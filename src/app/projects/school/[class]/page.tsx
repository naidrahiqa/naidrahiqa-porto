import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS, slugify } from "@/lib/utils";
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
  if (items.length === 0) {
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
          <p className="text-xs uppercase tracking-widest text-accent">
            Kelas {cls.toUpperCase()}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Proyek Sekolah <span className="gradient-text">Kelas {cls.toUpperCase()}</span>
          </h1>
        </header>
        <div className="rounded-2xl border-2 border-border bg-surface p-12 text-center hard-shadow-sm">
          <p className="font-display text-lg font-bold text-foreground">
            Belum ada proyek untuk Kelas {cls.toUpperCase()}
          </p>
          <p className="mt-2 text-sm text-muted">
            Proyek sekolah untuk kelas ini akan segera diunggah.
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold uppercase text-on-accent transition-all hover:bg-accent-hover"
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
        <p className="text-xs uppercase tracking-wider text-accent">
          School
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Kelas <span className="gradient-text">{cls.toUpperCase()}</span>
        </h1>
        <p className="mt-3 text-muted">
          {groups.length} mapel · {items.length} showcase
        </p>
      </header>

      <SchoolSubjectFilter currentClass={cls} groups={subjectGroupList} />
    </div>
  );
}
