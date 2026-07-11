-- Registry-uniqueness check: reports state how an idea's wording compares
-- against everything registered before it (counts + bands only — other
-- users' content is never exposed). Uses trigram text similarity (pg_trgm):
-- catches near-duplicate and reworded submissions, not same-concept-in-
-- different-words. No external services involved.

create extension if not exists pg_trgm;

-- Counts of earlier registered ideas by trigram-similarity band. Runs
-- entirely in Postgres so submission text never leaves the database.
-- Excludes the caller's own submissions — a re-submission of your own idea
-- must not scare you with a "close match" against yourself. Only called with
-- the service-role key from the evaluation pipeline (RLS doesn't apply there).
-- ponytail: full scan per call — fine at current volume; add a gin trgm index
-- and a prefilter if the registry grows past tens of thousands.
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
    select title, description, created_at, user_id
    from submissions where id = p_submission_id
  ),
  others as (
    select similarity(s.title || ' ' || s.description, me.title || ' ' || me.description) as sim
    from submissions s, me
    where s.id <> p_submission_id
      and s.user_id <> me.user_id
      and s.status in ('paid', 'processing', 'complete')
      and s.created_at < me.created_at
  )
  select
    count(*) as compared,
    count(*) filter (where sim >= p_close) as close_matches,
    count(*) filter (where sim >= p_moderate and sim < p_close) as moderate_matches
  from others;
$$;
