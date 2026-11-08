-- Solicitudes de cotización enviadas desde /cotizar
create extension if not exists pgcrypto;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'archived')),
  locale text not null default 'es',
  service text not null,
  property_type text not null,
  property_status text,
  area_m2 numeric,
  location text not null,
  zone text,
  needs text[] not null default '{}',
  description text,
  budget text not null,
  timeline text not null,
  links text[] not null default '{}',
  files text[] not null default '{}',
  name text not null,
  email text not null,
  phone text not null,
  contact_pref text not null default 'whatsapp',
  source text not null default 'web',
  notes text
);

create index if not exists quote_requests_status_idx on public.quote_requests (status, created_at desc);

-- Solo el service role (API del servidor) y, más adelante, los usuarios del admin pueden leer/escribir.
alter table public.quote_requests enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-files', 'quote-files', false, 15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do nothing;
