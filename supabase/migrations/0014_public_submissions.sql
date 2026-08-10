-- Payment-first funnel: an idea is described and paid for BEFORE an account
-- exists, so a submission has to survive without an owner until it is claimed.

-- An anonymous submission has no profile to reference yet. RLS is deliberately
-- left alone: the "own submissions" policy tests `user_id = auth.uid()`, which
-- evaluates to NULL (not true) for an unowned row, so no authenticated user can
-- read one. Only the service role writes and claims them.
alter table submissions alter column user_id drop not null;

-- The unguessable handle that turns an anonymous paid submission into an owned
-- one. Nulled the moment it is spent, so it can never be redeemed twice, and
-- unique so two rows can never collide on it.
alter table submissions add column claim_token text unique;

-- The landing form now carries the idea itself, so a follow-up to someone who
-- never paid can talk about their actual invention instead of "your enquiry".
alter table leads add column title text;
alter table leads add column description text;

-- The two qualifier questions leave the form ("What do you need?" / "Where are
-- you at?"). Existing rows keep their values; new rows won't have them.
alter table leads alter column stage drop not null;
alter table leads alter column patent_type drop not null;

-- registry_similarity (0008) already filters to status in
-- ('paid','processing','complete'), so unpaid anonymous drafts are excluded
-- from the uniqueness check automatically. No change needed there.

-- Document paths used to be {user_id}/{submission_id}/{file}, which an
-- anonymous submission cannot produce — its PDFs are generated before anyone
-- owns it. New objects are keyed on the submission alone and authorised by
-- looking the owner up live, so a submission that changes hands at claim time
-- becomes readable by its new owner immediately.
drop policy "read own documents" on storage.objects;

create policy "read own documents" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (
      public.is_admin()
      -- New layout: {submission_id}/{file}.
      or exists (
        select 1 from public.submissions s
        where s.id::text = (storage.foldername(name))[1]
          and s.user_id = auth.uid()
      )
      -- Legacy layout: {user_id}/{submission_id}/{file}. Objects written before
      -- this migration keep their stored paths, so both forms must pass and no
      -- file has to be moved.
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
