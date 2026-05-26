-- ============================================================
-- BENGAL EMPRESAS — Migration v3: Información nutricional
-- Ejecutar en SQL Editor DESPUÉS de v1 y v2
-- ============================================================

-- Agregar columnas nutricionales a la tabla menus
ALTER TABLE public.menus
  ADD COLUMN IF NOT EXISTS protein    numeric(8,1) DEFAULT NULL,   -- gramos de proteína
  ADD COLUMN IF NOT EXISTS carbs      numeric(8,1) DEFAULT NULL,   -- gramos de carbohidratos
  ADD COLUMN IF NOT EXISTS fat        numeric(8,1) DEFAULT NULL,   -- gramos de grasa total
  ADD COLUMN IF NOT EXISTS vitamins   text[]       DEFAULT '{}';   -- ej: {"Vitamina C","Hierro","Calcio"}

-- Comentarios para documentación
COMMENT ON COLUMN public.menus.protein  IS 'Proteínas por porción (g)';
COMMENT ON COLUMN public.menus.carbs    IS 'Carbohidratos por porción (g)';
COMMENT ON COLUMN public.menus.fat      IS 'Grasa total por porción (g)';
COMMENT ON COLUMN public.menus.vitamins IS 'Array de vitaminas y minerales destacados';
