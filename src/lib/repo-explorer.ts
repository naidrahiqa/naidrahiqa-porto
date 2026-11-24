import { isGitHubUrl, isGitLabUrl, repoProvider, type RepoProvider } from "@/lib/github-meta";

const DEFAULT_GITHUB_USER = process.env.GITHUB_USERNAME || "naidrahiqa";
const DEFAULT_GITLAB_USER = process.env.GITLAB_USERNAME || "naidrahiqa";

const GITHUB_API = "https://api.github.com";
const GITLAB_API = "https://gitlab.com/api/v4";
const MAX_PREVIEW_BYTES = 180_000;
const FETCH_REVALIDATE_SECONDS = 120;

export interface RepoIdentity {
  provider: RepoProvider;
  fullPath: string;
  defaultBranch: string;
  webUrl: string;
}

export interface RepoTreeItem {
  name: string;
  path: string;
  type: "dir" | "file";
  size?: number;
  webUrl: string;
}

export interface RepoCommitItem {
  sha: string;
  shortSha: string;
  title: string;
  body: string | null;
  authorName: string;
  committedAt: string | null;
  webUrl: string;
}

export interface RepoCommitFileDiff {
  path: string;
  oldPath: string | null;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
  patch: string | null;
}

export interface RepoCommitDetail extends RepoCommitItem {
  files: RepoCommitFileDiff[];
  totalAdditions: number;
  totalDeletions: number;
}

export interface RepoFileContent {
  path: string;
  name: string;
  content: string | null;
  size: number;
  isBinary: boolean;
  truncated: boolean;
  webUrl: string;
  rawUrl: string;
}

export interface RepoOverviewResponse {
  branch: string;
  branches: string[];
  path: string;
  tree: RepoTreeItem[];
  commits: RepoCommitItem[];
  readme: { path: string; content: string } | null;
}

export function extractRepoPathFromUrl(url: string | null | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  if (!isGitHubUrl(raw) && !isGitLabUrl(raw)) return null;

  try {
    const parsed = new URL(raw);
    const pathname = parsed.pathname.replace(/^\/+|\/+$/g, "");
    const beforeDash = pathname.split("/-/")[0] ?? pathname;
    const cleaned = beforeDash.replace(/\.git$/i, "").replace(/\/+$/g, "");
    if (!cleaned.includes("/")) return null;

    if (isGitHubUrl(raw)) {
      const segments = cleaned.split("/").filter(Boolean);
      if (segments.length >= 2) {
        return `${segments[0]}/${segments[1]}`;
      }
    }

    return cleaned;
  } catch {
    return null;
  }
}

export function resolveRepoIdentity(project: {
  link?: string | null;
  repo_name?: string | null;
  repo_default_branch?: string | null;
}): RepoIdentity | null {
  const provider = repoProvider(project.link, project.repo_name);
  if (!provider) return null;

  const fromUrl = extractRepoPathFromUrl(project.link);
  const rawName = project.repo_name?.trim().replace(/^\/+|\/+$/g, "") || null;

  let fullPath = fromUrl;
  if (!fullPath && rawName) {
    if (rawName.includes("/")) {
      fullPath = rawName;
    } else {
      const owner = provider === "gitlab" ? DEFAULT_GITLAB_USER : DEFAULT_GITHUB_USER;
      fullPath = `${owner}/${rawName}`;
    }
  }

  if (!fullPath) return null;

  const defaultBranch = project.repo_default_branch?.trim() || "main";
  const webUrl =
    provider === "gitlab"
      ? `https://gitlab.com/${fullPath}`
      : `https://github.com/${fullPath}`;

  return {
    provider,
    fullPath,
    defaultBranch,
    webUrl,
  };
}

export function splitCommitMessage(rawMessage: string | null | undefined): {
  title: string;
  body: string | null;
} {
  const cleaned = (rawMessage ?? "").replace(/\r\n/g, "\n").trim();
  if (!cleaned) {
    return { title: "Commit", body: null };
  }
  const [firstLine, ...rest] = cleaned.split("\n");
  const title = firstLine.trim() || "Commit";
  const body = rest.join("\n").trim();
  return {
    title,
    body: body.length > 0 ? body : null,
  };
}

export function countDiffLines(patch: string | null | undefined): {
  additions: number;
  deletions: number;
} {
  if (!patch) return { additions: 0, deletions: 0 };
  let additions = 0;
  let deletions = 0;
  for (const line of patch.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) additions += 1;
    else if (line.startsWith("-")) deletions += 1;
  }
  return { additions, deletions };
}

export function sortTreeItems(items: RepoTreeItem[]): RepoTreeItem[] {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "dir" ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function isLikelyBinaryContent(text: string): boolean {
  const sample = text.slice(0, 4096);
  return sample.includes("\u0000");
}

function githubHeaders(accept = "application/vnd.github+json"): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: accept,
    "User-Agent": "naidrahiqa-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function gitlabHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "naidrahiqa-portfolio",
  };
  if (process.env.GITLAB_TOKEN) {
    headers["PRIVATE-TOKEN"] = process.env.GITLAB_TOKEN;
  }
  return headers;
}

function encodePathSegments(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export async function fetchRepoBranches(
  provider: RepoProvider,
  fullPath: string
): Promise<{ branches: string[]; defaultBranch: string | null }> {
  if (provider === "gitlab") {
    const res = await fetch(
      `${GITLAB_API}/projects/${encodeURIComponent(fullPath)}/repository/branches?per_page=50`,
      {
        headers: gitlabHeaders(),
        next: { revalidate: FETCH_REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) return { branches: [], defaultBranch: null };
    const data = (await res.json()) as Array<{ name: string; default?: boolean }>;
    const defaultObj = data.find((b) => b.default);
    return {
      branches: data.map((b) => b.name),
      defaultBranch: defaultObj?.name ?? data[0]?.name ?? null,
    };
  }

  const [owner, repo] = fullPath.split("/");
  if (!owner || !repo) return { branches: [], defaultBranch: null };

  const res = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=50`,
    {
      headers: githubHeaders(),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    }
  );
  if (!res.ok) return { branches: [], defaultBranch: null };
  const data = (await res.json()) as Array<{ name: string }>;
  return {
    branches: data.map((b) => b.name),
    defaultBranch: data[0]?.name ?? null,
  };
}

export async function fetchRepoTree(
  provider: RepoProvider,
  fullPath: string,
  branch: string,
  dirPath = ""
): Promise<RepoTreeItem[]> {
  const cleanDir = dirPath.replace(/^\/+|\/+$/g, "");

  if (provider === "gitlab") {
    const query = new URLSearchParams({
      per_page: "100",
      ref: branch,
    });
    if (cleanDir) query.set("path", cleanDir);

    const res = await fetch(
      `${GITLAB_API}/projects/${encodeURIComponent(fullPath)}/repository/tree?${query.toString()}`,
      {
        headers: gitlabHeaders(),
        next: { revalidate: FETCH_REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      name: string;
      path: string;
      type: "tree" | "blob";
    }>;

    const items: RepoTreeItem[] = data.map((entry) => {
      const isDir = entry.type === "tree";
      const segmentType = isDir ? "tree" : "blob";
      return {
        name: entry.name,
        path: entry.path,
        type: isDir ? "dir" : "file",
        webUrl: `https://gitlab.com/${fullPath}/-/${segmentType}/${encodePathSegments(branch)}/${encodePathSegments(entry.path)}`,
      };
    });

    return sortTreeItems(items);
  }

  const [owner, repo] = fullPath.split("/");
  if (!owner || !repo) return [];

  const encodedSubpath = cleanDir ? `/${encodePathSegments(cleanDir)}` : "";
  const res = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents${encodedSubpath}?ref=${encodeURIComponent(branch)}`,
    {
      headers: githubHeaders(),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const items: RepoTreeItem[] = data.map(
    (entry: {
      name: string;
      path: string;
      type: string;
      size?: number;
      html_url?: string;
    }) => {
      const isDir = entry.type === "dir";
      return {
        name: entry.name,
        path: entry.path,
        type: isDir ? "dir" : "file",
        size: typeof entry.size === "number" ? entry.size : undefined,
        webUrl:
          entry.html_url ||
          `https://github.com/${fullPath}/${isDir ? "tree" : "blob"}/${encodePathSegments(branch)}/${encodePathSegments(entry.path)}`,
      };
    }
  );

  return sortTreeItems(items);
}

export async function fetchRepoCommits(
  provider: RepoProvider,
  fullPath: string,
  branch: string,
  page = 1,
  perPage = 15,
  filePath = ""
): Promise<RepoCommitItem[]> {
  const cleanPath = filePath.replace(/^\/+|\/+$/g, "");

  if (provider === "gitlab") {
    const query = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
      ref_name: branch,
    });
    if (cleanPath) query.set("path", cleanPath);

    const res = await fetch(
      `${GITLAB_API}/projects/${encodeURIComponent(fullPath)}/repository/commits?${query.toString()}`,
      {
        headers: gitlabHeaders(),
        next: { revalidate: FETCH_REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id: string;
      short_id?: string;
      title?: string;
      message?: string;
      author_name?: string;
      committed_date?: string | null;
      created_at?: string | null;
      web_url?: string;
    }>;

    return data.map((c) => {
      const { title, body } = splitCommitMessage(c.message || c.title);
      return {
        sha: c.id,
        shortSha: c.short_id || c.id.slice(0, 8),
        title,
        body,
        authorName: c.author_name || "Unknown",
        committedAt: c.committed_date ?? c.created_at ?? null,
        webUrl: c.web_url || `https://gitlab.com/${fullPath}/-/commit/${c.id}`,
      };
    });
  }

  const [owner, repo] = fullPath.split("/");
  if (!owner || !repo) return [];

  const query = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
    sha: branch,
  });
  if (cleanPath) query.set("path", cleanPath);

  const res = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?${query.toString()}`,
    {
      headers: githubHeaders(),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    sha: string;
    html_url?: string;
    commit?: {
      message?: string;
      author?: { name?: string; date?: string | null };
      committer?: { name?: string; date?: string | null };
    };
    author?: { login?: string } | null;
  }>;

  return data.map((c) => {
    const { title, body } = splitCommitMessage(c.commit?.message);
    return {
      sha: c.sha,
      shortSha: c.sha.slice(0, 7),
      title,
      body,
      authorName:
        c.commit?.author?.name ||
        c.author?.login ||
        c.commit?.committer?.name ||
        "Unknown",
      committedAt:
        c.commit?.author?.date ?? c.commit?.committer?.date ?? null,
      webUrl: c.html_url || `https://github.com/${fullPath}/commit/${c.sha}`,
    };
  });
}

export async function fetchRepoCommitDetail(
  provider: RepoProvider,
  fullPath: string,
  sha: string
): Promise<RepoCommitDetail | null> {
  if (provider === "gitlab") {
    const encodedProj = encodeURIComponent(fullPath);
    const encodedSha = encodeURIComponent(sha);

    const [commitRes, diffRes] = await Promise.all([
      fetch(`${GITLAB_API}/projects/${encodedProj}/repository/commits/${encodedSha}`, {
        headers: gitlabHeaders(),
        next: { revalidate: FETCH_REVALIDATE_SECONDS },
      }),
      fetch(`${GITLAB_API}/projects/${encodedProj}/repository/commits/${encodedSha}/diff?per_page=100`, {
        headers: gitlabHeaders(),
        next: { revalidate: FETCH_REVALIDATE_SECONDS },
      }),
    ]);

    if (!commitRes.ok) return null;
    const commitData = (await commitRes.json()) as {
      id: string;
      short_id?: string;
      title?: string;
      message?: string;
      author_name?: string;
      committed_date?: string | null;
      created_at?: string | null;
      web_url?: string;
      stats?: { additions?: number; deletions?: number };
    };

    const diffsData = diffRes.ok
      ? ((await diffRes.json()) as Array<{
          old_path: string;
          new_path: string;
          new_file?: boolean;
          renamed_file?: boolean;
          deleted_file?: boolean;
          diff?: string;
        }>)
      : [];

    const files: RepoCommitFileDiff[] = diffsData.map((d) => {
      const status: RepoCommitFileDiff["status"] = d.new_file
        ? "added"
        : d.deleted_file
          ? "deleted"
          : d.renamed_file
            ? "renamed"
            : "modified";
      const patch = d.diff?.trim() ? d.diff : null;
      const counts = countDiffLines(patch);
      return {
        path: d.new_path || d.old_path,
        oldPath: d.renamed_file ? d.old_path : null,
        status,
        additions: counts.additions,
        deletions: counts.deletions,
        patch,
      };
    });

    const computedAdd = files.reduce((sum, f) => sum + f.additions, 0);
    const computedDel = files.reduce((sum, f) => sum + f.deletions, 0);
    const { title, body } = splitCommitMessage(commitData.message || commitData.title);

    return {
      sha: commitData.id,
      shortSha: commitData.short_id || commitData.id.slice(0, 8),
      title,
      body,
      authorName: commitData.author_name || "Unknown",
      committedAt: commitData.committed_date ?? commitData.created_at ?? null,
      webUrl: commitData.web_url || `https://gitlab.com/${fullPath}/-/commit/${commitData.id}`,
      files,
      totalAdditions: commitData.stats?.additions ?? computedAdd,
      totalDeletions: commitData.stats?.deletions ?? computedDel,
    };
  }

  const [owner, repo] = fullPath.split("/");
  if (!owner || !repo) return null;

  const res = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`,
    {
      headers: githubHeaders(),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    }
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    sha: string;
    html_url?: string;
    commit?: {
      message?: string;
      author?: { name?: string; date?: string | null };
      committer?: { name?: string; date?: string | null };
    };
    author?: { login?: string } | null;
    stats?: { additions?: number; deletions?: number };
    files?: Array<{
      filename: string;
      previous_filename?: string;
      status?: string;
      additions?: number;
      deletions?: number;
      patch?: string;
    }>;
  };

  const files: RepoCommitFileDiff[] = (data.files ?? []).map((f) => {
    const rawStatus = f.status ?? "modified";
    const status: RepoCommitFileDiff["status"] =
      rawStatus === "added"
        ? "added"
        : rawStatus === "removed"
          ? "deleted"
          : rawStatus === "renamed"
            ? "renamed"
            : "modified";
    return {
      path: f.filename,
      oldPath: f.previous_filename ?? null,
      status,
      additions: f.additions ?? 0,
      deletions: f.deletions ?? 0,
      patch: f.patch ?? null,
    };
  });

  const { title, body } = splitCommitMessage(data.commit?.message);
  const computedAdd = files.reduce((sum, f) => sum + f.additions, 0);
  const computedDel = files.reduce((sum, f) => sum + f.deletions, 0);

  return {
    sha: data.sha,
    shortSha: data.sha.slice(0, 7),
    title,
    body,
    authorName:
      data.commit?.author?.name ||
      data.author?.login ||
      data.commit?.committer?.name ||
      "Unknown",
    committedAt: data.commit?.author?.date ?? data.commit?.committer?.date ?? null,
    webUrl: data.html_url || `https://github.com/${fullPath}/commit/${data.sha}`,
    files,
    totalAdditions: data.stats?.additions ?? computedAdd,
    totalDeletions: data.stats?.deletions ?? computedDel,
  };
}

export async function fetchRepoFileContent(
  provider: RepoProvider,
  fullPath: string,
  branch: string,
  filePath: string
): Promise<RepoFileContent | null> {
  const cleanPath = filePath.replace(/^\/+|\/+$/g, "");
  if (!cleanPath) return null;
  const name = cleanPath.split("/").pop() || cleanPath;

  if (provider === "gitlab") {
    const webUrl = `https://gitlab.com/${fullPath}/-/blob/${encodePathSegments(branch)}/${encodePathSegments(cleanPath)}`;
    const rawUrl = `https://gitlab.com/${fullPath}/-/raw/${encodePathSegments(branch)}/${encodePathSegments(cleanPath)}`;
    const apiRawUrl = `${GITLAB_API}/projects/${encodeURIComponent(fullPath)}/repository/files/${encodeURIComponent(cleanPath)}/raw?ref=${encodeURIComponent(branch)}`;

    const res = await fetch(apiRawUrl, {
      headers: gitlabHeaders(),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (
      contentType.startsWith("image/") ||
      contentType.startsWith("audio/") ||
      contentType.startsWith("video/") ||
      contentType.includes("application/octet-stream")
    ) {
      const buf = await res.arrayBuffer();
      const textCandidate = new TextDecoder("utf-8", { fatal: false }).decode(
        buf.slice(0, Math.min(buf.byteLength, MAX_PREVIEW_BYTES))
      );
      if (isLikelyBinaryContent(textCandidate)) {
        return {
          path: cleanPath,
          name,
          content: null,
          size: buf.byteLength,
          isBinary: true,
          truncated: false,
          webUrl,
          rawUrl,
        };
      }
      return {
        path: cleanPath,
        name,
        content: textCandidate,
        size: buf.byteLength,
        isBinary: false,
        truncated: buf.byteLength > MAX_PREVIEW_BYTES,
        webUrl,
        rawUrl,
      };
    }

    const text = await res.text();
    const isBinary = isLikelyBinaryContent(text);
    const truncated = text.length > MAX_PREVIEW_BYTES;
    return {
      path: cleanPath,
      name,
      content: isBinary ? null : truncated ? text.slice(0, MAX_PREVIEW_BYTES) : text,
      size: text.length,
      isBinary,
      truncated,
      webUrl,
      rawUrl,
    };
  }

  const [owner, repo] = fullPath.split("/");
  if (!owner || !repo) return null;

  const webUrl = `https://github.com/${fullPath}/blob/${encodePathSegments(branch)}/${encodePathSegments(cleanPath)}`;
  const rawUrl = `https://raw.githubusercontent.com/${fullPath}/${encodePathSegments(branch)}/${encodePathSegments(cleanPath)}`;

  const res = await fetch(
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePathSegments(cleanPath)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: githubHeaders("application/vnd.github.raw+json"),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    }
  );
  if (!res.ok) return null;

  const text = await res.text();
  const isBinary = isLikelyBinaryContent(text);
  const truncated = text.length > MAX_PREVIEW_BYTES;

  return {
    path: cleanPath,
    name,
    content: isBinary ? null : truncated ? text.slice(0, MAX_PREVIEW_BYTES) : text,
    size: text.length,
    isBinary,
    truncated,
    webUrl,
    rawUrl,
  };
}

export async function fetchRepoOverview(
  provider: RepoProvider,
  fullPath: string,
  requestedBranch: string,
  dirPath = ""
): Promise<RepoOverviewResponse> {
  const branchInfo = await fetchRepoBranches(provider, fullPath);
  const availableBranches = branchInfo.branches;

  let activeBranch = requestedBranch;
  if (
    availableBranches.length > 0 &&
    !availableBranches.includes(activeBranch)
  ) {
    activeBranch = branchInfo.defaultBranch || availableBranches[0];
  }

  const [tree, commits] = await Promise.all([
    fetchRepoTree(provider, fullPath, activeBranch, dirPath),
    fetchRepoCommits(provider, fullPath, activeBranch, 1, 15, dirPath),
  ]);

  const readmeItem = tree.find(
    (item) => item.type === "file" && /^readme(\.(md|txt|rst))?$/i.test(item.name)
  );

  let readme: { path: string; content: string } | null = null;
  if (readmeItem) {
    const file = await fetchRepoFileContent(
      provider,
      fullPath,
      activeBranch,
      readmeItem.path
    );
    if (file?.content) {
      readme = {
        path: readmeItem.path,
        content: file.content,
      };
    }
  }

  return {
    branch: activeBranch,
    branches: availableBranches.length > 0 ? availableBranches : [activeBranch],
    path: dirPath.replace(/^\/+|\/+$/g, ""),
    tree,
    commits,
    readme,
  };
}
