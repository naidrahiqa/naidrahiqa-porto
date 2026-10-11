-- =============================================================
-- 016 - Sync GitHub Repositories & Cleanup
-- Jalankan di Supabase Dashboard > SQL Editor (setelah 015)
-- =============================================================

-- ---------- 1. Hapus repo yang sudah dihapus di GitHub ----------
DELETE FROM public.projects WHERE slug IN (
  'mtk-flasher' -- repo deleted di GitHub
);

-- ---------- 2. Update repo yang di-rename / link diperbarui ----------

-- Dashboard Kelas (sebelumnya tekajeduwa / slug ber-spasi)
UPDATE public.projects
SET slug = 'dashboard-kelas',
    title = 'Dashboard Kelas',
    link = 'https://github.com/naidrahiqa/dashboard-kelas',
    description = 'Dashboard kelas SMK berbasis Kotlin & Android',
    language = 'Kotlin',
    updated_at = now()
WHERE slug = 'Dashboard Kelas' OR link LIKE '%tekajeduwa%';

-- CachyOS Rice (sebelumnya endeavouros-rice)
UPDATE public.projects
SET slug = 'cachyos-rice',
    title = 'CachyOS Rice',
    link = 'https://github.com/naidrahiqa/cachyos-rice',
    description = 'EndeavourOS Caelestia rice: Hyprland + Material You + blur + SDDM sync',
    language = 'QML',
    updated_at = now()
WHERE slug = 'endeavouros-rice' OR link LIKE '%endeavouros-rice%';

-- KTI Dashboard (sebelumnya kti-attendance-system)
UPDATE public.projects
SET slug = 'kti-dashboard',
    title = 'KTI Dashboard',
    link = 'https://github.com/naidrahiqa/kti-dashboard',
    description = 'Absensi, manajemen kas & keaktifan KTI (Next.js + Google Sheets)',
    language = 'TypeScript',
    updated_at = now()
WHERE slug = 'kti-attendance-system' OR link LIKE '%kti-attendance-system%';

-- Phrolova Kernel (update link ke android_kernel_xiaomi_selene)
UPDATE public.projects
SET link = 'https://github.com/naidrahiqa/android_kernel_xiaomi_selene',
    description = 'Android kernel xiaomi selene/selenes/eos R Vendor',
    language = 'C',
    updated_at = now()
WHERE slug = 'phrolova-kernel-selene' OR link LIKE '%phrolova_kernel_xiaomi_selene%';

-- Pollux Kernel (update link ke android_kernel_xiaomi_fire)
UPDATE public.projects
SET link = 'https://github.com/naidrahiqa/android_kernel_xiaomi_fire',
    description = 'Custom Kernel Redmi 12 Fire T/U (MIUI 14 & HyperOS 1)',
    language = 'C',
    updated_at = now()
WHERE slug = 'pollux-kernel-fire' OR link LIKE '%pollux_kernel_xiaomi_fire%';

-- Aqua Safe Monitor (update link dari aqua_safe_monitor_opsi_2026 ke aqua-safe-monitor)
UPDATE public.projects
SET link = 'https://github.com/naidrahiqa/aqua-safe-monitor',
    language = 'TypeScript',
    updated_at = now()
WHERE slug = 'aqua-safe-monitor' OR link LIKE '%aqua_safe_monitor_opsi_2026%';

-- ---------- 3. Tambah repository aktif baru ----------

-- Kernel CI Kit
INSERT INTO public.projects (
  title,
  slug,
  category,
  layout,
  description,
  content,
  link,
  language,
  published,
  featured,
  sort_order
) VALUES (
  'Kernel CI Kit',
  'kernel-ci-kit',
  'personal',
  'text-first',
  'Reusable GitHub Actions toolkit for Android kernels: cached Clang toolchain, ccache, AnyKernel3 zip, GitHub Release, Telegram notify',
  E'## Overview\nReusable GitHub Actions toolkit untuk kompilasi kernel Android secara otomatis dan efisien.\n\n## Features\n- Cached Clang toolchain\n- ccache untuk build cepat\n- Packaging otomatis AnyKernel3 flashable zip\n- GitHub Release otomatis & Telegram notify\n\n[Lihat di GitHub](https://github.com/naidrahiqa/kernel-ci-kit)',
  'https://github.com/naidrahiqa/kernel-ci-kit',
  'Shell',
  true,
  false,
  25
) ON CONFLICT (slug) DO UPDATE SET
  link = EXCLUDED.link,
  description = EXCLUDED.description,
  language = EXCLUDED.language,
  updated_at = now();

-- Selene Releases
INSERT INTO public.projects (
  title,
  slug,
  category,
  layout,
  description,
  content,
  link,
  language,
  published,
  featured,
  sort_order
) VALUES (
  'Selene Releases',
  'selene-releases',
  'personal',
  'text-first',
  'PawwwNunungggg custom kernel releases for Xiaomi Redmi 10 (selene)',
  E'## Overview\nDistribusi release dan update flashable zip untuk custom kernel Redmi 10 (selene).\n\n[Lihat di GitHub](https://github.com/naidrahiqa/selene-releases)',
  'https://github.com/naidrahiqa/selene-releases',
  'Shell',
  true,
  false,
  26
) ON CONFLICT (slug) DO UPDATE SET
  link = EXCLUDED.link,
  description = EXCLUDED.description,
  language = EXCLUDED.language,
  updated_at = now();

-- Xiaomi MT6768 Common Kernel (k4.19)
INSERT INTO public.projects (
  title,
  slug,
  category,
  layout,
  description,
  content,
  link,
  language,
  published,
  featured,
  sort_order
) VALUES (
  'Xiaomi MT6768 Common Kernel (k4.19)',
  'android-kernel-xiaomi-mt6768-k419',
  'personal',
  'text-first',
  'MediaTek MT6768 common 4.19 kernel source tree for Xiaomi devices (Helio G80/G85)',
  E'## Overview\nMediaTek MT6768 common 4.19 kernel source tree untuk perangkat Xiaomi (Helio G80/G85 platform).\n\n## Platform Specs\n- **SoC**: MediaTek MT6768 (Helio G80 / G85)\n- **Kernel Version**: Linux 4.19 LTS\n- **Architecture**: ARM64 (aarch64)\n\n[Lihat di GitHub](https://github.com/naidrahiqa/android_kernel_xiaomi_mt6768-k419)',
  'https://github.com/naidrahiqa/android_kernel_xiaomi_mt6768-k419',
  'C',
  true,
  false,
  27
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  link = EXCLUDED.link,
  description = EXCLUDED.description,
  language = EXCLUDED.language,
  updated_at = now();

-- ---------- 4. Update Current Focus di About ----------
UPDATE public.about_sections
SET content = E'- Developing custom kernel for Redmi 10 2022 (selene) & CI toolkit\n- Building tools for Linux & Android users (FetchVid, MTK Unbrick)\n- CachyOS Hyprland rice setup (Material You + SDDM sync)\n- Hardware recovery & security research (RK R75 SWD flash, Zygisk spoofing)',
    updated_at = now()
WHERE key = 'current_focus';

-- ---------- 5. Standarisasi format casing mapel ----------
UPDATE public.projects
SET subject = 'ENGLISH'
WHERE category = 'school' AND subject = 'English';

-- ---------- 6. Performance Indexes untuk Filter & Sort ----------
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_class_level ON public.projects (class_level) WHERE category = 'school';
CREATE INDEX IF NOT EXISTS idx_projects_subject ON public.projects (subject) WHERE category = 'school';
CREATE INDEX IF NOT EXISTS idx_projects_published_sort ON public.projects (published, sort_order);


