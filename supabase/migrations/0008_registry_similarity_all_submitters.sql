-- Fix: registry_similarity previously excluded the submitter's own earlier
-- submissions (`s.user_id <> me.user_id`), on the assumption a duplicate
-- resubmission was an intentional re-evaluation. That feature (reevaluation_of)
-- was already dropped as dead code (0004_rls_hardening.sql) — nothing protects
-- against it, so the exclusion just hid real duplicates registered by the same
-- account. A duplicate is a duplicate regardless of who submitted it.
create or replace function registry_similarity(
  p_submission_id uuid,
  p_close real,
  p_moderate real
)
returns table (compared bigint, close_matches bigint, moderate_matches bigint)
language sql stable
set search_path = public
as $$
  with me as (
    select title, description, created_at
    from submissions where id = p_submission_id
  ),
  others as (
    select similarity(s.title || ' ' || s.description, me.title || ' ' || me.description) as sim
    from submissions s, me
    where s.id <> p_submission_id
      and s.status in ('paid', 'processing', 'complete')
      and s.created_at < me.created_at
  )
  select
    count(*) as compared,
    count(*) filter (where sim >= p_close) as close_matches,
    count(*) filter (where sim >= p_moderate and sim < p_close) as moderate_matches
  from others;
$$;
