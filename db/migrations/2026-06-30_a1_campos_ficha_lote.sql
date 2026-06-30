-- ============================================================
-- ORGANICODE — Migración: campos faltantes de la ficha de lote (A1)
-- Hoy estos campos vienen del mock en LotePage.tsx porque no existen
-- en la BD. Se separan en dos tablas según a qué pertenecen:
--
--   caficultores → terruño/finca (mismo valor para todos los lotes
--                  de esa finca): suelo, brillo solar, precipitación,
--                  microclima.
--   lotes        → contenido generado por IA específico de ESE lote:
--                  sugerencia de tueste, storytelling.
--
-- Usa ADD COLUMN IF NOT EXISTS (MySQL 8.0.29+ / PlanetScale / Railway
-- MySQL actuales lo soportan) — seguro de re-ejecutar.
-- ============================================================

ALTER TABLE caficultores
  ADD COLUMN IF NOT EXISTS suelo         VARCHAR(100) NULL COMMENT 'Tipo de suelo de la finca, ej: Volcánico-Andosol',
  ADD COLUMN IF NOT EXISTS brillo_solar  VARCHAR(50)  NULL COMMENT 'Horas de brillo solar/año, ej: 2,100 hrs/año',
  ADD COLUMN IF NOT EXISTS precipitacion VARCHAR(50)  NULL COMMENT 'Precipitación anual, ej: 1,800 mm/año',
  ADD COLUMN IF NOT EXISTS microclima    VARCHAR(150) NULL COMMENT 'Descripción del microclima, ej: Cruce Andes-Amazonía';

ALTER TABLE lotes
  ADD COLUMN IF NOT EXISTS sugerencia_ia   TEXT NULL COMMENT 'Recomendación de tueste/preparación generada por IA para este lote',
  ADD COLUMN IF NOT EXISTS storytelling_ia TEXT NULL COMMENT 'Narrativa/storytelling generado por IA específico de este lote';
