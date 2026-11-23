import {
  firstLine,
  prettifyRepoName,
  repoSlug,
  repoTimestamp,
  runPool,
} from "@/lib/github";
import { isGitLabUrl } from "@/lib/github-meta";

export const GITLAB_USERNAME = process.env.GITLAB_USERNAME || "naidrahiqa";

const GITLAB_API = "https://gitlab.com/api/v4";
const PER_PAGE = 100;
const ENRICH_CONCURRENCY = 4;

export interface GitLabLicense {
  key?: string | null;
  name?: string | null;
  nickname?: string | null;
}

export interface GitLabProject {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  description: string | null;
  web_url: string;
  topics?: string[];
  tag_list?: string[];
  star_count: number;
  forks_count: number;
  open_issues_count?: number;
  default_branch: string | null;
  archived: boolean;
  forked_from_project?: unknown;
  created_at: string;
  last_activity_at: string;
  license?: GitLabLicense | null;
  statistics?: {
    repository_size?: number;
  } | null;
}

export interface GitLabRelease {
  tag_name: string;
  name: string | null;
  released_at: string | null;
  created_at: string | null;
  _links?: {
    self?: string;
  };
}

export interface GitLabCommit {
  id: string;
  title: string;
  message: string;
  committed_date: string | null;
  created_at: string | null;
}

export interface GitLabEnrichment {
  languages: Record<string, number> | null;
  release: GitLabRelease | null;
  releaseFetched: boolean;
  commit: GitLabCommit | null;
  commitFetched: boolean;
}

export interface GitLabEnrichResult {
  byPath: Map<string, GitLabEnrichment>;
  completed: number;
  failed: number;
}

export class GitLabApiError extends Error {
  status: number;

  constructor(status: number) {
    super(`GitLab API responded with ${status}`);
    this.name = "GitLabApiError";
    this.status = status;
  }
}

function gitlabHeaders(): Record<string, string> {
  const token = process.env.GITLAB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "naidrahiqa-portfolio",
  };
  if (token) headers["PRIVATE-TOKEN"] = token;
  return headers;
}

async function gitlabFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${GITLAB_API}${path}`, {
    headers: gitlabHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GitLabApiError(response.status);
  }

  return (await response.json()) as T;
}

async function gitlabFetchOptional<T>(path: string): Promise<T | null> {
  try {
    return await gitlabFetch<T>(path);
  } catch (error) {
    if (error instanceof GitLabApiError && error.status === 404) return null;
    throw error;
  }
}

export function gitlabPathFromUrl(
  value: string | null | undefined
): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (!raw.includes("://")) {
    const cleaned = raw.replace(/^\/+|\/+$/g, "").replace(/\.git$/i, "");
    return cleaned.includes("/") ? cleaned : null;
  }

  if (!isGitLabUrl(raw)) return null;

  try {
    const url = new URL(raw);
    const pathname = url.pathname.replace(/^\/+|\/+$/g, "");
    const beforeDash = pathname.split("/-/")[0] ?? pathname;
    const cleaned = beforeDash.replace(/\.git$/i, "").replace(/\/+$/g, "");
    return cleaned.includes("/") ? cleaned : null;
  } catch {
    return null;
  }
}

export function pinnedGitLabPaths(): string[] {
  const raw = process.env.GITLAB_REPOS ?? "";
  if (!raw.trim()) return [];
  const seen = new Set<string>();
  const paths: string[] = [];
  for (const part of raw.split(",")) {
    const parsed = gitlabPathFromUrl(part);
    if (!parsed) continue;
    const key = parsed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    paths.push(parsed);
  }
  return paths;
}

export async function fetchGitLabUserProjects(
  username = GITLAB_USERNAME
): Promise<GitLabProject[]> {
  const projects = await gitlabFetchOptional<GitLabProject[]>(
    `/users/${encodeURIComponent(username)}/projects?visibility=public&per_page=${PER_PAGE}&order_by=last_activity_at`
  );
  return projects ?? [];
}

export async function fetchGitLabProject(
  pathWithNamespace: string
): Promise<GitLabProject | null> {
  return gitlabFetchOptional<GitLabProject>(
    `/projects/${encodeURIComponent(pathWithNamespace)}?license=true&statistics=true`
  );
}

export async function collectGitLabProjects(
  existingLinks: Array<string | null | undefined> = []
): Promise<GitLabProject[]> {
  const userProjects = await fetchGitLabUserProjects();
  const byPath = new Map<string, GitLabProject>();

  for (const project of userProjects) {
    byPath.set(project.path_with_namespace.toLowerCase(), project);
  }

  const extraPaths = new Set<string>();
  for (const p of pinnedGitLabPaths()) extraPaths.add(p);
  for (const link of existingLinks) {
    const parsed = gitlabPathFromUrl(link);
    if (parsed) extraPaths.add(parsed);
  }

  const missing = [...extraPaths].filter((p) => !byPath.has(p.toLowerCase()));
  await runPool(missing, ENRICH_CONCURRENCY, async (path) => {
    const project = await fetchGitLabProject(path);
    if (project) {
      byPath.set(project.path_with_namespace.toLowerCase(), project);
    }
  });

  return [...byPath.values()];
}

export async function fetchGitLabLanguages(
  pathWithNamespace: string
): Promise<Record<string, number> | null> {
  const data = await gitlabFetchOptional<Record<string, number>>(
    `/projects/${encodeURIComponent(pathWithNamespace)}/languages`
  );
  if (!data || Object.keys(data).length === 0) return null;
  return data;
}

export async function fetchGitLabLatestRelease(
  pathWithNamespace: string
): Promise<GitLabRelease | null> {
  const items = await gitlabFetchOptional<GitLabRelease[]>(
    `/projects/${encodeURIComponent(pathWithNamespace)}/releases?per_page=1`
  );
  return items?.[0] ?? null;
}

export async function fetchGitLabLatestCommit(
  pathWithNamespace: string,
  ref?: string | null
): Promise<GitLabCommit | null> {
  const refQuery = ref ? `&ref_name=${encodeURIComponent(ref)}` : "";
  const items = await gitlabFetchOptional<GitLabCommit[]>(
    `/projects/${encodeURIComponent(pathWithNamespace)}/repository/commits?per_page=1${refQuery}`
  );
  return items?.[0] ?? null;
}

export async function enrichGitLabProjects(
  projects: GitLabProject[]
): Promise<GitLabEnrichResult> {
  const byPath = new Map<string, GitLabEnrichment>();
  let completed = 0;
  let failed = 0;

  await runPool(projects, ENRICH_CONCURRENCY, async (project) => {
    const entry: GitLabEnrichment = {
      languages: null,
      release: null,
      releaseFetched: false,
      commit: null,
      commitFetched: false,
    };

    try {
      const [languages, release, commit] = await Promise.all([
        fetchGitLabLanguages(project.path_with_namespace),
        fetchGitLabLatestRelease(project.path_with_namespace).then((r) => {
          entry.releaseFetched = true;
          return r;
        }),
        fetchGitLabLatestCommit(
          project.path_with_namespace,
          project.default_branch
        ).then((c) => {
          entry.commitFetched = true;
          return c;
        }),
      ]);
      entry.languages = languages;
      entry.release = release;
      entry.commit = commit;
      completed += 1;
    } catch {
      failed += 1;
    }

    byPath.set(project.path_with_namespace, entry);
  });

  return { byPath, completed, failed };
}

export function normalizeGitLabLicense(
  license: GitLabLicense | null | undefined
): string | null {
  const raw = license?.nickname?.trim() || license?.name?.trim() || license?.key?.trim();
  if (!raw) return null;
  return raw.toUpperCase() === "OTHER" ? null : raw;
}

export function topGitLabLanguage(
  languages: Record<string, number> | null | undefined
): string {
  if (!languages) return "";
  let best = "";
  let max = -1;
  for (const [name, pct] of Object.entries(languages)) {
    if (Number.isFinite(pct) && pct > max) {
      max = pct;
      best = name;
    }
  }
  return best;
}

export function gitLabSizeKb(project: GitLabProject): number {
  const bytes = project.statistics?.repository_size;
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return 0;
  return Math.max(1, Math.round(bytes / 1024));
}

export function gitLabCommitTitle(commit: GitLabCommit | null): string | null {
  if (!commit) return null;
  return firstLine(commit.title || commit.message);
}

export { prettifyRepoName, repoSlug, repoTimestamp };
