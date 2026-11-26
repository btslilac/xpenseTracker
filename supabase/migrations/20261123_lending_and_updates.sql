-- =============================================================================
-- XpenseTracker — Lending & Borrowing and App Release Migration
-- =============================================================================

-- 1. Lending Profile (for branding statements and PDF reports)
create table if not exists lending_profiles (
  id                  text        primary key default gen_random_uuid()::text,
  user_id             uuid        not null references users(id) on delete cascade unique,
  profile_type        text        not null default 'individual' check (profile_type in ('individual', 'company')),
  company_name        text,
  owner_name          text,
  mobile_number       text,
  email_address       text,
  office_address      text,
  business_identifier text,
  logo_path           text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 2. Loan Agreements (Lent vs Borrowed)
create table if not exists loan_agreements (
  id                          text        primary key,
  user_id                     uuid        not null references users(id) on delete cascade,
  agreement_reference         text        not null,
  direction                   text        not null check (direction in ('lent', 'borrowed')),
  counterparty_name           text        not null,
  counterparty_phone          text,
  counterparty_email          text,
  principal_amount            numeric     not null check (principal_amount > 0),
  currency_code               text        not null default 'KES',
  agreement_date              timestamptz not null default now(),
  due_date                    timestamptz,
  repayment_frequency         text        not null default 'one_time' check (repayment_frequency in ('one_time', 'weekly', 'biweekly', 'monthly', 'custom')),
  interest_type               text        not null default 'none' check (interest_type in ('none', 'fixed', 'simple')),
  agreed_interest_amount      numeric     not null default 0 check (agreed_interest_amount >= 0),
  interest_rate               numeric,
  interest_calculation_period text,
  penalty_amount              numeric     not null default 0 check (penalty_amount >= 0),
  penalty_type                text        not null default 'none' check (penalty_type in ('none', 'fixed', 'percentage', 'daily')),
  penalty_rate                numeric     default 0,
  penalty_grace_days          integer     not null default 0,
  notes                       text,
  status                      text        not null default 'active' check (status in ('active', 'due_soon', 'partially_repaid', 'overdue', 'settled', 'cancelled', 'written_off')),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  archived_at                 timestamptz
);

create index if not exists loan_agreements_user_idx on loan_agreements (user_id, direction, status);
create index if not exists loan_agreements_due_idx on loan_agreements (user_id, due_date);

-- 3. Loan Payments (Partial & Full Repayments)
create table if not exists loan_payments (
  id                  text        primary key,
  user_id             uuid        not null references users(id) on delete cascade,
  agreement_id        text        not null references loan_agreements(id) on delete cascade,
  idempotency_key     text        not null,
  amount              numeric     not null check (amount > 0),
  principal_component numeric     not null check (principal_component >= 0),
  interest_component  numeric     not null check (interest_component >= 0),
  penalty_component   numeric     not null default 0 check (penalty_component >= 0),
  payment_date        timestamptz not null default now(),
  payment_method      text        not null default 'UPI',
  reference_number    text,
  notes               text,
  created_at          timestamptz not null default now(),
  created_by          text,
  constraint check_components_match_amount check (principal_component + interest_component + penalty_component = amount),
  constraint unique_user_payment_idempotency unique (user_id, idempotency_key)
);

create index if not exists loan_payments_agreement_idx on loan_payments (agreement_id, payment_date desc);

-- 4. Loan Activity (Audit Log)
create table if not exists loan_activity (
  id              text        primary key default gen_random_uuid()::text,
  user_id         uuid        not null references users(id) on delete cascade,
  agreement_id    text        not null references loan_agreements(id) on delete cascade,
  event_type      text        not null,
  description     text        not null,
  previous_values jsonb,
  new_values      jsonb,
  actor_id        uuid        references users(id),
  created_at      timestamptz not null default now()
);

create index if not exists loan_activity_agreement_idx on loan_activity (agreement_id, created_at desc);

-- 5. App Releases (In-App Update Center Metadata)
create table if not exists app_releases (
  id                  text        primary key default gen_random_uuid()::text,
  version             text        not null unique,
  release_title       text        not null,
  release_notes       text        not null,
  update_type         text        not null default 'ota' check (update_type in ('ota', 'native')),
  is_mandatory        boolean     not null default false,
  min_native_version  text,
  store_url           text,
  published_at        timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

-- Seed initial current version release record
insert into app_releases (version, release_title, release_notes, update_type, is_mandatory, published_at)
values (
  '1.0.1',
  'Liquid Glass & Lending Workspace',
  'Introducing Liquid Glass & Material Design 3 selectable themes, the Lending & Borrowing workspace, and in-app Update Center.',
  'ota',
  false,
  now()
) on conflict (version) do nothing;

-- 6. Row Level Security Policies
alter table lending_profiles enable row level security;
alter table loan_agreements  enable row level security;
alter table loan_payments    enable row level security;
alter table loan_activity    enable row level security;
alter table app_releases     enable row level security;

-- lending_profiles RLS
create policy "Users own their lending profile"
  on lending_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- loan_agreements RLS
create policy "Users own their loan agreements"
  on loan_agreements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- loan_payments RLS
create policy "Users own their loan payments"
  on loan_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- loan_activity RLS
create policy "Users own their loan activity"
  on loan_activity for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- app_releases RLS (Public read for authenticated users)
create policy "Authenticated users can read app releases"
  on app_releases for select
  using (true);
