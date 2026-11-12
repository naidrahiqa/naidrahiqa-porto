"use client";

import { useState } from "react";
import { RepoCard } from "@/components/cards";
import { cn, languageColor } from "@/lib/utils";
import type { Project } from "@/lib/types";

const ALL = "All";

export function ProjectFilter({ projects }: { projects: Project[] }) {
  const languages = Array.from(
    new Set(projects.map((p) => p.language).filter(Boolean))
  ).sort();

  const [active, setActive] = useState(ALL);

  const filtered =
    active === ALL
      ? projects
      : projects.filter((p) => p.language === active);

  const countFor = (lang: string) =>
    lang === ALL
      ? projects.length
      : projects.filter((p) => p.language === lang).length;

  return (
    <div className="flex flex-col gap-6">
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
