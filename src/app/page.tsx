import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BrandIcon } from "@/components/BrandIcon";
import { ProjectCard, AchievementBadge } from "@/components/cards";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TextScramble } from "@/components/TextScramble";
import { Counter } from "@/components/Counter";
import { SkillTags } from "@/components/SkillTags";
import { TechIcon } from "@/components/TechIcon";

export const metadata: Metadata = {
  title: "Naidrahiqa",
  description:
    "Faqih Ardian Syah - Networking Student, Kernel Developer, IoT Builder, and CyberSecurity Enthusiast. Portfolio and school project showcase.",
  openGraph: {
    title: "Naidrahiqa - Faqih Ardian Syah",
    description:
      "TKJ Student, Kernel Developer, IoT Builder, and CyberSecurity Enthusiast.",
    type: "website",
    siteName: "Naidrahiqa",
  },
};

const TECH = [
  { name: "C", desc: "Kernel & system dev", tag: "Systems" },
  { name: "Linux", desc: "Daily driver & kernel", tag: "OS" },
  { name: "Shell", desc: "Bash & POSIX scripting", tag: "Scripting" },
  { name: "Python", desc: "Tooling & exploit dev", tag: "Security" },
  { name: "TypeScript", desc: "Modern fullstack", tag: "Frontend" },
  { name: "Next.js", desc: "App router & SSR", tag: "Framework" },
  { name: "Go", desc: "Daemons & network tools", tag: "Backend" },
  { name: "Kotlin", desc: "Android tinkering", tag: "Mobile" },
  { name: "Supabase", desc: "Postgres & secure auth", tag: "Database" },
  { name: "Tailwind CSS", desc: "Aesthetic styling", tag: "Design" },
  { name: "Git", desc: "Workflow control", tag: "Tool" },
  { name: "Hyprland", desc: "Wayland WM rice", tag: "Desktop" },
];

const FOCUS = [
  {
    label: "Phrolova Kernel",
    meta: "Linux 4.19, Redmi 10 (selene)",
    href: "/projects/phrolova-kernel-selene",
  },
  {
    label: "IoT telemetry",
    meta: "Aqua Safe Monitor, ESP32",
    href: "/projects/aqua-safe-monitor",
  },
  {
    label: "Offensive security",
    meta: "CTF, exploit dev & tooling",
    href: "/projects/catchido",
  },
];

const SPECS = [
  ["Based in", "Jepara, Indonesia"],
  ["Focus", "Kernel, IoT, security"],
  ["Stack", "C, Linux, TypeScript"],
  ["Status", "Open to collaborate"],
];

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: featuredProjects },
    { data: publishedProjects },
    { data: achievements },
    { data: allAchievements },
    { data: aboutSections },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", 1).single(),
    supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .limit(6),
    supabase.from("projects").select("id, category").eq("published", true),
    supabase
      .from("achievements")
      .select("*")
      .order("sort_order")
      .limit(4),
    supabase.from("achievements").select("id"),
    supabase
      .from("about_sections")
      .select("*")
      .order("sort_order")
      .limit(3),
  ]);

  const totalProjects = publishedProjects?.length ?? 0;
  const totalRepos =
    publishedProjects?.filter((p) => p.category === "personal").length ?? 0;
  const totalAchievements = allAchievements?.length ?? 0;

  const NEW_HERO_DESC =
    "Exploring Linux kernel optimization, embedded systems, and cybersecurity. Building competition-grade hardware and software solutions.";

  const heroDescription =
    profile?.hero_description && !profile.hero_description.startsWith("Diving deep")
      ? profile.hero_description
      : NEW_HERO_DESC;

  const NEW_ABOUT_OVERRIDES: Record<string, string> = {
    who_am_i:
      "Hi, I'm Faqih Ardian Syah (just 'Faqih' is fine!). I'm a Network & Computer Engineering (TKJ) student from Jepara, Indonesia, with a deep fascination for low-level systems, networking, and cybersecurity. My daily routine revolves around building functional systems, breaking things to see how they tick, and documenting the journey.",
    current_focus:
      "Right now, I'm deep into custom kernel development for the Redmi 10 2022 (selene).",
    whats_next:
      "I'm always open to collaborating on challenging projects, exchanging insights with fellow developers, and building tools that genuinely solve problems.",
  };

  const resolvedAboutSections = (aboutSections && aboutSections.length > 0
    ? aboutSections.map((s) => {
        if (
          NEW_ABOUT_OVERRIDES[s.key] &&
          (s.content.includes("often just") ||
            s.content === "- Developing custom kernel for Redmi 10 2022 (selene)" ||
            s.content.includes("learning from experienced developers") ||
            s.content.includes("Learning from experienced developers"))
        ) {
          return { ...s, content: NEW_ABOUT_OVERRIDES[s.key] };
        }
        return s;
      })
    : [
        {
          id: "who_am_i",
          key: "who_am_i",
          heading: "Who I Am",
          content: NEW_ABOUT_OVERRIDES.who_am_i,
        },
        {
          id: "current_focus",
          key: "current_focus",
          heading: "Current Focus",
          content: NEW_ABOUT_OVERRIDES.current_focus,
        },
        {
          id: "whats_next",
          key: "whats_next",
          heading: "What's Next?",
          content: NEW_ABOUT_OVERRIDES.whats_next,
        },
      ]);

  let displayProjects = featuredProjects ?? [];
  if (displayProjects.length === 0) {
    const { data: fallbackProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .limit(6);
    displayProjects = fallbackProjects ?? [];
  }

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative grid gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="flex flex-col items-start">
          <div className="inline-flex flex-wrap items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Open for collaboration
            </span>
          </div>

          <h1 className="mt-7 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-foreground">
            <span className="block">
              <TextScramble text="FAQIH" /> ARDIAN
            </span>
            <span className="block">SYAH</span>
          </h1>

          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
            {heroDescription}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2.5 rounded-full bg-foreground px-6 py-3 text-sm font-semibold tracking-wide text-background transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              Explore work
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold tracking-wide text-foreground transition-colors duration-200 hover:border-foreground/30 active:scale-[0.98]"
            >
              Let&apos;s connect
            </Link>
          </div>

          <div className="mt-8">
            <SkillTags />
          </div>
        </div>

        <aside className="relative">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Currently
            </p>

            <ul className="mt-4 flex flex-col">
              {FOCUS.map((item) => (
                <li
                  key={item.label}
                  className="border-t border-border first:border-t-0"
                >
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 py-3.5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] tracking-wide text-muted">
                        {item.meta}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { value: totalRepos ?? 0, label: "Repos" },
                { value: totalProjects ?? 0, label: "Projects" },
                { value: totalAchievements ?? 0, label: "Certs" },
              ].map((stat) => (
                <div key={stat.label}>
                  <Counter
                    target={stat.value}
                    className="font-display text-2xl font-bold tracking-tight text-foreground"
                  />
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <div className="grid gap-6 border-t border-border py-6 sm:grid-cols-2 lg:grid-cols-4">
        {SPECS.map(([key, value]) => (
          <div key={key}>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/70">
              {key}
            </p>
            <p className="mt-1.5 text-[13px] font-medium text-foreground/80">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ABOUT */}
      {resolvedAboutSections.length > 0 && (
        <section id="about" className="mt-20 sm:mt-24">
          <SectionHeader title="About" note="Profile & background" />
          <div className="mt-8 grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
            <div className="hidden lg:block">
              <p className="max-w-[16ch] font-display text-lg font-semibold leading-snug tracking-tight text-foreground/70">
                Building systems, breaking them, documenting the process.
              </p>
            </div>
            <div className="flex flex-col">
              {resolvedAboutSections.map((s, i) => (
                <ScrollReveal key={s.id} delay={i * 60}>
                  <article className="border-t border-border py-6 first:border-t-0 first:pt-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      {s.heading}
                    </p>
                    <div className="mt-2 max-w-2xl">
                      <MarkdownContent content={s.content} />
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TECH STACK */}
      <section className="mt-20 sm:mt-24">
        <SectionHeader
          title="Stack"
          note={`${TECH.length} technologies`}
        />
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {TECH.map((tech) => (
            <div
              key={tech.name}
              className="group bg-background p-4 transition-colors duration-200 hover:bg-surface"
            >
              <div className="flex items-center justify-between">
                <TechIcon name={tech.name} size={20} />
              </div>
              <p className="mt-4 font-display text-sm font-bold tracking-tight text-foreground">
                {tech.name}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="mt-20 sm:mt-24">
        <SectionHeader
          title="Selected work"
          note="Featured projects"
          action={
            <Link
              href="/projects"
              className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
            >
              All projects
              <ArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          }
        />

        {displayProjects.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayProjects.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 60}>
                <ProjectCard project={p} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects published yet"
            description="Projects will appear here as soon as they are published from the admin panel."
          />
        )}
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements" className="mt-20 sm:mt-24">
        <SectionHeader
          title="Achievements"
          note="Certificates & competitions"
          action={
            <Link
              href="/achievements"
              className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          }
        />

        {achievements && achievements.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {achievements.map((a, i) => (
              <ScrollReveal key={a.id} delay={i * 60}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-200 hover:border-foreground/25">
                  {a.certificate_url && (
                    <a
                      href={a.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-[16/10] overflow-hidden border-b border-border bg-surface-2"
                    >
                      {a.certificate_url.toLowerCase().endsWith(".pdf") ? (
                        <PDFThumbnail
                          url={a.certificate_url}
                          className="h-full w-full"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.certificate_url}
                          alt={a.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                        />
                      )}
                    </a>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <AchievementBadge category={a.category} />
                      <span className="font-mono text-[10px] tracking-wider text-muted">
                        {a.year}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold leading-snug tracking-tight text-foreground">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-[13px] text-muted">{a.event}</p>
                    {a.certificate_url && (
                      <a
                        href={a.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[11px] font-semibold text-foreground hover:text-accent"
                      >
                        <ExternalLink size={12} />
                        View certificate
                      </a>
                    )}
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No achievements listed yet"
            description="Competitions, trainings, and seminars will show up here once added."
          />
        )}
      </section>

      {/* CTA */}
      <ScrollReveal>
        <section className="mt-20 overflow-hidden rounded-3xl bg-foreground px-6 py-12 text-center text-background sm:mt-24 sm:px-12 sm:py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
            Open for collaboration
          </p>
          <h2 className="mx-auto mt-4 max-w-[20ch] font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
            Let&apos;s build something that lasts
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-background/60">
            Interested in systems programming, IoT telemetry, or cybersecurity?
            My inbox is always open for ideas and collaborations.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold tracking-wide text-foreground transition-opacity duration-200 hover:opacity-90"
            >
              Send a message
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <a
              href="https://github.com/naidrahiqa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3 text-sm font-semibold tracking-wide text-background transition-colors duration-200 hover:bg-background/10"
            >
              <BrandIcon platform="github" size={15} />
              GitHub
            </a>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

function SectionHeader({
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
      <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <div className="flex items-center gap-5">
        {note && (
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:block">
            {note}
          </p>
        )}
        {action}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-8 flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border bg-surface/50 p-8">
      <p className="font-display text-sm font-bold text-foreground">{title}</p>
      <p className="max-w-md text-[13px] leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
