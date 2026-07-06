-- Fixes two problems found in a re-audit of 0004_rls_hardening.sql:
--
-- 1. `protect_submission_fields()` blocked `stripe_session_id` from any
--    non-service-role session — but `app/(app)/pay/actions.ts` writes that
--    column directly from the paying user's own session right after
--    creating the Stripe Checkout session. The trigger silently rejected
--    every one of those writes, so the column has been going unpopulated
--    since 0004 was applied. Knowing your own checkout session id grants no
--    privilege, so it's dropped from the protected list.
--
-- 2. The trigger never protected the submission's CONTENT columns
--    (title/description/problem/industry/inventor_name/email) — only the
--    payment-lifecycle ones. The app enforces "only a draft is editable" at
--    the application layer (`.eq("status", "draft")` in submit/actions.ts),
--    but that's not a database guarantee: a user's own valid session can
--    call the Supabase client directly and edit those fields on an already
--    paid/complete submission. Because app/verify/[certId]/page.tsx reads
--    title/inventor_name/industry LIVE from `submissions` (not from the
--    already-rendered, immutable PDF), this let a user re-describe a
--    different invention under an already-issued certificate's public
--    verify page after the fact — a real certificate-integrity hole, not
--    just a data-hygiene one. Now enforced at the database layer.
--
-- Note for anyone debugging this by hand later: `auth.role()` (used below
-- and in 0004) is only set inside a PostgREST request — a direct psql/SQL
-- Studio session running as the service-role Postgres user has no JWT, so
-- `auth.role()` is NULL there and this trigger will (correctly, safely)
-- still block edits to these columns. Use the app's own service-role code
-- paths (webhook, Inngest, admin actions) to change them, not manual SQL.

create or replace function protect_submission_fields()
returns trigger language plpgsql as $$
begin
  if auth.role() = 'service_role' or is_admin() then
    return new;
  end if;

  if new.user_id is distinct from old.user_id
     or new.status is distinct from old.status
     or new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id
     or new.paid_at is distinct from old.paid_at
     or new.completed_at is distinct from old.completed_at
  then
    raise exception 'not allowed to modify protected submission fields';
  end if;

  if old.status <> 'draft' and (
       new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.problem is distinct from old.problem
    or new.industry is distinct from old.industry
    or new.inventor_name is distinct from old.inventor_name
    or new.email is distinct from old.email
  ) then
    raise exception 'cannot edit submission content once it is no longer a draft';
  end if;

  return new;
end;
$$;
