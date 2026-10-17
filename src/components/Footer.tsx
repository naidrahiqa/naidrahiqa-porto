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
          <div className="flex items-center gap-1.5 font-display text-sm font-extrabold uppercase text-foreground">
            <span className="text-accent">✦</span>
            <span>naidrahiqa</span>
            <span className="rounded-md bg-accent-fill px-1.5 py-0.5 font-mono text-[9px] font-bold text-accent dark:bg-accent/20">
              VER 2.6
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Kernel Developer ✦ IoT Builder ✦ CyberSecurity Enthusiast
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
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-surface text-muted backdrop-blur-sm transition-all duration-200 hover:text-accent hover:border-accent/40 hover:-translate-y-0.5 hover:hard-shadow-sm"
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
