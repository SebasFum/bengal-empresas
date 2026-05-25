-- ============================================================
-- BENGAL EMPRESAS — Migration v2: Multi-rol + ingredientes + precios por segmento
-- Ejecutar en SQL Editor DESPUÉS del schema inicial + fix-rls
-- ============================================================

-- ===========================================================
-- 1. ACTUALIZAR CONSTRAINT DE ROL EN PROFILES
-- ===========================================================

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('empresa', 'hogar', 'eventos', 'cocina', 'admin', 'company_admin', 'employee'));

-- Migrar roles existentes: 'employee' → 'empresa'
UPDATE public.profiles SET role = 'empresa' WHERE role = 'employee';

-- ===========================================================
-- 2. PRECIOS POR SEGMENTO
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.menu_segment_prices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id    uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  segment    text NOT NULL CHECK (segment IN ('empresa', 'hogar', 'eventos')),
  price      numeric(10,2) NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  UNIQUE (menu_id, segment)
);

ALTER TABLE public.menu_segment_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view segment prices" ON public.menu_segment_prices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage segment prices" ON public.menu_segment_prices
  FOR ALL USING (public.current_user_role() = 'admin');

-- ===========================================================
-- 3. INGREDIENTES
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.ingredients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  unit             text NOT NULL DEFAULT 'unidades',  -- kg, litros, gramos, unidades, etc.
  cost_per_unit    numeric(10,4) NOT NULL DEFAULT 0,
  current_stock    numeric(12,3) NOT NULL DEFAULT 0,
  min_stock_alert  numeric(12,3) NOT NULL DEFAULT 0,
  supplier         text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cocina and admin view ingredients" ON public.ingredients
  FOR SELECT USING (public.current_user_role() IN ('admin', 'cocina'));

CREATE POLICY "Admins manage ingredients" ON public.ingredients
  FOR ALL USING (public.current_user_role() = 'admin');

-- ===========================================================
-- 4. RECETAS (menu → ingredientes)
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.menu_ingredients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id         uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  ingredient_id   uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  quantity        numeric(10,3) NOT NULL,
  UNIQUE (menu_id, ingredient_id)
);

ALTER TABLE public.menu_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cocina and admin view recipes" ON public.menu_ingredients
  FOR SELECT USING (public.current_user_role() IN ('admin', 'cocina'));

CREATE POLICY "Admins manage recipes" ON public.menu_ingredients
  FOR ALL USING (public.current_user_role() = 'admin');

-- ===========================================================
-- 5. PROMOCIONES (descuentos globales por segmento o para todos)
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.promotions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  description      text,
  code             text UNIQUE,                       -- código opcional
  discount_type    text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value   numeric(10,2) NOT NULL,
  applies_to       text NOT NULL DEFAULT 'all'
                     CHECK (applies_to IN ('all', 'empresa', 'hogar', 'eventos')),
  min_order_total  numeric(10,2),
  valid_from       date NOT NULL,
  valid_until      date NOT NULL,
  active           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view active promotions" ON public.promotions
  FOR SELECT USING (auth.role() = 'authenticated' AND active = true);

CREATE POLICY "Admins manage promotions" ON public.promotions
  FOR ALL USING (public.current_user_role() = 'admin');

-- ===========================================================
-- 6. DESCUENTOS POR CLIENTE
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.client_discounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id      uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  discount_type   text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  numeric(10,2) NOT NULL,
  valid_until     date,
  note            text,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR company_id IS NOT NULL)
);

ALTER TABLE public.client_discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own discounts" ON public.client_discounts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage client discounts" ON public.client_discounts
  FOR ALL USING (public.current_user_role() = 'admin');

-- ===========================================================
-- 7. HISTORIAL DE PUBLICACIONES EN REDES
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.social_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_date   date NOT NULL,
  caption     text,
  image_url   text,
  platform    text NOT NULL DEFAULT 'instagram',
  published   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage social posts" ON public.social_posts
  FOR ALL USING (public.current_user_role() = 'admin');

-- ===========================================================
-- 8. FUNCIÓN HELPER: descontar stock de ingredientes al confirmar pedido
-- ===========================================================

CREATE OR REPLACE FUNCTION public.deduct_ingredients_for_order(p_menu_id uuid, p_quantity int DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE public.ingredients AS ing
  SET current_stock = ing.current_stock - (mi.quantity * p_quantity)
  FROM public.menu_ingredients mi
  WHERE mi.menu_id = p_menu_id
    AND mi.ingredient_id = ing.id
    AND ing.current_stock >= (mi.quantity * p_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================
-- 9. PRECIOS DE EJEMPLO para los menús existentes
-- ===========================================================

INSERT INTO public.menu_segment_prices (menu_id, segment, price)
SELECT m.id, s.segment, m.price * s.multiplier
FROM public.menus m
CROSS JOIN (VALUES
  ('empresa', 1.0),
  ('hogar',   1.15),
  ('eventos', 1.30)
) AS s(segment, multiplier)
ON CONFLICT (menu_id, segment) DO NOTHING;

-- ===========================================================
-- 10. AGREGAR COLUMNA segment A orders (para saber qué segmento hizo el pedido)
-- ===========================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS segment text
  CHECK (segment IN ('empresa', 'hogar', 'eventos'));
