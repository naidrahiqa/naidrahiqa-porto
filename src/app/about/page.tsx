import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { resolveImageUrl } from "@/lib/utils";
import { MarkdownContent } from "@/components/MarkdownContent";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "About",
  description: "About Faqih Ardian Syah - Naidrahiqa",
};

const NEW_ABOUT_OVERRIDES: Record<string, string> = {
  who_am_i:
    "Hi, I'm Faqih Ardian Syah (just 'Faqih' is fine!). I'm a Network & Computer Engineering (TKJ) student from Jepara, Indonesia, with a deep fascination for low-level systems, networking, and cybersecurity. My daily routine revolves around building functional systems, breaking things to see how they tick, and documenting the journey.",
  current_focus:
    "Right now, I'm deep into custom kernel development for the Redmi 10 2022 (selene).",
  whats_next:
    "I'm always open to collaborating on challenging projects, exchanging insights with fellow developers, and building tools that genuinely solve problems.",
};

export default async function AboutPage() {
  const supabase = await createClient();

  const [{ data: profile }, { data: rawSections }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", 1).single(),
    supabase.from("about_sections").select("*").order("sort_order"),
  ]);

  const sections = rawSections && rawSections.length > 0
    ? rawSections.map((s) => {
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
      ];

  return (
    <div className="flex flex-col gap-14 pt-12 sm:pt-16">
      <header>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            About
          </span>
          <span className="h-px w-8 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Identity
          </span>
        </div>
        <h1 className="mt-5 max-w-[18ch] font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.035em] text-foreground sm:text-6xl">
          Who is <span className="text-foreground/30">Naidra</span>?
        </h1>

        {profile && (
          <div className="mt-8 flex flex-col items-start gap-5 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
            {profile.profile_image ? (
              <Image
                src={resolveImageUrl(profile.profile_image)}
                alt={profile.name}
                width={100}
                height={100}
                className="h-24 w-24 shrink-0 rounded-2xl border border-border object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-2 font-display text-3xl font-extrabold text-foreground">
                {profile.nickname?.charAt(0) ?? "N"}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                Profile / {profile.nickname ?? "NAIDRA"}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                {profile.name}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {profile.tagline}
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
        <div className="hidden lg:block">
          <p className="max-w-[16ch] font-display text-lg font-semibold leading-snug tracking-tight text-foreground/70">
            Building systems, breaking them, documenting the process.
          </p>
        </div>

        <div className="flex flex-col">
          {sections?.map((section, idx) => (
            <ScrollReveal key={section.id} delay={idx * 60}>
              <article className="border-t border-border py-7 first:border-t-0 first:pt-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {section.heading}
                </p>
                <div className="mt-3">
                  <MarkdownContent content={section.content} />
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}

export const revalidate = 3600;
