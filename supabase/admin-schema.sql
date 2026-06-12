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
