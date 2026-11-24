"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Loader2,
  Pin,
  ExternalLink,
  FolderGit2,
  Search,
  X,
} from "lucide-react";
import { cn, resolveImageUrl } from "@/lib/utils";
import { isPklProject } from "@/lib/pkl";
import type { Project } from "@/lib/types";
import { useToast } from "@/components/admin/Toast";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  FeaturedToggle,
  PublishToggle,
} from "@/components/admin/FeaturedToggle";

function SortableRow({
  item,
  index,
  dragDisabled,
  onPatch,
}: {
  item: Project;
  index: number;
  dragDisabled: boolean;
  onPatch: (id: string, patch: Partial<Project>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: dragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cover = item.cover_image ? resolveImageUrl(item.cover_image) : null;
  const isPkl = isPklProject(item);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border bg-surface p-3 transition-all sm:flex-nowrap",
        item.featured
          ? "border-accent/40 bg-accent-fill/20"
          : "border-border",
        isDragging && "z-10 opacity-80 ring-2 ring-accent"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        disabled={dragDisabled}
        className={cn(
          "touch-none rounded-md p-1 text-muted transition-colors",
          dragDisabled
            ? "cursor-not-allowed opacity-30"
            : "cursor-grab hover:text-accent active:cursor-grabbing"
        )}
        aria-label="Drag to reorder"
        title={
          dragDisabled
            ? "Matikan filter pencarian untuk ubah urutan drag & drop"
            : "Tarik untuk ubah urutan"
        }
      >
        <GripVertical size={18} />
      </button>

      <span className="w-6 shrink-0 text-center font-mono text-xs font-bold text-muted">
        {index + 1}
      </span>

      <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <FolderGit2 size={16} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
              isPkl
                ? "border-accent/40 bg-accent-fill text-accent"
                : item.category === "school"
                  ? "border-border bg-surface-2 text-foreground/80"
                  : "border-border bg-surface-2 text-muted"
            )}
          >
            {isPkl ? "PKL" : item.category}
          </span>
          {item.class_level && (
            <span className="font-mono text-[10px] uppercase text-muted">
              Kelas {item.class_level}
            </span>
          )}
          {item.subject && !isPkl && (
            <span className="truncate font-mono text-[10px] text-muted">
              · {item.subject}
            </span>
          )}
          {item.language && (
            <span className="truncate font-mono text-[10px] text-muted">
              · {item.language.split("|")[0].trim()}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-display text-sm font-bold tracking-tight text-foreground">
          {item.title}
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <FeaturedToggle
          id={item.id}
          featured={item.featured}
          onToggled={(next) => onPatch(item.id, { featured: next })}
        />

        <PublishToggle
          id={item.id}
          published={item.published}
          onToggled={(next) => onPatch(item.id, { published: next })}
        />

        <Link
          href={`/projects/${item.slug}`}
          target="_blank"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-2 p-1.5 text-muted transition-colors hover:text-foreground"
          title="Lihat di halaman publik"
        >
          <ExternalLink size={13} />
        </Link>

        <Link
          href={
            isPkl ? `/admin/pkl/${item.id}` : `/admin/projects/${item.id}`
          }
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
          title="Edit"
        >
          <Pencil size={12} />
          Edit
        </Link>

        <DeleteButton entity="projects" id={item.id} name={item.title} />
      </div>
    </li>
  );
}

export function ProjectReorderList({ items }: { items: Project[] }) {
  const [prevItems, setPrevItems] = useState(items);
  const [ordered, setOrdered] = useState<Project[]>(items);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "pinned" | "draft">(
    "all"
  );
  const { toast } = useToast();

  if (items !== prevItems) {
    setPrevItems(items);
    setOrdered(items);
  }

  const handlePatch = (id: string, patch: Partial<Project>) => {
    setOrdered((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const pinnedItems = useMemo(
    () => ordered.filter((i) => i.featured),
    [ordered]
  );
  const draftCount = useMemo(
    () => ordered.filter((i) => !i.published).length,
    [ordered]
  );

  const visibleItems = useMemo(() => {
    let list = ordered;
    if (quickFilter === "pinned") {
      list = list.filter((i) => i.featured);
    } else if (quickFilter === "draft") {
      list = list.filter((i) => !i.published);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.subject ?? "").toLowerCase().includes(q) ||
        (i.language ?? "").toLowerCase().includes(q) ||
        (i.repo_name ?? "").toLowerCase().includes(q) ||
        i.slug.toLowerCase().includes(q)
    );
  }, [ordered, quickFilter, search]);

  const isFiltered = quickFilter !== "all" || search.trim().length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    if (isFiltered) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((i) => i.id === active.id);
    const newIndex = ordered.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    persist(next);
  }

  async function persist(next: Project[]) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next.map((i) => i.id) }),
      });
      if (!res.ok) throw new Error("reorder failed");
      toast("success", "Urutan disimpan");
    } catch {
      toast("error", "Gagal menyimpan urutan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pinned summary bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-fill text-accent">
              <Pin size={14} className="fill-accent" />
            </span>
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-tight text-foreground">
                Pin Beranda (Selected Work)
              </p>
              <p className="text-[11px] text-muted">
                Maksimal 6 proyek teratas yang di-pin akan tampil di halaman
                utama. Klik tombol <strong>Pin</strong> pada daftar di bawah
                untuk menambah/melepas.
              </p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold",
              pinnedItems.length > 6
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-accent/30 bg-accent-fill text-accent"
            )}
          >
            {pinnedItems.length} / 6 Pinned
          </span>
        </div>

        {pinnedItems.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
            {pinnedItems.map((p, idx) => (
              <div
                key={p.id}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs",
                  idx < 6
                    ? "border-accent/30 bg-accent-fill/50 text-foreground"
                    : "border-border bg-surface-2 text-muted"
                )}
              >
                <span className="font-mono text-[10px] font-bold text-accent">
                  #{idx + 1}
                </span>
                <span className="max-w-[180px] truncate font-medium">
                  {p.title}
                </span>
                <FeaturedToggle
                  id={p.id}
                  featured={p.featured}
                  compact
                  onToggled={(next) => handlePatch(p.id, { featured: next })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search & quick filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, mapel, bahasa, atau repo..."
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-foreground/40"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setQuickFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              quickFilter === "all"
                ? "bg-foreground text-background"
                : "bg-surface-2 text-muted hover:text-foreground"
            )}
          >
            Semua ({ordered.length})
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter("pinned")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              quickFilter === "pinned"
                ? "bg-accent text-on-accent"
                : "bg-surface-2 text-muted hover:text-foreground"
            )}
          >
            <Pin size={11} />
            Pinned ({pinnedItems.length})
          </button>
          {draftCount > 0 && (
            <button
              type="button"
              onClick={() => setQuickFilter("draft")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                quickFilter === "draft"
                  ? "bg-foreground text-background"
                  : "bg-surface-2 text-muted hover:text-foreground"
              )}
            >
              Draft ({draftCount})
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin text-accent" />
            Menyimpan urutan...
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-accent" />
            {visibleItems.length} ditampilkan
            {!isFiltered && " · tarik ikon titik di kiri untuk ubah urutan"}
          </>
        )}
      </div>

      {visibleItems.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2">
              {visibleItems.map((item, index) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  index={index}
                  dragDisabled={isFiltered}
                  onPatch={handlePatch}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center text-xs text-muted">
          Tidak ada proyek yang cocok dengan filter saat ini.
        </div>
      )}
    </div>
  );
}
