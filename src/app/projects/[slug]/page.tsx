import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  GitFork,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  formatDate,
  formatRelativeTime,
  languageColor,
  slugify,
} from "@/lib/utils";
import {
  isPklProject,
  isPklSubjectSlug,
  parsePklMeta,
  PKL_DEFAULT_CLASS,
} from "@/lib/pkl";
import { ProjectLayout } from "@/components/ProjectLayout";
import { RepoFacts } from "@/components/RepoFacts";
import { linkActionLabel, normalizeHomepage } from "@/lib/github-meta";
import type { Project, ProjectMedia } from "@/lib/types";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("title, description")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  return {
    title: data?.title ?? "Project",
    description: data?.description || undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!project) notFound();

  const { data: media } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", project.id)
    .order("sort_order");

  const resolvedProject = project as Project;
  const resolvedMedia = (media ?? []) as ProjectMedia[];
  const isPkl = isPklProject(resolvedProject);
  const pklMeta = isPkl ? parsePklMeta(resolvedProject) : null;

  let prevPkl: { project: Project; weekLabel: string } | null = null;
  let nextPkl: { project: Project; weekLabel: string } | null = null;

  if (isPkl) {
    const targetClass = resolvedProject.class_level || PKL_DEFAULT_CLASS;
    const { data: siblingData } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .eq("category", "school")
      .eq("class_level", targetClass)
      .order("sort_order", { ascending: true });

    const pklSiblings = ((siblingData ?? []) as Project[])
      .filter((p) => isPklSubjectSlug(p.subject))
      .map((p) => ({
        project: p,
        meta: parsePklMeta(p),
      }))
      .sort((a, b) => {
        if (
          a.meta.weekNumber !== null &&
          b.meta.weekNumber !== null &&
          a.meta.weekNumber !== b.meta.weekNumber
        ) {
          return a.meta.weekNumber - b.meta.weekNumber;
        }
        const sortDiff = (a.project.sort_order ?? 0) - (b.project.sort_order ?? 0);
        if (sortDiff !== 0) return sortDiff;
        return (
          new Date(a.project.created_at).getTime() -
          new Date(b.project.created_at).getTime()
        );
      });

    const currentIndex = pklSiblings.findIndex(
      (item) => item.project.id === resolvedProject.id
    );
    if (currentIndex > 0) {
      const prev = pklSiblings[currentIndex - 1];
      prevPkl = { project: prev.project, weekLabel: prev.meta.weekLabel };
    }
    if (currentIndex >= 0 && currentIndex < pklSiblings.length - 1) {
      const next = pklSiblings[currentIndex + 1];
      nextPkl = { project: next.project, weekLabel: next.meta.weekLabel };
    }
  }

  const backHref = isPkl
    ? `/projects/school/${resolvedProject.class_level || PKL_DEFAULT_CLASS}/pkl`
    : resolvedProject.category === "school" && resolvedProject.class_level
      ? resolvedProject.subject
        ? `/projects/school/${resolvedProject.class_level}/${slugify(resolvedProject.subject)}`
        : `/projects/school/${resolvedProject.class_level}`
      : "/projects";
  const backLabel = isPkl
    ? "Jurnal Kegiatan PKL"
    : resolvedProject.category === "school" && resolvedProject.class_level
      ? resolvedProject.subject
        ? resolvedProject.subject
        : `Kelas ${resolvedProject.class_level.toUpperCase()}`
      : "Projects";

  const repoHomepage = normalizeHomepage(resolvedProject.repo_homepage);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 pt-12 sm:pt-16">
      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {isPkl && pklMeta ? (
            <>
              <span className="rounded-full border border-accent/30 bg-accent-fill px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent">
                {pklMeta.weekLabel}
              </span>
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] uppercase text-muted">
                PKL · Kelas {(resolvedProject.class_level || PKL_DEFAULT_CLASS).toUpperCase()}
              </span>
            </>
          ) : (
            <>
              <span className="rounded-full border border-accent/30 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-accent">
                {resolvedProject.category}
              </span>
              {resolvedProject.category === "school" && resolvedProject.class_level && (
                <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] uppercase text-muted">
                  class {resolvedProject.class_level}
                </span>
              )}
              {resolvedProject.category === "school" && resolvedProject.subject && (
                <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted">
                  {resolvedProject.subject}
                </span>
              )}
              {resolvedProject.language && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: languageColor(resolvedProject.language) }}
                  />
                  {resolvedProject.language}
                </span>
              )}
            </>
          )}
          {resolvedProject.repo_is_fork && (
            <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              Fork
            </span>
          )}
          {resolvedProject.repo_archived && (
            <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              Archived
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {resolvedProject.title}
        </h1>
        {resolvedProject.description && (
          <p className="text-[15px] leading-relaxed text-muted sm:text-base">
            {resolvedProject.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted">
          {isPkl && pklMeta ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={12} />
                {pklMeta.period ?? formatDate(resolvedProject.created_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} />
                {pklMeta.readingTimeMinutes} menit baca
              </span>
            </>
          ) : (
            <time>{formatDate(resolvedProject.created_at)}</time>
          )}
          {resolvedProject.repo_name && (
            <span className="inline-flex items-center gap-1">
              <Star size={12} />
              {resolvedProject.repo_stars ?? 0}
            </span>
          )}
          {resolvedProject.repo_name && (
            <span className="inline-flex items-center gap-1">
              <GitFork size={12} />
              {resolvedProject.repo_forks ?? 0}
            </span>
          )}
          {resolvedProject.repo_pushed_at && (
            <span>
              updated {formatRelativeTime(resolvedProject.repo_pushed_at)}
            </span>
          )}
          {resolvedProject.link && (
            <a
              href={resolvedProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-accent hover:underline"
            >
              <ExternalLink size={13} />
              {linkActionLabel(resolvedProject.link)}
            </a>
          )}
          {repoHomepage && (
            <a
              href={repoHomepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-accent hover:underline"
            >
              <ExternalLink size={13} />
              Live demo
            </a>
          )}
        </div>
        {(resolvedProject.repo_topics?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resolvedProject.repo_topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[10px] tracking-wide text-muted"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </header>

      {resolvedProject.repo_name && (
        <RepoFacts project={resolvedProject as Project} />
      )}

      {/* Layout content */}
      <ProjectLayout
        project={resolvedProject as Project}
        media={resolvedMedia as ProjectMedia[]}
      />

      {/* PKL Prev/Next Week Navigation */}
      {isPkl && (prevPkl || nextPkl) && (
        <nav
          aria-label="Navigasi jurnal mingguan PKL"
          className="mt-4 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {prevPkl ? (
            <Link
              href={`/projects/${prevPkl.project.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-foreground/25"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                <ArrowLeft
                  size={12}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                Sebelumnya · {prevPkl.weekLabel}
              </span>
              <span className="mt-2 font-display text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-accent">
                {prevPkl.project.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextPkl && (
            <Link
              href={`/projects/${nextPkl.project.slug}`}
              className="group flex flex-col items-end rounded-2xl border border-border bg-surface p-5 text-right transition-colors hover:border-foreground/25"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Selanjutnya · {nextPkl.weekLabel}
                <ArrowRight
                  size={12}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="mt-2 font-display text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-accent">
                {nextPkl.project.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
