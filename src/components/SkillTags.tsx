"use client";

import { useState } from "react";
import { Network, Terminal, Cpu, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  category: string;
  icon: typeof Network;
  dotColor: string;
}

const SKILLS: Skill[] = [
  { name: "Networking", category: "TKJ", icon: Network, dotColor: "bg-sky-500" },
  { name: "Kernel Dev", category: "C / eBPF", icon: Terminal, dotColor: "bg-emerald-500" },
  { name: "IoT Systems", category: "ESP32", icon: Cpu, dotColor: "bg-amber-500" },
  { name: "CTF & Pwn", category: "Binary", icon: Flag, dotColor: "bg-rose-500" },
];

export function SkillTags() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {SKILLS.map((skill) => {
        const Icon = skill.icon;
        const isSelected = active === skill.name;

        return (
          <button
            key={skill.name}
            type="button"
            onClick={() => setActive(isSelected ? null : skill.name)}
            aria-pressed={isSelected}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
              "text-[11px] tracking-wide transition-colors duration-150",
              isSelected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-surface text-foreground/80 hover:border-foreground/30 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full transition-transform group-hover:scale-125",
                skill.dotColor
              )}
            />
            <Icon size={12} className="shrink-0 opacity-60" />
            <span className="font-semibold">{skill.name}</span>
            <span
              className={cn(
                "font-mono text-[9px]",
                isSelected ? "text-background/60" : "text-muted"
              )}
            >
              {skill.category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
