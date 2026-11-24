import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { unauthorized } from "@/lib/api";
import { repoProvider } from "@/lib/github-meta";
import { runPool } from "@/lib/github";
import {
  collectGitLabProjects,
  enrichGitLabProjects,
  gitLabCommitTitle,
  gitlabPathFromUrl,
  gitLabSizeKb,
  GitLabApiError,
  normalizeGitLabLicense,
  prettifyRepoName,
  repoSlug,
  repoTimestamp,
  topGitLabLanguage,
} from "@/lib/gitlab";

type ExistingProject = {
  id: string;
  slug: string;
  description: string;
  category: string;
  link: string | null;
  repo_name: string | null;
};

export async function POST() {
  const user = await requireAdmin();
  if (!user) return unauthorized();

  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("projects")
    .select("id, slug, description, category, link, repo_name")
    .eq("category", "personal");

  if (readError) {
    return NextResponse.json(
      { error: "Could not read projects from the database." },
      { status: 500 }
    );
  }

  const current = ((existing ?? []) as ExistingProject[]).filter(
    (project) => repoProvider(project.link, project.repo_name) === "gitlab"
  );

  let repos: Awaited<ReturnType<typeof collectGitLabProjects>>;
  try {
    repos = await collectGitLabProjects(current.map((p) => p.link));
  } catch (error) {
    console.error("[gitlab sync] fetch failed", error);
    if (error instanceof GitLabApiError && error.status === 429) {
      return NextResponse.json(
        { error: "GitLab API rate limit reached. Try again in a moment." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Could not reach the GitLab API. Try again in a moment." },
      { status: 502 }
    );
  }

  const enrichment = await enrichGitLabProjects(repos);
  const now = new Date().toISOString();

  const byPath = new Map<string, ExistingProject>();
  for (const project of current) {
    const key = gitlabPathFromUrl(project.link) ?? project.repo_name;
    if (key) byPath.set(key.toLowerCase(), project);
  }

  const { data: slugRows } = await supabase.from("projects").select("slug");
  const usedSlugs = new Set(
    (slugRows ?? []).map((row: { slug: string }) => row.slug)
  );

  let created = 0;
  let updated = 0;
  const failures: string[] = [];

  const writes = repos.map((repo) => {
    const match = byPath.get(repo.path_with_namespace.toLowerCase());
    const extra = enrichment.byPath.get(repo.path_with_namespace);
    const topics = repo.topics ?? repo.tag_list ?? [];
    const primaryLang = topGitLabLanguage(extra?.languages);

    const metadata: Record<string, unknown> = {
      link: repo.web_url,
      repo_name: repo.path_with_namespace,
      repo_stars: repo.star_count ?? 0,
      repo_forks: repo.forks_count ?? 0,
      repo_is_fork: Boolean(repo.forked_from_project),
      repo_archived: Boolean(repo.archived),
      repo_pushed_at: repoTimestamp(repo.last_activity_at),
      repo_topics: topics,
      repo_license: normalizeGitLabLicense(repo.license),
      repo_open_issues: repo.open_issues_count ?? 0,
      repo_created_at: repoTimestamp(repo.created_at),
      repo_default_branch: repo.default_branch || null,
      repo_synced_at: now,
      updated_at: now,
    };

    const sizeKb = gitLabSizeKb(repo);
    if (sizeKb > 0) metadata.repo_size_kb = sizeKb;
    if (primaryLang) metadata.language = primaryLang;

    if (extra?.languages) {
      metadata.repo_languages = extra.languages;
    }
    if (extra?.releaseFetched) {
      metadata.repo_release_tag = extra.release?.tag_name ?? null;
      metadata.repo_release_url = extra.release?._links?.self ?? null;
      metadata.repo_release_at = repoTimestamp(
        extra.release?.released_at ?? extra.release?.created_at
      );
    }
    if (extra?.commitFetched) {
      metadata.repo_last_commit = gitLabCommitTitle(extra.commit);
      metadata.repo_last_commit_at = repoTimestamp(
        extra.commit?.committed_date ?? extra.commit?.created_at
      );
    }

    if (match) {
      return { kind: "update" as const, repo, match, metadata };
    }

    const baseSlug = repoSlug(repo.path);
    let slug = baseSlug;
    let attempt = 1;
    while (usedSlugs.has(slug)) {
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }
    usedSlugs.add(slug);

    return { kind: "insert" as const, repo, slug, metadata };
  });

  await runPool(writes, 6, async (item) => {
    if (item.kind === "update") {
      const cleanDesc = (item.repo.description ?? "").trim();
      const { error } = await supabase
        .from("projects")
        .update({
          ...item.metadata,
          description: item.match.description || cleanDesc || "",
        })
        .eq("id", item.match.id);

      if (error) failures.push(item.repo.path_with_namespace);
      else updated += 1;
      return;
    }

    const cleanDesc = (item.repo.description ?? "").trim();
    const { error } = await supabase.from("projects").insert({
      title: prettifyRepoName(item.repo.name),
      slug: item.slug,
      category: "personal",
      description: cleanDesc,
      content: "",
      language: topGitLabLanguage(
        enrichment.byPath.get(item.repo.path_with_namespace)?.languages
      ),
      published: true,
      featured: false,
      ...item.metadata,
    });

    if (error) failures.push(item.repo.path_with_namespace);
    else created += 1;
  });

  if (failures.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        total: repos.length,
        created,
        updated,
        enriched: enrichment.completed,
        error: `Synced with ${failures.length} failure(s).`,
        failures,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    total: repos.length,
    created,
    updated,
    enriched: enrichment.completed,
  });
}
