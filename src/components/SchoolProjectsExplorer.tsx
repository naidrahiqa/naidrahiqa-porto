"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, BookOpen, Layers, ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/cards";
import { cn, slugify } from "@/lib/utils";
import type { Project } from "@/lib/types";

interface SchoolProjectsExplorerProps {
  projects: Project[];
}

export function SchoolProjectsExplorer({ projects }: SchoolProjectsExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const classCounts = useMemo(() => {
    return {
      all: projects.length,
      xii: projects.filter((p) => p.class_level === "xii").length,
      xi: projects.filter((p) => p.class_level === "xi").length,
      x: projects.filter((p) => p.class_level === "x").length,
    };
  }, [projects]);

  const availableSubjects = useMemo(() => {
    const pool =
      selectedClass === "all"
        ? projects
        : projects.filter((p) => p.class_level === selectedClass);
    return Array.from(new Set(pool.map((p) => p.subject).filter(Boolean))).sort();
  }, [projects, selectedClass]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedClass !== "all" && p.class_level !== selectedClass) {
        return false;
      }
      if (selectedSubject !== "all" && p.subject !== selectedSubject) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchSubject = (p.subject || "").toLowerCase().includes(query);
        const matchDesc = (p.description || "").toLowerCase().includes(query);
        if (!matchTitle && !matchSubject && !matchDesc) {
          return false;
        }
      }
      return true;
    });
  }, [projects, selectedClass, selectedSubject, search]);

  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    setSelectedSubject("all");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* FILTER CONTROL BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-foreground bg-surface p-5 hard-shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* CLASS PILLS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "Semua Kelas", count: classCounts.all },
              { id: "xii", label: "Kelas XII", count: classCounts.xii },
              { id: "xi", label: "Kelas XI", count: classCounts.xi },
              { id: "x", label: "Kelas X", count: classCounts.x },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleClassChange(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase transition-all duration-150",
                  selectedClass === tab.id
                    ? "bg-accent text-on-accent hard-shadow-sm"
                    : "border border-border bg-surface-2/60 text-muted hover:border-accent hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.2 font-mono text-[10px]",
                    selectedClass === tab.id
                      ? "bg-black/20 text-on-accent"
                      : "bg-surface text-muted"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* REALTIME SEARCH INPUT */}
          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, materi, atau topik..."
              className="w-full rounded-xl border border-border bg-surface-2/40 px-8 py-2 text-xs text-foreground placeholder:text-muted/50 outline-none transition-colors focus:border-accent focus:bg-surface"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* SUBJECT PILLS */}
        {availableSubjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            <span className="text-[11px] font-bold text-muted mr-1 flex items-center gap-1">
              <Layers size={11} className="text-accent" />
              Mapel:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSubject("all")}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all",
                selectedSubject === "all"
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border/70 bg-surface text-muted hover:border-accent hover:text-foreground"
              )}
            >
              Semua Mapel
            </button>
            {availableSubjects.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all",
                  selectedSubject === sub
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border/70 bg-surface text-muted hover:border-accent hover:text-foreground"
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RESULT STATUS BAR */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Menampilkan <strong className="text-foreground">{filteredProjects.length}</strong> showcase tugas
          {selectedClass !== "all" && ` di Kelas ${selectedClass.toUpperCase()}`}
          {selectedSubject !== "all" && ` (${selectedSubject})`}
        </span>
        {selectedClass !== "all" && (
          <Link
            href={`/projects/school/${selectedClass}`}
            className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
          >
            Buka direktori Kelas {selectedClass.toUpperCase()}
            <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* PROJECTS GRID */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface p-12 text-center">
          <BookOpen size={36} className="mb-3 text-muted/40" />
          <h3 className="font-display text-base font-bold text-foreground">
            Tidak ada proyek yang cocok
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm">
            {search
              ? `Tidak ditemukan proyek yang cocok dengan kata kunci "${search}".`
              : "Belum ada proyek yang terdata untuk kombinasi filter ini."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedClass("all");
              setSelectedSubject("all");
            }}
            className="mt-4 inline-flex items-center gap-1 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-on-accent hard-shadow-sm hover:bg-accent-hover"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}
