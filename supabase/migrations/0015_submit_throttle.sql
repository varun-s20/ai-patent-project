-- The evaluation form is now public, writes two rows, AND creates a Stripe
-- Checkout session per submit. The honeypot alone stops naive bots; this caps
-- what a determined one can cost us in Stripe API calls and junk rows — junk
-- that would also inflate the "ideas already registered" figure the landing
-- page shows.

create table submit_throttle (
  ip inet primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);

-- ponytail: fixed one-hour windows, not a sliding log. A burst straddling a
-- boundary can get 2x the limit; that is fine for a spam cap and costs one row
-- per IP instead of one per request.
create or replace function bump_submit_throttle(p_ip inet, p_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  insert into submit_throttle (ip, count, window_start)
  values (p_ip, 1, now())
  on conflict (ip) do update
    set count = case when submit_throttle.window_start < now() - interval '1 hour'
                     then 1 else submit_throttle.count + 1 end,
        window_start = case when submit_throttle.window_start < now() - interval '1 hour'
                            then now() else submit_throttle.window_start end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;

-- RLS on the table does NOT gate writes here, unlike `leads`: the only write
-- path is bump_submit_throttle(), a `security definer` function that runs
-- with its owner's rights and bypasses this table's RLS entirely. What
-- actually gates it is the function's EXECUTE privilege, which Postgres
-- grants to PUBLIC by default — so without this revoke, anyone holding the
-- anon key could call it directly with an arbitrary p_ip and p_limit: 0,
-- pushing a real customer's bucket over the limit before they ever submit.
-- These revokes do not touch the service role, which still calls it fine.
revoke execute on function bump_submit_throttle(inet, int) from public, anon, authenticated;

-- Kept on for defense in depth even though the function above is the only
-- writer and bypasses it: blocks any accidental direct PostgREST access to
-- the table itself.
alter table submit_throttle enable row level security;
