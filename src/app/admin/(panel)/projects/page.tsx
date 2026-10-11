import Link from "next/link";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS, cn } from "@/lib/utils";
import { ProjectReorderList } from "./ProjectReorderList";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; class?: string; subject?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const classLevel = params.class;
  const subjectFilter = params.subject;

  const supabase = await createClient();

  // If school category is active, fetch school projects to compile available mapel filters
  let schoolStatsQuery = supabase
    .from("projects")
    .select("class_level, subject")
    .eq("category", "school");

  if (classLevel && CLASS_LEVELS.includes(classLevel as (typeof CLASS_LEVELS)[number])) {
    schoolStatsQuery = schoolStatsQuery.eq("class_level", classLevel);
  }

  const { data: schoolProjectsMeta } = await schoolStatsQuery;

  const subjectCounts = new Map<string, number>();
  let unfiledCount = 0;
  if (schoolProjectsMeta) {
    for (const item of schoolProjectsMeta) {
      if (item.subject && item.subject.trim()) {
        const s = item.subject.trim();
        subjectCounts.set(s, (subjectCounts.get(s) ?? 0) + 1);
      } else {
        unfiledCount++;
      }
    }
  }

  const availableSubjects = Array.from(subjectCounts.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  let query = supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (category === "school" || category === "personal") {
    query = query.eq("category", category);
  }

  if (
    category === "school" &&
    classLevel &&
    CLASS_LEVELS.includes(classLevel as (typeof CLASS_LEVELS)[number])
  ) {
    query = query.eq("class_level", classLevel);
  }

  if (category === "school" && subjectFilter) {
    if (subjectFilter === "__unfiled__") {
      query = query.or("subject.is.null,subject.eq.");
    } else {
      query = query.eq("subject", subjectFilter);
    }
  }

  const { data: projects } = await query;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            Drag to reorder - the top items appear first on your site.{" "}
            {projects?.length ?? 0} total
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-all duration-200 hover:bg-accent-hover hover:-translate-y-0.5"
        >
          <Plus size={15} />
          New Project
        </Link>
      </header>

      {/* Category tabs */}
      <div className="flex gap-2">
        <Link
          href="/admin/projects"
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            !category
              ? "bg-accent text-on-accent"
              : "bg-surface-2 text-muted hover:text-foreground"
          )}
        >
          All
        </Link>
        <Link
          href="/admin/projects?category=school"
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            category === "school"
              ? "bg-accent text-on-accent"
              : "bg-surface-2 text-muted hover:text-foreground"
          )}
        >
          School
        </Link>
        <Link
          href="/admin/projects?category=personal"
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            category === "personal"
              ? "bg-accent text-on-accent"
              : "bg-surface-2 text-muted hover:text-foreground"
          )}
        >
          Personal
        </Link>
      </div>

      {/* School Class & Mapel filters */}
      {category === "school" && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-foreground bg-surface p-4 hard-shadow-sm">
          {/* Class filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Kelas:
            </span>
            <Link
              href="/admin/projects?category=school"
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                !classLevel
                  ? "bg-accent text-on-accent"
                  : "bg-surface-2 text-muted hover:text-foreground"
              )}
            >
              Semua Kelas
            </Link>
            {CLASS_LEVELS.map((cls) => (
              <Link
                key={cls}
                href={`/admin/projects?category=school&class=${cls}`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  classLevel === cls
                    ? "bg-accent text-on-accent"
                    : "bg-surface-2 text-muted hover:text-foreground"
                )}
              >
                Kelas {cls.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* Mapel filter */}
          {availableSubjects.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1">
                Mapel:
              </span>

              <Link
                href={
                  classLevel
                    ? `/admin/projects?category=school&class=${classLevel}`
                    : "/admin/projects?category=school"
                }
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  !subjectFilter
                    ? "bg-accent text-on-accent"
                    : "bg-surface-2 text-muted hover:text-foreground"
                )}
              >
                Semua Mapel
              </Link>

              {availableSubjects.map(([sName, count]) => {
                const isActive = subjectFilter === sName;
                const href = classLevel
                  ? `/admin/projects?category=school&class=${classLevel}&subject=${encodeURIComponent(sName)}`
                  : `/admin/projects?category=school&subject=${encodeURIComponent(sName)}`;

                return (
                  <Link
                    key={sName}
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors border",
                      isActive
                        ? "bg-accent text-on-accent border-accent"
                        : "border-border/60 bg-surface-2/60 text-muted hover:text-foreground hover:border-accent/40"
                    )}
                  >
                    <span>{sName}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                        isActive ? "bg-black/20 text-white" : "bg-surface text-muted"
                      )}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })}

              {unfiledCount > 0 && (
                <Link
                  href={
                    classLevel
                      ? `/admin/projects?category=school&class=${classLevel}&subject=__unfiled__`
                      : "/admin/projects?category=school&subject=__unfiled__"
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors border",
                    subjectFilter === "__unfiled__"
                      ? "bg-accent text-on-accent border-accent"
                      : "border-border/60 bg-surface-2/60 text-muted hover:text-foreground"
                  )}
                >
                  <span>Tanpa Mapel</span>
                  <span className="rounded-full bg-surface px-1.5 py-0.2 text-[10px] font-mono text-muted">
                    {unfiledCount}
                  </span>
                </Link>
              )}

              {subjectFilter && (
                <Link
                  href={
                    classLevel
                      ? `/admin/projects?category=school&class=${classLevel}`
                      : "/admin/projects?category=school"
                  }
                  className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-danger hover:underline"
                >
                  <X size={12} />
                  Reset Filter Mapel
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reorderable list */}
      {projects && projects.length > 0 ? (
        <ProjectReorderList items={projects} />
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          <p className="font-semibold text-foreground">Tidak ada proyek ditemukan</p>
          <p className="mt-1 text-xs">Coba sesuaikan filter kelas atau mapel di atas.</p>
        </div>
      )}
    </div>
  );
}
