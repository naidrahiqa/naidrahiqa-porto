import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ProjectCard, AchievementBadge } from "@/components/cards";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TextScramble } from "@/components/TextScramble";
import { Counter } from "@/components/Counter";
import { MagneticButton } from "@/components/MagneticButton";
import { CardTilt } from "@/components/CardTilt";
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

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: featuredProjects },
    { count: totalProjects },
    { data: achievements },
    { count: totalAchievements },
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
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase
      .from("achievements")
      .select("*")
      .order("sort_order")
      .limit(4),
    supabase
      .from("achievements")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("about_sections")
      .select("*")
      .order("sort_order")
      .limit(3),
  ]);

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
    <div className="flex flex-col pt-12 sm:pt-20">
      {/* HERO: EDITORIAL, CLEAN & CONFIDENT */}
      <section className="relative flex min-h-[75dvh] flex-col justify-center items-center text-center py-16 sm:py-24">
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto gap-8">
          {/* Status Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-surface-2/60 px-4 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] font-medium tracking-wider uppercase text-muted">
              TKJ Student &bull; Kernel, IoT & Security
            </span>
          </div>

          {/* Crisp Headline */}
          <div className="flex flex-col items-center">
            <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl font-black uppercase leading-[0.9] tracking-tight text-foreground select-none">
              <TextScramble text="FAQIH" />
              <span className="block text-4xl sm:text-6xl lg:text-7xl font-extrabold mt-3 text-foreground/85">
                ARDIAN SYAH
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted font-normal">
              {heroDescription}
            </p>
          </div>

          {/* Clean Matte Pastel Skill Tags */}
          <SkillTags />

          {/* Solid, High-End Action Buttons (No AI Gradients) */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton>
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2.5 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm"
              >
                Explore Work
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/[0.12] bg-surface/50 backdrop-blur-md px-7 py-3.5 text-sm font-semibold tracking-wide text-foreground transition-all duration-200 hover:bg-surface-2 hover:border-foreground/20 active:scale-95"
              >
                Let&apos;s Connect ✦
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      {resolvedAboutSections && resolvedAboutSections.length > 0 && (
        <section id="about" className="relative flex flex-col gap-8 mt-20 sm:mt-28">
          <ScrollReveal>
            <SectionHeader title="About Me" subtitle="PROFILE & BACKGROUND" />
          </ScrollReveal>
          <div className="flex flex-col gap-4 max-w-3xl">
            {resolvedAboutSections.map((s, i) => (
              <ScrollReveal key={s.id} delay={i * 80}>
                <div className="rounded-2xl border border-foreground/[0.08] bg-surface/50 p-6 backdrop-blur-md transition-all duration-200 hover:border-foreground/20">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                    {s.heading}
                  </h3>
                  <div className="mt-3 text-sm leading-relaxed text-muted font-normal">
                    <MarkdownContent content={s.content} />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* TECH STACK */}
      <section className="flex flex-col gap-6 mt-20 sm:mt-28">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4">
            <SectionHeader title="Tech Stack" subtitle="LANGUAGES, TOOLS & FRAMEWORKS" />
            <span className="font-mono text-xs font-medium text-muted">12 TECHNOLOGIES</span>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[
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
          ].map((tech, i) => (
            <ScrollReveal key={tech.name} delay={i * 35}>
              <div
                className="group relative flex flex-col justify-between rounded-2xl border border-foreground/[0.08] bg-surface/50 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] transition-transform duration-200 group-hover:scale-105">
                    <TechIcon name={tech.name} size={22} />
                  </div>
                  <span className="font-mono text-[9px] font-medium text-muted px-2 py-0.5 rounded-md bg-foreground/[0.04] border border-foreground/[0.05]">
                    {tech.tag}
                  </span>
                </div>
                <div className="mt-3 min-w-0">
                  <p className="font-display text-sm font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-foreground/90">
                    {tech.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">{tech.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="mt-20 sm:mt-28">
        <ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative flex flex-col items-start justify-between rounded-2xl border border-foreground/[0.08] bg-surface/50 p-6 backdrop-blur-md sm:col-span-2">
              <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted mb-2">
                PRODUCTION SHIPMENTS
              </div>
              <Counter
                target={totalProjects ?? displayProjects.length}
                suffix="+"
                className="font-display text-5xl font-extrabold tracking-tight text-foreground"
              />
              <span className="mt-2 text-sm font-medium uppercase tracking-wider text-muted">
                Projects Shipped & Deployed
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start gap-1 rounded-2xl border border-foreground/[0.08] bg-surface/50 p-5 backdrop-blur-md">
                <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted">
                  AWARDS & MILESTONES
                </div>
                <Counter
                  target={totalAchievements ?? 0}
                  suffix=""
                  className="font-display text-3xl font-extrabold tracking-tight text-foreground"
                />
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  Certificates & Medals
                </span>
              </div>
              <div className="flex flex-col items-start gap-1 rounded-2xl border border-foreground/[0.08] bg-surface/50 p-5 backdrop-blur-md">
                <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted">
                  TECHNOLOGIES
                </div>
                <Counter
                  target={12}
                  suffix="+"
                  className="font-display text-3xl font-extrabold tracking-tight text-foreground"
                />
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  Languages & Frameworks
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="flex flex-col gap-6 mt-20 sm:mt-28">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4">
            <SectionHeader title="Featured Works" subtitle="SELECTED PROJECTS" />
            <Link
              href="/projects"
              className="group text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:text-foreground"
            >
              View all
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 80}>
              <CardTilt>
                <ProjectCard project={p} />
              </CardTilt>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements" className="flex flex-col gap-6 mt-20 sm:mt-28">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4">
            <SectionHeader title="Achievements" subtitle="CERTIFICATES & COMPETITIONS" />
            <Link
              href="/achievements"
              className="group text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:text-foreground"
            >
              View all
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-2">
          {achievements?.map((a, i) => (
            <ScrollReveal key={a.id} delay={i * 80}>
              <div
                className="flex flex-col gap-3 rounded-2xl border border-foreground/[0.08] bg-surface/50 backdrop-blur-md shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-sm"
              >
                {a.certificate_url && a.certificate_url.endsWith(".pdf") && (
                  <a
                    href={a.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-[4/3] overflow-hidden border-b border-foreground/[0.06] bg-surface-2/50"
                  >
                    <PDFThumbnail url={a.certificate_url} className="h-full w-full" />
                  </a>
                )}
                {a.certificate_url && !a.certificate_url.endsWith(".pdf") && (
                  <a
                    href={a.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-[4/3] overflow-hidden border-b border-foreground/[0.06] bg-surface-2/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.certificate_url}
                      alt={a.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </a>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <AchievementBadge category={a.category} />
                    <span className="font-mono text-xs font-medium text-muted">{a.year}</span>
                  </div>
                  <h3 className="mt-2 font-display font-bold uppercase leading-snug tracking-tight text-foreground">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted">{a.event}</p>
                  {a.certificate_url && (
                    <a
                      href={a.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-foreground hover:underline"
                    >
                      <ExternalLink size={12} />
                      View Certificate
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <ScrollReveal>
        <section className="relative mt-20 sm:mt-28 overflow-hidden rounded-3xl border border-foreground/[0.08] bg-surface/50 backdrop-blur-md p-8 text-center sm:p-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-foreground/[0.1] bg-foreground/[0.04] px-3 py-1 text-[11px] font-mono font-medium uppercase tracking-wider text-muted mb-4">
              <span>✦</span>
              <span>OPEN FOR COLLABORATION</span>
              <span>✦</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl text-foreground">
              Let&apos;s connect & build
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted leading-relaxed">
              Interested in systems programming, IoT telemetry, or cybersecurity? My inbox is always open for ideas and collaborations.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm"
              >
                Send a Message
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      {subtitle && (
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted mb-1">
          ✦ {subtitle}
        </p>
      )}
      <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl text-foreground">
        {title}
      </h2>
      <div className="mt-2.5 h-0.5 w-10 bg-foreground/20 rounded-full" />
    </div>
  );
}