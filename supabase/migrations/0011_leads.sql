-- Marketing leads captured by the ad landing page (/patent-idea-check).
--
-- A lead is neither an account nor a submission: it's an anonymous visitor who
-- gave us contact details before paying, so there is no user_id to scope the
-- row by and no submission to hang it off. Kept in its own table so the paid
-- funnel's tables stay about paid work.

create type lead_stage as enum
  ('Just an idea', 'Prototype built', 'Already selling', 'Talked to an attorney');

create type lead_status as enum ('new', 'contacted', 'converted', 'junk');

create table leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  -- Lowercased by the server action before it gets here, so this unique
  -- constraint is a real dedupe key: a repeat submit updates the same lead
  -- instead of stacking near-identical rows in the console.
  email text not null unique,
  phone text,
  stage lead_stage not null,
  industry industry not null,
  -- Ad attribution, straight off the landing URL. All nullable — a direct
  -- visit or an organic click carries no UTM parameters at all.
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_path text,
  status lead_status not null default 'new',
  contacted_at timestamptz,
  created_at timestamptz not null default now(),
  -- Bumped on a repeat submit; created_at stays the first touch, which is the
  -- one that the ad spend actually paid for.
  updated_at timestamptz not null default now()
);

create index idx_leads_created_at on leads(created_at desc);
create index idx_leads_status on leads(status);

-- RLS on with zero policies, deliberately. The landing form writes with the
-- service role (an ad landing page has no session to authenticate) and only
-- the admin console reads, also via the service role. Zero policies therefore
-- means the anon and authenticated keys can neither read nor write a table
-- full of contact details — which is exactly the intent.
alter table leads enable row level security;
