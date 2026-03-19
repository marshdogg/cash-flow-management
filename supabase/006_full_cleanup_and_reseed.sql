-- ============================================
-- Full cleanup + reseed for fr_toronto_east
-- Combines 004 + 005 + removes all test data
-- Paste this ONCE in the Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CLEANUP - Remove all test data
-- ============================================

-- Remove revenue items if table exists
DO $$ BEGIN
  EXECUTE 'DELETE FROM revenue_items WHERE franchise_id = ''fr_toronto_east''';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Remove ritual cost entries (linked to snapshots)
DELETE FROM ritual_fixed_cost_entries
  WHERE snapshot_id IN (SELECT id FROM weekly_snapshots WHERE franchise_id = 'fr_toronto_east');

DELETE FROM ritual_one_time_costs
  WHERE snapshot_id IN (SELECT id FROM weekly_snapshots WHERE franchise_id = 'fr_toronto_east');

-- Remove all snapshots and balances
DELETE FROM weekly_snapshots WHERE franchise_id = 'fr_toronto_east';
DELETE FROM bank_balances WHERE franchise_id = 'fr_toronto_east';

-- ============================================
-- 2. CREATE revenue_items table (from 004)
-- ============================================

CREATE TABLE IF NOT EXISTS revenue_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id     text NOT NULL,
  note             text NOT NULL,
  category         text NOT NULL DEFAULT 'ar'
    CHECK (category IN ('ar','sales','proposal')),
  gross_amount     numeric(12,2) NOT NULL,
  adjusted_amount  numeric(12,2) NOT NULL DEFAULT 0,
  adjustment_rate  numeric(5,2) NOT NULL DEFAULT 0,
  week             text NOT NULL DEFAULT 'w0'
    CHECK (week IN ('w0','w1','w2','w3','w4','w5','w6')),
  expected_date    date NOT NULL,
  status           text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','collected','cancelled','lost')),
  ritual_date      date NOT NULL,
  snapshot_id      uuid REFERENCES weekly_snapshots(id) ON DELETE SET NULL,
  collected_date   date,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE revenue_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all" ON revenue_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_revenue_items_franchise
  ON revenue_items (franchise_id, expected_date);

-- ============================================
-- 3. Seed revenue items (from 004)
-- ============================================

INSERT INTO revenue_items (franchise_id, note, category, gross_amount, adjusted_amount, adjustment_rate, week, expected_date, status, ritual_date)
VALUES
  ('fr_toronto_east', 'Henderson project',      'ar',       8400, 7140, 85, 'w0', CURRENT_DATE,                 'open',      CURRENT_DATE),
  ('fr_toronto_east', 'Martinez invoice',        'ar',       6200, 5270, 85, 'w0', CURRENT_DATE - INTERVAL '7 days',  'open',      CURRENT_DATE - INTERVAL '7 days'),
  ('fr_toronto_east', 'Oakwood Condo deposit',   'ar',       3800, 3230, 85, 'w2', CURRENT_DATE + INTERVAL '14 days', 'open',      CURRENT_DATE),
  ('fr_toronto_east', 'Chen exterior job',       'ar',       7200, 7200, 100,'w0', CURRENT_DATE - INTERVAL '7 days',  'collected', CURRENT_DATE - INTERVAL '14 days'),
  ('fr_toronto_east', 'Joe''s estimate - Riverdale',  'sales', 12000, 10200, 85, 'w0', CURRENT_DATE,                 'open',      CURRENT_DATE),
  ('fr_toronto_east', 'Sarah K. - exterior repaint',  'sales',  9500,  8075, 85, 'w1', CURRENT_DATE + INTERVAL '7 days',  'open',      CURRENT_DATE),
  ('fr_toronto_east', 'Liu - interior full repaint',  'sales',  8400,  7140, 85, 'w0', CURRENT_DATE - INTERVAL '7 days',  'open',      CURRENT_DATE - INTERVAL '7 days'),
  ('fr_toronto_east', 'Nguyen - kitchen cabinets',    'sales',  4200,     0,  0, 'w0', CURRENT_DATE - INTERVAL '7 days',  'cancelled', CURRENT_DATE - INTERVAL '14 days'),
  ('fr_toronto_east', 'Thompson - full interior',       'proposal', 22000,  8800, 40, 'w1', CURRENT_DATE + INTERVAL '7 days',  'open', CURRENT_DATE),
  ('fr_toronto_east', 'Patel - condo complex',          'proposal', 45000, 18000, 40, 'w3', CURRENT_DATE + INTERVAL '21 days', 'open', CURRENT_DATE),
  ('fr_toronto_east', 'Morrison - heritage restoration', 'proposal', 31000, 12400, 40, 'w5', CURRENT_DATE + INTERVAL '35 days', 'open', CURRENT_DATE),
  ('fr_toronto_east', 'Villa - stucco exterior',         'proposal',  9100,     0,  0, 'w0', CURRENT_DATE - INTERVAL '7 days',  'lost', CURRENT_DATE - INTERVAL '14 days');

UPDATE revenue_items SET collected_date = CURRENT_DATE - INTERVAL '4 days'
  WHERE note = 'Chen exterior job' AND franchise_id = 'fr_toronto_east';

-- ============================================
-- 4. Seed bank balance (from 005)
-- ============================================

INSERT INTO bank_balances (franchise_id, amount, recorded_at, recorded_by)
VALUES ('fr_toronto_east', 93500, now(), 'usr_001');

-- ============================================
-- 5. Seed 6 weekly snapshots (from 005)
-- ============================================

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
