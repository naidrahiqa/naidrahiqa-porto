"use client";

import { useState } from "react";
import { RepoCard } from "@/components/cards";
import { BrandIcon } from "@/components/BrandIcon";
import { repoProvider, type RepoProvider } from "@/lib/github-meta";
import { cn, languageColor } from "@/lib/utils";
import type { Project } from "@/lib/types";

const ALL = "All";

export function ProjectFilter({ projects }: { projects: Project[] }) {
  const [providerFilter, setProviderFilter] = useState<"all" | RepoProvider>(
    "all"
  );
  const [active, setActive] = useState(ALL);

  const githubCount = projects.filter(
    (p) => repoProvider(p.link, p.repo_name) === "github"
  ).length;
  const gitlabCount = projects.filter(
    (p) => repoProvider(p.link, p.repo_name) === "gitlab"
  ).length;
  const showProviderTabs = githubCount > 0 && gitlabCount > 0;

  const providerScoped =
    providerFilter === "all"
      ? projects
      : projects.filter(
          (p) => repoProvider(p.link, p.repo_name) === providerFilter
        );

  const languages = Array.from(
    new Set(providerScoped.map((p) => p.language).filter(Boolean))
  ).sort();

  const filtered =
    active === ALL
      ? providerScoped
      : providerScoped.filter((p) => p.language === active);

  const countFor = (lang: string) =>
    lang === ALL
      ? providerScoped.length
      : providerScoped.filter((p) => p.language === lang).length;

  return (
    <div className="flex flex-col gap-5">
      {showProviderTabs && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setProviderFilter("all");
              setActive(ALL);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors",
              providerFilter === "all"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted hover:text-foreground"
            )}
          >
            All Sources
            <span className="font-mono text-[10px] opacity-70">
              {projects.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setProviderFilter("github");
              setActive(ALL);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors",
              providerFilter === "github"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted hover:text-foreground"
            )}
          >
            <BrandIcon platform="github" size={12} />
            GitHub
            <span className="font-mono text-[10px] opacity-70">
              {githubCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setProviderFilter("gitlab");
              setActive(ALL);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors",
              providerFilter === "gitlab"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-muted hover:text-foreground"
            )}
          >
            <BrandIcon platform="gitlab" size={12} />
            GitLab
            <span className="font-mono text-[10px] opacity-70">
              {gitlabCount}
            </span>
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {[ALL, ...languages].map((lang) => {
          const isActive = active === lang;
          return (
            <button
              key={lang}
              type="button"
              onClick={() => setActive(lang)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-colors duration-150",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-muted hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {lang !== ALL && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: languageColor(lang) }}
                />
              )}
              {lang}
              <span
                className={cn(
                  "font-mono text-[10px]",
                  isActive ? "text-background/60" : "text-muted/70"
                )}
              >
                {countFor(lang)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <RepoCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
          No repositories in this language yet.
        </p>
      )}
    </div>
  );
}
