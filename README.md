# Dr. Saad El Mahdy — Therapy Booking

A Next.js + Supabase booking platform for Dr. Saad's therapy sessions.

## Database Setup

1. Open your Supabase project SQL editor
2. Run `supabase/migrations/001_schema.sql`
3. Run `supabase/migrations/002_rls.sql`

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_SECRET`

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Emails**: Resend
- **Deployment**: Vercel
