-- Public bucket with images used in transactional email templates (services/<service>.jpg)
insert into storage.buckets (id, name, public)
values ('email-assets', 'email-assets', true)
on conflict (id) do nothing;
