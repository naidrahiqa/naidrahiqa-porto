import { createClient } from "@/lib/supabase/server";
import { SocialIcon } from "@/components/SocialIcon";

export default async function Footer() {
  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .order("sort_order");

  return (
    <footer className="mt-auto border-t border-border/60 bg-surface/40 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm font-extrabold uppercase text-foreground">
            naidrahiqa
          </p>
        </div>

        <div className="flex items-center gap-2">
          {contacts?.map((c) => (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${c.platform} - ${c.handle}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition-colors duration-200 hover:border-foreground/30 hover:text-foreground"
            >
              <SocialIcon platform={c.platform} size={16} />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-muted">
          <span>© {new Date().getFullYear()} FAQIH ARDIAN SYAH</span>
        </div>
      </div>
    </footer>
  );
}

export const revalidate = 3600;
