-- =============================================================================
-- XpenseTracker Compliance, Consent, Age Verification & Safe Account Deletion
-- Kenya Data Protection Act, 2019 (ODPC) & Google Play Compliance
-- Safe to run idempotently in Supabase SQL Editor.
-- =============================================================================

-- 1. User Compliance & Consent Records
create table if not exists public.user_consents (
  user_id                   uuid primary key references public.users(id) on delete cascade,
  age_bracket               text not null default 'adult_18_plus' check (age_bracket in ('adult_18_plus', 'under_18')),
  is_minor                  boolean not null default false,
  guardian_consent_status   text not null default 'not_required' check (guardian_consent_status in ('not_required', 'pending', 'verified', 'revoked')),
  guardian_name             text,
  guardian_email            text,
  guardian_consent_token    text unique,
  guardian_verified_at      timestamptz,
  terms_version             text not null default '2026.11.1',
  privacy_version           text not null default '2026.11.1',
  sms_disclosure_version    text not null default '2026.11.1',
  terms_accepted_at         timestamptz,
  privacy_accepted_at       timestamptz,
  sms_consent_granted_at    timestamptz,
  sms_consent_withdrawn_at  timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.user_consents enable row level security;

drop policy if exists "user_consents_select_own" on public.user_consents;
create policy "user_consents_select_own" on public.user_consents
  for select using (auth.uid() = user_id);

drop policy if exists "user_consents_insert_own" on public.user_consents;
create policy "user_consents_insert_own" on public.user_consents
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_consents_update_own" on public.user_consents;
create policy "user_consents_update_own" on public.user_consents
  for update using (auth.uid() = user_id);

drop policy if exists "user_consents_delete_own" on public.user_consents;
create policy "user_consents_delete_own" on public.user_consents
  for delete using (auth.uid() = user_id);

-- 2. Data Subject Access / Rectification / Restriction / Deletion Requests
create table if not exists public.privacy_requests (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.users(id) on delete cascade,
  request_type      text not null check (request_type in ('access_export', 'rectification', 'restriction', 'deletion', 'guardian_verification')),
  contact_email     text,
  reference_code    text not null,
  status            text not null default 'submitted' check (status in ('submitted', 'in_review', 'completed', 'rejected')),
  details           text not null default '',
  created_at        timestamptz not null default now(),
  resolved_at       timestamptz
);

alter table public.privacy_requests enable row level security;

drop policy if exists "privacy_requests_select_own" on public.privacy_requests;
create policy "privacy_requests_select_own" on public.privacy_requests
  for select using (auth.uid() = user_id);

drop policy if exists "privacy_requests_insert_own" on public.privacy_requests;
create policy "privacy_requests_insert_own" on public.privacy_requests
  for insert with check (auth.uid() = user_id);

-- 3. Public non-enumerating privacy request RPC (supports external web deletion / DSAR form without login)
create or replace function public.submit_external_privacy_request(
  p_email text,
  p_request_type text,
  p_details text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_clean_email text := lower(trim(coalesce(p_email, '')));
  v_type text := lower(trim(coalesce(p_request_type, 'deletion')));
  v_ref text := 'DSAR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  v_matched_user uuid;
begin
  if v_clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'message', 'Please enter a valid email address.');
  end if;

  if v_type not in ('access_export', 'rectification', 'restriction', 'deletion', 'guardian_verification') then
    return jsonb_build_object('ok', false, 'message', 'Unsupported request type.');
  end if;

  -- Silently match auth user if present; response NEVER reveals whether account exists
  select id into v_matched_user
  from auth.users
  where lower(email) = v_clean_email
  limit 1;

  insert into public.privacy_requests (user_id, request_type, contact_email, reference_code, status, details)
  values (v_matched_user, v_type, v_clean_email, v_ref, 'submitted', left(coalesce(p_details, ''), 2000));

  return jsonb_build_object(
    'ok', true,
    'referenceCode', v_ref,
    'message', 'If an XpenseTracker account is associated with this email address, your request has been queued under reference ' || v_ref || '. Check your inbox for identity verification instructions.'
  );
end;
$$;

revoke all on function public.submit_external_privacy_request(text, text, text) from public;
grant execute on function public.submit_external_privacy_request(text, text, text) to anon, authenticated;

-- 4. Guardian Consent Verification / Revocation RPC (token-scoped, non-enumerating)
create or replace function public.verify_guardian_consent(
  p_token text,
  p_guardian_email text,
  p_decision text default 'verified'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean_token text := trim(coalesce(p_token, ''));
  v_clean_email text := lower(trim(coalesce(p_guardian_email, '')));
  v_decision text := case when lower(trim(coalesce(p_decision, ''))) = 'revoked' then 'revoked' else 'verified' end;
  v_row public.user_consents%rowtype;
begin
  if length(v_clean_token) < 8 or v_clean_email = '' then
    return jsonb_build_object('ok', false, 'message', 'Invalid verification token or guardian email.');
  end if;

  select * into v_row
  from public.user_consents
  where guardian_consent_token = v_clean_token
    and lower(coalesce(guardian_email, '')) = v_clean_email
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'No matching pending guardian consent record was found for that token and email.');
  end if;

  update public.user_consents
  set
    guardian_consent_status = v_decision,
    guardian_verified_at = case when v_decision = 'verified' then now() else guardian_verified_at end,
    sms_consent_withdrawn_at = case when v_decision = 'revoked' then now() else sms_consent_withdrawn_at end,
    updated_at = now()
  where user_id = v_row.user_id;

  -- Sync status inside users.settings JSONB
  update public.users
  set
    settings = jsonb_set(
      jsonb_set(
        coalesce(settings, '{}'::jsonb),
        '{compliance,guardianConsentStatus}',
        to_jsonb(v_decision::text),
        true
      ),
      '{smsTransactionDetection}',
      case when v_decision = 'revoked' then 'false'::jsonb else coalesce(settings->'smsTransactionDetection', 'false'::jsonb) end,
      true
    ),
    updated_at = now()
  where id = v_row.user_id;

  return jsonb_build_object(
    'ok', true,
    'status', v_decision,
    'message', case when v_decision = 'verified'
      then 'Guardian consent verified. The minor account can now access permitted tracking features.'
      else 'Guardian consent revoked. Automated tracking is disabled.'
    end
  );
end;
$$;

revoke all on function public.verify_guardian_consent(text, text, text) from public;
grant execute on function public.verify_guardian_consent(text, text, text) to anon, authenticated;

-- 5. FK-safe delete_user() RPC (handles ON DELETE RESTRICT between transactions & categories)
create or replace function public.delete_user()
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

  delete from public.loan_activity where user_id = v_uid or actor_id = v_uid;
  delete from public.loan_payments where user_id = v_uid;
  delete from public.loan_agreements where user_id = v_uid;
  delete from public.lending_profiles where user_id = v_uid;
  delete from public.transaction_tags
  where transaction_id in (select id from public.transactions where user_id = v_uid);
  delete from public.transactions where user_id = v_uid;
  delete from public.recurring_transactions where user_id = v_uid;
  delete from public.budgets where user_id = v_uid;
  delete from public.savings_goals where user_id = v_uid;
  delete from public.tags where user_id = v_uid;
  delete from public.payment_methods where user_id = v_uid;
  delete from public.categories where user_id = v_uid;
  delete from public.privacy_requests where user_id = v_uid;
  delete from public.user_consents where user_id = v_uid;
  delete from public.users where id = v_uid;
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;
