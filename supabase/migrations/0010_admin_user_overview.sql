-- The admin Users console needs, per user: how to contact them, how many ideas
-- they submitted, how those ideas scored, and whether they asked to be referred
-- to a patent attorney. None of that is reachable in one PostgREST query:
-- the login email lives in auth.users (profiles has no email column) and the
-- rest are aggregates. One read-only view keeps the page at a single select.
--
-- Left join on submissions so a user who signed up but never submitted still
-- appears (submission_count 0, avg_score null).
create view admin_user_overview as
select
  p.id,
  p.full_name,
  p.is_admin,
  p.is_disabled,
  p.is_flagged,
  p.created_at,
  u.email,
  count(s.id)::int as submission_count,
  round(avg(e.avg_score))::int as avg_score,
  count(s.attorney_requested_at)::int as referral_requests,
  count(*) filter (
    where s.attorney_requested_at is not null and s.attorney_referred_at is null
  )::int as referrals_pending
from profiles p
join auth.users u on u.id = p.id
left join submissions s on s.user_id = p.id
left join evaluations e on e.submission_id = s.id
group by p.id, u.email;

-- The view runs with its owner's rights (it has to, to read auth.users), so it
-- must never be reachable by a logged-in or anonymous client. Admin pages read
-- it with the service-role key, which these revokes do not touch.
revoke all on admin_user_overview from anon, authenticated;
