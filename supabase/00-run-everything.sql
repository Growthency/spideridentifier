-- ============================================================================
-- SPIDER IDENTIFIER — COMPLETE DATABASE SETUP (one file, run once)
-- Supabase Dashboard -> SQL Editor -> New query -> paste everything -> Run.
-- Safe to re-run any time: every statement is idempotent.
-- Generated from schema.sql + saas-schema.sql + admin-schema.sql — edit those
-- source files and regenerate rather than editing this one.
-- ============================================================================

-- ============================================================================
-- SOURCE: supabase/schema.sql
-- ============================================================================

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
  author_name text default 'Spider Identifier',
  author_role text default 'Editorial',
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

-- ============================================================================
-- SOURCE: supabase/saas-schema.sql
-- ============================================================================

-- ============================================================================
--  SPIDER IDENTIFIER — SaaS SCHEMA (auth profiles, identifications, billing)
--  Run AFTER schema.sql, in the Supabase SQL Editor.  Safe to re-run.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users) — credits, plan, referral, subscription
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  country text,
  credits int not null default 30,
  total_identifications int not null default 0,
  plan text not null default 'free',                -- free | starter | explorer | pro
  referral_code text unique,
  referred_by uuid references public.profiles (id),
  subscription_id text,
  subscription_status text,                          -- active | trialing | canceled | past_due | null
  subscription_canceled_at timestamptz,
  current_period_end timestamptz,
  paddle_customer_id text,
  created_at timestamptz not null default now()
);
create index if not exists profiles_referral_code_idx on public.profiles (referral_code);
create index if not exists profiles_subscription_id_idx on public.profiles (subscription_id);

-- Auto-create a profile whenever a new auth user signs up (email or OAuth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,'spider'), '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    upper(substr(md5(random()::text || new.id::text), 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: accounts created BEFORE the trigger existed have no profile
-- row, which breaks favorites/comments/analyses foreign keys. Heal them.
insert into public.profiles (id, email, full_name)
select u.id, u.email, u.raw_user_meta_data->>'full_name'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- ANALYSES  — each identification result (logged-in or guest)
-- ----------------------------------------------------------------------------
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,   -- null = guest
  ip_address text,
  image_hash text,
  image_url text,
  image_urls text[] default '{}',
  result jsonb not null,
  credits_used int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists analyses_user_id_idx on public.analyses (user_id, created_at desc);
create index if not exists analyses_image_hash_idx on public.analyses (image_hash);
create index if not exists analyses_ip_idx on public.analyses (ip_address, created_at);

-- ----------------------------------------------------------------------------
-- TRANSACTIONS  — billing log (Paddle)
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  paddle_transaction_id text unique,
  paddle_subscription_id text,
  credits_added int default 0,
  amount_paid numeric,
  pack_name text,
  created_at timestamptz not null default now()
);
create index if not exists transactions_user_id_idx on public.transactions (user_id);

-- ----------------------------------------------------------------------------
-- IP USAGE  — guest free-scan rate limiting
-- ----------------------------------------------------------------------------
create table if not exists public.ip_usage (
  ip_address text primary key,
  count int not null default 0,
  reset_date date not null default current_date
);

-- ----------------------------------------------------------------------------
-- FAVORITES  — saved blog guides
-- ----------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, post_slug)
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.transactions enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
-- No client-side update policy on purpose: profile writes (name, avatar)
-- go through server routes with an allow-list, so credits/plan/subscription
-- can never be edited from the browser.
drop policy if exists "own profile update" on public.profiles;

drop policy if exists "own analyses" on public.analyses;
create policy "own analyses" on public.analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own transactions" on public.transactions;
create policy "own transactions" on public.transactions for select using (auth.uid() = user_id);

drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for uploaded scan images (public read)
insert into storage.buckets (id, name, public) values ('scans', 'scans', true)
on conflict (id) do nothing;
drop policy if exists "public read scans" on storage.objects;
create policy "public read scans" on storage.objects for select using (bucket_id = 'scans');

-- ============================================================================
-- SOURCE: supabase/admin-schema.sql
-- ============================================================================

-- ============================================================================
-- ADMIN / SITE-CONFIG SCHEMA — run AFTER schema.sql + saas-schema.sql
-- Powers the admin panel: site settings, header scripts, menus,
-- external-link rules. All tables are written ONLY via server routes
-- (service role); the public site reads them anonymously.
-- ============================================================================

-- Key/value store for site configuration (footer content, theme colors,
-- custom CSS, homepage blocks, tracked keywords, …). Value is jsonb so a
-- key can hold a string, object or array.
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Third-party / tracking snippets injected into the public site.
create table if not exists public.site_scripts (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  location text not null default 'head' check (location in ('head', 'body')),
  code text not null,
  enabled boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Navigation menus (header, footer columns, bottom bar).
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu text not null check (menu in ('header', 'footer_explore', 'footer_company', 'footer_bottom')),
  label text not null,
  url text not null,
  target text not null default '_self' check (target in ('_self', '_blank')),
  sort_order int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists menu_items_menu_idx on public.menu_items (menu, sort_order);

-- Per-domain rel rules for outbound links inside article content.
create table if not exists public.external_link_rules (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  nofollow boolean not null default true,
  sponsored boolean not null default false,
  created_at timestamptz not null default now()
);

-- Author avatar on posts (photo URL — falls back to the bundled default).
alter table public.blog_posts add column if not exists author_avatar text;

-- Rich editor fields (mushroom-parity page builder).
alter table public.blog_posts add column if not exists featured_image text;
alter table public.blog_posts add column if not exists access_type text not null default 'free';
alter table public.blog_posts add column if not exists layout text not null default 'full';
alter table public.blog_posts add column if not exists custom_css text;
alter table public.blog_posts add column if not exists custom_schema text;

-- Reader comments on blog posts. Written ONLY via the server route
-- (signed-in users); public read.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  user_id uuid references public.profiles (id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_slug, created_at desc);

-- Per-post view counters (incremented by the server route).
create table if not exists public.post_views (
  slug text primary key,
  views bigint not null default 0
);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.site_content enable row level security;
alter table public.site_scripts enable row level security;
alter table public.menu_items enable row level security;
alter table public.external_link_rules enable row level security;

-- Public read (the site renders from these); writes only via service role.
drop policy if exists "public read site_content" on public.site_content;
create policy "public read site_content" on public.site_content for select using (true);

drop policy if exists "public read site_scripts" on public.site_scripts;
create policy "public read site_scripts" on public.site_scripts for select using (true);

drop policy if exists "public read menu_items" on public.menu_items;
create policy "public read menu_items" on public.menu_items for select using (true);

drop policy if exists "public read external_link_rules" on public.external_link_rules;
create policy "public read external_link_rules" on public.external_link_rules for select using (true);

alter table public.comments enable row level security;
drop policy if exists "public read comments" on public.comments;
create policy "public read comments" on public.comments for select using (true);

alter table public.post_views enable row level security;
drop policy if exists "public read post_views" on public.post_views;
create policy "public read post_views" on public.post_views for select using (true);

