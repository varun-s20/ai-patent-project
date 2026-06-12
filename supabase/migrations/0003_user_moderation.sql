-- Day-5 admin moderation: flag/disable users.
alter table profiles add column if not exists is_disabled boolean not null default false;
alter table profiles add column if not exists is_flagged boolean not null default false;

-- Allow admins to update any profile (admin actions use the service role and bypass RLS,
-- but this keeps RLS coherent if ever exercised with an authed admin session).
drop policy if exists "admin update profiles" on profiles;
create policy "admin update profiles" on profiles
  for update using (is_admin());
