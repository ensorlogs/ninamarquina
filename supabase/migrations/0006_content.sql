create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  cover text,
  html text not null default '',
  minutes int not null default 1,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at date not null default current_date,
  seo_title text,
  seo_description text,
  newsletter_sent_at timestamptz
);
create index if not exists posts_status_date_idx on public.posts (status, published_at desc);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  year int not null default extract(year from now())::int,
  location text,
  category jsonb not null default '{"es":"","en":""}',
  summary jsonb not null default '{"es":"","en":""}',
  images text[] not null default '{}',
  details jsonb,
  featured boolean not null default false,
  published boolean not null default false,
  position int not null default 0
);
create index if not exists portfolio_projects_position_idx on public.portfolio_projects (position);

alter table public.posts enable row level security;
alter table public.portfolio_projects enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 15728640, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
