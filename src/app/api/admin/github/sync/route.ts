import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { unauthorized } from "@/lib/api";
import {
  enrichBudgetFromRateLimit,
  enrichGitHubRepos,
  fetchGitHubProfile,
  fetchGitHubRateLimit,
  fetchGitHubRepos,
  GitHubApiError,
  normalizeHomepage,
  normalizeLicense,
  prettifyRepoName,
  repoNameFromUrl,
  repoSlug,
  repoTimestamp,
  runPool,
} from "@/lib/github";
import { repoProvider } from "@/lib/github-meta";

type ExistingProject = {
  id: string;
  slug: string;
  description: string;
  category: string;
  link: string | null;
  repo_name: string | null;
};

const MIGRATION_HINT =
  "Run supabase/migrations/022_github_repo_enrichment.sql first, then retry the sync.";

function rateLimitMessage(resetAt: string | null): string {
  if (!resetAt) {
    return "GitHub API rate limit reached. Set GITHUB_TOKEN in your environment to raise the limit.";
  }
  return `GitHub API rate limit reached. It resets at ${resetAt}. Set GITHUB_TOKEN in your environment to raise the limit.`;
}

export async function POST() {
  const user = await requireAdmin();
  if (!user) return unauthorized();

  const supabase = await createClient();

  const { error: schemaError } = await supabase
    .from("projects")
    .select(
      "repo_name, repo_languages, repo_license, repo_open_issues, repo_size_kb, repo_created_at, repo_default_branch, repo_release_tag, repo_release_url, repo_release_at, repo_last_commit, repo_last_commit_at, repo_synced_at"
    )
    .limit(1);

  if (schemaError) {
    return NextResponse.json(
      { error: MIGRATION_HINT, code: "MIGRATION_REQUIRED" },
      { status: 409 }
    );
  }

  const { error: profileSchemaError } = await supabase
    .from("github_profile")
    .select("id")
    .limit(1);

  if (profileSchemaError) {
    return NextResponse.json(
      { error: MIGRATION_HINT, code: "MIGRATION_REQUIRED" },
      { status: 409 }
    );
  }

  let repos: Awaited<ReturnType<typeof fetchGitHubRepos>>;
  let profile: Awaited<ReturnType<typeof fetchGitHubProfile>> | null;
  try {
    [profile, repos] = await Promise.all([
      fetchGitHubProfile().catch(() => null),
      fetchGitHubRepos(),
    ]);
  } catch (error) {
    console.error("[github sync] fetch failed", error);
    if (
      error instanceof GitHubApiError &&
      (error.status === 403 || error.status === 429)
    ) {
      return NextResponse.json(
        { error: rateLimitMessage(error.resetAt), code: "RATE_LIMITED" },
        { status: 429 }
      );
    }
    if (error instanceof GitHubApiError && error.status === 401) {
      return NextResponse.json(
        {
          error:
            "GitHub rejected GITHUB_TOKEN. Check that the token is valid and not expired.",
        },
        { status: 502 }
      );
    }
    if (error instanceof GitHubApiError && error.status === 404) {
      return NextResponse.json(
        { error: "GitHub user not found. Check GITHUB_USERNAME." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Could not reach the GitHub API. Try again in a moment." },
      { status: 502 }
    );
  }

  const rate = await fetchGitHubRateLimit();
  const enrichment = await enrichGitHubRepos(repos, {
    budget: enrichBudgetFromRateLimit(rate, repos.length),
    concurrency: 4,
  });

  const now = new Date().toISOString();
  let profileSaved = false;

  if (profile) {
    const { error } = await supabase.from("github_profile").upsert({
      id: 1,
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      followers: profile.followers,
      following: profile.following,
      public_repos: profile.public_repos,
      member_since: repoTimestamp(profile.created_at),
      synced_at: now,
    });

    if (error) console.error("[github sync] profile upsert failed", error);
    else profileSaved = true;
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

  const current = ((existing ?? []) as ExistingProject[]).filter(
    (project) => repoProvider(project.link, project.repo_name) === "github"
  );
  const repoKey = (name: string) => name.toLowerCase();
  const byRepo = new Map<string, ExistingProject>();
  for (const project of current) {
    const key = project.repo_name ?? repoNameFromUrl(project.link);
    if (key) byRepo.set(repoKey(key), project);
  }

  const { data: slugRows } = await supabase.from("projects").select("slug");
  const usedSlugs = new Set(
    (slugRows ?? []).map((row: { slug: string }) => row.slug)
  );
  let created = 0;
  let updated = 0;
  const failures: string[] = [];

  const writes = repos.map((repo, index) => {
    const match = byRepo.get(repoKey(repo.name));
    const extra = enrichment.byRepo.get(repo.name);

    const metadata: Record<string, unknown> = {
      link: repo.html_url,
      language: repo.language ?? "",
      sort_order: index + 1,
      repo_name: repo.name,
      repo_stars: repo.stargazers_count ?? 0,
      repo_forks: repo.forks_count ?? 0,
      repo_is_fork: Boolean(repo.fork),
      repo_archived: Boolean(repo.archived),
      repo_pushed_at: repoTimestamp(repo.pushed_at),
      repo_homepage: normalizeHomepage(repo.homepage),
      repo_topics: repo.topics ?? [],
      repo_license: normalizeLicense(repo.license),
      repo_open_issues: repo.open_issues_count ?? 0,
      repo_size_kb: repo.size ?? 0,
      repo_created_at: repoTimestamp(repo.created_at),
      repo_default_branch: repo.default_branch || null,
      repo_synced_at: now,
      updated_at: now,
    };

    if (extra?.languages !== null && extra?.languages !== undefined) {
      metadata.repo_languages = extra.languages;
    }
    if (extra?.releaseFetched) {
      metadata.repo_release_tag = extra.release?.tag_name ?? null;
      metadata.repo_release_url = extra.release?.html_url ?? null;
      metadata.repo_release_at = repoTimestamp(extra.release?.published_at);
    }
    if (extra?.commitFetched) {
      metadata.repo_last_commit = extra.commit?.message ?? null;
      metadata.repo_last_commit_at = repoTimestamp(extra.commit?.committed_at);
    }

    if (match) {
      return { kind: "update" as const, repo, match, metadata };
    }

    const baseSlug = repoSlug(repo.name);
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
      const { error } = await supabase
        .from("projects")
        .update({
          ...item.metadata,
          description: item.match.description || item.repo.description || "",
        })
        .eq("id", item.match.id);

      if (error) failures.push(item.repo.name);
      else updated += 1;
      return;
    }

    const { error } = await supabase.from("projects").insert({
      title: prettifyRepoName(item.repo.name),
      slug: item.slug,
      category: "personal",
      description: item.repo.description ?? "",
      content: "",
      published: true,
      featured: false,
      ...item.metadata,
    });

    if (error) failures.push(item.repo.name);
    else created += 1;
  });

  const liveRepos = new Set(repos.map((repo) => repoKey(repo.name)));
  const staleIds = current
    .filter((project) => {
      const key = project.repo_name ?? repoNameFromUrl(project.link);
      return key ? !liveRepos.has(repoKey(key)) : false;
    })
    .map((project) => project.id);

  let archived = 0;
  if (staleIds.length > 0) {
    const { error } = await supabase
      .from("projects")
      .update({ published: false, updated_at: now })
      .in("id", staleIds);
    if (!error) archived = staleIds.length;
  }

  const warnings: string[] = [];
  if (!process.env.GITHUB_TOKEN) {
    warnings.push(
      "GITHUB_TOKEN is not set, so enrichment is limited by the public GitHub rate limit."
    );
  }
  if (!profile) {
    warnings.push("GitHub profile stats could not be refreshed.");
  }
  if (enrichment.failed > 0) {
    warnings.push(`${enrichment.failed} enrichment request(s) failed.`);
  }
  if (enrichment.skipped > 0) {
    warnings.push(
      `${enrichment.skipped} enrichment request(s) were skipped by the rate limit.`
    );
  }

  const payload = {
    total: repos.length,
    created,
    updated,
    archived,
    enriched: enrichment.completed,
    profile: profileSaved,
    rate: rate
      ? { limit: rate.limit, remaining: rate.remaining, resetAt: rate.resetAt }
      : null,
    warnings,
  };

  if (failures.length > 0) {
    return NextResponse.json(
      {
        ...payload,
        ok: false,
        error: `Synced with ${failures.length} failure(s).`,
        failures,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, ...payload });
}
