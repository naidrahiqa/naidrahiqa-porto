import Link from "next/link";
import Image from "next/image";
import { ArrowRight, GitFork, Star, Trophy, GraduationCap, MessageSquare } from "lucide-react";
import {
  formatRelativeTime,
  isTrustedImageHost,
  languageColor,
  resolveImageUrl,
} from "@/lib/utils";
import type { Project, Achievement } from "@/lib/types";

function resolveCover(cover: string | null | undefined): string | null {
  if (!cover) return null;
  return resolveImageUrl(cover) || null;
}

function ProjectThumb({ project }: { project: Project }) {
  const imgSrc = resolveCover(project.cover_image);

  if (imgSrc) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-surface-2">
        <Image
          src={imgSrc}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={!isTrustedImageHost(imgSrc)}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border bg-gradient-to-br from-surface-2 to-surface">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {project.language || "project"}
      </span>
      <span className="absolute -right-2 -bottom-6 font-display text-8xl font-black leading-none text-foreground/[0.04]">
        {project.title.charAt(0)}
      </span>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const meta = project.category === "school" ? project.subject : "Personal";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-200 hover:border-foreground/25"
    >
      <ProjectThumb project={project} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          <span>{meta || "Project"}</span>
          {project.language && (
            <>
              <span className="h-px w-3 bg-border" />
              <span>{project.language}</span>
            </>
          )}
        </div>

        <h3 className="mt-2 font-display text-base font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
          {project.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {project.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            Open project
            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
          {project.repo_name && (
            <span className="flex items-center gap-2 font-mono text-[10px] text-muted">
              <span className="inline-flex items-center gap-1">
                <Star size={11} />
                {project.repo_stars ?? 0}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork size={11} />
                {project.repo_forks ?? 0}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function RepoCard({ project }: { project: Project }) {
  const pushed = project.repo_pushed_at ?? project.updated_at;
  const topics = project.repo_topics ?? [];
  const badge = project.repo_archived
    ? "Archived"
    : project.repo_is_fork
      ? "Fork"
      : "Public";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-foreground/25"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-all font-display text-[15px] font-bold tracking-tight text-foreground transition-colors group-hover:text-accent">
          {project.repo_name ?? project.slug}
        </h3>
        <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
          {badge}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.6em] text-[13px] leading-relaxed text-muted">
        {project.description || "No description provided."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] text-muted">
        {project.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: languageColor(project.language) }}
            />
            {project.language}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Star size={11} />
          {project.repo_stars ?? 0}
        </span>
        <span className="inline-flex items-center gap-1">
          <GitFork size={11} />
          {project.repo_forks ?? 0}
        </span>
        {pushed && <span>updated {formatRelativeTime(pushed)}</span>}
      </div>

      {topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[9px] tracking-wide text-muted"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-1.5 pt-5 text-[11px] font-semibold text-foreground">
        View project
        <ArrowRight
          size={12}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

export function ClassCard({
  cls,
  subjects,
  itemCount,
}: {
  cls: string;
  subjects: string[];
  itemCount: number;
}) {
  return (
    <Link
      href={`/projects/school/${cls}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-foreground/25"
    >
      <div className="pointer-events-none absolute right-4 top-2 select-none font-display text-[64px] font-black uppercase leading-none text-foreground/[0.05] transition-colors group-hover:text-accent/15">
        {cls}
      </div>
      <div className="relative z-10">
        <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-foreground transition-colors group-hover:text-accent">
          Kelas {cls.toUpperCase()}
        </h3>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {itemCount} showcase projects
        </p>
        {subjects.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {subjects.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted"
              >
                {s}
              </span>
            ))}
            {subjects.length > 4 && (
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted">
                +{subjects.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function SubjectRow({
  cls,
  subject,
  slug,
  itemCount,
}: {
  cls: string;
  subject: string;
  slug: string;
  itemCount: number;
}) {
  return (
    <Link
      href={`/projects/school/${cls}/${slug}`}
      className="group flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 transition-colors duration-200 hover:border-foreground/25"
    >
      <div>
        <h3 className="font-display font-bold uppercase tracking-tight transition-colors group-hover:text-accent">
          {subject}
        </h3>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {itemCount} showcase
        </p>
      </div>
      <ArrowRight
        size={16}
        className="text-accent transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}

export function AchievementBadge({
  category,
}: {
  category: Achievement["category"];
}) {
  const icons: Record<Achievement["category"], typeof Trophy> = {
    competition: Trophy,
    training: GraduationCap,
    seminar: MessageSquare,
  };
  const Icon = icons[category] ?? MessageSquare;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
      <Icon size={11} />
      <span>{category}</span>
    </span>
  );
}
