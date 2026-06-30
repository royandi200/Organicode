// api/migrate.js — Crea tablas faltantes en la BD
// Protegido por MIGRATE_SECRET en variables de entorno
// Uso: POST /api/migrate  { "secret": "<MIGRATE_SECRET>" }

import { query } from './_lib/db.js';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { secret } = req.body || {};
  const MIGRATE_SECRET = process.env.MIGRATE_SECRET || 'organicode-migrate-2026';

  if (secret !== MIGRATE_SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const results = [];

  // ── 1. webhook_logs ──────────────────────────────────────────
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        tipo          VARCHAR(50)   DEFAULT 'caficultor',
        from_number   VARCHAR(50)   DEFAULT NULL,
        action        VARCHAR(100)  DEFAULT NULL,
        raw_body      TEXT          DEFAULT NULL,
        parsed_json   TEXT          DEFAULT NULL,
        response      TEXT          DEFAULT NULL,
        status_code   SMALLINT      DEFAULT 200,
        error         VARCHAR(500)  DEFAULT NULL,
        duration_ms   INT           DEFAULT NULL,
        created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_from     (from_number),
        INDEX idx_action   (action),
        INDEX idx_created  (created_at),
        INDEX idx_tipo     (tipo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.push({ table: 'webhook_logs', status: 'OK ✅' });
  } catch (e) {
    results.push({ table: 'webhook_logs', status: 'ERROR ❌', error: e.message });
  }

  // ── 2. Verificar tablas principales ─────────────────────────
  const tablasRequeridas = ['caficultores', 'lotes', 'precios_bolsa'];
  for (const tabla of tablasRequeridas) {
    try {
      const rows = await query(`SELECT COUNT(*) as cnt FROM ${tabla} LIMIT 1`);
      results.push({ table: tabla, status: `OK ✅ (${rows[0].cnt} registros)` });
    } catch (e) {
      results.push({ table: tabla, status: 'NO EXISTE ⚠️', error: e.message });
    }
  }

  // ── 3. A1 — Campos faltantes de la ficha de lote (terruño + IA) ──
  try {
    await query(`
      ALTER TABLE caficultores
        ADD COLUMN IF NOT EXISTS suelo         VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS brillo_solar  VARCHAR(50)  NULL,
        ADD COLUMN IF NOT EXISTS precipitacion VARCHAR(50)  NULL,
        ADD COLUMN IF NOT EXISTS microclima    VARCHAR(150) NULL
    `);
    results.push({ table: 'caficultores (suelo/brillo_solar/precipitacion/microclima)', status: 'OK ✅' });
  } catch (e) {
    results.push({ table: 'caficultores (terruño)', status: 'ERROR ❌', error: e.message });
  }

  try {
    await query(`
      ALTER TABLE lotes
        ADD COLUMN IF NOT EXISTS sugerencia_ia   TEXT NULL,
        ADD COLUMN IF NOT EXISTS storytelling_ia TEXT NULL
    `);
    results.push({ table: 'lotes (sugerencia_ia/storytelling_ia)', status: 'OK ✅' });
  } catch (e) {
    results.push({ table: 'lotes (IA)', status: 'ERROR ❌', error: e.message });
  }

  return res.status(200).json({
    ok: true,
    mensaje: 'Migración completada',
    results,
    timestamp: new Date().toISOString()
  });
};
