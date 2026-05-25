-- ============================================================
-- BENGAL EMPRESAS — Fix recursión infinita en RLS
-- Ejecutar en SQL Editor después del schema inicial
-- ============================================================

-- ===========================================================
-- 1. ELIMINAR TODAS LAS POLICIES EXISTENTES
-- ===========================================================

DROP POLICY IF EXISTS "Admins manage companies"               ON public.companies;
DROP POLICY IF EXISTS "Users view own company"                ON public.companies;

DROP POLICY IF EXISTS "Users manage own profile"              ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles"              ON public.profiles;
DROP POLICY IF EXISTS "Company admins view company profiles"  ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users view active menus" ON public.menus;
DROP POLICY IF EXISTS "Admins manage menus"                   ON public.menus;

DROP POLICY IF EXISTS "Authenticated users view daily menus"  ON public.daily_menus;
DROP POLICY IF EXISTS "Admins manage daily menus"             ON public.daily_menus;

DROP POLICY IF EXISTS "Users view own orders"                 ON public.orders;
DROP POLICY IF EXISTS "Users insert own orders"               ON public.orders;
DROP POLICY IF EXISTS "Users cancel own pending orders"       ON public.orders;
DROP POLICY IF EXISTS "Company admins view company orders"    ON public.orders;
DROP POLICY IF EXISTS "Admins manage all orders"              ON public.orders;

-- ===========================================================
-- 2. FUNCIÓN HELPER — lee el rol sin disparar RLS (SECURITY DEFINER)
--    Al usar SECURITY DEFINER, corre como el owner (postgres),
--    bypaseando las policies de profiles y rompiendo el loop.
-- ===========================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS uuid AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===========================================================
-- 3. RECREAR POLICIES usando las funciones helper
-- ===========================================================

-- COMPANIES
CREATE POLICY "Admins manage companies" ON public.companies
  FOR ALL USING (public.current_user_role() = 'admin');

CREATE POLICY "Users view own company" ON public.companies
  FOR SELECT USING (id = public.current_user_company_id());

-- PROFILES
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.current_user_role() = 'admin');

CREATE POLICY "Company admins view company profiles" ON public.profiles
  FOR SELECT USING (
    company_id = public.current_user_company_id()
    AND public.current_user_role() IN ('company_admin', 'admin')
  );

-- MENUS
CREATE POLICY "Authenticated users view active menus" ON public.menus
  FOR SELECT USING (active = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins manage menus" ON public.menus
  FOR ALL USING (public.current_user_role() = 'admin');

-- DAILY_MENUS
CREATE POLICY "Authenticated users view daily menus" ON public.daily_menus
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage daily menus" ON public.daily_menus
  FOR ALL USING (public.current_user_role() = 'admin');

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
    company_id = public.current_user_company_id()
    AND public.current_user_role() IN ('company_admin', 'admin')
  );

CREATE POLICY "Admins manage all orders" ON public.orders
  FOR ALL USING (public.current_user_role() = 'admin');
