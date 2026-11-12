import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AchievementForm } from "@/components/admin/AchievementForm";

export default async function EditAchievementPage({
  params,
}: PageProps<"/admin/achievements/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: achievement } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", id)
    .single();

  if (!achievement) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">Edit Achievement</h1>
      </header>
      <AchievementForm initial={achievement} />
    </div>
  );
}
