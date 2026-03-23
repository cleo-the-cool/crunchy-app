-- Ensure products table has all required columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_scores JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gemini_analysis JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS overall_score INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS normalized_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for normalized name lookups
CREATE INDEX IF NOT EXISTS idx_products_normalized_name ON products (normalized_name);

-- Ensure RLS policies allow inserts and selects for anon/authenticated
-- First check what exists, then add missing policies
DO $$
BEGIN
  -- Allow anyone to read products (public product database)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_select_all') THEN
    CREATE POLICY products_select_all ON products FOR SELECT USING (true);
  END IF;

  -- Allow anyone to insert products (scans create product entries)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_insert_all') THEN
    CREATE POLICY products_insert_all ON products FOR INSERT WITH CHECK (true);
  END IF;

  -- Allow anyone to update products (scan count, cached analysis)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_update_all') THEN
    CREATE POLICY products_update_all ON products FOR UPDATE USING (true);
  END IF;
END $$;

-- Make sure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
