-- Genovaris Health & Wellness — PostgreSQL Relational Schema

CREATE TABLE IF NOT EXISTS formulations (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  dosage_form TEXT NOT NULL,
  servings_per_container INTEGER NOT NULL DEFAULT 30,
  icon TEXT NOT NULL,
  medallion_bg TEXT NOT NULL,
  summary TEXT NOT NULL,
  clinical_mechanism TEXT NOT NULL,
  active_ingredients JSONB NOT NULL,
  directions TEXT NOT NULL,
  timing_window TEXT NOT NULL,
  cautions JSONB NOT NULL,
  contraindications TEXT NOT NULL,
  batch_code TEXT NOT NULL,
  monograph_updated TEXT NOT NULL,
  quality_verification TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regimen_items (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT 'default',
  product_slug TEXT NOT NULL REFERENCES formulations(slug) ON DELETE CASCADE,
  notes TEXT NOT NULL DEFAULT '',
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, product_slug)
);

CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  product_slug TEXT REFERENCES formulations(slug) ON DELETE SET NULL,
  current_medications TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_state (
  session_id TEXT PRIMARY KEY,
  checked_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_formulations_category ON formulations(category);
CREATE INDEX IF NOT EXISTS idx_regimen_session ON regimen_items(session_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON consultations(created_at DESC);
