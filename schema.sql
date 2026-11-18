-- Public read access; all writes are performed by authenticated server routes using
-- the service role key. Do not add anon INSERT/UPDATE/DELETE policies.
create extension if not exists pgcrypto;

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_name text not null,
  course_code text not null,
  major text not null check (major in ('CS', 'SE', 'CIS', 'CYS', 'CORE')),
  category text not null check (category in ('ملخص', 'سلايدات', 'سنوات سابقة')),
  file_url text not null,
  created_at timestamptz not null default now()
);

alter table public.summaries enable row level security;
drop policy if exists "Public can read summaries" on public.summaries;
create policy "Public can read summaries" on public.summaries
  for select to anon, authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('summaries', 'summaries', true, 52428800, array['application/pdf', 'application/zip', 'application/x-zip-compressed'])
on conflict (id) do update set public = true, file_size_limit = 52428800,
  allowed_mime_types = array['application/pdf', 'application/zip', 'application/x-zip-compressed'];

drop policy if exists "Public can read summary PDFs" on storage.objects;
create policy "Public can read summary PDFs" on storage.objects
  for select to anon, authenticated using (bucket_id = 'summaries');

-- No browser write policies: the admin API validates the password server-side and
-- uses SUPABASE_SERVICE_ROLE_KEY. Keep that key private on the server.
