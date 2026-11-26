-- Supabase RPC for FK-safe, complete user account deletion
-- Run this in your Supabase SQL Editor

create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Authentication required to delete account';
  end if;

  -- 1. Lending activity & records (actor_id has no cascade)
  delete from public.loan_activity where user_id = v_uid or actor_id = v_uid;
  delete from public.loan_payments where user_id = v_uid;
  delete from public.loan_agreements where user_id = v_uid;
  delete from public.lending_profiles where user_id = v_uid;

  -- 2. Join table & category dependents BEFORE categories (transactions/recurring have ON DELETE RESTRICT on categories)
  delete from public.transaction_tags
  where transaction_id in (select id from public.transactions where user_id = v_uid);
  delete from public.transactions where user_id = v_uid;
  delete from public.recurring_transactions where user_id = v_uid;

  -- 3. Remaining financial workspace tables
  delete from public.budgets where user_id = v_uid;
  delete from public.savings_goals where user_id = v_uid;
  delete from public.tags where user_id = v_uid;
  delete from public.payment_methods where user_id = v_uid;
  delete from public.categories where user_id = v_uid;

  -- 4. Compliance & consent tables (if present)
  if to_regclass('public.privacy_requests') is not null then
    delete from public.privacy_requests where user_id = v_uid;
  end if;
  if to_regclass('public.user_consents') is not null then
    delete from public.user_consents where user_id = v_uid;
  end if;

  -- 5. Profile row and auth user
  delete from public.users where id = v_uid;
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function delete_user() from public;
grant execute on function delete_user() to authenticated;
