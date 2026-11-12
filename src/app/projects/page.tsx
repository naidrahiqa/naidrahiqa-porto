import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CLASS_LEVELS } from "@/lib/utils";
import { ClassCard } from "@/components/cards";
import { ProjectFilter } from "@/components/ProjectFilter";
import { BrandIcon } from "@/components/BrandIcon";
import type { Project } from "@/lib/types";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "School showcases and personal open-source repositories by Faqih Ardian Syah.",
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const all = (projects ?? []) as Project[];
  const school = all.filter((p) => p.category === "school");
  const personal = all.filter((p) => p.category === "personal");

  const classes = CLASS_LEVELS.map((cls) => {
    const items = school.filter((p) => p.class_level === cls);
    const subjectSet = new Set(items.map((p) => p.subject).filter(Boolean));
    return {
      cls,
      items,
      subjects: [...subjectSet].sort(),
    };
  }).filter((c) => c.items.length > 0);

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
          School showcases organized by class and subject, alongside personal
          builds in Linux kernels, IoT sensor networks, and CTF utilities.
        </p>
      </header>

      {classes.length > 0 && (
        <section className="mt-16">
          <SectionRow
            index="01"
            title="School"
            note="Per class & subject"
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
        </section>
      )}

      {personal.length > 0 && (
        <section className="mt-16">
          <SectionRow
            index="02"
            title="From GitHub"
            note={`${personal.length} public repositories`}
            action={
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
            }
          />
          <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-muted">
            Kernels, Android tooling, IoT firmware, and web apps. Metadata is
            synced from the GitHub API, so languages, stars, and topics stay
            current.
          </p>
          <div className="mt-6">
            <ProjectFilter projects={personal} />
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
  index,
  title,
  note,
  action,
}: {
  index: string;
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-accent">
          {index}
        </span>
        <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
      </div>
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
