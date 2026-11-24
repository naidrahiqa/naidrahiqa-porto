import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS, slugify } from "@/lib/utils";
import { isPklSubjectSlug, PKL_DEFAULT_CLASS } from "@/lib/pkl";
import { SchoolSubjectFilter } from "@/components/SchoolSubjectFilter";
import type { Project } from "@/lib/types";

export async function generateStaticParams() {
  return CLASS_LEVELS.map((cls) => ({ class: cls }));
}

export const metadata: Metadata = {
  title: "School Projects",
  description: "School projects per class - Naidrahiqa",
};

export default async function SchoolClassPage({
  params,
}: PageProps<"/projects/school/[class]">) {
  const { class: cls } = await params;
  if (!CLASS_LEVELS.includes(cls as (typeof CLASS_LEVELS)[number])) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .eq("category", "school")
    .eq("class_level", cls)
    .order("sort_order", { ascending: true });

  const items = (data ?? []) as Project[];
  const pklItems = items.filter((item) => isPklSubjectSlug(item.subject));
  const showPklBanner = cls === PKL_DEFAULT_CLASS || pklItems.length > 0;

  if (items.length === 0 && !showPklBanner) {
    return (
      <div className="flex flex-col gap-10 pt-12 sm:pt-16">
        <Link
          href="/projects"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={14} />
          Semua Proyek
        </Link>
        <header className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            Kelas {cls.toUpperCase()}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Proyek Sekolah Kelas {cls.toUpperCase()}
          </h1>
        </header>
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="font-display text-lg font-bold text-foreground">
            Belum ada proyek untuk Kelas {cls.toUpperCase()}
          </p>
          <p className="mt-2 text-sm text-muted">
            Proyek sekolah untuk kelas ini akan segera diunggah.
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            Lihat Proyek Lainnya
          </Link>
        </div>
      </div>
    );
  }

  const groups: { name: string; items: Project[] }[] = [];
  const bySubject = new Map<string, Project[]>();
  const unfiled: Project[] = [];

  for (const item of items) {
    if (item.subject) {
      const key = slugify(item.subject);
      if (!bySubject.has(key)) bySubject.set(key, []);
      bySubject.get(key)!.push(item);
    } else {
      unfiled.push(item);
    }
  }

  for (const [, list] of bySubject) {
    groups.push({ name: list[0].subject, items: list });
  }
  groups.sort((a, b) => a.name.localeCompare(b.name));

  if (unfiled.length > 0) {
    groups.push({ name: "Lainnya", items: unfiled });
  }

  const subjectGroupList = groups.map((g) => ({
    name: g.name,
    itemCount: g.items.length,
  }));

  return (
    <div className="flex flex-col gap-10 pt-12 sm:pt-16">
      <Link
        href="/projects"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} />
        Semua kelas
      </Link>

      <header className="max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          School
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Kelas <span className="text-foreground/30">{cls.toUpperCase()}</span>
        </h1>
        <p className="mt-3 font-mono text-xs text-muted">
          {groups.length} mapel · {items.length} showcase
        </p>
      </header>

      {showPklBanner && (
        <Link
          href={`/projects/school/${cls}/pkl`}
          className="group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-foreground/25 sm:flex-row sm:items-center"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent-fill text-accent">
              <BookOpen size={18} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  Jurnal Mingguan
                </span>
                <span className="h-px w-3 bg-border" />
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {pklItems.length} catatan
                </span>
              </div>
              <h2 className="mt-1 font-display text-lg font-extrabold uppercase tracking-tight text-foreground transition-colors group-hover:text-accent">
                Kegiatan PKL (Praktik Kerja Lapangan)
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Timeline blog kegiatan mingguan, dokumentasi pekerjaan, dan
                pembelajaran lapangan.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-foreground">
            Buka Jurnal PKL
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        </Link>
      )}

      {subjectGroupList.length > 0 && (
        <SchoolSubjectFilter currentClass={cls} groups={subjectGroupList} />
      )}
    </div>
  );
}
