"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Layers } from "lucide-react";
import { CLASS_LEVELS, cn, slugify } from "@/lib/utils";
import { SubjectRow } from "@/components/cards";

interface SubjectGroup {
  name: string;
  itemCount: number;
}

export function SchoolSubjectFilter({
  currentClass,
  groups,
}: {
  currentClass: string;
  groups: SubjectGroup[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, search]);

  return (
    <div className="flex flex-col gap-6">
      {/* Class Level Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-xl border-2 border-foreground bg-surface p-1 hard-shadow-sm">
          {CLASS_LEVELS.map((cls) => (
            <Link
              key={cls}
              href={`/projects/school/${cls}`}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase transition-all",
                currentClass === cls
                  ? "bg-accent text-on-accent hard-shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-surface-2"
              )}
            >
              Kelas {cls.toUpperCase()}
            </Link>
          ))}
        </div>

        {/* Real-time Subject Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mapel..."
            className="w-full rounded-xl border border-border bg-surface px-8 py-2 text-xs text-foreground placeholder:text-muted/50 outline-none transition-colors focus:border-accent"
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

      {/* Subject rows */}
      <div className="flex flex-col gap-3">
        {filtered.map((g) => (
          <SubjectRow
            key={slugify(g.name)}
            cls={currentClass}
            subject={g.name}
            slug={slugify(g.name)}
            itemCount={g.itemCount}
          />
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface p-8 text-center text-muted">
            <Layers size={28} className="mb-2 text-muted/40" />
            <p className="text-sm font-semibold text-foreground">
              Tidak ada mapel yang cocok dengan &quot;{search}&quot;
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-2 text-xs font-bold text-accent hover:underline"
            >
              Reset pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
