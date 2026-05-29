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
    const lotes = await query(`
      SELECT l.*, c.nombre AS caficultor_nombre, c.finca AS caficultor_finca,
        c.municipio AS caficultor_municipio
      FROM lotes l
      JOIN caficultores c ON c.id = l.caficultor_id
      ORDER BY l.created_at DESC
    `);
    return res.status(200).json({ ok: true, data: lotes });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
