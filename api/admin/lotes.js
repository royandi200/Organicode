import { query } from '../_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Acepta cualquiera de las dos variables de entorno
  const validToken = process.env.ADMIN_TOKEN || process.env.JWT_SECRET || 'organicode-admin-2026';
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (token !== validToken) {
    return res.status(401).json({
      ok: false,
      error: 'No autorizado',
      debug: `Recibido: "${token.slice(0,8)}..." | Esperado primeros 8: "${validToken.slice(0,8)}..."`
    });
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
