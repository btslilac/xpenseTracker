-- Add relationship column to loan_agreements for Casual records
alter table if exists public.loan_agreements
  add column if not exists relationship text default 'Friend';

-- Update comment
comment on column public.loan_agreements.relationship is 'Relationship classification for casual records: Family, Friend, Co-worker';
