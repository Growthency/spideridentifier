-- ============================================================================
--  SPIDER IDENTIFIER — DATABASE SCHEMA
--  Run this once in the Supabase SQL Editor (New query → paste → Run).
--  Safe to re-run: it uses IF NOT EXISTS / DROP POLICY IF EXISTS.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- BLOG POSTS
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text default '',
  content text default '',
  category text default 'Guide',
  tags text[] default '{}',
  author_name text default 'Marcus Webb',
  author_role text default 'Spider Researcher',
  read_time int default 4,
  region text default 'Worldwide',
  level text default 'Beginner',
  cover_accent text default 'gold',
  status text default 'draft',
  is_featured boolean default false,
  published_at timestamptz default now(),
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);

-- ----------------------------------------------------------------------------
-- SPECIES
-- ----------------------------------------------------------------------------
create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  common_name text not null,
  scientific_name text,
  family text,
  venom_level text default 'harmless',
  size text,
  region text,
  habitat text,
  summary text,
  identification text[] default '{}',
  fact text,
  accent text default 'gold',
  is_dangerous boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- CONTACT SUBMISSIONS
-- ----------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'new',
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS
-- ----------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- The service_role key (used by the admin dashboard & API) bypasses RLS.
-- These policies govern the public/anon key only.
-- ============================================================================
alter table public.blog_posts enable row level security;
alter table public.species enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public can read published posts
drop policy if exists "public read published posts" on public.blog_posts;
create policy "public read published posts" on public.blog_posts
  for select using (status = 'published');

-- Public can read all species
drop policy if exists "public read species" on public.species;
create policy "public read species" on public.species
  for select using (true);

-- Anyone can submit the contact form (insert only; reads are admin-only)
drop policy if exists "anyone can submit contact" on public.contact_submissions;
create policy "anyone can submit contact" on public.contact_submissions
  for insert with check (true);

-- Anyone can subscribe (insert only)
drop policy if exists "anyone can subscribe" on public.newsletter_subscribers;
create policy "anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);

-- ============================================================================
-- STORAGE — public "media" bucket for WebP uploads from the admin dashboard
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');
