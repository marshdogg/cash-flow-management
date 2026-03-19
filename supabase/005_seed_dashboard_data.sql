-- ============================================
-- Seed dashboard data for fr_toronto_east
-- Run in Supabase SQL Editor after 004.
-- ============================================

-- Clear any existing test data so this is idempotent
DELETE FROM weekly_snapshots WHERE franchise_id = 'fr_toronto_east';
DELETE FROM bank_balances WHERE franchise_id = 'fr_toronto_east';

-- ============================================
-- 1. Bank balance (current)
-- ============================================

INSERT INTO bank_balances (franchise_id, amount, recorded_at, recorded_by)
VALUES ('fr_toronto_east', 93500, now(), 'usr_001');

-- ============================================
-- 2. Weekly snapshots (6 weeks of history)
--    Revenue comes from total_collections (split via cash/cc)
--    Expenses come from fixed + variable + one-time costs
--
-- ============================================

-- Week 1 (current week) - strong revenue, moderate expenses
INSERT INTO weekly_snapshots (
  franchise_id, bank_balance, tcp, net_weekly_cash_flow,
  weeks_of_runway, health_status, completed_at, completed_by,
  opening_balance, work_completed,
  cash_cheque_collections, credit_card_collections,
  total_collections, total_variable_cogs,
  total_fixed_costs, total_one_time_costs,
  ending_balance, week_start, week_end
) VALUES (
  'fr_toronto_east', 93500, 85995, 8600,
  12.5, 'healthy', now() - interval '1 day', 'usr_001',
  93500, 28000,
  8200, 16400,
  24600, 4200,
  9800, 2000,
  102100, CURRENT_DATE - interval '6 days', CURRENT_DATE
);

-- Week 2 (last week) - slightly lower
INSERT INTO weekly_snapshots (
  franchise_id, bank_balance, tcp, net_weekly_cash_flow,
  weeks_of_runway, health_status, completed_at, completed_by,
  opening_balance, work_completed,
  cash_cheque_collections, credit_card_collections,
  total_collections, total_variable_cogs,
  total_fixed_costs, total_one_time_costs,
  ending_balance, week_start, week_end
) VALUES (
  'fr_toronto_east', 88200, 81500, 5300,
  10.2, 'healthy', now() - interval '8 days', 'usr_001',
  88200, 24000,
  5500, 12800,
  18300, 3500,
  8200, 1300,
  93500, CURRENT_DATE - interval '13 days', CURRENT_DATE - interval '7 days'
);

-- Week 3 - big week, large commercial job
INSERT INTO weekly_snapshots (
  franchise_id, bank_balance, tcp, net_weekly_cash_flow,
  weeks_of_runway, health_status, completed_at, completed_by,
  opening_balance, work_completed,
  cash_cheque_collections, credit_card_collections,
  total_collections, total_variable_cogs,
  total_fixed_costs, total_one_time_costs,
  ending_balance, week_start, week_end
) VALUES (
  'fr_toronto_east', 78500, 71200, 9700,
  9.8, 'healthy', now() - interval '15 days', 'usr_001',
  78500, 32000,
  10000, 22000,
  32000, 5800,
  12500, 4000,
  88200, CURRENT_DATE - interval '20 days', CURRENT_DATE - interval '14 days'
);

-- Week 4 - slower week
INSERT INTO weekly_snapshots (
  franchise_id, bank_balance, tcp, net_weekly_cash_flow,
  weeks_of_runway, health_status, completed_at, completed_by,
  opening_balance, work_completed,
  cash_cheque_collections, credit_card_collections,
  total_collections, total_variable_cogs,
  total_fixed_costs, total_one_time_costs,
  ending_balance, week_start, week_end
) VALUES (
  'fr_toronto_east', 76800, 72100, 1700,
  8.4, 'healthy', now() - interval '22 days', 'usr_001',
  76800, 18000,
  3500, 8500,
  12000, 2800,
  6500, 1000,
  78500, CURRENT_DATE - interval '27 days', CURRENT_DATE - interval '21 days'
);

-- Week 5 - decent week with equipment purchase
INSERT INTO weekly_snapshots (
  franchise_id, bank_balance, tcp, net_weekly_cash_flow,
  weeks_of_runway, health_status, completed_at, completed_by,
  opening_balance, work_completed,
  cash_cheque_collections, credit_card_collections,
  total_collections, total_variable_cogs,
  total_fixed_costs, total_one_time_costs,
  ending_balance, week_start, week_end
) VALUES (
  'fr_toronto_east', 72400, 67800, 4400,
  7.5, 'caution', now() - interval '29 days', 'usr_001',
  72400, 25000,
  7000, 14000,
  21000, 4000,
  9500, 3100,
  76800, CURRENT_DATE - interval '34 days', CURRENT_DATE - interval '28 days'
);

-- Week 6 - first tracked week, startup expenses heavy
INSERT INTO weekly_snapshots (
  franchise_id, bank_balance, tcp, net_weekly_cash_flow,
  weeks_of_runway, health_status, completed_at, completed_by,
  opening_balance, work_completed,
  cash_cheque_collections, credit_card_collections,
  total_collections, total_variable_cogs,
  total_fixed_costs, total_one_time_costs,
  ending_balance, week_start, week_end
) VALUES (
  'fr_toronto_east', 65000, 58200, 7400,
  6.2, 'caution', now() - interval '36 days', 'usr_001',
  65000, 22000,
  6000, 11000,
  17000, 3200,
  4200, 2200,
  72400, CURRENT_DATE - interval '41 days', CURRENT_DATE - interval '35 days'
);
