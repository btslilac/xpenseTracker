-- =============================================================================
-- XpenseTracker — Loan Penalties & Waterfall Repayment Allocation
-- =============================================================================

-- 1. Add penalty configuration columns to loan_agreements
alter table if exists public.loan_agreements
  add column if not exists penalty_amount numeric not null default 0 check (penalty_amount >= 0),
  add column if not exists penalty_type text not null default 'none' check (penalty_type in ('none', 'fixed', 'percentage', 'daily')),
  add column if not exists penalty_rate numeric default 0 check (penalty_rate >= 0),
  add column if not exists penalty_grace_days integer not null default 0 check (penalty_grace_days >= 0);

-- 2. Add penalty_component to loan_payments
alter table if exists public.loan_payments
  add column if not exists penalty_component numeric not null default 0 check (penalty_component >= 0);

-- 3. Update the component sum constraint to include penalties
alter table if exists public.loan_payments
  drop constraint if exists check_components_match_amount;

alter table if exists public.loan_payments
  add constraint check_components_match_amount
  check (principal_component + interest_component + penalty_component = amount);

-- =============================================================================
-- ROLLBACK SCRIPT (if needed):
-- alter table if exists public.loan_payments drop constraint if exists check_components_match_amount;
-- alter table if exists public.loan_payments add constraint check_components_match_amount check (principal_component + interest_component = amount);
-- alter table if exists public.loan_payments drop column if exists penalty_component;
-- alter table if exists public.loan_agreements drop column if exists penalty_grace_days;
-- alter table if exists public.loan_agreements drop column if exists penalty_rate;
-- alter table if exists public.loan_agreements drop column if exists penalty_type;
-- alter table if exists public.loan_agreements drop column if exists penalty_amount;
-- =============================================================================
