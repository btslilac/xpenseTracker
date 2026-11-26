-- =============================================================================
-- XpenseTracker — Add agreement_category & ensure relationship on loan_agreements
-- Run in Supabase SQL Editor (idempotent)
-- =============================================================================

alter table if exists public.loan_agreements
  add column if not exists agreement_category text not null default 'casual'
    check (agreement_category in ('casual', 'formal'));

alter table if exists public.loan_agreements
  add column if not exists relationship text default 'Friend';

-- Backfill existing institutional/interest-bearing agreements as formal
update public.loan_agreements
set agreement_category = 'formal'
where (interest_type is not null and interest_type <> 'none')
   or coalesce(interest_rate, 0) > 0
   or coalesce(agreed_interest_amount, 0) > 0;

comment on column public.loan_agreements.agreement_category is
  'Operational lending category: casual (0% personal tracking) or formal (institutional loan agreement)';

comment on column public.loan_agreements.relationship is
  'Relationship classification for casual records: Family, Friend, Co-worker, Business Partner, Other';
