export interface LanguageSlice {
  name: string;
  bytes: number;
  percent: number;
}

export function languageBreakdown(
  languages: Record<string, number> | null | undefined,
  max = 6
): LanguageSlice[] {
  const entries = Object.entries(languages ?? {})
    .filter(([, bytes]) => Number.isFinite(bytes) && bytes > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total <= 0) return [];

  const limit = Math.max(1, Math.floor(max));
  const top = entries.slice(0, limit);
  const rest = entries.slice(limit);

  const slices: LanguageSlice[] = top.map(([name, bytes]) => ({
    name,
    bytes,
    percent: Math.round((bytes / total) * 1000) / 10,
  }));

  if (rest.length > 0) {
    const bytes = rest.reduce((sum, [, value]) => sum + value, 0);
    slices.push({
      name: "Other",
      bytes,
      percent: Math.round((bytes / total) * 1000) / 10,
    });
  }

  if (slices.length > 0) {
    const rounded = slices.reduce((sum, slice) => sum + slice.percent, 0);
    const last = slices[slices.length - 1];
    last.percent = Math.round((last.percent + (100 - rounded)) * 10) / 10;
  }

  return slices;
}

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

export type RepoProvider = "github" | "gitlab";

function hostnameOf(url: string | null | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isGitLabUrl(url: string | null | undefined): boolean {
  const host = hostnameOf(url);
  return host === "gitlab.com" || Boolean(host?.endsWith(".gitlab.com"));
}

export function isGitHubUrl(url: string | null | undefined): boolean {
  const host = hostnameOf(url);
  return host === "github.com" || Boolean(host?.endsWith(".github.com"));
}

export function isTelegramUrl(url: string | null | undefined): boolean {
  const host = hostnameOf(url);
  return host === "t.me" || host === "telegram.me";
}

export function repoProvider(
  link: string | null | undefined,
  repoName?: string | null
): RepoProvider | null {
  if (isGitLabUrl(link)) return "gitlab";
  if (isGitHubUrl(link)) return "github";
  if (repoName) return "github";
  return null;
}

export function linkActionLabel(link: string | null | undefined): string {
  if (isTelegramUrl(link)) return "View on Telegram";
  if (isGitLabUrl(link)) return "View on GitLab";
  if (isGitHubUrl(link)) return "View on GitHub";
  return "Open link";
}
