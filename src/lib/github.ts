import { slugify } from "@/lib/utils";

export const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "naidrahiqa";

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  updated_at: string;
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "naidrahiqa-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
    { headers, next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }

  const repos = (await response.json()) as GitHubRepo[];
  return repos.filter((repo) => !repo.name.startsWith("."));
}

export function repoNameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/github\.com\/[^/]+\/([^/?#]+)/i);
  return match ? match[1].replace(/\.git$/i, "") : null;
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
