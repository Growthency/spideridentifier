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
