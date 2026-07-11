-- Tracks when an admin has actually sent the attorney referral, so the admin
-- console can separate pending requests from handled ones.
-- attorney_requested_at (0006) = customer asked; attorney_referred_at = admin
-- followed up. Null referred_at with a non-null requested_at = still pending.
alter table submissions add column attorney_referred_at timestamptz;

-- Partial index: the referrals console lists only rows that requested a
-- referral, newest first — a small slice of all submissions.
create index idx_submissions_attorney_requested
  on submissions (attorney_requested_at desc)
  where attorney_requested_at is not null;
