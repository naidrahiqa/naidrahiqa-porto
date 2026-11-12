import { AchievementForm } from "@/components/admin/AchievementForm";

export default function NewAchievementPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">New Achievement</h1>
      </header>
      <AchievementForm />
    </div>
  );
}
