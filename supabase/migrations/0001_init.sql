-- Enums
create type submission_status as enum
  ('draft', 'paid', 'processing', 'complete', 'failed', 'refunded');
create type verdict as enum ('PROCEED_NOW', 'REFINE_FIRST', 'DO_NOT_PATENT');
create type industry as enum
  ('Technology', 'Medical', 'Consumer Goods', 'Sports & Recreation', 'Agriculture', 'Other');

-- profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- submissions
create table submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  problem text,
  industry industry not null,
  inventor_name text not null,
  email text not null,
  status submission_status not null default 'draft',
  stripe_session_id text,
  stripe_payment_intent_id text,
  reevaluation_of uuid references submissions(id),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  completed_at timestamptz
);

-- evaluations (1:1 with submission)
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references submissions(id) on delete cascade,
  novelty int not null check (novelty between 0 and 100),
  commercial int not null check (commercial between 0 and 100),
  defensibility int not null check (defensibility between 0 and 100),
  licensing int not null check (licensing between 0 and 100),
  timing int not null check (timing between 0 and 100),
  novelty_rationale text not null,
  commercial_rationale text not null,
  defensibility_rationale text not null,
  licensing_rationale text not null,
  timing_rationale text not null,
  avg_score int not null,
  verdict verdict not null,
  report_json jsonb not null,
  model_used text not null,
  created_at timestamptz not null default now()
);

-- certificates (1:1 with submission)
create table certificates (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references submissions(id) on delete cascade,
  cert_id text not null unique,
  report_pdf_path text,
  certificate_pdf_path text,
  issued_at timestamptz not null default now()
);

-- Indexes (PRD 12.4)
create index idx_submissions_user_id on submissions(user_id);
create index idx_submissions_created_at on submissions(created_at);
create index idx_evaluations_submission_id on evaluations(submission_id);
create index idx_certificates_cert_id on certificates(cert_id);

-- Auto-create a profile row when a new auth user signs up
create function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row-Level Security
alter table profiles enable row level security;
alter table submissions enable row level security;
alter table evaluations enable row level security;
alter table certificates enable row level security;

-- Helper: is the current user an admin?
create function is_admin()
returns boolean language sql security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "own profile" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "update own profile" on profiles
  for update using (id = auth.uid());

create policy "own submissions" on submissions
  for all using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid());

create policy "own evaluations" on evaluations
  for select using (
    exists (select 1 from submissions s
            where s.id = evaluations.submission_id
              and (s.user_id = auth.uid() or is_admin()))
  );

create policy "own certificates" on certificates
  for select using (
    exists (select 1 from submissions s
            where s.id = certificates.submission_id
              and (s.user_id = auth.uid() or is_admin()))
  );
