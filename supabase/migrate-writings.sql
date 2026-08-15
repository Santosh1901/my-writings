-- Writings notes table for this site.
-- Safe: only creates public.writings.
-- Run once: Supabase Dashboard → SQL Editor → New query → Run

create extension if not exists "pgcrypto";

create table if not exists public.writings (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  title text not null,
  kicker text not null default 'Note',
  excerpt text not null default '',
  body text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists writings_created_at_idx
  on public.writings (created_at desc);

alter table public.writings enable row level security;

drop policy if exists "Anyone can read published writings" on public.writings;
create policy "Anyone can read published writings"
  on public.writings for select
  using (published = true);

drop policy if exists "Signed-in author can insert writings" on public.writings;
create policy "Signed-in author can insert writings"
  on public.writings for insert
  with check (auth.uid() is not null and author_id = auth.uid());

drop policy if exists "Author can update own writings" on public.writings;
create policy "Author can update own writings"
  on public.writings for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Author can delete own writings" on public.writings;
create policy "Author can delete own writings"
  on public.writings for delete
  using (auth.uid() = author_id);
