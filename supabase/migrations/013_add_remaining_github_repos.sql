-- =============================================================
-- 013 — Tambah repo GitHub yang belum masuk ke portfolio
-- Jalankan di Supabase Dashboard > SQL Editor (setelah 012)
-- =============================================================

insert into public.projects (title, slug, category, description, content, link, published, sort_order)
values
  (
    'MTK Unbrick',
    'mtk-unbrick',
    'personal',
    'One-click unbrick tool for Xiaomi MTK devices via BROM mode',
    'Tool unbrick one-click untuk perangkat Xiaomi MTK via BROM mode, bypass auth dongle (SLA/DAA/SBC). [Lihat di GitHub](https://github.com/naidrahiqa/mtk-unbrick)',
    'https://github.com/naidrahiqa/mtk-unbrick',
    true,
    40
  ),
  (
    'MTK Flasher',
    'mtk-flasher',
    'personal',
    'MTK flashing toolkit for Xiaomi/Redmi (Linux)',
    'Toolkit flashing MTK untuk Xiaomi/Redmi di Linux. [Lihat di GitHub](https://github.com/naidrahiqa/mtk-flasher)',
    'https://github.com/naidrahiqa/mtk-flasher',
    true,
    41
  ),
  (
    'Gitload Dump',
    'gitload-dump',
    'personal',
    'OTA payload dumper via GitHub Actions',
    'Tool untuk dump OTA payload secara otomatis menggunakan GitHub Actions. [Lihat di GitHub](https://github.com/naidrahiqa/gitload-dump)',
    'https://github.com/naidrahiqa/gitload-dump',
    true,
    42
  ),
  (
    'EndeavourOS Rice',
    'endeavouros-rice',
    'personal',
    'EndeavourOS Caelestia rice: Hyprland + Material You + blur + SDDM sync',
    'Rice EndeavourOS dengan Hyprland, Material You theme, blur effects, dan SDDM sync. [Lihat di GitHub](https://github.com/naidrahiqa/endeavouros-rice)',
    'https://github.com/naidrahiqa/endeavouros-rice',
    true,
    43
  ),
  (
    'RK R75 Wired Recovery',
    'rk-r75-wired-recovery',
    'personal',
    'RK R75 Wired keyboard recovery toolkit - flash via ST-Link SWD',
    'Toolkit recovery untuk keyboard RK R75 Wired via ST-Link SWD flashing. [Lihat di GitHub](https://github.com/naidrahiqa/rk-r75-wired-recovery)',
    'https://github.com/naidrahiqa/rk-r75-wired-recovery',
    true,
    44
  ),
  (
    'Tekajeduwa',
    'tekajeduwa',
    'personal',
    'Aplikasi Kotlin',
    'Aplikasi Android berbasis Kotlin. [Lihat di GitHub](https://github.com/naidrahiqa/tekajeduwa)',
    'https://github.com/naidrahiqa/tekajeduwa',
    true,
    45
  )
on conflict (slug) do nothing;
