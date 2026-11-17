# AHU IT Study Summaries

Arabic RTL course-summary portal for the Faculty of Information Technology at Al-Hussein Bin Talal University.

## Run locally

1. Copy `.env.local.example` to `.env.local` and fill in the Supabase project URL, anon key, admin password, and server-only service role key.
2. Run `npm install` and `npm run dev`.
3. Run `schema.sql` in the Supabase SQL Editor. The `summaries` bucket is public for PDF viewing and downloads.

The public site uses the anon key for read-only queries. Admin list, upload, and delete actions go through `/api/admin/summaries`, which checks the configured password server-side and uses `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service role key to the browser. Use HTTPS in production and choose a strong admin password.
