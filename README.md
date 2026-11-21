# Naidrahiqa

Personal portfolio + school project showcase for Faqih Ardian Syah.

## Tech Stack

- Next.js 16.3.0 + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + Storage)
- Deployed on Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Environment variables (`.env.local` locally, Vercel dashboard in production):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ADMIN_EMAIL=...              # admin login for RLS
RESEND_API_KEY=...           # optional: contact form email
GITHUB_USERNAME=naidrahiqa   # optional: defaults to naidrahiqa
GITHUB_TOKEN=...             # optional but recommended: richer repo sync
```

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Public pages
│   │   ├── page.tsx        # Homepage
│   │   ├── about/          # About page
│   │   ├── contact/        # Contact page
│   │   └── projects/       # Project showcase
│   │       ├── [slug]/     # Project detail
│   │       └── school/     # Class/subject pages
│   ├── admin/              # Admin panel (RLS-protected)
│   │   ├── login/          # Magic link login
│   │   └── (panel)/        # Dashboard, CRUD editors
│   └── api/admin/          # Admin API routes
├── components/
│   ├── admin/              # Admin UI components
│   └── [public components]
└── lib/
    ├── types.ts            # TypeScript interfaces
    ├── utils.ts            # Helpers (cn, slugify, resolveImageUrl)
    └── supabase/           # Client/server Supabase helpers
```

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
npm test         # Vitest unit tests (src/lib)
```

## GitHub Sync

`POST /api/admin/github/sync` (admin only) pulls every public repository and stores:

- stars, forks, topics, primary language, license, open issues, size, default branch
- per-language byte breakdown for the stacked language bars
- latest release and latest commit message
- profile snapshot (public repo count, followers, member since)

`GITHUB_TOKEN` is optional. Without it the public 60 requests/hour limit still allows a partial sync; with it every repository is enriched on each run. Run migration `022_github_repo_enrichment.sql` before the first sync.

## Database

Migrations in `supabase/migrations/` (run in order in Supabase SQL Editor).

## License

Private — Faqih Ardian Syah
