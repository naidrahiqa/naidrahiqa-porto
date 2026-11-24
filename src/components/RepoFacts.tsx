import {
  CircleDot,
  ExternalLink,
  GitBranch,
  GitCommit,
  HardDrive,
  Scale,
  Tag,
} from "lucide-react";
import { LanguageBar } from "@/components/LanguageBar";
import { CopyClone } from "@/components/CopyClone";
import { RepoExplorer } from "@/components/RepoExplorer";
import {
  formatRepoSize,
  normalizeHomepage,
  repoCloneUrl,
} from "@/lib/github-meta";
import { resolveRepoIdentity } from "@/lib/repo-explorer";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { Project } from "@/lib/types";

export function RepoFacts({ project }: { project: Project }) {
  const homepage = normalizeHomepage(project.repo_homepage);
  const cloneUrl = repoCloneUrl(project.link);
  const identity = resolveRepoIdentity(project);

  const facts = [
    {
      label: "License",
      value: project.repo_license ?? "-",
      icon: Scale,
    },
    {
      label: "Branch",
      value: project.repo_default_branch ?? "-",
      icon: GitBranch,
    },
    {
      label: "Open issues",
      value: String(project.repo_open_issues ?? 0),
      icon: CircleDot,
    },
    {
      label: "Size",
      value: formatRepoSize(project.repo_size_kb),
      icon: HardDrive,
    },
  ].filter((fact) => fact.value !== "-");

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
          Repository
        </h2>
        {homepage && (
          <a
            href={homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent transition-colors hover:underline"
          >
            Live demo
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      <LanguageBar
        languages={project.repo_languages}
        fallback={project.language}
        max={6}
        showLegend
      />

      {facts.length > 0 && (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div key={fact.label} className="bg-background px-3 py-2.5">
                <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  <Icon size={11} />
                  {fact.label}
                </div>
                <p className="mt-1 truncate font-mono text-[11px] text-foreground/80">
                  {fact.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {project.repo_release_tag && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Tag size={13} className="shrink-0 text-accent" />
          <span className="text-[11px] font-semibold text-foreground">
            Latest release
          </span>
          <span className="font-mono text-[11px] text-muted">
            {project.repo_release_tag}
          </span>
          {project.repo_release_at && (
            <span className="font-mono text-[10px] text-muted">
              / {formatDate(project.repo_release_at)}
            </span>
          )}
          {project.repo_release_url && (
            <a
              href={project.repo_release_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline"
            >
              Open
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}

      {project.repo_last_commit && (
        <div className="flex items-start gap-2 px-1">
          <GitCommit size={13} className="mt-0.5 shrink-0 text-muted" />
          <div className="min-w-0">
            <p className="truncate font-mono text-[11px] text-foreground/80">
              {project.repo_last_commit}
            </p>
            {project.repo_last_commit_at && (
              <p className="mt-0.5 font-mono text-[10px] text-muted">
                last commit {formatRelativeTime(project.repo_last_commit_at)}
              </p>
            )}
          </div>
        </div>
      )}

      {cloneUrl && <CopyClone url={cloneUrl} />}

      {identity && <RepoExplorer identity={identity} />}
    </section>
  );
}
