"use client";

import { useState } from "react";
import { Network, Terminal, Cpu, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  icon: typeof Network;
}

const SKILLS: Skill[] = [
  { name: "Networking", icon: Network },
  { name: "Kernel Dev", icon: Terminal },
  { name: "IoT Systems", icon: Cpu },
  { name: "CTF & Pwn", icon: Flag },
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
            <Icon size={12} className="shrink-0 opacity-60" />
            <span className="font-semibold">{skill.name}</span>
          </button>
        );
      })}
    </div>
  );
}
