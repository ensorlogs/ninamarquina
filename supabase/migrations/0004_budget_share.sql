alter table public.budgets add column if not exists share_token uuid not null default gen_random_uuid();
alter table public.budgets add column if not exists sent_at timestamptz;
create unique index if not exists budgets_share_token_idx on public.budgets (share_token);
