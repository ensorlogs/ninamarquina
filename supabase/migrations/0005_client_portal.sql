alter table public.clients add column if not exists portal_enabled boolean not null default false;
alter table public.clients add column if not exists portal_invited_at timestamptz;
create index if not exists clients_email_lower_idx on public.clients (lower(email));

create table if not exists public.project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  position int not null default 0,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  progress int not null default 0 check (progress between 0 and 100),
  start_date date,
  end_date date,
  notes text
);
create index if not exists project_phases_project_idx on public.project_phases (project_id, position);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  phase_id uuid references public.project_phases (id) on delete set null,
  date date not null default current_date,
  title text not null,
  body text,
  photos text[] not null default '{}',
  visible boolean not null default true
);
create index if not exists project_updates_project_idx on public.project_updates (project_id, date desc);

alter table public.project_phases enable row level security;
alter table public.project_updates enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-files', 'project-files', false, 15728640, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
