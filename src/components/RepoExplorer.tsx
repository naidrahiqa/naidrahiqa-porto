"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  FileCode,
  FileDiff,
  FileText,
  Folder,
  GitBranch,
  GitCommit,
  Loader2,
  Search,
  User,
} from "lucide-react";
import { MarkdownContent } from "@/components/MarkdownContent";
import type {
  RepoCommitDetail,
  RepoCommitFileDiff,
  RepoCommitItem,
  RepoFileContent,
  RepoIdentity,
  RepoOverviewResponse,
  RepoTreeItem,
} from "@/lib/repo-explorer";
import { formatDate, formatRelativeTime } from "@/lib/utils";

function formatBytes(bytes: number | undefined): string | null {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) {
    return null;
  }
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: RepoCommitFileDiff["status"] }) {
  const config = {
    added: {
      label: "A",
      title: "Added",
      cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    modified: {
      label: "M",
      title: "Modified",
      cls: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    deleted: {
      label: "D",
      title: "Deleted",
      cls: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    },
    renamed: {
      label: "R",
      title: "Renamed",
      cls: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
  }[status];

  return (
    <span
      title={config.title}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border font-mono text-[10px] font-bold ${config.cls}`}
    >
      {config.label}
    </span>
  );
}

function DiffPatchView({ patch }: { patch: string }) {
  const lines = useMemo(() => patch.replace(/\r\n/g, "\n").split("\n"), [patch]);

  return (
    <div className="max-h-[420px] overflow-auto bg-background font-mono text-[11px] leading-[1.6]">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, idx) => {
            const isHeader =
              line.startsWith("@@") ||
              line.startsWith("+++") ||
              line.startsWith("---");
            const isAdd = !isHeader && line.startsWith("+");
            const isDel = !isHeader && line.startsWith("-");

            let rowCls = "text-foreground/80";
            let marker = " ";
            if (line.startsWith("@@")) {
              rowCls = "bg-accent/10 text-accent font-semibold";
              marker = "@";
            } else if (isHeader) {
              rowCls = "bg-surface-2 text-muted";
            } else if (isAdd) {
              rowCls =
                "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
              marker = "+";
            } else if (isDel) {
              rowCls = "bg-red-500/10 text-red-700 dark:text-red-300";
              marker = "-";
            }

            return (
              <tr key={idx} className={rowCls}>
                <td className="w-8 select-none border-r border-border/50 px-2 text-right text-[10px] text-muted/60">
                  {idx + 1}
                </td>
                <td className="w-5 select-none px-1.5 text-center font-bold opacity-75">
                  {marker}
                </td>
                <td className="whitespace-pre px-2 py-0.5">{line}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CommitDetailPanel({
  detail,
  onOpenFile,
}: {
  detail: RepoCommitDetail;
  onOpenFile: (filePath: string) => void;
}) {
  const [openDiffs, setOpenDiffs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    detail.files.slice(0, 3).forEach((f) => {
      initial[f.path] = true;
    });
    return initial;
  });

  const toggleFileDiff = (filePath: string) => {
    setOpenDiffs((prev) => ({ ...prev, [filePath]: !prev[filePath] }));
  };

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-surface/60 p-3.5 sm:p-4">
      {detail.body && (
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-muted">
            Commit Message Detail
          </div>
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground/85">
            {detail.body}
          </pre>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <FileDiff size={13} className="text-accent" />
          <span>
            <strong className="text-foreground">{detail.files.length}</strong>{" "}
            file berubah
          </span>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[11px]">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            +{detail.totalAdditions}
          </span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            -{detail.totalDeletions}
          </span>
        </div>
      </div>

      {detail.files.length === 0 ? (
        <p className="rounded-xl border border-border bg-background px-3 py-4 text-center font-mono text-xs text-muted">
          Tidak ada perubahan file pada commit ini.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {detail.files.map((file) => {
            const isOpen = Boolean(openDiffs[file.path]);
            return (
              <div
                key={file.path}
                className="overflow-hidden rounded-xl border border-border bg-background"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 bg-surface px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleFileDiff(file.path)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown size={13} className="shrink-0 text-muted" />
                    ) : (
                      <ChevronRight size={13} className="shrink-0 text-muted" />
                    )}
                    <StatusBadge status={file.status} />
                    <span className="break-all font-mono text-[11px] font-medium text-foreground hover:text-accent">
                      {file.oldPath ? `${file.oldPath} -> ${file.path}` : file.path}
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="font-mono text-[10px]">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{file.additions}
                      </span>{" "}
                      <span className="text-red-600 dark:text-red-400">
                        -{file.deletions}
                      </span>
                    </span>
                    {file.status !== "deleted" && (
                      <button
                        type="button"
                        onClick={() => onOpenFile(file.path)}
                        className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                      >
                        Buka File
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border">
                    {file.patch ? (
                      <DiffPatchView patch={file.patch} />
                    ) : (
                      <div className="px-3 py-3 font-mono text-[11px] text-muted">
                        Diff terlalu besar atau file binary - klik{" "}
                        <button
                          type="button"
                          onClick={() => onOpenFile(file.path)}
                          className="text-accent underline"
                        >
                          Buka File
                        </button>{" "}
                        untuk melihat isinya.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RepoExplorer({ identity }: { identity: RepoIdentity }) {
  const [activeTab, setActiveTab] = useState<"commits" | "files">("commits");
  const [branch, setBranch] = useState(identity.defaultBranch);
  const [branches, setBranches] = useState<string[]>([identity.defaultBranch]);
  const [currentDir, setCurrentDir] = useState("");
  const [tree, setTree] = useState<RepoTreeItem[]>([]);
  const [commits, setCommits] = useState<RepoCommitItem[]>([]);
  const [commitPage, setCommitPage] = useState(1);
  const [hasMoreCommits, setHasMoreCommits] = useState(false);
  const [loadingMoreCommits, setLoadingMoreCommits] = useState(false);
  const [readme, setReadme] = useState<{ path: string; content: string } | null>(
    null
  );

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingDir, setLoadingDir] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedCommits, setExpandedCommits] = useState<Record<string, boolean>>(
    {}
  );
  const [commitDetails, setCommitDetails] = useState<
    Record<string, RepoCommitDetail>
  >({});
  const fetchedCommitsRef = useRef<Set<string>>(new Set());
  const [loadingCommitSha, setLoadingCommitSha] = useState<string | null>(null);

  const [activeFile, setActiveFile] = useState<RepoFileContent | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileViewMode, setFileViewMode] = useState<"code" | "preview">("code");
  const [copiedFile, setCopiedFile] = useState(false);
  const [fileFilter, setFileFilter] = useState("");

  const loadCommitDetail = useCallback(
    async (sha: string, forceOpen = false) => {
      setExpandedCommits((prev) => {
        const nextOpen = forceOpen ? true : !prev[sha];
        return { ...prev, [sha]: nextOpen };
      });

      if (fetchedCommitsRef.current.has(sha)) return;
      fetchedCommitsRef.current.add(sha);

      setLoadingCommitSha(sha);
      try {
        const params = new URLSearchParams({
          provider: identity.provider,
          repo: identity.fullPath,
          action: "commit",
          sha,
        });
        const res = await fetch(`/api/repo/explore?${params.toString()}`);
        if (!res.ok) {
          fetchedCommitsRef.current.delete(sha);
          return;
        }
        const data = (await res.json()) as { commit?: RepoCommitDetail };
        if (data.commit) {
          setCommitDetails((prev) => ({ ...prev, [sha]: data.commit! }));
        }
      } catch {
        fetchedCommitsRef.current.delete(sha);
      } finally {
        setLoadingCommitSha((curr) => (curr === sha ? null : curr));
      }
    },
    [identity.fullPath, identity.provider]
  );

  const fetchOverviewData = useCallback(
    async (targetBranch: string) => {
      const params = new URLSearchParams({
        provider: identity.provider,
        repo: identity.fullPath,
        action: "overview",
        branch: targetBranch,
      });
      const res = await fetch(`/api/repo/explore?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal memuat data repository");
      }
      return (await res.json()) as RepoOverviewResponse;
    },
    [identity.fullPath, identity.provider]
  );

  const applyOverviewData = useCallback(
    (data: RepoOverviewResponse) => {
      setBranch(data.branch);
      setBranches(data.branches);
      setTree(data.tree);
      setCommits(data.commits);
      setHasMoreCommits(data.commits.length >= 15);
      setReadme(data.readme);

      if (data.commits.length > 0) {
        const firstSha = data.commits[0].sha;
        void loadCommitDetail(firstSha, true);
      }
    },
    [loadCommitDetail]
  );

  const reloadOverview = useCallback(
    async (targetBranch: string) => {
      setLoadingOverview(true);
      setError(null);
      setActiveFile(null);
      setCurrentDir("");
      setCommitPage(1);

      try {
        const data = await fetchOverviewData(targetBranch);
        applyOverviewData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat data repository"
        );
      } finally {
        setLoadingOverview(false);
      }
    },
    [applyOverviewData, fetchOverviewData]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOverviewData(identity.defaultBranch);
        if (cancelled) return;
        applyOverviewData(data);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Gagal memuat data repository"
        );
      } finally {
        if (!cancelled) {
          setLoadingOverview(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyOverviewData, fetchOverviewData, identity.defaultBranch]);

  const navigateDirectory = async (dirPath: string) => {
    setActiveTab("files");
    setActiveFile(null);
    setFileFilter("");
    setLoadingDir(true);
    try {
      const params = new URLSearchParams({
        provider: identity.provider,
        repo: identity.fullPath,
        action: "tree",
        branch,
        path: dirPath,
      });
      const res = await fetch(`/api/repo/explore?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        tree: RepoTreeItem[];
        readme: { path: string; content: string } | null;
        path: string;
      };
      setCurrentDir(data.path);
      setTree(data.tree);
      setReadme(data.readme);
    } finally {
      setLoadingDir(false);
    }
  };

  const openFile = async (filePath: string) => {
    setActiveTab("files");
    setLoadingFile(true);
    const parentParts = filePath.split("/").slice(0, -1);
    const parentDir = parentParts.join("/");
    if (parentDir !== currentDir) {
      setCurrentDir(parentDir);
    }

    try {
      const params = new URLSearchParams({
        provider: identity.provider,
        repo: identity.fullPath,
        action: "file",
        branch,
        path: filePath,
      });
      const res = await fetch(`/api/repo/explore?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as { file?: RepoFileContent };
      if (data.file) {
        setActiveFile(data.file);
        const isMarkdown = /\.(md|markdown)$/i.test(data.file.name);
        setFileViewMode(isMarkdown ? "preview" : "code");
      }
    } finally {
      setLoadingFile(false);
    }
  };

  const loadMoreCommits = async () => {
    if (loadingMoreCommits) return;
    setLoadingMoreCommits(true);
    const nextPage = commitPage + 1;
    try {
      const params = new URLSearchParams({
        provider: identity.provider,
        repo: identity.fullPath,
        action: "commits",
        branch,
        page: String(nextPage),
      });
      const res = await fetch(`/api/repo/explore?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as { commits?: RepoCommitItem[] };
      const more = data.commits ?? [];
      setCommits((prev) => [...prev, ...more]);
      setCommitPage(nextPage);
      setHasMoreCommits(more.length >= 15);
    } finally {
      setLoadingMoreCommits(false);
    }
  };

  const handleCopyFile = async () => {
    if (!activeFile?.content) return;
    await navigator.clipboard.writeText(activeFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 1800);
  };

  const dirSegments = useMemo(
    () => (currentDir ? currentDir.split("/").filter(Boolean) : []),
    [currentDir]
  );

  const filteredTree = useMemo(() => {
    const q = fileFilter.trim().toLowerCase();
    if (!q) return tree;
    return tree.filter((item) => item.name.toLowerCase().includes(q));
  }, [fileFilter, tree]);

  const fileLines = useMemo(() => {
    if (!activeFile?.content) return [];
    return activeFile.content.replace(/\r\n/g, "\n").split("\n");
  }, [activeFile]);

  const providerLabel = identity.provider === "gitlab" ? "GitLab" : "GitHub";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("commits")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
              activeTab === "commits"
                ? "bg-foreground text-background"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            <GitCommit size={13} />
            Commits
            {commits.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === "commits"
                    ? "bg-background/20 text-background"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {commits.length}
                {hasMoreCommits ? "+" : ""}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("files")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
              activeTab === "files"
                ? "bg-foreground text-background"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            <Code2 size={13} />
            Files &amp; Code
            {tree.length > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === "files"
                    ? "bg-background/20 text-background"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {tree.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-[11px] text-foreground">
            <GitBranch size={12} className="text-accent" />
            {branches.length > 1 ? (
              <select
                value={branch}
                onChange={(e) => {
                  const nextBranch = e.target.value;
                  setBranch(nextBranch);
                  void reloadOverview(nextBranch);
                }}
                aria-label="Select branch"
                className="max-w-[160px] cursor-pointer truncate bg-transparent font-mono text-[11px] text-foreground focus:outline-none"
              >
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-surface text-foreground">
                    {b}
                  </option>
                ))}
              </select>
            ) : (
              <span className="max-w-[150px] truncate">{branch}</span>
            )}
          </div>

          <a
            href={identity.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {providerLabel}
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {loadingOverview ? (
        <div className="flex items-center justify-center gap-2.5 py-14 font-mono text-xs text-muted">
          <Loader2 size={15} className="animate-spin text-accent" />
          Memuat git tree &amp; riwayat commit dari {providerLabel}...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <p className="font-mono text-xs text-muted">{error}</p>
          <button
            type="button"
            onClick={() => void reloadOverview(branch)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-foreground hover:border-accent"
          >
            Coba Lagi
          </button>
        </div>
      ) : activeTab === "commits" ? (
        <div className="flex flex-col divide-y divide-border">
          {commits.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-muted">
              Belum ada riwayat commit pada branch {branch}.
            </div>
          ) : (
            commits.map((commit) => {
              const isExpanded = Boolean(expandedCommits[commit.sha]);
              const detail = commitDetails[commit.sha];
              const isLoadingThis = loadingCommitSha === commit.sha;

              return (
                <div key={commit.sha} className="flex flex-col">
                  <div className="flex flex-col gap-2.5 p-3.5 transition-colors hover:bg-surface/50 sm:flex-row sm:items-start sm:justify-between sm:p-4">
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => void loadCommitDetail(commit.sha)}
                        className="group flex items-start gap-2 text-left"
                      >
                        <span className="mt-0.5 shrink-0 text-muted group-hover:text-accent">
                          {isExpanded ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </span>
                        <span className="break-words font-mono text-xs font-semibold leading-snug text-foreground group-hover:text-accent sm:text-[13px]">
                          {commit.title}
                        </span>
                      </button>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-5 font-mono text-[10px] text-muted">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                          <User size={11} className="text-accent" />
                          {commit.authorName}
                        </span>
                        {commit.committedAt && (
                          <span title={formatDate(commit.committedAt)}>
                            committed {formatRelativeTime(commit.committedAt)} (
                            {formatDate(commit.committedAt)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 pl-5 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => void loadCommitDetail(commit.sha)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors ${
                          isExpanded
                            ? "border-accent/40 bg-accent-fill text-accent"
                            : "border-border bg-surface text-foreground hover:border-foreground/30"
                        }`}
                      >
                        <FileDiff size={11} />
                        {isExpanded ? "Tutup File & Diff" : "Lihat File & Diff"}
                      </button>

                      <a
                        href={commit.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Buka commit di tab baru"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 font-mono text-[10px] text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
                      >
                        {commit.shortSha}
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>

                  {isExpanded && (
                    <div>
                      {isLoadingThis && !detail ? (
                        <div className="flex items-center gap-2 border-t border-border bg-surface/40 px-4 py-6 font-mono text-xs text-muted">
                          <Loader2 size={14} className="animate-spin text-accent" />
                          Memuat daftar file &amp; diff commit {commit.shortSha}...
                        </div>
                      ) : detail ? (
                        <CommitDetailPanel
                          detail={detail}
                          onOpenFile={(filePath) => void openFile(filePath)}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {hasMoreCommits && (
            <div className="bg-surface/40 p-3 text-center">
              <button
                type="button"
                onClick={() => void loadMoreCommits()}
                disabled={loadingMoreCommits}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 font-mono text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {loadingMoreCommits && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                Muat Commit Lebih Lama
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/50 px-3.5 py-2.5">
            <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => void navigateDirectory("")}
                className={`rounded px-1.5 py-0.5 font-semibold transition-colors ${
                  dirSegments.length === 0 && !activeFile
                    ? "text-foreground"
                    : "text-accent hover:underline"
                }`}
              >
                {identity.fullPath.split("/").pop()}
              </button>
              {dirSegments.map((segment, index) => {
                const targetPath = dirSegments.slice(0, index + 1).join("/");
                const isLast = index === dirSegments.length - 1 && !activeFile;
                return (
                  <span key={targetPath} className="inline-flex items-center gap-1">
                    <span className="text-muted">/</span>
                    <button
                      type="button"
                      onClick={() => void navigateDirectory(targetPath)}
                      className={`rounded px-1.5 py-0.5 transition-colors ${
                        isLast
                          ? "font-semibold text-foreground"
                          : "text-accent hover:underline"
                      }`}
                    >
                      {segment}
                    </button>
                  </span>
                );
              })}
              {activeFile && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-muted">/</span>
                  <span className="px-1.5 py-0.5 font-semibold text-foreground">
                    {activeFile.name}
                  </span>
                </span>
              )}
            </div>

            {!activeFile && tree.length > 5 && (
              <div className="relative">
                <Search
                  size={12}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={fileFilter}
                  onChange={(e) => setFileFilter(e.target.value)}
                  placeholder="Filter file..."
                  className="w-36 rounded-lg border border-border bg-background py-1 pl-7 pr-2.5 font-mono text-[11px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none sm:w-44"
                />
              </div>
            )}
          </div>

          {loadingFile || loadingDir ? (
            <div className="flex items-center justify-center gap-2 py-14 font-mono text-xs text-muted">
              <Loader2 size={15} className="animate-spin text-accent" />
              Memuat {loadingFile ? "isi file" : "direktori"}...
            </div>
          ) : activeFile ? (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveFile(null)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-[11px] font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    <ArrowLeft size={12} />
                    Folder
                  </button>
                  <span className="font-mono text-[11px] text-muted">
                    {fileLines.length > 0 ? `${fileLines.length} lines` : ""}
                    {activeFile.size ? ` · ${formatBytes(activeFile.size)}` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/\.(md|markdown)$/i.test(activeFile.name) &&
                    activeFile.content && (
                      <div className="flex overflow-hidden rounded-lg border border-border bg-background font-mono text-[10px]">
                        <button
                          type="button"
                          onClick={() => setFileViewMode("preview")}
                          className={`px-2.5 py-1 ${
                            fileViewMode === "preview"
                              ? "bg-foreground font-semibold text-background"
                              : "text-muted hover:text-foreground"
                          }`}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => setFileViewMode("code")}
                          className={`px-2.5 py-1 ${
                            fileViewMode === "code"
                              ? "bg-foreground font-semibold text-background"
                              : "text-muted hover:text-foreground"
                          }`}
                        >
                          Raw Code
                        </button>
                      </div>
                    )}

                  {activeFile.content && (
                    <button
                      type="button"
                      onClick={() => void handleCopyFile()}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-[10px] font-medium text-foreground transition-colors hover:border-accent"
                    >
                      {copiedFile ? (
                        <>
                          <Check size={11} className="text-emerald-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          Copy
                        </>
                      )}
                    </button>
                  )}

                  <a
                    href={activeFile.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted transition-colors hover:text-foreground"
                  >
                    {providerLabel}
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {activeFile.isBinary || activeFile.content === null ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <p className="font-mono text-xs text-muted">
                    File binary ({formatBytes(activeFile.size) ?? "binary"}) tidak
                    ditampilkan sebagai teks.
                  </p>
                  <a
                    href={activeFile.rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-accent hover:underline"
                  >
                    Unduh / Buka Raw File
                    <ExternalLink size={12} />
                  </a>
                </div>
              ) : fileViewMode === "preview" ? (
                <div className="p-5">
                  <MarkdownContent content={activeFile.content} />
                </div>
              ) : (
                <div className="max-h-[600px] overflow-auto bg-background font-mono text-[11px] leading-[1.65]">
                  {activeFile.truncated && (
                    <div className="border-b border-border bg-amber-500/10 px-3.5 py-2 text-[11px] text-amber-600 dark:text-amber-400">
                      Menampilkan 180 KB pertama dari file ini.{" "}
                      <a
                        href={activeFile.rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                      >
                        Buka file penuh di {providerLabel}
                      </a>
                    </div>
                  )}
                  <table className="w-full border-collapse">
                    <tbody>
                      {fileLines.map((line, index) => (
                        <tr
                          key={index}
                          className="hover:bg-surface/70"
                        >
                          <td className="w-12 select-none border-r border-border/50 px-2.5 text-right text-[10px] text-muted/60">
                            {index + 1}
                          </td>
                          <td className="whitespace-pre px-3 py-0.5 text-foreground/90">
                            {line || " "}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {commits[0] && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/35 px-3.5 py-2 font-mono text-[11px]">
                  <div className="flex min-w-0 items-center gap-2">
                    <GitCommit size={13} className="shrink-0 text-accent" />
                    <span className="font-semibold text-foreground">
                      {commits[0].authorName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("commits");
                        void loadCommitDetail(commits[0].sha, true);
                      }}
                      className="truncate text-muted hover:text-accent hover:underline"
                    >
                      {commits[0].title}
                    </button>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-[10px] text-muted">
                    <span>{commits[0].shortSha}</span>
                    {commits[0].committedAt && (
                      <span>{formatRelativeTime(commits[0].committedAt)}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="divide-y divide-border/60">
                {currentDir && (
                  <button
                    type="button"
                    onClick={() => {
                      const parent = dirSegments.slice(0, -1).join("/");
                      void navigateDirectory(parent);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left font-mono text-xs text-muted transition-colors hover:bg-surface/60 hover:text-foreground"
                  >
                    <Folder size={14} className="text-accent" />
                    <span>..</span>
                  </button>
                )}

                {filteredTree.length === 0 ? (
                  <div className="py-10 text-center font-mono text-xs text-muted">
                    Tidak ada file yang cocok.
                  </div>
                ) : (
                  filteredTree.map((item) => {
                    const isDir = item.type === "dir";
                    const isMd = /\.(md|markdown)$/i.test(item.name);
                    const sizeLabel = formatBytes(item.size);

                    return (
                      <div
                        key={item.path}
                        className="flex items-center justify-between gap-3 px-3.5 py-2 transition-colors hover:bg-surface/60"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            isDir
                              ? void navigateDirectory(item.path)
                              : void openFile(item.path)
                          }
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left font-mono text-xs text-foreground hover:text-accent"
                        >
                          {isDir ? (
                            <Folder
                              size={14}
                              className="shrink-0 fill-accent/15 text-accent"
                            />
                          ) : isMd ? (
                            <FileText size={14} className="shrink-0 text-muted" />
                          ) : (
                            <FileCode size={14} className="shrink-0 text-muted" />
                          )}
                          <span className="truncate">
                            {item.name}
                            {isDir ? "/" : ""}
                          </span>
                        </button>

                        <div className="flex shrink-0 items-center gap-2.5">
                          {sizeLabel && (
                            <span className="font-mono text-[10px] text-muted">
                              {sizeLabel}
                            </span>
                          )}
                          <a
                            href={item.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${item.name} on ${providerLabel}`}
                            className="text-muted transition-colors hover:text-foreground"
                          >
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {readme && (
                <div className="border-t border-border bg-surface/20 p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-2.5 font-mono text-xs font-semibold text-foreground">
                    <BookOpen size={13} className="text-accent" />
                    {readme.path}
                  </div>
                  <MarkdownContent content={readme.content} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
