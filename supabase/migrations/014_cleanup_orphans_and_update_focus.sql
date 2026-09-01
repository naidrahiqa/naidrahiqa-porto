-- =============================================================
-- 014 — Bersihkan orphan repos + update Current Focus
-- Jalankan di Supabase Dashboard > SQL Editor (setelah 013)
-- =============================================================

-- ---------- 1. Hapus orphan repos yang udah ga ada/di-archive di GitHub ----------
DELETE FROM public.projects WHERE slug IN (
  'oronyx-clang',           -- repo deleted
  'naidrahiqa-github-io',   -- repo deleted
  'resukisu',               -- repo deleted
  'kernelsu-next',          -- repo deleted
  'epitaph-kernel-fire-gki', -- repo archived
  'susf4ksu-legacy',        -- repo archived
  'anykernel3'              -- fork, bukan project sendiri
);

-- ---------- 2. Update Current Focus ----------
UPDATE public.about_sections
SET content = E'- Developing custom kernel for Redmi 10 2022 (selene)\n- Building Windows tools for Linux users (FetchVid, MTK Flasher)\n- EndeavourOS Hyprland rice setup\n- Hardware recovery (RK R75 keyboard SWD flash)',
    updated_at = now()
WHERE key = 'current_focus';
