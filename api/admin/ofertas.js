import { query } from '../_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const validToken = process.env.ADMIN_TOKEN || process.env.JWT_SECRET || 'organicode-admin-2026';
  const headerToken = (req.headers.authorization || '').replace('Bearer ', '').trim();
  const queryToken  = (req.query.token || '').trim();
  const token = headerToken || queryToken;

  if (token !== validToken) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }

  try {
    const ofertas = await query(`
      SELECT o.*, l.nombre AS lote_nombre, l.slug AS lote_slug,
        l.variedad, l.sca_score
      FROM ofertas o
      JOIN lotes l ON l.id = o.lote_id
      ORDER BY o.created_at DESC
    `);
    return res.status(200).json({ ok: true, data: ofertas });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
