"use client";

import { useState } from "react";
import { Network, Terminal, Cpu, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  category: string;
  icon: typeof Network;
  dotColor: string;
  hoverGlow: string;
}

const SKILLS: Skill[] = [
  {
    name: "Networking",
    category: "TKJ",
    icon: Network,
    dotColor: "bg-sky-400",
    hoverGlow: "hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-300 hover:shadow-sky-500/10",
  },
  {
    name: "Kernel Dev",
    category: "C / eBPF",
    icon: Terminal,
    dotColor: "bg-emerald-400",
    hoverGlow: "hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300 hover:shadow-emerald-500/10",
  },
  {
    name: "IoT Systems",
    category: "ESP32",
    icon: Cpu,
    dotColor: "bg-amber-400",
    hoverGlow: "hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 hover:shadow-amber-500/10",
  },
  {
    name: "CTF & Pwn",
    category: "Binary",
    icon: Flag,
    dotColor: "bg-rose-400",
    hoverGlow: "hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-300 hover:shadow-rose-500/10",
  },
];

export function SkillTags() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {SKILLS.map((skill) => {
        const Icon = skill.icon;
        const isSelected = active === skill.name;

        return (
          <button
            key={skill.name}
            type="button"
            onClick={() => setActive(isSelected ? null : skill.name)}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5",
              "border-foreground/[0.08] bg-surface/40 dark:bg-white/[0.03] text-foreground/80",
              "text-xs font-medium tracking-wide backdrop-blur-xl shadow-xs",
              "transition-all duration-300 cursor-pointer hover:shadow-md",
              "hover:-translate-y-0.5",
              skill.hoverGlow,
              isSelected ? "border-accent bg-accent/15 text-accent ring-1 ring-accent/30 shadow-accent/20" : ""
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0 transition-transform group-hover:scale-125", skill.dotColor)} />
            <Icon size={13} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="font-semibold">{skill.name}</span>
            <span className="text-[10px] font-mono text-muted group-hover:text-foreground/75 transition-colors">
              {skill.category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
