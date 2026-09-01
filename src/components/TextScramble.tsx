"use client";

import { useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function TextScramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const totalFrames = text.length * 3;
    const queue: { from: string; to: string; start: number; end: number }[] = [];

    for (let i = 0; i < text.length; i++) {
      queue.push({
        from: CHARS[Math.floor(Math.random() * CHARS.length)],
        to: text[i],
        start: Math.floor(Math.random() * 12),
        end: Math.floor(Math.random() * 12) + 12,
      });
    }

    function update() {
      let output = "";
      let complete = 0;

      for (let i = 0; i < queue.length; i++) {
        const { from, to, start, end } = queue[i];
        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          output += from;
        }
      }

      if (el) el.textContent = output;

      if (complete < queue.length) {
        frame++;
        requestAnimationFrame(update);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          update();
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return <span ref={ref} className={className}>{text}</span>;
}
