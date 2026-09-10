import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { dbError } from "@/lib/api";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("sort_order");

  if (error) return NextResponse.json({ error: dbError(error) }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  if (body.deleted && Array.isArray(body.deleted)) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("contacts")
      .delete()
      .in("id", body.deleted);
    if (error) return NextResponse.json({ error: dbError(error) }, { status: 500 });
  }

  const items = body.items ?? body;
  if (!Array.isArray(items)) {
    return NextResponse.json({ ok: true });
  }

  const clean = items.map(
    (i: { id?: string; platform?: string; handle?: string; url?: string; sort_order?: number }) => ({
      id: i.id,
      platform: i.platform ?? "email",
      handle: i.handle ?? "",
      url: i.url ?? "",
      sort_order: i.sort_order ?? 0,
    })
  ).filter((i) => !i.id?.startsWith("new-"));

  if (clean.length === 0) return NextResponse.json({ ok: true });

  const supabase = await createClient();

  for (const item of clean) {
    if (item.id) {
      const { id, ...fields } = item;
      await supabase.from("contacts").update(fields).eq("id", id);
    } else {
      await supabase.from("contacts").insert(item);
    }
  }

  return NextResponse.json({ ok: true });
}