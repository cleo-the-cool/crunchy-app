-- Add normalized_name column for improved cache matching
-- This stores a pre-normalized version of "brand + product name" for fast lookups
-- Normalization: lowercase, no punctuation, no filler words

ALTER TABLE products ADD COLUMN IF NOT EXISTS normalized_name TEXT;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_normalized_name ON products (normalized_name);

-- Backfill existing products with a basic normalization
-- (The app will overwrite with proper normalization on next scan)
UPDATE products
SET normalized_name = LOWER(REGEXP_REPLACE(
  CONCAT(COALESCE(brand, ''), ' ', COALESCE(name, '')),
  '[^a-zA-Z0-9\s]', ' ', 'g'
))
WHERE normalized_name IS NULL;
