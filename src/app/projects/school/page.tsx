import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS } from "@/lib/utils";
import { ClassCard } from "@/components/cards";
import { SchoolProjectsExplorer } from "@/components/SchoolProjectsExplorer";
import type { Project } from "@/lib/types";

export const metadata: Metadata = {
  title: "School Projects - Naidrahiqa",
  description:
    "Koleksi portofolio tugas sekolah, praktikum kejuruan TKJ, dan laporan observasi Faqih Ardian Syah di SMK Negeri 3 Jepara.",
};

export default async function SchoolProjectsHubPage() {
  const supabase = await createClient();

  const { data: rawProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .eq("category", "school")
    .order("sort_order", { ascending: true });

  const projects = (rawProjects ?? []) as Project[];

  const classSummaries = CLASS_LEVELS.map((cls) => {
    const items = projects.filter((p) => p.class_level === cls);
    const subjectSet = new Set(items.map((p) => p.subject).filter(Boolean));
    return {
      cls,
      items,
      itemCount: items.length,
      subjects: [...subjectSet].sort(),
    };
  });

  const totalSubjects = new Set(projects.map((p) => p.subject).filter(Boolean)).size;

  return (
    <div className="flex flex-col gap-12 pt-12 sm:pt-16">
      {/* NAVIGATION & BREADCRUMB */}
      <Link
        href="/projects"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} />
        Kembali ke Semua Proyek
      </Link>

      {/* HEADER SECTION */}
      <header className="flex flex-col gap-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 w-fit">
          <BookOpen size={13} className="text-accent" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
            School Projects & Showcase
          </span>
        </div>

        <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
          Tugas & Praktikum <span className="gradient-text">Sekolah</span>
        </h1>

        <p className="text-sm leading-relaxed text-muted sm:text-base">
          Dokumentasi praktikum kejuruan Teknik Komputer dan Jaringan (TKJ), modul administrasi sistem, keamanan jaringan, tugas kelompok, serta jobsheet pembelajaran di SMK Negeri 3 Jepara.
        </p>

        {/* STATS STRIP */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 hard-shadow-sm">
            <Layers size={13} className="text-accent" />
            <span className="text-xs font-semibold text-foreground">
              {projects.length} Total Showcase
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 hard-shadow-sm">
            <Award size={13} className="text-accent" />
            <span className="text-xs font-semibold text-foreground">
              {totalSubjects} Mata Pelajaran
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 hard-shadow-sm">
            <span className="font-mono text-xs font-bold text-accent">3</span>
            <span className="text-xs font-semibold text-foreground">
              Tingkat Kelas (X, XI, XII)
            </span>
          </div>
        </div>
      </header>

      {/* CLASS QUICK DIRECTORY */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
            Direktori Per Kelas
          </h2>
          <span className="font-mono text-xs text-muted">
            Klik kelas untuk melihat daftar per mapel
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classSummaries.map((c) => (
            <ClassCard
              key={c.cls}
              cls={c.cls}
              itemCount={c.itemCount}
              subjects={c.subjects}
            />
          ))}
        </div>
      </section>

      {/* INTERACTIVE SHOWCASE EXPLORER */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
            Semua Showcase Tugas Sekolah
          </h2>
          <p className="text-xs text-muted mt-1">
            Gunakan filter kelas, kategori mata pelajaran, atau pencarian langsung untuk menemukan materi tugas.
          </p>
        </div>

        <SchoolProjectsExplorer projects={projects} />
      </section>
    </div>
  );
}
