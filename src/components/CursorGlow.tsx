"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleMouseMove(e: MouseEvent) {
      el!.style.opacity = "1";
      el!.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
    }

    function handleMouseLeave() {
      el!.style.opacity = "0";
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-50 h-[300px] w-[300px] rounded-full opacity-0"
      style={{
        background: "radial-gradient(circle, var(--glow) 0%, transparent 70%)",
        transition: "opacity 0.3s ease",
        willChange: "transform",
      }}
    />
  );
}
