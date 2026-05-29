// api/precios/actual.js — GET /api/precios/actual
// Retorna el último precio ICE registrado + diferenciales
import { getPool, corsHeaders } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end();
  }

  try {
    const pool = getPool();

    const [[precio]] = await pool.query(`
      SELECT
        precio_ice_usd,
        precio_ice_kg,
        trm_cop,
        diferencial_col,
        diferencial_hui,
        diferencial_trace,
        recorded_at
      FROM precios_historico
      ORDER BY recorded_at DESC
      LIMIT 1
    `);

    if (!precio) {
      // Fallback con valores por defecto si no hay datos
      return res.status(200).setHeaders(corsHeaders()).json({
        ok: true,
        data: {
          precio_ice_usd:   2.18,
          precio_ice_kg:    4.80,
          trm_cop:          4180,
          diferencial_col:  0.40,
          diferencial_hui:  0.10,
          diferencial_trace:0.50,
          recorded_at:      new Date().toISOString(),
          fuente:           'fallback'
        }
      });
    }

    return res.status(200).setHeaders(corsHeaders()).json({ ok: true, data: precio });
  } catch (err) {
    console.error('[API /precios/actual]', err);
    return res.status(500).setHeaders(corsHeaders()).json({ ok: false, error: err.message });
  }
}
