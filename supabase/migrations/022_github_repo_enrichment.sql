-- =============================================================
-- 022 - GitHub repository enrichment + profile stats
-- Jalankan di Supabase Dashboard > SQL Editor (setelah 021)
-- =============================================================

-- ---------- 1. Extra repository metadata ----------
alter table public.projects
  add column if not exists repo_languages jsonb not null default '{}'::jsonb,
  add column if not exists repo_license text,
  add column if not exists repo_open_issues int not null default 0,
  add column if not exists repo_size_kb int not null default 0,
  add column if not exists repo_created_at timestamptz,
  add column if not exists repo_default_branch text,
  add column if not exists repo_release_tag text,
  add column if not exists repo_release_url text,
  add column if not exists repo_release_at timestamptz,
  add column if not exists repo_last_commit text,
  add column if not exists repo_last_commit_at timestamptz,
  add column if not exists repo_synced_at timestamptz;

-- ---------- 2. GitHub profile snapshot (single row) ----------
create table if not exists public.github_profile (
  id int primary key default 1 check (id = 1),
  login text not null default 'naidrahiqa',
  name text,
  bio text,
  avatar_url text,
  followers int not null default 0,
  following int not null default 0,
  public_repos int not null default 0,
  member_since timestamptz,
  synced_at timestamptz not null default now()
);

alter table public.github_profile enable row level security;

drop policy if exists "public read github_profile" on public.github_profile;
create policy "public read github_profile" on public.github_profile
  for select using (true);

drop policy if exists "admin write github_profile" on public.github_profile;
create policy "admin write github_profile" on public.github_profile
  for all
  using (auth.jwt() ->> 'email' = 'naidrahiqa@naidra.dev')
  with check (auth.jwt() ->> 'email' = 'naidrahiqa@naidra.dev');
