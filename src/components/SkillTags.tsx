"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const SKILLS = [
  { name: "Networking", color: "border-accent bg-accent text-on-accent" },
  { name: "Kernel Dev", color: "border-accent-2 bg-accent-2 text-on-accent" },
  { name: "IoT", color: "border-gold bg-gold text-on-accent" },
  { name: "CTF", color: "border-danger bg-danger text-on-accent" },
];

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function SkillTags() {
  const [scattered, setScattered] = useState(true);

  const positions = SKILLS.map((_, i) => ({
    x: rand(i * 7 + 1) * 55 + 5,
    y: rand(i * 13 + 3) * 30 + 5,
    r: rand(i * 19 + 5) * 50 - 25,
    delay: rand(i * 31 + 7) * 0.4,
  }));

  return (
    <div className="relative w-full">
      {scattered ? (
        <div className="relative h-32 sm:h-28">
          {SKILLS.map((skill, i) => {
            const p = positions[i];
            return (
              <button
                key={skill.name}
                onClick={() => setScattered(false)}
                className={cn(
                  "absolute rounded-2xl border-2 px-4 py-2.5",
                  "font-display text-xs font-bold uppercase tracking-wider",
                  "hard-shadow-sm cursor-pointer z-10",
                  "transition-all duration-300 ease-out",
                  "hover:scale-110 hover:brightness-110 hover:z-20 hover:rotate-0",
                  "active:scale-95",
                  skill.color
                )}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: `rotate(${p.r}deg)`,
                  animation: `skill-float ${2.5 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`,
                }}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <button
              key={skill.name}
              onClick={() => setScattered(true)}
              className={cn(
                "rounded-2xl border-2 px-4 py-2.5",
                "font-display text-xs font-bold uppercase tracking-wider",
                "hard-shadow-sm cursor-pointer",
                "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                "hover:scale-105 hover:brightness-110",
                "active:scale-95",
                skill.color
              )}
            >
              {skill.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
