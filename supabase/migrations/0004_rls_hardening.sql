-- Audit fix: two RLS policies were missing `with check`, which in Postgres
-- means the USING clause doubles as the check — i.e. no column restriction at
-- all. Any authenticated user could self-promote to admin, self-clear their
-- own moderation flags, or forge their own submission's paid/complete status
-- and Stripe fields directly via the anon-key client, bypassing every server
-- action and the webhook/Inngest state machine entirely.
--
-- Plain `with check` can't compare NEW against OLD, so protecting individual
-- columns (rather than the whole row) needs a trigger. Both triggers let the
-- service role (used by every legitimate write path: webhook, Inngest, admin
-- actions) and real admins through untouched.

-- profiles: only full_name may move via a user's own session.
create or replace function protect_profile_fields()
returns trigger language plpgsql as $$
begin
  if auth.role() = 'service_role' or is_admin() then
    return new;
  end if;
  if new.id is distinct from old.id
     or new.is_admin is distinct from old.is_admin
     or new.is_disabled is distinct from old.is_disabled
     or new.is_flagged is distinct from old.is_flagged
  then
    raise exception 'not allowed to modify protected profile fields';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields_trigger on profiles;
create trigger protect_profile_fields_trigger
  before update on profiles
  for each row execute function protect_profile_fields();

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- submissions: status/stripe/timestamp/reevaluation fields are only ever
-- written by the webhook or Inngest via the service role — a plain user
-- session must never be able to touch them, and may only delete a draft.
create or replace function protect_submission_fields()
returns trigger language plpgsql as $$
begin
  if auth.role() = 'service_role' or is_admin() then
    return new;
  end if;
  if new.user_id is distinct from old.user_id
     or new.status is distinct from old.status
     or new.stripe_session_id is distinct from old.stripe_session_id
     or new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id
     or new.paid_at is distinct from old.paid_at
     or new.completed_at is distinct from old.completed_at
  then
    raise exception 'not allowed to modify protected submission fields';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_submission_fields_trigger on submissions;
create trigger protect_submission_fields_trigger
  before update on submissions
  for each row execute function protect_submission_fields();

drop policy if exists "own submissions" on submissions;

create policy "select own submissions" on submissions
  for select using (user_id = auth.uid() or is_admin());

create policy "insert own submissions" on submissions
  for insert with check (user_id = auth.uid() and status = 'draft');

create policy "update own submissions" on submissions
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- Only a draft (never paid) may be deleted by its owner; admins can delete
-- any row. A completed/certified record can no longer be erased by the user.
create policy "delete own draft submissions" on submissions
  for delete using ((user_id = auth.uid() and status = 'draft') or is_admin());

-- `reevaluation_of` was schema for a re-evaluation feature that was never
-- built (grep confirms zero reads/writes anywhere in the app) and, combined
-- with the bug above, was an unconstrained FK a user could point at an
-- arbitrary submission. Drop it; re-add with an ownership check if the
-- feature is ever built.
alter table submissions drop column if exists reevaluation_of;

-- evaluations.avg_score was missing the same range check every dimension
-- column already has.
alter table evaluations
  add constraint evaluations_avg_score_check check (avg_score between 0 and 100);
