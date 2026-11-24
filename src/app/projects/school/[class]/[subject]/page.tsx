import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS, formatDate, slugify } from "@/lib/utils";
import { isPklSubjectSlug } from "@/lib/pkl";
import { ProjectCard } from "@/components/cards";
import { PklTimeline } from "@/components/PklTimeline";
import type { Project } from "@/lib/types";

export async function generateMetadata({
  params,
}: PageProps<"/projects/school/[class]/[subject]">): Promise<Metadata> {
  const { class: cls, subject } = await params;

  if (isPklSubjectSlug(subject)) {
    return {
      title: `Jurnal Kegiatan PKL - Kelas ${cls?.toUpperCase()}`,
      description: `Jurnal mingguan dan dokumentasi kegiatan Praktik Kerja Lapangan (PKL) Kelas ${cls?.toUpperCase()} - Naidrahiqa`,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("subject")
    .eq("published", true)
    .eq("category", "school")
    .eq("class_level", cls);

  const matched = data?.find(
    (p) => (p.subject ? slugify(p.subject) : "lainnya") === subject
  );

  const displayName =
    subject === "lainnya"
      ? "Lainnya"
      : (matched?.subject || subject.toUpperCase());

  return {
    title: `${displayName} - Kelas ${cls?.toUpperCase()}`,
    description: `Proyek ${displayName} kelas ${cls?.toUpperCase()} - Naidrahiqa`,
  };
}

export default async function SchoolSubjectPage({
  params,
}: PageProps<"/projects/school/[class]/[subject]">) {
  const { class: cls, subject } = await params;
  if (!CLASS_LEVELS.includes(cls as (typeof CLASS_LEVELS)[number])) notFound();

  const isPkl = isPklSubjectSlug(subject);

  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .eq("category", "school")
    .eq("class_level", cls)
    .order("sort_order", { ascending: true });

  const items = ((data ?? []) as Project[]).filter((p) => {
    if (isPkl) {
      return isPklSubjectSlug(p.subject);
    }
    return (
      (p.subject ? slugify(p.subject) : "lainnya") === subject ||
      (!p.subject && subject === "lainnya")
    );
  });

  if (!isPkl && items.length === 0) notFound();

  if (isPkl) {
    const latestUpdate =
      items.length > 0
        ? items.reduce((latest, item) =>
            item.created_at > latest ? item.created_at : latest
          , items[0].created_at)
        : null;

    return (
      <div className="flex flex-col gap-10 pt-12 sm:pt-16">
        <Link
          href={`/projects/school/${cls}`}
          className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={14} />
          Kelas {cls.toUpperCase()}
        </Link>

        <header className="max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Kelas {cls.toUpperCase()}
            </span>
            <span className="h-px w-6 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Praktik Kerja Lapangan
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl">
            Jurnal Kegiatan PKL
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            Catatan mingguan kegiatan di lapangan, dokumentasi teknis, serta
            pengalaman yang dipelajari selama menjalani Praktik Kerja Lapangan.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-4 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted/70">
                Total Catatan
              </p>
              <p className="mt-1 font-display text-base font-bold text-foreground">
                {items.length} {items.length === 1 ? "Minggu" : "Minggu"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted/70">
                Update Terakhir
              </p>
              <p className="mt-1 text-[13px] font-medium text-foreground/85">
                {latestUpdate ? formatDate(latestUpdate) : "Belum ada postingan"}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted/70">
                Format
              </p>
              <p className="mt-1 text-[13px] font-medium text-foreground/85">
                Log Mingguan &amp; Dokumentasi
              </p>
            </div>
          </div>
        </header>

        <PklTimeline items={items} />
      </div>
    );
  }

  const displayName =
    subject === "lainnya" ? "Lainnya" : (items[0].subject || subject);

  return (
    <div className="flex flex-col gap-10 pt-12 sm:pt-16">
      <Link
        href={`/projects/school/${cls}`}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} />
        Kelas {cls.toUpperCase()}
      </Link>

      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-wider text-accent">
          {cls.toUpperCase()} · mapel
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {displayName}
        </h1>
        <p className="mt-3 text-muted">{items.length} showcase</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
