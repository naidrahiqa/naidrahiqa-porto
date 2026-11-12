import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { unauthorized } from "@/lib/api";
import {
  fetchGitHubRepos,
  prettifyRepoName,
  repoNameFromUrl,
  repoSlug,
  repoTimestamp,
} from "@/lib/github";

type ExistingProject = {
  id: string;
  slug: string;
  description: string;
  category: string;
  link: string | null;
  repo_name: string | null;
};

const MIGRATION_HINT =
  "Run supabase/migrations/021_github_repo_metadata.sql first, then retry the sync.";

export async function POST() {
  const user = await requireAdmin();
  if (!user) return unauthorized();

  const supabase = await createClient();

  const { error: schemaError } = await supabase
    .from("projects")
    .select("repo_name")
    .limit(1);

  if (schemaError) {
    return NextResponse.json(
      { error: MIGRATION_HINT, code: "MIGRATION_REQUIRED" },
      { status: 409 }
    );
  }

  let repos;
  try {
    repos = await fetchGitHubRepos();
  } catch (error) {
    console.error("[github sync] fetch failed", error);
    return NextResponse.json(
      { error: "Could not reach the GitHub API. Try again in a moment." },
      { status: 502 }
    );
  }

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

  const current = (existing ?? []) as ExistingProject[];
  const byRepo = new Map<string, ExistingProject>();
  for (const project of current) {
    const key = project.repo_name ?? repoNameFromUrl(project.link);
    if (key) byRepo.set(key, project);
  }

  const usedSlugs = new Set(current.map((project) => project.slug));
  let created = 0;
  let updated = 0;
  const failures: string[] = [];

  for (const [index, repo] of repos.entries()) {
    const match = byRepo.get(repo.name);
    const metadata = {
      link: repo.html_url,
      language: repo.language ?? "",
      sort_order: index + 1,
      repo_name: repo.name,
      repo_stars: repo.stargazers_count ?? 0,
      repo_forks: repo.forks_count ?? 0,
      repo_is_fork: Boolean(repo.fork),
      repo_archived: Boolean(repo.archived),
      repo_pushed_at: repoTimestamp(repo.pushed_at),
      repo_homepage: repo.homepage || null,
      repo_topics: repo.topics ?? [],
      updated_at: new Date().toISOString(),
    };

    if (match) {
      const { error } = await supabase
        .from("projects")
        .update({
          ...metadata,
          description: match.description || repo.description || "",
        })
        .eq("id", match.id);

      if (error) failures.push(repo.name);
      else updated += 1;
      continue;
    }

    let slug = repoSlug(repo.name);
    if (usedSlugs.has(slug)) slug = `${slug}-${index + 1}`;
    usedSlugs.add(slug);

    const { error } = await supabase.from("projects").insert({
      title: prettifyRepoName(repo.name),
      slug,
      category: "personal",
      description: repo.description ?? "",
      content: "",
      published: true,
      featured: false,
      ...metadata,
    });

    if (error) failures.push(repo.name);
    else created += 1;
  }

  const liveRepos = new Set(repos.map((repo) => repo.name));
  const staleIds = current
    .filter((project) => {
      const key = project.repo_name ?? repoNameFromUrl(project.link);
      return key ? !liveRepos.has(key) : false;
    })
    .map((project) => project.id);

  let archived = 0;
  if (staleIds.length > 0) {
    const { error } = await supabase
      .from("projects")
      .update({ published: false, updated_at: new Date().toISOString() })
      .in("id", staleIds);
    if (!error) archived = staleIds.length;
  }

  if (failures.length > 0) {
    return NextResponse.json(
      {
        error: `Synced with ${failures.length} failure(s).`,
        created,
        updated,
        archived,
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
    archived,
  });
}
