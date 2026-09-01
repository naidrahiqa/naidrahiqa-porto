-- =============================================================
-- 015 — Tambah kolom language ke projects
-- Jalankan di Supabase Dashboard > SQL Editor (setelah 014)
-- =============================================================

alter table public.projects
  add column if not exists language text not null default '';

-- Backfill berdasarkan bahasa dari GitHub
update public.projects set language = 'C' where slug in ('phrolova-kernel-selene', 'pollux-kernel-fire');
update public.projects set language = 'Shell' where slug in ('kairitsu-safe', 'evanescia-memory', 'media-fix', 'h-thermal', 'hyacine-io', 'multi-audio');
update public.projects set language = 'C++' where slug = 'spoof-fierce';
update public.projects set language = 'Python' where slug in ('catchido', 'mtk-unbrick', 'rk-r75-wired-recovery');
update public.projects set language = 'JavaScript' where slug = 'reboisasi';
update public.projects set language = 'TypeScript' where slug in ('aqua-safe-monitor', 'scorewave', 'kti-attendance-system');
update public.projects set language = 'Go' where slug = 'fetchvid';
update public.projects set language = 'Blade' where slug = 'kasirin-aja';
update public.projects set language = 'Kotlin' where slug in ('aqua-safe-monitor-android', 'tekajeduwa');
update public.projects set language = 'QML' where slug = 'endeavouros-rice';
update public.projects set language = '-' where slug in ('mtk-flasher', 'gitload-dump', 'lks-itnsa-2026');
