import Link from "next/link";
import {
  FolderGit2,
  Award,
  LayoutList,
  Users,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const cards = [
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderGit2,
    get: (s: { projects: number }) => s.projects,
  },
  {
    label: "Achievements",
    href: "/admin/achievements",
    icon: Award,
    get: (s: { achievements: number }) => s.achievements,
  },
  {
    label: "About Sections",
    href: "/admin/about",
    icon: LayoutList,
    get: (s: { about: number }) => s.about,
  },
  {
    label: "Contacts",
    href: "/admin/contacts",
    icon: Users,
    get: (s: { contacts: number }) => s.contacts,
  },
];

const quickActions = [
  { href: "/admin/projects/new", label: "New Project", icon: FolderGit2 },
  { href: "/admin/achievements/new", label: "New Achievement", icon: Award },
];

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [projects, achievements, about, contacts] = await Promise.all([
    supabase.from("projects").select("id"),
    supabase.from("achievements").select("id"),
    supabase.from("about_sections").select("id"),
    supabase.from("contacts").select("id"),
  ]);

  const stats = {
    projects: projects.data?.length ?? 0,
    achievements: achievements.data?.length ?? 0,
    about: about.data?.length ?? 0,
    contacts: contacts.data?.length ?? 0,
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Control panel
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted">
          Manage your portal content from here.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-foreground/25"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted transition-colors group-hover:text-accent">
              <c.icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-2xl font-bold tracking-tight text-foreground">
                {c.get(stats)}
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {c.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-foreground/30"
            >
              <Plus size={15} />
              {a.label}
            </Link>
          ))}
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Review projects
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
