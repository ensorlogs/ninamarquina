-- Leads capturados por el chat IA de la web
create table if not exists public.chat_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text,
  phone text,
  transcript jsonb not null default '[]',
  source text not null default 'chat'
);
create index if not exists chat_leads_created_idx on public.chat_leads (created_at desc);
alter table public.chat_leads enable row level security;
