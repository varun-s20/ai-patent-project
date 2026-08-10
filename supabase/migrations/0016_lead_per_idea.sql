-- Two fixes to the payment-first funnel, both about the same mistake: treating
-- an email address as if it identified one idea.

-- 1. A lead is now one *idea*, not one person.
--
-- `email unique` + upsert(onConflict: email) meant a visitor who described a
-- second invention silently overwrote the first: the console showed one row,
-- with the newest title and description, and the earlier idea was gone. Someone
-- who comes back with another invention is the warmest lead there is, so each
-- submit gets its own row from here on.
alter table leads drop constraint if exists leads_email_key;

-- Which submission this lead was captured alongside. Lets the Stripe webhook
-- convert the one lead that was actually paid for instead of every row sharing
-- that email — the reason the unique constraint could not simply be dropped.
alter table leads add column if not exists submission_id uuid references submissions(id) on delete set null;

-- The unique constraint was also the only index on email; the console still
-- groups and searches by it.
create index if not exists idx_leads_email on leads(email);
create index if not exists idx_leads_submission_id on leads(submission_id);

-- 2. An idea submitted with the email of an existing account belongs to that
-- account.
--
-- Before the payment-first funnel, /submit was auth-gated and every draft was
-- written with a user_id, so it appeared on the submitter's dashboard straight
-- away. Now the form is public: a customer who is signed out — or who never
-- signed in on this device — writes an unowned row that RLS hides from them,
-- and the only route back to it is the claim token, which is issued *after*
-- payment. Describe an idea, don't pay, and it vanished.
--
-- profiles has no email column (see 0010), so the lookup has to read
-- auth.users. Security definer + revoked from public: only the service-role
-- server action can ask.
create or replace function public.confirmed_user_id_for_email(p_email text)
returns uuid language sql security definer stable set search_path = public as $$
  select id
  from auth.users
  where lower(email) = lower(p_email)
    -- Confirmed only. An unconfirmed signup is not proof the address belongs
    -- to whoever is typing it, and that path already works: registration
    -- resends the confirmation and the claim token in user metadata attaches
    -- the submission once they confirm.
    and email_confirmed_at is not null
  limit 1;
$$;

revoke all on function public.confirmed_user_id_for_email(text) from public;
grant execute on function public.confirmed_user_id_for_email(text) to service_role;

-- Existing orphans: hand every unowned submission to the confirmed account
-- that shares its email. Nulling the token is bookkeeping — claimForUser()
-- requires `user_id is null`, so these are already unclaimable.
--
-- protect_submission_fields() (0005) rejects any change to user_id unless
-- auth.role() = 'service_role', and as that migration's own closing note
-- warns, raw SQL has no JWT — auth.role() is NULL here, so the trigger fires
-- on this backfill. Disabling it for the statement is the honest way through:
-- this IS the privileged path the trigger exists to reserve, and the disable
-- is transactional, so a failure anywhere in this migration restores it.
alter table submissions disable trigger protect_submission_fields_trigger;

update submissions s
set user_id = u.id, claim_token = null
from auth.users u
where s.user_id is null
  and lower(s.email) = lower(u.email)
  and u.email_confirmed_at is not null;

alter table submissions enable trigger protect_submission_fields_trigger;
