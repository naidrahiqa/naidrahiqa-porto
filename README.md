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

## Database

Migrations in `supabase/migrations/` (run in order in Supabase SQL Editor).

## License

Private — Faqih Ardian Syah
