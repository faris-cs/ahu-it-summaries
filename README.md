# AHU IT Study Summaries

Arabic RTL course-summary portal for the Faculty of Information Technology at Al-Hussein Bin Talal University.

## Run locally

1. Copy `.env.local.example` to `.env.local` and fill in the Supabase project URL, anon key, admin password, and server-only service role key.
2. Run `npm install` and `npm run dev`.
3. Run `schema.sql` in the Supabase SQL Editor. The `summaries` bucket is public for supported file downloads and PDF viewing.

The public site uses the anon key for read-only queries. Admin list, upload authorization, metadata, and delete actions go through the Cloudflare Pages Function at `/api/admin/summaries`, which checks the password server-side and uses `SUPABASE_SERVICE_ROLE_KEY`. File bytes upload directly from the browser to Supabase Storage with a short-lived signed upload token. No anonymous write policies are needed. Never expose the service role key or admin password to browser code.

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `out`
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as build environment variables.
- Set `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` as Pages Function secrets. The function also accepts `NEXT_PUBLIC_ADMIN_PASSWORD` for compatibility with existing deployments.
- Keep the root `functions/` directory in the Git repository. Cloudflare Pages discovers its Functions alongside the static `out/` assets.

The generated Next.js site is static. Admin API handling lives in `functions/api/admin/summaries.js`, not in a Next.js Route Handler.
