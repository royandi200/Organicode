import { query } from './_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    const rows = await query('SELECT 1 + 1 AS suma');
    return res.status(200).json({
      ok:  true,
      api: 'Organicode API v1.0',
      db:  rows[0].suma === 2 ? 'connected' : 'error',
      ts:  new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ ok: false, db: 'disconnected', error: err.message });
  }
}
