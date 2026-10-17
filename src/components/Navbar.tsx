"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div ref={sentinelRef} className="absolute top-0 h-px w-full" />
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 py-3",
          scrolled
            ? "glass-strong border-b border-border/50 shadow-lg shadow-black/10 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
      <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-1.5 font-display text-base font-extrabold tracking-tight uppercase transition-colors"
        >
          <span className="text-foreground group-hover:text-accent transition-colors">
            naidrahiqa
          </span>
          <span className="text-accent text-xs animate-spin-slow">✦</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/70 bg-surface/70 px-2 py-1 backdrop-blur-md">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition-all duration-200",
                isActive(link.href)
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted hover:text-foreground hover:bg-foreground/[0.05]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="md:hidden p-2 rounded-xl border border-border bg-surface text-muted hover:text-foreground transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden glass-strong border-t border-border/50 mt-2 px-5 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "block rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                isActive(link.href)
                  ? "text-accent bg-accent-fill dark:bg-accent/20"
                  : "text-muted hover:text-foreground hover:bg-surface-2/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
    </>
  );
}
