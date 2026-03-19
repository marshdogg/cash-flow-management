-- ============================================
-- 007 — Franchise Settings
-- Per-franchise configuration (min balance threshold, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS franchise_settings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id  text NOT NULL UNIQUE,
  min_balance   numeric(12,2) NOT NULL DEFAULT 5000,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE franchise_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all" ON franchise_settings
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_franchise_settings_franchise
  ON franchise_settings (franchise_id);

-- Seed default for existing test franchise
INSERT INTO franchise_settings (franchise_id, min_balance)
VALUES ('fr_toronto_east', 5000)
ON CONFLICT (franchise_id) DO NOTHING;
