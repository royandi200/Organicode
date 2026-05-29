import { query } from '../_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rows = await query(`
      SELECT precio_ice_usd, precio_ice_kg, trm_cop,
        diferencial_col, diferencial_hui, diferencial_trace, recorded_at
      FROM precios_historico
      ORDER BY recorded_at DESC LIMIT 1
    `);

    const precio = rows[0] || {
      precio_ice_usd: 2.18, precio_ice_kg: 4.80, trm_cop: 4180,
      diferencial_col: 0.40, diferencial_hui: 0.10, diferencial_trace: 0.50,
      recorded_at: new Date().toISOString(), fuente: 'fallback'
    };

    return res.status(200).json({ ok: true, data: precio });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
