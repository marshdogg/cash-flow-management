-- ============================================
-- Cash Flow Guide — Seed Data
-- Matches src/mocks/cash-flow-fixtures.ts
-- ============================================

-- 8 Recurring Transactions
insert into recurring_transactions (id, franchise_id, name, type, amount, frequency, start_date, next_occurrence, status, created_at, updated_at) values
  ('00000000-0000-0000-0000-000000000001', 'fr_toronto_east', 'Residential Painting Revenue', 'income', 12000, 'weekly', '2025-01-06', (now() + interval '2 days')::text, 'active', '2025-01-06T10:00:00Z', '2025-01-06T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', 'fr_toronto_east', 'Commercial Contracts', 'income', 8000, 'monthly', '2025-01-01', (now() + interval '10 days')::text, 'active', '2025-01-01T10:00:00Z', '2025-01-01T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000003', 'fr_toronto_east', 'Crew Payroll', 'expense', 6500, 'biweekly', '2025-01-10', (now() + interval '4 days')::text, 'active', '2025-01-10T10:00:00Z', '2025-01-10T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000004', 'fr_toronto_east', 'Vehicle Leases', 'expense', 2400, 'monthly', '2025-01-15', (now() + interval '12 days')::text, 'active', '2025-01-15T10:00:00Z', '2025-01-15T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000005', 'fr_toronto_east', 'Office Rent', 'expense', 3200, 'monthly', '2025-01-01', (now() + interval '15 days')::text, 'active', '2025-01-01T10:00:00Z', '2025-01-01T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000006', 'fr_toronto_east', 'Insurance Premium', 'expense', 4800, 'quarterly', '2025-01-01', (now() + interval '45 days')::text, 'active', '2025-01-01T10:00:00Z', '2025-01-01T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000007', 'fr_toronto_east', 'Marketing Budget', 'expense', 1500, 'monthly', '2025-02-01', (now() + interval '8 days')::text, 'active', '2025-02-01T10:00:00Z', '2025-02-01T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000008', 'fr_toronto_east', 'Holiday Bonus Fund', 'expense', 6000, 'annually', '2025-12-01', '2025-12-01T00:00:00Z', 'paused', '2025-01-01T10:00:00Z', '2025-03-01T10:00:00Z');

-- 1 Bank Balance
insert into bank_balances (id, franchise_id, amount, recorded_at, recorded_by) values
  ('00000000-0000-0000-0000-100000000001', 'fr_toronto_east', 45000, now() - interval '3 days', 'usr_001');

-- Balance history entries
insert into bank_balances (franchise_id, amount, recorded_at, recorded_by) values
  ('fr_toronto_east', 42000, now() - interval '10 days', 'usr_001'),
  ('fr_toronto_east', 38500, now() - interval '17 days', 'usr_001'),
  ('fr_toronto_east', 41200, now() - interval '24 days', 'usr_001');

-- 1 Weekly Snapshot
insert into weekly_snapshots (id, franchise_id, bank_balance, tcp, net_weekly_cash_flow, weeks_of_runway, health_status, completed_at, completed_by) values
  ('00000000-0000-0000-0000-200000000001', 'fr_toronto_east', 45000, 48500, 1500, 7.5, 'caution', now() - interval '3 days', 'usr_001');
