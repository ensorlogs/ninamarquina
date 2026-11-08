create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text,
  location text,
  notes text
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid references public.clients (id) on delete set null,
  request_id uuid references public.quote_requests (id) on delete set null,
  title text not null,
  service text,
  location text,
  status text not null default 'design'
    check (status in ('design', 'permits', 'construction', 'done', 'paused', 'cancelled')),
  notes text
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number serial,
  client_id uuid references public.clients (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  request_id uuid references public.quote_requests (id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  currency text not null default 'USD',
  tax_rate numeric not null default 0,
  valid_until date,
  notes text
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets (id) on delete cascade,
  position int not null default 0,
  description text not null,
  quantity numeric not null default 1,
  unit text,
  unit_price numeric not null default 0
);

alter table public.quote_requests add column if not exists client_id uuid references public.clients (id) on delete set null;
alter table public.quote_requests add column if not exists project_id uuid references public.projects (id) on delete set null;

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;
