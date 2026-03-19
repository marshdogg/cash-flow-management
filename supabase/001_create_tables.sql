-- ============================================
-- Cash Flow Guide — Database Tables
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Recurring Transactions
create table if not exists recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  franchise_id text not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null,
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
  start_date text not null,
  next_occurrence text not null,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Weekly Snapshots
create table if not exists weekly_snapshots (
  id uuid primary key default gen_random_uuid(),
  franchise_id text not null,
  bank_balance numeric(12,2) not null,
  tcp numeric(12,2) not null,
  net_weekly_cash_flow numeric(12,2) not null,
  weeks_of_runway numeric(6,1),
  health_status text not null check (health_status in ('critical', 'caution', 'healthy', 'not_available')),
  completed_at timestamptz not null default now(),
  completed_by text not null
);

-- 3. Bank Balances
create table if not exists bank_balances (
  id uuid primary key default gen_random_uuid(),
  franchise_id text not null,
  amount numeric(12,2) not null,
  recorded_at timestamptz not null default now(),
  recorded_by text not null
);

-- Disable RLS (open access, no auth)
alter table recurring_transactions enable row level security;
create policy "Allow all" on recurring_transactions for all using (true) with check (true);

alter table weekly_snapshots enable row level security;
create policy "Allow all" on weekly_snapshots for all using (true) with check (true);

alter table bank_balances enable row level security;
create policy "Allow all" on bank_balances for all using (true) with check (true);
