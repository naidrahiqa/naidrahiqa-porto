import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Pencil,
  Plus,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, resolveImageUrl } from "@/lib/utils";
import { isPklProject, parsePklMeta, PKL_DEFAULT_CLASS } from "@/lib/pkl";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  FeaturedToggle,
  PublishToggle,
} from "@/components/admin/FeaturedToggle";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPklPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("category", "school")
    .order("sort_order", { ascending: true });

  const pklPosts = ((data ?? []) as Project[])
    .filter((p) => isPklProject(p))
    .map((project) => ({
      project,
      meta: parsePklMeta(project),
    }))
    .sort((a, b) => {
      if (
        a.meta.weekNumber !== null &&
        b.meta.weekNumber !== null &&
        a.meta.weekNumber !== b.meta.weekNumber
      ) {
        return a.meta.weekNumber - b.meta.weekNumber;
      }
      return (a.project.sort_order ?? 0) - (b.project.sort_order ?? 0);
    });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Jurnal Mingguan · Kelas XII
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">
            Kegiatan PKL
          </h1>
          <p className="mt-1 text-sm text-muted">
            Posting cerita dan foto kegiatan mingguan selama Praktik Kerja
            Lapangan seperti blog. ({pklPosts.length} catatan)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/school/${PKL_DEFAULT_CLASS}/pkl`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30"
          >
            <ExternalLink size={14} />
            Lihat Halaman PKL
          </Link>
          <Link
            href="/admin/pkl/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-all duration-200 hover:bg-accent-hover"
          >
            <Plus size={15} />
            Tulis Catatan Mingguan
          </Link>
        </div>
      </header>

      {pklPosts.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {pklPosts.map(({ project, meta }, index) => {
            const cover = project.cover_image
              ? resolveImageUrl(project.cover_image)
              : null;

            return (
              <li
                key={project.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-foreground/20 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-[10px] font-bold text-muted">
                        W{meta.weekNumber ?? index + 1}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-accent/30 bg-accent-fill px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
                        {meta.weekLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted">
                        <Calendar size={11} />
                        {meta.period ?? formatDate(project.created_at)}
                      </span>
                      {project.published ? (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                          published
                        </span>
                      ) : (
                        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-bold text-muted">
                          draft
                        </span>
                      )}
                      {project.featured && (
                        <Star size={13} className="fill-accent text-accent" />
                      )}
                    </div>

                    <p className="mt-1.5 truncate font-display text-base font-bold tracking-tight text-foreground">
                      {project.title}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                      {meta.excerpt}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <FeaturedToggle
                    id={project.id}
                    featured={project.featured}
                  />
                  <PublishToggle
                    id={project.id}
                    published={project.published}
                  />
                  <Link
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:text-foreground"
                    title="Lihat postingan"
                  >
                    <ExternalLink size={13} />
                    Lihat
                  </Link>
                  <Link
                    href={`/admin/pkl/${project.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    <Pencil size={13} />
                    Edit
                  </Link>
                  <DeleteButton
                    entity="projects"
                    id={project.id}
                    name={project.title}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-accent">
            <BookOpen size={20} />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-foreground">
            Belum ada catatan kegiatan PKL
          </h2>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">
            Mulai tulis catatan Minggu 1 kamu. Sudah disiapkan template siap
            pakai dan fitur upload foto dokumentasi.
          </p>
          <Link
            href="/admin/pkl/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
          >
            <Plus size={14} />
            Buat Catatan Minggu 1
          </Link>
        </div>
      )}
    </div>
  );
}
