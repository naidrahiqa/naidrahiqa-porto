import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { slugify, detectVideoType, getStoragePath } from "@/lib/utils";
import { dbError } from "@/lib/api";
import { pickFields, projectFields, achievementFields } from "@/lib/admin-fields";

const entities = ["projects", "achievements"] as const;
type Entity = (typeof entities)[number];

const allowedFields: Record<Entity, readonly string[]> = {
  projects: projectFields,
  achievements: achievementFields,
};

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/admin/[entity]/[id]">
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entity, id } = await params;
  if (!entities.includes(entity as Entity)) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(entity)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: dbError(error) }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/admin/[entity]/[id]">
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entity, id } = await params;
  if (!entities.includes(entity as Entity)) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const payload = pickFields(body, allowedFields[entity as Entity]);
  delete payload.created_at;
  payload.updated_at = new Date().toISOString();
  if (entity === "projects") {
    if (payload.slug !== undefined) {
      const trimmed = String(payload.slug ?? "").trim();
      payload.slug = trimmed || (payload.title ? slugify(String(payload.title)) : undefined);
    } else if (payload.title) {
      payload.slug = slugify(String(payload.title));
    }
    if (payload.slug === undefined) delete payload.slug;

    if (payload.slug) {
      const supabaseCheck = await createClient();
      const { data: existing } = await supabaseCheck
        .from("projects")
        .select("id")
        .eq("slug", payload.slug)
        .neq("id", id)
        .limit(1)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: "A project with this slug already exists" },
          { status: 409 }
        );
      }
    }

    if (payload.video_url !== undefined) {
      const videoUrl = typeof payload.video_url === "string" ? payload.video_url : null;
      payload.video_type = payload.video_type ?? detectVideoType(videoUrl);
    }
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(entity)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: dbError(error) }, { status: 500 });
  return NextResponse.json(data);
}

async function cleanupStorageFiles(supabase: Awaited<ReturnType<typeof createClient>>, urls: (string | null)[]) {
  const paths: string[] = [];
  for (const url of urls) {
    if (!url) continue;
    const path = getStoragePath(url);
    if (path) paths.push(path);
  }
  if (paths.length > 0) {
    await supabase.storage.from("media").remove(paths);
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/admin/[entity]/[id]">
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entity, id } = await params;
  if (!entities.includes(entity as Entity)) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  }

  const supabase = await createClient();

  if (entity === "projects") {
    const { data: project } = await supabase
      .from("projects")
      .select("cover_image, video_url")
      .eq("id", id)
      .single();

    const { data: media } = await supabase
      .from("project_media")
      .select("url")
      .eq("project_id", id);

    const urls = [
      project?.cover_image,
      project?.video_url,
      ...(media?.map((m) => m.url) ?? []),
    ];
    await cleanupStorageFiles(supabase, urls);
  } else if (entity === "achievements") {
    const { data: achievement } = await supabase
      .from("achievements")
      .select("certificate_url")
      .eq("id", id)
      .single();

    await cleanupStorageFiles(supabase, [achievement?.certificate_url ?? null]);
  }

  const { error } = await supabase.from(entity).delete().eq("id", id);

  if (error) return NextResponse.json({ error: dbError(error) }, { status: 500 });
  return NextResponse.json({ ok: true });
}
