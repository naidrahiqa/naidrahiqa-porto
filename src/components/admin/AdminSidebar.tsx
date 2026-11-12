"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Award,
  LayoutList,
  Users,
  UserCircle,
  ExternalLink,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderGit2, exact: false },
  { href: "/admin/achievements", label: "Achievements", icon: Award, exact: false },
  { href: "/admin/about", label: "About", icon: LayoutList, exact: false },
  { href: "/admin/contacts", label: "Contacts", icon: Users, exact: false },
  { href: "/admin/profile", label: "Profile", icon: UserCircle, exact: false },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <>
      <div className="mb-3 hidden px-1 lg:block">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted/60">
          Admin panel
        </p>
        <p className="mt-1 truncate text-xs text-muted">{email}</p>
      </div>
      <nav className="flex flex-wrap gap-1 lg:flex-col">
        {nav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-foreground font-semibold text-background"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-foreground"
        >
          <ExternalLink size={16} />
          View site
        </Link>
      </nav>
    </>
  );
}
