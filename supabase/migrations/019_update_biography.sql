-- =============================================================
-- 019 — Update Biography: Hero & About Me sections
-- Jalankan di Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. Update Profile (Hero Bio)
UPDATE public.profiles
SET hero_description = 'Exploring Linux kernel optimization, embedded systems, and cybersecurity. Building competition-grade hardware and software solutions.',
    updated_at = now()
WHERE id = 1;

-- 2. Update Who I Am
UPDATE public.about_sections
SET content = E'Hi, I''m Faqih Ardian Syah (just ''Faqih'' is fine!). I''m a Network & Computer Engineering (TKJ) student from Jepara, Indonesia, with a deep fascination for low-level systems, networking, and cybersecurity. My daily routine revolves around building functional systems, breaking things to see how they tick, and documenting the journey.',
    updated_at = now()
WHERE key = 'who_am_i';

-- 3. Update Current Focus
UPDATE public.about_sections
SET content = E'Right now, I''m deep into custom kernel development for the Redmi 10 2022 (selene).',
    updated_at = now()
WHERE key = 'current_focus';

-- 4. Update What's Next?
UPDATE public.about_sections
SET content = E'I''m always open to collaborating on challenging projects, exchanging insights with fellow developers, and building tools that genuinely solve problems.',
    updated_at = now()
WHERE key = 'whats_next';
