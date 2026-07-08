-- ============================================================
-- BENGAL EMPRESAS — Schema para Neon (reemplaza Supabase)
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================================
-- 1. TABLA DE USUARIOS (reemplaza auth.users de Supabase)
-- ===========================================================

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================
-- 2. COMPANIES
-- ===========================================================

CREATE TABLE IF NOT EXISTS companies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  contact_email     TEXT,
  contact_phone     TEXT,
  address           TEXT,
  budget_per_person NUMERIC(10,2),
  delivery_time     TEXT NOT NULL DEFAULT '12:30',
  active            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================
-- 3. PROFILES
-- ===========================================================

CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_id           UUID REFERENCES companies(id) ON DELETE SET NULL,
  full_name            TEXT,
  role                 TEXT NOT NULL DEFAULT 'empresa'
                         CHECK (role IN ('empresa','hogar','eventos','cocina','admin','company_admin','employee')),
  dietary_restrictions TEXT[] NOT NULL DEFAULT '{}',
  phone                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================
-- 4. MENUS
-- ===========================================================

CREATE TABLE IF NOT EXISTS menus (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  calories    INTEGER,
  protein     NUMERIC(6,2),
  carbs       NUMERIC(6,2),
  fat         NUMERIC(6,2),
  vitamins    TEXT[] NOT NULL DEFAULT '{}',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  image_url   TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================
-- 5. DAILY_MENUS
-- ===========================================================

CREATE TABLE IF NOT EXISTS daily_menus (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id      UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  stock        INTEGER NOT NULL DEFAULT 50,
  orders_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (menu_id, date)
);

-- ===========================================================
-- 6. ORDERS
-- ===========================================================

CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  menu_id       UUID NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
  daily_menu_id UUID REFERENCES daily_menus(id) ON DELETE SET NULL,
  date          DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pendiente'
                  CHECK (status IN ('pendiente','en_produccion','en_camino','entregado','cancelado')),
  extras        TEXT[] NOT NULL DEFAULT '{}',
  notes         TEXT,
  total         NUMERIC(10,2) NOT NULL,
  segment       TEXT CHECK (segment IN ('empresa','hogar','eventos')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx    ON orders (user_id);
CREATE INDEX IF NOT EXISTS orders_company_id_idx ON orders (company_id);
CREATE INDEX IF NOT EXISTS orders_date_idx       ON orders (date);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders (status);

-- ===========================================================
-- 7. TABLAS EXTRA (admin)
-- ===========================================================

CREATE TABLE IF NOT EXISTS menu_segment_prices (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  segment TEXT NOT NULL CHECK (segment IN ('empresa','hogar','eventos')),
  price   NUMERIC(10,2) NOT NULL,
  active  BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (menu_id, segment)
);

CREATE TABLE IF NOT EXISTS ingredients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  unit            TEXT NOT NULL DEFAULT 'unidades',
  cost_per_unit   NUMERIC(10,4) NOT NULL DEFAULT 0,
  current_stock   NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock_alert NUMERIC(12,3) NOT NULL DEFAULT 0,
  supplier        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_ingredients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id       UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity      NUMERIC(10,3) NOT NULL,
  UNIQUE (menu_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value  NUMERIC(10,2) NOT NULL,
  min_order_total NUMERIC(10,2),
  applies_to      TEXT NOT NULL DEFAULT 'all',
  valid_from      DATE NOT NULL,
  valid_until     DATE NOT NULL,
  active          BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS client_discounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discount_type  TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  valid_until    DATE NOT NULL,
  active         BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (user_id)
);
