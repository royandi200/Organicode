// api/ping.js — GET /api/ping
// Health check: verifica que la API y la DB responden
import { getPool, corsHeaders } from './_lib/db.js';

export default async function handler(req, res) {
  try {
    const pool = getPool();
    const [[result]] = await pool.query('SELECT 1 + 1 AS suma');

    return res.status(200).setHeaders(corsHeaders()).json({
      ok:      true,
      api:     'Organicode API v1.0',
      db:      result.suma === 2 ? 'connected' : 'error',
      ts:      new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).setHeaders(corsHeaders()).json({
      ok:  false,
      db:  'disconnected',
      error: err.message
    });
  }
}
