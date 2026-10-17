"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveImageUrl } from "@/lib/utils";
import { ImageLightbox } from "@/components/ImageLightbox";

export function MarkdownContent({ content }: { content: string }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="prose prose-invert max-w-none prose-headings:font-mono prose-headings:tracking-tight prose-headings:text-foreground prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-muted prose-strong:text-foreground prose-li:text-muted prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-blockquote:border-accent prose-blockquote:text-muted prose-code:text-accent prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-pre:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({
            node,
            children,
          }: {
            node?: {
              children?: Array<{ type?: string; value?: string; tagName?: string }>;
            };
            children?: React.ReactNode;
          }) => {
            const nonWhitespace =
              node?.children?.filter((child) => {
                if (child.type === "text" && child.value?.trim() === "") return false;
                return true;
              }) || [];
            const isImagesOnly =
              nonWhitespace.length > 0 &&
              nonWhitespace.every(
                (child) => child.type === "element" && child.tagName === "img"
              );

            if (isImagesOnly) {
              if (nonWhitespace.length >= 2) {
                return (
                  <div className="not-prose my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {children}
                  </div>
                );
              }
              return <div className="not-prose my-6">{children}</div>;
            }

            return <p>{children}</p>;
          },
          img: (props: React.ComponentPropsWithoutRef<"img">) => {
            const { src, alt } = props;
            if (!src || typeof src !== "string") return null;
            const resolved = resolveImageUrl(src);
            return (
              <figure className="group not-prose my-2 overflow-hidden rounded-xl border border-border bg-surface">
                <button
                  type="button"
                  onClick={() => setLightbox({ src: resolved, alt: alt || "image" })}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-video overflow-hidden bg-surface-2">
                    <img
                      src={resolved}
                      alt={alt || "image"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </button>
                {alt && (
                  <figcaption className="border-t border-border/50 px-3 py-2 font-mono text-xs text-muted truncate">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
