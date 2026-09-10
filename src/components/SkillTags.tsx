"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const SKILLS = ["Networking", "Kernel Dev", "IoT", "CTF"];

const SCATTER = [
  { x: 8, y: 5, r: -12, drift: 6 },
  { x: 55, y: 0, r: 8, drift: -4 },
  { x: 28, y: 18, r: -6, drift: 5 },
  { x: 68, y: 14, r: 14, drift: -6 },
];

export function SkillTags() {
  const [scattered, setScattered] = useState(true);

  return (
    <div className="relative h-24 w-full sm:h-20">
      {scattered ? (
        <div className="relative h-full w-full">
          {SKILLS.map((skill, i) => {
            const s = SCATTER[i];
            return (
              <button
                key={skill}
                onClick={() => setScattered(false)}
                className={cn(
                  "absolute font-display rounded-full border-2 border-accent bg-accent px-3 py-1",
                  "text-[10px] font-bold uppercase tracking-widest text-on-accent",
                  "hard-shadow-sm cursor-pointer",
                  "transition-all duration-300 ease-out",
                  "hover:scale-110 hover:brightness-110 hover:z-10",
                  "active:scale-95"
                )}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  "--r": `${s.r}deg`,
                  transform: `rotate(${s.r}deg)`,
                  animation: `skill-float ${3 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.25}s`,
                } as React.CSSProperties}
              >
                {skill}
              </button>
            );
          })}
        </div>
      ) : (
        <button
          onClick={() => setScattered(true)}
          className={cn(
            "font-display w-fit cursor-pointer rounded-full border-2 border-accent bg-accent",
            "px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-accent",
            "hard-shadow-sm",
            "transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "hover:scale-105 hover:brightness-110",
            "active:scale-95"
          )}
        >
          Networking · Kernel Dev · IoT · CTF
        </button>
      )}
    </div>
  );
}
