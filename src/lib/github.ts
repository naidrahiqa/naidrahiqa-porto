import { slugify } from "@/lib/utils";

export const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "naidrahiqa";

const GITHUB_API = "https://api.github.com";
const PER_PAGE = 100;
const MAX_PAGES = 10;
const ENRICH_CONCURRENCY = 4;
const RATE_LIMIT_RESERVE = 5;

export interface GitHubLicense {
  spdx_id: string | null;
  name: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  license: GitHubLicense | null;
  default_branch: string;
  fork: boolean;
  archived: boolean;
  created_at: string;
  pushed_at: string;
  updated_at: string;
}

export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

export interface GitHubRelease {
  tag_name: string;
  html_url: string;
  name: string | null;
  published_at: string | null;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  committed_at: string | null;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  resetAt: string;
}

export interface RepoEnrichment {
  languages: Record<string, number> | null;
  release: GitHubRelease | null;
  releaseFetched: boolean;
  commit: GitHubCommit | null;
  commitFetched: boolean;
}

export interface EnrichResult {
  byRepo: Map<string, RepoEnrichment>;
  requested: number;
  completed: number;
  failed: number;
  skipped: number;
}

export interface EnrichOptions {
  budget?: number;
  concurrency?: number;
}

export class GitHubApiError extends Error {
  status: number;
  resetAt: string | null;

  constructor(status: number, resetAt: string | null = null) {
    super(`GitHub API responded with ${status}`);
    this.name = "GitHubApiError";
    this.status = status;
    this.resetAt = resetAt;
  }
}

function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "naidrahiqa-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function resetAtFromResponse(response: Response): string | null {
  const raw = response.headers?.get?.("x-ratelimit-reset");
  if (!raw) return null;
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GitHubApiError(response.status, resetAtFromResponse(response));
  }

  return (await response.json()) as T;
}

async function githubFetchOptional<T>(path: string): Promise<T | null> {
  try {
    return await githubFetch<T>(path);
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return null;
    throw error;
  }
}

function repoPath(name: string): string {
  return `/repos/${encodeURIComponent(GITHUB_USERNAME)}/${encodeURIComponent(name)}`;
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  const collected: GitHubRepo[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const batch = await githubFetch<GitHubRepo[]>(
      `/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?per_page=${PER_PAGE}&sort=pushed&page=${page}`
    );

    for (const repo of batch) {
      if (seen.has(repo.name) || repo.name.startsWith(".")) continue;
      seen.add(repo.name);
      collected.push(repo);
    }

    if (batch.length < PER_PAGE) break;
  }

  return collected;
}

export async function fetchGitHubProfile(): Promise<GitHubProfile> {
  const data = await githubFetch<{
    login: string;
    name: string | null;
    bio: string | null;
    avatar_url: string;
    html_url: string;
    followers: number;
    following: number;
    public_repos: number;
    created_at: string;
  }>(`/users/${encodeURIComponent(GITHUB_USERNAME)}`);

  return {
    login: data.login,
    name: data.name,
    bio: data.bio,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    followers: data.followers ?? 0,
    following: data.following ?? 0,
    public_repos: data.public_repos ?? 0,
    created_at: data.created_at,
  };
}

export async function fetchGitHubRateLimit(): Promise<GitHubRateLimit | null> {
  try {
    const data = await githubFetch<{
      resources: { core: { limit: number; remaining: number; reset: number } };
    }>("/rate_limit");

    const core = data.resources?.core;
    if (!core) return null;

    return {
      limit: core.limit,
      remaining: core.remaining,
      resetAt: new Date(core.reset * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function fetchRepoLanguages(
  name: string
): Promise<Record<string, number>> {
  const data = await githubFetch<Record<string, number>>(
    `${repoPath(name)}/languages`
  );

  const languages: Record<string, number> = {};
  for (const [language, bytes] of Object.entries(data)) {
    if (typeof bytes === "number" && Number.isFinite(bytes) && bytes > 0) {
      languages[language] = bytes;
    }
  }
  return languages;
}

export async function fetchLatestRelease(
  name: string
): Promise<GitHubRelease | null> {
  const data = await githubFetchOptional<{
    tag_name: string;
    html_url: string;
    name: string | null;
    published_at: string | null;
  }>(`${repoPath(name)}/releases/latest`);

  if (!data) return null;
  return {
    tag_name: data.tag_name,
    html_url: data.html_url,
    name: data.name,
    published_at: data.published_at,
  };
}

export async function fetchLatestCommit(
  name: string
): Promise<GitHubCommit | null> {
  let data;
  try {
    data = await githubFetchOptional<
      Array<{
        sha: string;
        commit: {
          message: string;
          committer: { date: string } | null;
        };
      }>
    >(`${repoPath(name)}/commits?per_page=1`);
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 409) return null;
    throw error;
  }

  const entry = data?.[0];
  if (!entry) return null;

  return {
    sha: entry.sha,
    message: firstLine(entry.commit?.message ?? ""),
    committed_at: entry.commit?.committer?.date ?? null,
  };
}

export function firstLine(value: string, max = 140): string {
  const line = value.split(/\r?\n/)[0].trim();
  return line.length > max ? `${line.slice(0, max - 3)}...` : line;
}

async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  if (items.length === 0) return;

  let cursor = 0;
  const size = Math.max(1, Math.min(limit, items.length));

  await Promise.all(
    Array.from({ length: size }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        await worker(items[index]);
      }
    })
  );
}

function emptyEnrichment(): RepoEnrichment {
  return {
    languages: null,
    release: null,
    releaseFetched: false,
    commit: null,
    commitFetched: false,
  };
}

export async function enrichGitHubRepos(
  repos: GitHubRepo[],
  options: EnrichOptions = {}
): Promise<EnrichResult> {
  const concurrency = options.concurrency ?? ENRICH_CONCURRENCY;
  const budget =
    options.budget === undefined
      ? repos.length
      : Math.max(0, Math.floor(options.budget));

  const tasks: Array<{
    name: string;
    kind: "languages" | "release" | "commit";
  }> = [];

  for (const kind of ["languages", "release", "commit"] as const) {
    for (const repo of repos) tasks.push({ name: repo.name, kind });
  }

  const selected = tasks.slice(0, budget);
  const byRepo = new Map<string, RepoEnrichment>();
  for (const repo of repos) byRepo.set(repo.name, emptyEnrichment());

  let completed = 0;
  let failed = 0;
  let stopped = false;

  await runPool(selected, concurrency, async (task) => {
    if (stopped) return;

    const entry = byRepo.get(task.name);
    if (!entry) return;

    try {
      if (task.kind === "languages") {
        entry.languages = await fetchRepoLanguages(task.name);
      } else if (task.kind === "release") {
        entry.release = await fetchLatestRelease(task.name);
        entry.releaseFetched = true;
      } else {
        entry.commit = await fetchLatestCommit(task.name);
        entry.commitFetched = true;
      }
      completed += 1;
    } catch (error) {
      failed += 1;
      if (
        error instanceof GitHubApiError &&
        (error.status === 403 || error.status === 429)
      ) {
        stopped = true;
      }
    }
  });

  return {
    byRepo,
    requested: selected.length,
    completed,
    failed,
    skipped: Math.max(0, tasks.length - completed - failed),
  };
}

export function enrichBudgetFromRateLimit(
  rate: GitHubRateLimit | null,
  fallback: number
): number {
  if (!rate) return fallback;
  return Math.max(0, rate.remaining - RATE_LIMIT_RESERVE);
}

export { languageBreakdown } from "@/lib/github-meta";
export type { LanguageSlice } from "@/lib/github-meta";

export function normalizeHomepage(
  value: string | null | undefined
): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return /^https?:\/\//i.test(raw) ? raw : null;
  }
  return `https://${raw}`;
}

export function normalizeLicense(
  license: GitHubLicense | null | undefined
): string | null {
  const id = license?.spdx_id?.trim();
  if (!id || id.toUpperCase() === "NOASSERTION") return null;
  return id;
}

export function formatRepoSize(kb: number | null | undefined): string {
  const value = Number(kb);
  if (!Number.isFinite(value) || value <= 0) return "-";

  const mb = value / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 10) return `${Math.round(mb)} MB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(value))} KB`;
}

export function repoCloneUrl(htmlUrl: string | null | undefined): string | null {
  if (!htmlUrl) return null;
  return htmlUrl.endsWith(".git") ? htmlUrl : `${htmlUrl}.git`;
}

export function repoNameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/github\.com\/[^/]+\/([^/?#]+)/i);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1].replace(/\.git$/i, ""));
  } catch {
    return match[1].replace(/\.git$/i, "");
  }
}

export function repoSlug(name: string): string {
  return (
    slugify(name.replace(/[._]+/g, "-")).replace(/^-+|-+$/g, "") ||
    name.toLowerCase()
  );
}

export function prettifyRepoName(name: string): string {
  const cleaned = name.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return name;
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function repoTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
