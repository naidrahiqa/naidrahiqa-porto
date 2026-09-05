"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ExternalLink } from "lucide-react";

interface LightboxProps {
  src: string;
  alt: string;
  href?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, href, onClose }: LightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "Tab") {
        const focusable = overlay.querySelectorAll<HTMLElement>(
          'button, a, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image preview: ${alt}`}
      onClick={(e) => {
        if (e.target === overlayRef.current) close();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <button
        ref={closeButtonRef}
        onClick={close}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close lightbox"
      >
        <X size={20} />
      </button>

      <div className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center gap-3">
        <Image
          src={src}
          alt={alt}
          width={1920}
          height={1080}
          className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
          unoptimized
        />
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
          >
            <ExternalLink size={13} />
            Open original
          </a>
        )}
      </div>
    </div>
  );
}