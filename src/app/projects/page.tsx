import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS } from "@/lib/utils";
import { isPklProject, PKL_DEFAULT_CLASS } from "@/lib/pkl";
import { ClassCard, ProjectCard } from "@/components/cards";
import { ProjectFilter } from "@/components/ProjectFilter";
import { GitHubOverview } from "@/components/GitHubOverview";
import { BrandIcon } from "@/components/BrandIcon";
import { repoProvider } from "@/lib/github-meta";
import type { GitHubProfile, Project } from "@/lib/types";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "School showcases, weekly PKL journal, and personal open-source repositories by Faqih Ardian Syah.",
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase.from("github_profile").select("*").eq("id", 1).maybeSingle(),
  ]);

  const all = (projects ?? []) as Project[];
  const school = all.filter((p) => p.category === "school");
  const pklPosts = school.filter((p) => isPklProject(p));
  const personal = all.filter((p) => p.category === "personal");
  const repos = personal.filter((p) => Boolean(p.repo_name));
  const localBuilds = personal.filter((p) => !p.repo_name);

  const hasGitHub = repos.some(
    (p) => repoProvider(p.link, p.repo_name) === "github"
  );
  const hasGitLab = repos.some(
    (p) => repoProvider(p.link, p.repo_name) === "gitlab"
  );
  const repoTitle =
    hasGitHub && hasGitLab
      ? "Repositories"
      : hasGitLab
        ? "From GitLab"
        : "From GitHub";
  const repoSourceText =
    hasGitHub && hasGitLab
      ? "GitHub and GitLab"
      : hasGitLab
        ? "GitLab"
        : "GitHub";

  const classes = CLASS_LEVELS.map((cls) => {
    const items = school.filter((p) => p.class_level === cls);
    const subjectSet = new Set(items.map((p) => p.subject).filter(Boolean));
    if (cls === PKL_DEFAULT_CLASS) {
      subjectSet.add("PKL");
    }
    return {
      cls,
      items,
      subjects: [...subjectSet].sort(),
    };
  }).filter((c) => c.items.length > 0 || c.cls === PKL_DEFAULT_CLASS);

  return (
    <div className="flex flex-col pb-8 pt-12 sm:pt-16">
      <header className="max-w-3xl">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Archive
          </span>
          <span className="h-px w-8 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {all.length} entries
          </span>
        </div>
        <h1 className="mt-5 max-w-[20ch] font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-foreground sm:text-6xl">
          Work &amp; repositories
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          School showcases organized by class and subject, weekly PKL field
          journal, alongside personal builds in Linux kernels, IoT sensor
          networks, and CTF utilities.
        </p>
      </header>

      {classes.length > 0 && (
        <section className="mt-16">
          <SectionRow
            title="School"
            note="Per class, subject & PKL journal"
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <ClassCard
                key={c.cls}
                cls={c.cls}
                itemCount={c.items.length}
                subjects={c.subjects}
              />
            ))}
          </div>

          <Link
            href={`/projects/school/${PKL_DEFAULT_CLASS}/pkl`}
            className="group mt-4 flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-foreground/25 sm:flex-row sm:items-center sm:p-6"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent-fill text-accent">
                <BookOpen size={18} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]">
                  <span className="text-accent">
                    Kelas {PKL_DEFAULT_CLASS.toUpperCase()} · Jurnal Mingguan
                  </span>
                  <span className="h-px w-3 bg-border" />
                  <span className="text-muted">
                    {pklPosts.length} catatan
                  </span>
                </div>
                <h3 className="mt-1 font-display text-base font-extrabold uppercase tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-lg">
                  Jurnal Kegiatan PKL (Praktik Kerja Lapangan)
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Catatan blog mingguan tentang kegiatan lapangan, instalasi,
                  dan pembelajaran teknis selama PKL.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-foreground">
              Lihat Jurnal PKL
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </Link>
        </section>
      )}

      {localBuilds.length > 0 && (
        <section className="mt-16">
          <SectionRow
            title="Builds &amp; Notes"
            note={`${localBuilds.length} ${localBuilds.length === 1 ? "project" : "projects"}`}
          />
          <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted">
            Local builds, experiments, and writeups shared on Telegram.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {localBuilds.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {repos.length > 0 && (
        <section className="mt-16">
          <SectionRow
            title={repoTitle}
            note={`${repos.length} public repositories`}
            action={
              <div className="flex items-center gap-4">
                {hasGitHub && (
                  <a
                    href="https://github.com/naidrahiqa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
                  >
                    <BrandIcon platform="github" size={12} />
                    @naidrahiqa
                    <ArrowUpRight
                      size={12}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                )}
                {hasGitLab && (
                  <a
                    href="https://gitlab.com/naidrahiqa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
                  >
                    <BrandIcon platform="gitlab" size={12} />
                    @naidrahiqa
                    <ArrowUpRight
                      size={12}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                )}
              </div>
            }
          />
          <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted">
            Kernels, Android tooling, IoT firmware, and web apps. Metadata is
            synced from {repoSourceText}, so languages, releases, stars, and
            topics stay current.
          </p>
          <GitHubOverview
            projects={repos}
            profile={(profile as GitHubProfile | null) ?? null}
          />
          <div className="mt-6">
            <ProjectFilter projects={repos} />
          </div>
        </section>
      )}

      {all.length === 0 && (
        <p className="mt-16 rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted">
          No projects yet.
        </p>
      )}
    </div>
  );
}

function SectionRow({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="flex items-center gap-5">
        {note && (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            {note}
          </span>
        )}
        {action}
      </div>
    </div>
  );
}
