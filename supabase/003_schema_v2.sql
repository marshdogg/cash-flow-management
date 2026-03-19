-- ============================================
-- Cash Flow Guide — Schema v2 Migration
-- Run this in the Supabase SQL Editor after 001 and 002.
-- ============================================

-- ============================================
-- 1. ALTER recurring_transactions
-- ============================================

ALTER TABLE recurring_transactions
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS day_of_month integer,
  ADD COLUMN IF NOT EXISTS end_date text,
  ADD COLUMN IF NOT EXISTS notes text;

-- Add category constraint (drop first in case re-running)
DO $$ BEGIN
  ALTER TABLE recurring_transactions
    ADD CONSTRAINT recurring_transactions_category_check
    CHECK (category IN ('rent','royalty','vehicle','insurance','draw','subscription','loan','supplies','other'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. ALTER weekly_snapshots — P&L fields
-- ============================================

ALTER TABLE weekly_snapshots
  ADD COLUMN IF NOT EXISTS opening_balance numeric(12,2),
  ADD COLUMN IF NOT EXISTS work_completed numeric(12,2),
  ADD COLUMN IF NOT EXISTS cash_cheque_collections numeric(12,2),
  ADD COLUMN IF NOT EXISTS credit_card_collections numeric(12,2),
  ADD COLUMN IF NOT EXISTS credit_card_fee_pct numeric(4,2) DEFAULT 3.0,
  ADD COLUMN IF NOT EXISTS total_collections numeric(12,2),
  ADD COLUMN IF NOT EXISTS labor_pct numeric(5,2),
  ADD COLUMN IF NOT EXISTS labor_calculated numeric(12,2),
  ADD COLUMN IF NOT EXISTS labor_actual numeric(12,2),
  ADD COLUMN IF NOT EXISTS materials_pct numeric(5,2),
  ADD COLUMN IF NOT EXISTS materials_calculated numeric(12,2),
  ADD COLUMN IF NOT EXISTS materials_actual numeric(12,2),
  ADD COLUMN IF NOT EXISTS other_variable_costs numeric(12,2),
  ADD COLUMN IF NOT EXISTS total_variable_cogs numeric(12,2),
  ADD COLUMN IF NOT EXISTS total_fixed_costs numeric(12,2),
  ADD COLUMN IF NOT EXISTS total_one_time_costs numeric(12,2),
  ADD COLUMN IF NOT EXISTS ending_balance numeric(12,2),
  ADD COLUMN IF NOT EXISTS week_start date,
  ADD COLUMN IF NOT EXISTS week_end date;

-- ============================================
-- 3. CREATE accounts_receivable
-- ============================================

CREATE TABLE IF NOT EXISTS accounts_receivable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id text NOT NULL,
  customer_name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  invoice_date date,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','partial','paid','overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all" ON accounts_receivable FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 4. CREATE accounts_payable
-- ============================================

CREATE TABLE IF NOT EXISTS accounts_payable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id text NOT NULL,
  vendor_name text NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  remaining_amount numeric(12,2) NOT NULL,
  due_date date,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','partial','paid','overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all" ON accounts_payable FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 5. CREATE ritual_fixed_cost_entries
-- ============================================

CREATE TABLE IF NOT EXISTS ritual_fixed_cost_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id uuid REFERENCES weekly_snapshots(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES recurring_transactions(id) ON DELETE SET NULL,
  payee text NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'paid'
    CHECK (status IN ('paid','skipped','adjusted')),
  adjusted_amount numeric(12,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ritual_fixed_cost_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all" ON ritual_fixed_cost_entries FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 6. CREATE ritual_one_time_costs
-- ============================================

CREATE TABLE IF NOT EXISTS ritual_one_time_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id uuid REFERENCES weekly_snapshots(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  category text,
  cost_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ritual_one_time_costs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all" ON ritual_one_time_costs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 7. Update existing recurring_transactions with categories
-- ============================================

UPDATE recurring_transactions SET description = 'Weekly painting revenue', category = 'other'
  WHERE name = 'Residential Painting Revenue';

UPDATE recurring_transactions SET description = 'Monthly commercial contracts', category = 'other'
  WHERE name = 'Commercial Contracts';

UPDATE recurring_transactions SET description = 'Bi-weekly crew wages', category = 'other'
  WHERE name = 'Crew Payroll';

UPDATE recurring_transactions SET description = 'Monthly truck payments', category = 'vehicle', day_of_month = 10
  WHERE name = 'Vehicle Leases';

UPDATE recurring_transactions SET description = 'Office lease', category = 'rent', day_of_month = 1
  WHERE name = 'Office Rent';

UPDATE recurring_transactions SET description = 'General liability', category = 'insurance', day_of_month = 1
  WHERE name = 'Insurance Premium';

UPDATE recurring_transactions SET description = 'Monthly marketing spend', category = 'other', day_of_month = 1
  WHERE name = 'Marketing Budget';

UPDATE recurring_transactions SET description = 'Annual staff bonus', category = 'other', day_of_month = 1
  WHERE name = 'Holiday Bonus Fund';

-- ============================================
-- 8. Seed sample AR & AP for fr_toronto_east
-- ============================================

INSERT INTO accounts_receivable (franchise_id, customer_name, amount, invoice_date, status)
VALUES
  ('fr_toronto_east', 'Henderson Family', 2200, CURRENT_DATE - INTERVAL '12 days', 'pending'),
  ('fr_toronto_east', 'Maple Corp', 1300, CURRENT_DATE - INTERVAL '8 days', 'pending');

INSERT INTO accounts_payable (franchise_id, vendor_name, total_amount, remaining_amount, due_date, status)
VALUES
  ('fr_toronto_east', 'Sherwin-Williams', 3500, 2700, CURRENT_DATE + INTERVAL '7 days', 'partial'),
  ('fr_toronto_east', 'ProSpray Equipment', 3500, 3500, CURRENT_DATE + INTERVAL '14 days', 'pending'),
  ('fr_toronto_east', 'Valley Subcontractors', 2000, 2000, CURRENT_DATE - INTERVAL '7 days', 'overdue');
