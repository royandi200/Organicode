import { query } from '../_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ') || auth.replace('Bearer ', '') !== process.env.JWT_SECRET) {
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
