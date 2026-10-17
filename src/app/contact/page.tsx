import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SocialLink } from "@/components/SocialIcon";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact - Naidrahiqa",
};

export default async function ContactPage() {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-10 pt-12 sm:pt-16">
      <header className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-fill px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent mb-3 dark:bg-accent/20">
          <span>✉</span>
          <span>TRANSMISSION // DIRECT INBOX</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl text-foreground">
          Let&apos;s <span className="marker">connect</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted">
          Reach out for collaborations, questions, or just to talk about Linux kernels, IoT telemetry, and CTF challenges.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <ContactForm />

        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Or find me on
          </p>
          <div className="flex flex-col gap-3">
            {contacts?.map((c) => (
              <SocialLink
                key={c.id}
                platform={c.platform}
                handle={c.handle}
                url={c.url}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
