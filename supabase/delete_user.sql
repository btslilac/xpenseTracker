-- Supabase RPC for user account deletion
-- Run this in your Supabase SQL Editor

create or replace function delete_user()
returns void
language sql
security definer
as $$
  delete from auth.users where id = auth.uid();
$$;
