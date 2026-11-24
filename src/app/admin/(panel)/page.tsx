import Link from "next/link";
import {
  FolderGit2,
  BookOpen,
  Award,
  LayoutList,
  Users,
  Plus,
  ArrowRight,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { isPklProject, parsePklMeta } from "@/lib/pkl";
import { DashboardPinManager } from "@/components/admin/DashboardPinManager";
import {
  GitHubSyncButton,
  GitLabSyncButton,
} from "@/components/admin/GitHubSyncButton";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [projectsRes, achievementsRes, aboutRes, contactsRes] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase.from("achievements").select("id"),
      supabase.from("about_sections").select("id"),
      supabase.from("contacts").select("id"),
    ]);

  const allProjects = (projectsRes.data ?? []) as Project[];
  const pklPosts = allProjects.filter((p) => isPklProject(p));
  const regularProjects = allProjects.filter((p) => !isPklProject(p));
  const recentPkl = [...pklPosts]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 4);
  const recentProjects = [...regularProjects]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 4);

  const cards = [
    {
      label: "Jurnal PKL",
      href: "/admin/pkl",
      icon: BookOpen,
      count: pklPosts.length,
    },
    {
      label: "Projects & Repos",
      href: "/admin/projects",
      icon: FolderGit2,
      count: regularProjects.length,
    },
    {
      label: "Achievements",
      href: "/admin/achievements",
      icon: Award,
      count: achievementsRes.data?.length ?? 0,
    },
    {
      label: "About",
      href: "/admin/about",
      icon: LayoutList,
      count: aboutRes.data?.length ?? 0,
    },
    {
      label: "Contacts",
      href: "/admin/contacts",
      icon: Users,
      count: contactsRes.data?.length ?? 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header + Direct Action Bar */}
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Control Panel
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-muted">
            Kelola catatan PKL, pin proyek unggulan ke beranda, dan sinkronkan
            repositori dari satu tempat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/pkl/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-on-accent transition-colors hover:bg-accent-hover"
          >
            <Plus size={14} />
            Catatan PKL
          </Link>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30"
          >
            <Plus size={14} />
            Proyek Baru
          </Link>
          <Link
            href="/admin/achievements/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30"
          >
            <Plus size={14} />
            Sertifikat
          </Link>
          <GitHubSyncButton />
          <GitLabSyncButton />
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-foreground/25"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted transition-colors group-hover:text-accent">
              <c.icon size={17} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold tracking-tight text-foreground">
                {c.count}
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {c.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Homepage Pin Manager */}
      <DashboardPinManager initialProjects={allProjects} />

      {/* 2-Column Quick Access: Recent PKL & Recent Projects */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent PKL Logs */}
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
                Jurnal PKL Terbaru
              </h2>
              <p className="text-[11px] text-muted">
                Catatan kegiatan mingguan Kelas XII
              </p>
            </div>
            <Link
              href="/admin/pkl"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
            >
              Semua ({pklPosts.length})
              <ArrowRight size={11} />
            </Link>
          </div>

          {recentPkl.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recentPkl.map((post) => {
                const meta = parsePklMeta(post);
                return (
                  <li
                    key={post.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/40 px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-accent/30 bg-accent-fill px-2 py-0.2 font-mono text-[9px] font-bold uppercase text-accent">
                          {meta.weekLabel}
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          {meta.period ?? formatDate(post.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-display text-xs font-bold text-foreground">
                        {post.title}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/projects/${post.slug}`}
                        target="_blank"
                        className="rounded-md border border-border bg-surface p-1.5 text-muted hover:text-foreground"
                        title="Lihat"
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <Link
                        href={`/admin/pkl/${post.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-foreground hover:border-accent hover:text-accent"
                      >
                        <Pencil size={11} />
                        Edit
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/30 p-6 text-center">
              <p className="text-xs font-semibold text-foreground">
                Belum ada catatan mingguan PKL
              </p>
              <Link
                href="/admin/pkl/new"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <Plus size={12} />
                Tulis Catatan Minggu 1
              </Link>
            </div>
          )}
        </section>

        {/* Recent Projects */}
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-tight text-foreground">
                Proyek Terakhir Diperbarui
              </h2>
              <p className="text-[11px] text-muted">
                Proyek sekolah &amp; repositori personal
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
            >
              Semua ({regularProjects.length})
              <ArrowRight size={11} />
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recentProjects.map((proj) => (
                <li
                  key={proj.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/40 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-muted">
                      <span>{proj.category}</span>
                      {(proj.subject || proj.language) && (
                        <>
                          <span>·</span>
                          <span className="truncate">
                            {proj.subject || proj.language}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-0.5 truncate font-display text-xs font-bold text-foreground">
                      {proj.title}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/projects/${proj.slug}`}
                      target="_blank"
                      className="rounded-md border border-border bg-surface p-1.5 text-muted hover:text-foreground"
                      title="Lihat"
                    >
                      <ExternalLink size={12} />
                    </Link>
                    <Link
                      href={`/admin/projects/${proj.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-foreground hover:border-accent hover:text-accent"
                    >
                      <Pencil size={11} />
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/30 p-6 text-center">
              <p className="text-xs text-muted">Belum ada proyek.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
