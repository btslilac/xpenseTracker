-- =============================================================================
-- XPENSIFY AI — Supabase Schema
-- DESTRUCTIVE: drops and recreates all app tables.
-- Run this in the Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Tear down existing objects (order matters for FK constraints)
-- ---------------------------------------------------------------------------

drop table if exists transaction_tags   cascade;
drop table if exists tags               cascade;
drop table if exists savings_goals      cascade;
drop table if exists recurring_transactions cascade;
drop table if exists budgets            cascade;
drop table if exists transactions       cascade;
drop table if exists categories         cascade;
drop table if exists payment_methods    cascade;
drop table if exists users              cascade;

-- ---------------------------------------------------------------------------
-- 1. Users (settings stored as JSONB for flexibility)
-- ---------------------------------------------------------------------------

create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  settings   jsonb        not null default '{}'
);

-- ---------------------------------------------------------------------------
-- 2. Payment methods (lookup table; user can add custom ones)
-- ---------------------------------------------------------------------------

create table payment_methods (
  id         text        primary key,          -- e.g. 'upi', 'cash', 'card'
  user_id    uuid        not null references users(id) on delete cascade,
  name       text        not null,
  icon       text        not null default 'payment',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Categories
-- ---------------------------------------------------------------------------

create table categories (
  id         text        primary key,
  user_id    uuid        not null references users(id) on delete cascade,
  name       text        not null,
  icon       text        not null default 'category',
  color      text        not null default '#1A237E',
  type       text        not null check (type in ('expense', 'income')),
  "order"    int         not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Transactions
-- ---------------------------------------------------------------------------

create table transactions (
  id             text        primary key,
  user_id        uuid        not null references users(id)       on delete cascade,
  amount         numeric     not null check (amount >= 0),
  category_id    text        not null references categories(id)  on delete restrict,
  note           text        not null default '',
  date           timestamptz not null,
  type           text        not null check (type in ('expense', 'income')),
  payment_method text        not null default 'UPI',
  recurring      boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index transactions_user_date_idx on transactions (user_id, date desc);

-- ---------------------------------------------------------------------------
-- 5. Budgets (monthly budget per category or overall)
-- ---------------------------------------------------------------------------

create table budgets (
  id          text        primary key default gen_random_uuid()::text,
  user_id     uuid        not null references users(id) on delete cascade,
  category_id text        references categories(id) on delete cascade,  -- null = overall budget
  amount      numeric     not null check (amount >= 0),
  period      text        not null default 'monthly' check (period in ('weekly', 'monthly', 'yearly')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, category_id, period)   -- one budget per user/category/period
);

-- ---------------------------------------------------------------------------
-- 6. Recurring transactions (subscriptions / standing orders)
-- ---------------------------------------------------------------------------

create table recurring_transactions (
  id             text        primary key,
  user_id        uuid        not null references users(id)      on delete cascade,
  amount         numeric     not null check (amount >= 0),
  category_id    text        not null references categories(id) on delete restrict,
  note           text        not null default '',
  type           text        not null check (type in ('expense', 'income')),
  payment_method text        not null default 'UPI',
  frequency      text        not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date  timestamptz not null,
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. Tags
-- ---------------------------------------------------------------------------

create table tags (
  id         text        primary key,
  user_id    uuid        not null references users(id) on delete cascade,
  name       text        not null,
  color      text        not null default '#607D8B',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------------------------------------------------------------------------
-- 8. Transaction ↔ Tag join table
-- ---------------------------------------------------------------------------

create table transaction_tags (
  transaction_id text not null references transactions(id) on delete cascade,
  tag_id         text not null references tags(id)         on delete cascade,
  primary key (transaction_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- 9. Savings goals
-- ---------------------------------------------------------------------------

create table savings_goals (
  id            text        primary key,
  user_id       uuid        not null references users(id) on delete cascade,
  name          text        not null,
  icon          text        not null default 'savings',
  color         text        not null default '#2E7D32',
  target_amount numeric     not null check (target_amount > 0),
  saved_amount  numeric     not null default 0 check (saved_amount >= 0),
  deadline      date,
  is_completed  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 10. Row Level Security
-- ---------------------------------------------------------------------------

alter table users                 enable row level security;
alter table payment_methods       enable row level security;
alter table categories            enable row level security;
alter table transactions          enable row level security;
alter table budgets               enable row level security;
alter table recurring_transactions enable row level security;
alter table tags                  enable row level security;
alter table transaction_tags      enable row level security;
alter table savings_goals         enable row level security;

-- users
create policy "users: own row"
  on users for all using (auth.uid() = id);

-- payment_methods
create policy "payment_methods: own rows"
  on payment_methods for all using (auth.uid() = user_id);

-- categories
create policy "categories: own rows"
  on categories for all using (auth.uid() = user_id);

-- transactions
create policy "transactions: own rows"
  on transactions for all using (auth.uid() = user_id);

-- budgets
create policy "budgets: own rows"
  on budgets for all using (auth.uid() = user_id);

-- recurring_transactions
create policy "recurring_transactions: own rows"
  on recurring_transactions for all using (auth.uid() = user_id);

-- tags
create policy "tags: own rows"
  on tags for all using (auth.uid() = user_id);

-- transaction_tags (join via transactions)
create policy "transaction_tags: own rows"
  on transaction_tags for all
  using (
    exists (
      select 1 from transactions t
      where t.id = transaction_tags.transaction_id
        and t.user_id = auth.uid()
    )
  );

-- savings_goals
create policy "savings_goals: own rows"
  on savings_goals for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 11. Realtime (enable CDC for tables the app subscribes to)
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table users;
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table budgets;
alter publication supabase_realtime add table savings_goals;
alter publication supabase_realtime add table recurring_transactions;
