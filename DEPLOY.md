# Deploy Guide — naidra

## 1. Buat Supabase Project

1. Buka https://supabase.com → **New project** (free tier cukup).
2. Catat **Project URL** dan **anon public key** dari *Project Settings → API*.

## 2. Jalankan Migrasi

1. Buka **SQL Editor** di dashboard Supabase.
2. Jalankan semua file di `supabase/migrations/` secara berurutan (001 sampai 021) via **Run**. Jangan lompat, jangan jalankan ulang file yang sudah pernah dijalankan.
3. `002_seed.sql` berisi data awal: profile, about sections, contacts, projects, achievements.

## 3. Buat User Admin

Di **Authentication → Users → Add user**, buat akun email + password (mis. `admin@naidra.dev`). Ini dipakai login di `/admin/login`.

## 4. Isi Environment

Edit `.env.local` (jangan pernah di-commit - sudah ada di .gitignore):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_EMAIL=naidrahiqa@naidra.dev
RESEND_API_KEY=re_xxx            # opsional: form kontak (resend.com)
```

## 5. Verifikasi Lokal

```bash
npm run dev
```

Buka `http://localhost:3000` (cek halaman publik) dan `http://localhost:3000/admin/login` (login pakai akun admin).

## 6. Deploy ke Vercel

```bash
git add .
git commit -m "feat: naidra portfolio + admin panel"
git branch -M main
git remote add origin https://github.com/naidrahiqa/naidrahiqa-porto.git
git push -u origin main
```

1. Buka https://vercel.com/new → import repo.
2. Tambahkan environment variables yang sama seperti `.env.local` (Settings → Environment Variables).
3. **Deploy**. Project URL di Vercel harus sama persis dengan Project URL Supabase (biarkan default, Jangan centang "Deploy a static site" — ini project Next.js).

## Catatan

- Semua halaman server-rendered (dynamic), jadi konten baru langsung muncul setelah edit di `/admin` - tidak perlu redeploy.
- Repo GitHub (project personal): klik **Sync GitHub** di dashboard admin untuk menarik metadata terbaru (stars, forks, topics, bahasa) ke database.
- Form kontak butuh `RESEND_API_KEY` di Vercel; tanpa itu API balas "Email service is not configured".
- Video: dukung URL YouTube, Google Drive (format `drive.google.com/file/d/<id>` atau `/uc?id=`), dan file di bucket `media`.
- Upload gambar/video via admin tersimpan di Storage bucket `media` (public, RLS: authenticated write).
