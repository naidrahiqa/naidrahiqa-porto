import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SocialLink } from "@/components/SocialIcon";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Faqih Ardian Syah for collaborations, questions, or technical discussions.",
};

export default async function ContactPage() {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-12 pt-12 sm:pt-16">
      <header className="max-w-2xl">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Contact
          </span>
          <span className="h-px w-8 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Open inbox
          </span>
        </div>
        <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-foreground sm:text-6xl">
          Let&apos;s <span className="text-foreground/30">connect</span>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          Reach out for collaborations, questions, or just to talk about Linux
          kernels, IoT telemetry, and CTF challenges.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Send a message
          </p>
          <ContactForm />
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Or find me on
          </p>
          <div className="flex flex-col gap-3">
            {contacts && contacts.length > 0 ? (
              contacts.map((c) => (
                <SocialLink
                  key={c.id}
                  platform={c.platform}
                  handle={c.handle}
                  url={c.url}
                />
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-[13px] text-muted">
                Social links are not configured yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
