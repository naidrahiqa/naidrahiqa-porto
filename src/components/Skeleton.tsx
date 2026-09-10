"use client";

import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-foreground/10",
        className
      )}
    />
  );
}

export function HeroSkeleton() {
  return (
    <div className="flex min-h-[100dvh] flex-col justify-center gap-8">
      <Pulse className="h-8 w-48 rounded-full" />
      <div className="space-y-3">
        <Pulse className="h-16 w-64 sm:h-24 sm:w-96" />
        <Pulse className="h-8 w-48 sm:h-12 sm:w-64" />
      </div>
      <Pulse className="h-20 w-full max-w-lg" />
      <div className="flex gap-4">
        <Pulse className="h-12 w-40 rounded-xl" />
        <Pulse className="h-12 w-36 rounded-xl" />
      </div>
    </div>
  );
}

export function TechStackSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Pulse key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Pulse key={i} className="h-64 w-full" />
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Pulse className="h-28 sm:col-span-2" />
      <div className="flex flex-col gap-4">
        <Pulse className="h-12" />
        <Pulse className="h-12" />
      </div>
    </div>
  );
}
