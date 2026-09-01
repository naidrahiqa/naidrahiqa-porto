import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProjectCard, AchievementBadge } from "@/components/cards";
import { NowPlaying } from "@/components/NowPlaying";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PDFThumbnail } from "@/components/PDFThumbnail";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TextScramble } from "@/components/TextScramble";
import { Counter } from "@/components/Counter";
import { MagneticButton } from "@/components/MagneticButton";
import { CardTilt } from "@/components/CardTilt";
import { CursorGlow } from "@/components/CursorGlow";
import type { NowPlayingSong } from "@/lib/types";

function pickTodaysSong(rows: NowPlayingSong[]): NowPlayingSong | null {
  if (rows.length === 0) return null;
  return rows[Math.floor(Date.now() / 86400000) % rows.length];
}

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: projects },
    { data: achievements },
    { data: allAchievements },
    { data: aboutSections },
    { data: nowPlaying },
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
    supabase.from("now_playing").select("*").order("sort_order"),
  ]);

  const nowPlayingRows = (Array.isArray(nowPlaying) ? nowPlaying : []) as NowPlayingSong[];
  const todaysSong = pickTodaysSong(nowPlayingRows);

  return (
    <div className="flex flex-col pt-14 sm:pt-20">
      {/* HERO */}
      <section className="relative flex flex-col gap-10 overflow-hidden px-5 sm:px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="orb orb-accent -top-40 -left-40 h-80 w-80" />
        <div className="orb orb-pink top-20 -right-20 h-60 w-60" />

        <div className="relative z-10 flex flex-col gap-8">
          {/* Sticker chips — rotated, chunky */}
          <div className="flex flex-wrap items-center gap-3">
          <span className="font-display rounded-full border-2 border-accent bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-accent hard-shadow-sm -rotate-3">
            TKJ Student
          </span>
          <span className="font-display rounded-full border-2 border-border bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground hard-shadow-sm rotate-2">
            Kernel Dev
          </span>
          <span className="font-display rounded-full border-2 border-accent-2 bg-accent-2/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-2 hard-shadow-sm -rotate-2">
            IoT
          </span>
          <span className="font-display rounded-full border-2 border-border bg-surface px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground hard-shadow-sm rotate-1">
            CTF
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
            <TextScramble text="FAQIH" />
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3">
              <span className="marker">ARD</span>IAN <span className="marker">SYAH</span>
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">
            {profile?.hero_description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <MagneticButton>
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-foreground bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-accent hard-shadow transition-all duration-150 hover:-translate-y-0.5 hover:hard-shadow-hover"
              >
                View Projects
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-foreground bg-surface px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all duration-150 hover:-translate-y-0.5"
              >
                Get in Touch
              </Link>
            </MagneticButton>
          </div>
        </div>
        </div>

        <NowPlaying song={todaysSong} />
      </section>

      {/* ABOUT */}
      {aboutSections && aboutSections.length > 0 && (
        <section id="about" className="relative flex flex-col gap-10 px-5 sm:px-8 mt-20">
          <span className="sticker top-0 right-10 text-lg rotate-12">✦</span>
          <span className="sticker top-20 right-0 text-xs -rotate-6" style={{animationDelay:"1s"}}>◆</span>
          <span className="sticker top-8 left-0 text-xs rotate-45" style={{animationDelay:"2s"}}>✦</span>

          <ScrollReveal>
            <SectionHeader index="01" title="About" />
          </ScrollReveal>
          <div className="flex flex-col gap-8 max-w-2xl">
            {aboutSections.map((s, i) => (
              <ScrollReveal key={s.id} delay={i * 100}>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                  <span className="marker">{s.heading}</span>
                </h3>
                <div className="mt-3">
                  <MarkdownContent content={s.content} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* TECH STACK */}
      <section className="flex flex-col gap-6 px-5 sm:px-8 mt-20">
        <ScrollReveal>
          <SectionHeader index="01.5" title="Tech Stack" />
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { name: "C", desc: "Kernel dev" },
            { name: "Shell", desc: "Linux modules" },
            { name: "Python", desc: "Tools & scripts" },
            { name: "TypeScript", desc: "Web apps" },
            { name: "Go", desc: "Desktop apps" },
            { name: "Kotlin", desc: "Android" },
            { name: "Next.js", desc: "React framework" },
            { name: "Supabase", desc: "Backend" },
            { name: "Tailwind CSS", desc: "Styling" },
            { name: "Git", desc: "Version control" },
            { name: "Linux", desc: "Daily driver" },
            { name: "Hyprland", desc: "WM rice" },
          ].map((tech, i) => (
            <ScrollReveal key={tech.name} delay={i * 50}>
              <div className="rounded-xl border-2 border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:hard-shadow-sm">
                <p className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
                  {tech.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">{tech.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="flex flex-wrap justify-center gap-8 px-5 sm:px-8 mt-16">
        {[
          { value: projects?.length ?? 0, suffix: "+", label: "Projects" },
          { value: allAchievements?.length ?? 0, suffix: "", label: "Achievements" },
          { value: 12, suffix: "+", label: "Tech Used" },
        ].map((stat) => (
          <ScrollReveal key={stat.label}>
            <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-border bg-surface px-6 py-4 hard-shadow-sm">
              <Counter
                target={stat.value}
                suffix={stat.suffix}
                className="font-display text-3xl font-extrabold tracking-tight text-accent"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {stat.label}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* PROJECTS */}
      <section id="projects" className="flex flex-col gap-6 px-5 sm:px-8 mt-20">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4">
            <SectionHeader index="02" title="Projects" />
            <Link
              href="/projects"
              className="group text-xs font-semibold uppercase tracking-wide text-accent transition-colors hover:text-foreground"
            >
              View all
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 80}>
              <CardTilt>
                <ProjectCard project={p} />
              </CardTilt>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements" className="flex flex-col gap-6 px-5 sm:px-8 mt-24">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4">
            <SectionHeader index="03" title="Achievements" />
            <Link
              href="/achievements"
              className="group text-xs font-semibold uppercase tracking-wide text-accent transition-colors hover:text-foreground"
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
                className="flex flex-col gap-3 rounded-xl border-2 border-foreground bg-surface hard-shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:hard-shadow-hover"
              >
                {a.certificate_url && a.certificate_url.endsWith(".pdf") && (
                  <a
                    href={a.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-[4/3] overflow-hidden border-b-2 border-foreground bg-surface-2"
                  >
                    <PDFThumbnail url={a.certificate_url} className="h-full w-full" />
                  </a>
                )}
                {a.certificate_url && !a.certificate_url.endsWith(".pdf") && (
                  <a
                    href={a.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-[4/3] overflow-hidden border-b-2 border-foreground bg-surface-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.certificate_url}
                      alt={a.title}
                      className="h-full w-full object-cover"
                    />
                  </a>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <AchievementBadge category={a.category} />
                    <span className="font-display text-xs font-bold text-foreground">{a.year}</span>
                  </div>
                  <h3 className="mt-2 font-display font-bold uppercase leading-snug tracking-tight">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted">{a.event}</p>
                  {a.certificate_url && (
                    <a
                      href={a.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-accent hover:underline"
                    >
                      <ExternalLink size={12} />
                      Certificate
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
        <section className="relative mt-20 overflow-hidden rounded-2xl border-2 border-foreground bg-surface p-8 text-center hard-shadow sm:p-12">
          <div className="orb orb-accent -top-20 left-1/2 h-40 w-60 -translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              Let&apos;s <span className="marker">connect</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Interested in systems programming, IoT, or cybersecurity? My inbox is
              always open.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-foreground bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-accent transition-all duration-150 hover:-translate-y-0.5"
            >
              Contact Me
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="font-display inline-flex items-center justify-center rounded-md border-2 border-foreground bg-accent px-2 py-0.5 text-xs font-extrabold text-on-accent -rotate-3 hard-shadow-sm">
          {index}
        </span>
        <div className="h-0.5 flex-1 bg-foreground/15" />
      </div>
      <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        <span className="marker">{title}</span>
      </h2>
    </div>
  );
}