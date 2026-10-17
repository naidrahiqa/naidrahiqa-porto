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

  const sections = (rawSections && rawSections.length > 0
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
      ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 pt-12 sm:pt-16">
      <header className="flex flex-col gap-5">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-foreground/[0.08] bg-surface-2/60 px-3.5 py-1 text-[11px] font-mono font-medium uppercase tracking-wider text-muted">
          <span>IDENTITY &bull; ABOUT ME</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl text-foreground">
          Who is Naidra?
        </h1>

        {profile && (
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-foreground/[0.08] bg-surface/50 p-6 backdrop-blur-md sm:flex-row sm:items-center sm:gap-6">
            {profile.profile_image ? (
              <Image
                src={resolveImageUrl(profile.profile_image)}
                alt={profile.name}
                width={100}
                height={100}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover border border-foreground/[0.08]"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-foreground/[0.06] text-3xl font-extrabold text-foreground border border-foreground/[0.08]">
                {profile.nickname?.charAt(0) ?? "N"}
              </div>
            )}
            <div className="min-w-0 text-center sm:text-left">
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted">
                PROFILE &bull; {profile.nickname ?? "NAIDRA"}
              </span>
              <h2 className="font-display text-2xl font-extrabold text-foreground mt-0.5">
                {profile.name}
              </h2>
              <p className="mt-1 text-sm text-muted leading-relaxed font-normal">
                {profile.tagline}
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-4">
        {sections?.map((section, idx) => (
          <ScrollReveal key={section.id} delay={idx * 60}>
            <section className="rounded-2xl border border-foreground/[0.08] bg-surface/50 p-6 backdrop-blur-md transition-all duration-200 hover:border-foreground/20">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {section.heading}
              </h2>
              <div className="mt-3 text-sm leading-relaxed text-muted font-normal">
                <MarkdownContent content={section.content} />
              </div>
            </section>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

export const revalidate = 3600;
