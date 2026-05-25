-- ============================================================
-- BENGAL EMPRESAS — Schema para Supabase SQL Editor
-- ============================================================

-- ===========================================================
-- 1. TABLAS (primero todas, sin policies)
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  contact_email     text,
  contact_phone     text,
  address           text,
  budget_per_person numeric(10,2),
  delivery_time     text NOT NULL DEFAULT '12:30',
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id            uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name             text,
  role                  text NOT NULL DEFAULT 'employee'
                          CHECK (role IN ('employee', 'company_admin', 'admin')),
  dietary_restrictions  text[] NOT NULL DEFAULT '{}',
  phone                 text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menus (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  category    text NOT NULL,
  price       numeric(10,2) NOT NULL,
  calories    integer,
  tags        text[] NOT NULL DEFAULT '{}',
  image_url   text,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_menus (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id       uuid NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  date          date NOT NULL,
  stock         integer NOT NULL DEFAULT 50,
  orders_count  integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (menu_id, date)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id      uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  menu_id         uuid NOT NULL REFERENCES public.menus(id) ON DELETE RESTRICT,
  daily_menu_id   uuid REFERENCES public.daily_menus(id) ON DELETE SET NULL,
  date            date NOT NULL,
  status          text NOT NULL DEFAULT 'pendiente'
                    CHECK (status IN ('pendiente','en_produccion','en_camino','entregado','cancelado')),
  extras          text[] NOT NULL DEFAULT '{}',
  notes           text,
  total           numeric(10,2) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx    ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_company_id_idx ON public.orders (company_id);
CREATE INDEX IF NOT EXISTS orders_date_idx       ON public.orders (date);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON public.orders (status);

-- ===========================================================
-- 2. HABILITAR RLS
-- ===========================================================

ALTER TABLE public.companies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- 3. POLICIES (ahora todas las tablas ya existen)
-- ===========================================================

-- COMPANIES
CREATE POLICY "Admins manage companies" ON public.companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users view own company" ON public.companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- PROFILES
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Company admins view company profiles" ON public.profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('company_admin', 'admin')
    )
  );

-- MENUS
CREATE POLICY "Authenticated users view active menus" ON public.menus
  FOR SELECT USING (active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins manage menus" ON public.menus
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DAILY_MENUS
CREATE POLICY "Authenticated users view daily menus" ON public.daily_menus
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage daily menus" ON public.daily_menus
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ORDERS
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users insert own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users cancel own pending orders" ON public.orders
  FOR UPDATE USING (user_id = auth.uid() AND status = 'pendiente')
  WITH CHECK (status = 'cancelado');

CREATE POLICY "Company admins view company orders" ON public.orders
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('company_admin', 'admin')
    )
  );

CREATE POLICY "Admins manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ===========================================================
-- 4. TRIGGER — crear perfil automáticamente al registrarse
-- ===========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, dietary_restrictions)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'employee',
    '{}'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================================
-- 5. FUNCIÓN — incrementar stock de forma atómica
-- ===========================================================

CREATE OR REPLACE FUNCTION public.increment_orders_count(p_daily_menu_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.daily_menus
  SET orders_count = orders_count + 1
  WHERE id = p_daily_menu_id AND orders_count < stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================
-- 6. DATOS DE EJEMPLO
-- ===========================================================

INSERT INTO public.menus (name, description, category, price, calories, tags, image_url, active)
VALUES
  ('Pollo al limón con arroz integral',
   'Suprema de pollo marinada en limón y hierbas, servida con arroz integral y vegetales salteados.',
   'principal', 2800, 520, ARRAY['proteico','sin-gluten','recomendado'],
   'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80', true),

  ('Salmón con quinoa y espinaca',
   'Filet de salmón al horno con quinoa tricolor y espinaca salteada con ajo.',
   'principal', 3400, 480, ARRAY['omega3','sin-gluten','premium'],
   'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80', true),

  ('Pasta al pesto con cherry',
   'Fusilli con pesto de albahaca fresca, tomates cherry asados y parmesano.',
   'principal', 2400, 610, ARRAY['vegetariano','clasico'],
   'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80', true),

  ('Ensalada niçoise',
   'Mix de verdes, atún, huevo, aceitunas negras, tomate cherry y vinagreta.',
   'ensalada', 2600, 380, ARRAY['liviano','sin-gluten','proteico'],
   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', true),

  ('Wrap de pollo grillado',
   'Tortilla integral rellena de pollo grillado, palta, lechuga y salsa yogurt.',
   'sandwich', 2200, 440, ARRAY['rapido','balanceado'],
   'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80', true),

  ('Tarta de verduras y queso',
   'Tarta casera de espinaca, zapallito y ricotta con masa de escanda.',
   'vegetariano', 2100, 410, ARRAY['vegetariano','casero'],
   'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80', true)
ON CONFLICT DO NOTHING;

-- Daily menus para hoy
INSERT INTO public.daily_menus (menu_id, date, stock, orders_count)
SELECT id, CURRENT_DATE, 30, 0
FROM public.menus
WHERE active = true
ON CONFLICT (menu_id, date) DO NOTHING;
