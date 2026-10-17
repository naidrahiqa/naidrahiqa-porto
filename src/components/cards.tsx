import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn, getStoragePath, storagePublicUrl } from "@/lib/utils";
import type { Project, Achievement } from "@/lib/types";

function resolveCover(cover: string | null | undefined): string | null {
  if (!cover) return null;
  const path = getStoragePath(cover);
  return path ? storagePublicUrl(path) : cover;
}

export function ProjectCard({ project }: { project: Project }) {
  const imgSrc = resolveCover(project.cover_image);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-foreground/[0.08] bg-surface/40 dark:bg-white/[0.02] backdrop-blur-xl shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
    >
      {imgSrc ? (
        <div className="relative aspect-video overflow-hidden border-b border-border/60 bg-surface-2">
          <Image
            src={imgSrc}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="relative flex aspect-video items-center justify-center border-b border-border/60 bg-gradient-to-br from-surface to-surface-2">
          <span className="font-display text-4xl font-bold text-accent/20">
            {project.title.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.category === "school" && project.class_level && (
            <span className="rounded-full bg-accent-fill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/20 dark:bg-accent/15">
              kelas {project.class_level}
            </span>
          )}
          {project.category === "school" && project.subject && (
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted">
              {project.subject}
            </span>
          )}
          {project.category === "personal" && (
            <span className="rounded-full bg-accent-2-fill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-2 border border-accent-2/20 dark:bg-accent-2/15">
              personal
            </span>
          )}
          {project.language && (
            <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-semibold text-muted">
              {project.language}
            </span>
          )}
        </div>
        <h3 className="mt-2.5 font-display font-bold uppercase leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
          {project.description}
        </p>
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
      className="group relative block overflow-hidden rounded-2xl border border-foreground/[0.08] bg-surface/40 dark:bg-white/[0.02] backdrop-blur-xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
    >
      <div className="pointer-events-none absolute right-4 top-2 select-none font-display text-[64px] font-black uppercase leading-none text-accent/10 transition-colors group-hover:text-accent/20">
        {cls}
      </div>
      <div className="relative z-10">
        <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-foreground transition-colors group-hover:text-accent">
          Kelas {cls.toUpperCase()}
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-muted">
          {itemCount} showcase projects
        </p>
        {subjects.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {subjects.slice(0, 4).map((s, i) => (
              <span
                key={s}
                className={cn(
                  "rounded-full border bg-surface-2/70 px-2 py-0.5 text-[10px] font-semibold text-muted",
                  i % 2 === 0 ? "border-accent/30 -rotate-1" : "border-border rotate-1"
                )}
              >
                {s}
              </span>
            ))}
            {subjects.length > 4 && (
              <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted">
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
      className="group flex items-center justify-between rounded-2xl border border-foreground/[0.08] bg-surface/40 dark:bg-white/[0.02] backdrop-blur-xl px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md active:-translate-y-0.5"
    >
      <div>
        <h3 className="font-display font-bold uppercase tracking-tight transition-colors group-hover:text-accent">
          {subject}
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-muted">{itemCount} showcase</p>
      </div>
      <ArrowRight
        size={16}
        className="text-accent transition-all duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}

export function AchievementBadge({
  category,
}: {
  category: Achievement["category"];
}) {
  const styles: Record<Achievement["category"], string> = {
    competition: "border-accent/30 bg-accent-fill text-accent",
    training: "border-accent-2/30 bg-accent-2-fill text-accent-2",
    seminar: "border-accent-3/30 bg-accent-3-fill text-accent-3",
  };
  const icons: Record<Achievement["category"], string> = {
    competition: "🏆",
    training: "🎓",
    seminar: "💬",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider hard-shadow-sm",
        styles[category]
      )}
    >
      <span>{icons[category]}</span>
      <span>{category}</span>
    </span>
  );
}