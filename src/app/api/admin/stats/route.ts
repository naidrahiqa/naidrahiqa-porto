import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { dbError } from "@/lib/api";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  const [projects, achievements, about, contacts] = await Promise.all([
    supabase.from("projects").select("id"),
    supabase.from("achievements").select("id"),
    supabase.from("about_sections").select("id"),
    supabase.from("contacts").select("id"),
  ]);

  if ([projects, achievements, about, contacts].some((r) => r.error)) {
    return NextResponse.json({ error: dbError("stats failed") }, { status: 500 });
  }

  return NextResponse.json({
    projects: projects.data?.length ?? 0,
    achievements: achievements.data?.length ?? 0,
    about: about.data?.length ?? 0,
    contacts: contacts.data?.length ?? 0,
  });
}
