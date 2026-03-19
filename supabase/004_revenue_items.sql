-- ============================================
-- Cash Flow Guide — Revenue Items Table
-- Run this in the Supabase SQL Editor after 001–003.
-- ============================================

-- ============================================
-- 1. CREATE revenue_items
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

-- Index for franchise queries
CREATE INDEX IF NOT EXISTS idx_revenue_items_franchise
  ON revenue_items (franchise_id, expected_date);

-- ============================================
-- 2. Seed sample revenue items for fr_toronto_east
-- ============================================

INSERT INTO revenue_items (franchise_id, note, category, gross_amount, adjusted_amount, adjustment_rate, week, expected_date, status, ritual_date)
VALUES
  -- AR items
  ('fr_toronto_east', 'Henderson project',      'ar',       8400, 7140, 85, 'w0', CURRENT_DATE,                 'open',      CURRENT_DATE),
  ('fr_toronto_east', 'Martinez invoice',        'ar',       6200, 5270, 85, 'w0', CURRENT_DATE - INTERVAL '7 days',  'open',      CURRENT_DATE - INTERVAL '7 days'),
  ('fr_toronto_east', 'Oakwood Condo deposit',   'ar',       3800, 3230, 85, 'w2', CURRENT_DATE + INTERVAL '14 days', 'open',      CURRENT_DATE),
  ('fr_toronto_east', 'Chen exterior job',       'ar',       7200, 7200, 100,'w0', CURRENT_DATE - INTERVAL '7 days',  'collected', CURRENT_DATE - INTERVAL '14 days'),

  -- Sales items
  ('fr_toronto_east', 'Joe''s estimate — Riverdale',  'sales', 12000, 10200, 85, 'w0', CURRENT_DATE,                 'open',      CURRENT_DATE),
  ('fr_toronto_east', 'Sarah K. — exterior repaint',  'sales',  9500,  8075, 85, 'w1', CURRENT_DATE + INTERVAL '7 days',  'open',      CURRENT_DATE),
  ('fr_toronto_east', 'Liu — interior full repaint',  'sales',  8400,  7140, 85, 'w0', CURRENT_DATE - INTERVAL '7 days',  'open',      CURRENT_DATE - INTERVAL '7 days'),
  ('fr_toronto_east', 'Nguyen — kitchen cabinets',    'sales',  4200,     0,  0, 'w0', CURRENT_DATE - INTERVAL '7 days',  'cancelled', CURRENT_DATE - INTERVAL '14 days'),

  -- Proposal items
  ('fr_toronto_east', 'Thompson — full interior',       'proposal', 22000,  8800, 40, 'w1', CURRENT_DATE + INTERVAL '7 days',  'open', CURRENT_DATE),
  ('fr_toronto_east', 'Patel — condo complex',          'proposal', 45000, 18000, 40, 'w3', CURRENT_DATE + INTERVAL '21 days', 'open', CURRENT_DATE),
  ('fr_toronto_east', 'Morrison — heritage restoration', 'proposal', 31000, 12400, 40, 'w5', CURRENT_DATE + INTERVAL '35 days', 'open', CURRENT_DATE),
  ('fr_toronto_east', 'Villa — stucco exterior',         'proposal',  9100,     0,  0, 'w0', CURRENT_DATE - INTERVAL '7 days',  'lost', CURRENT_DATE - INTERVAL '14 days');

-- Set collected_date for items that are collected
UPDATE revenue_items SET collected_date = CURRENT_DATE - INTERVAL '4 days'
  WHERE note = 'Chen exterior job' AND franchise_id = 'fr_toronto_east';
