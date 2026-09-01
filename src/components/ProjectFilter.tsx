"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/cards";
import { cn } from "@/lib/utils";
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

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {[ALL, ...languages].map((lang) => (
          <button
            key={lang}
            onClick={() => setActive(lang)}
            className={cn(
              "rounded-full border-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-150",
              active === lang
                ? "border-foreground bg-accent text-on-accent hard-shadow-sm"
                : "border-border bg-surface text-muted hover:border-border-hover hover:text-foreground"
            )}
          >
            {lang}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          No projects found
        </p>
      )}
    </>
  );
}
