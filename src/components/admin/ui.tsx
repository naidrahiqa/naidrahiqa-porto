import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
    >
      {children}
    </label>
  );
}

const fieldBase =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 outline-none transition-colors focus:border-foreground/40";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(fieldBase, "leading-relaxed", props.className)}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldBase, props.className)} />;
}

export function Button({
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-foreground text-background hover:opacity-90",
        variant === "secondary" &&
          "border border-border bg-surface text-foreground hover:border-foreground/30",
        variant === "danger" &&
          "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
        props.className
      )}
    />
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 transition-colors duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatusPill({ ok, text }: { ok: boolean; text: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        ok
          ? "border-accent-2/30 bg-accent-2-fill text-accent-2"
          : "border-amber-400/30 bg-amber-400/5 text-amber-500"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          ok ? "bg-accent-2" : "bg-amber-400"
        )}
      />
      {text}
    </span>
  );
}
