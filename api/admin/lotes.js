import { query } from '../_lib/db.js';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'organicode-admin-2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.query?.token || req.headers?.authorization?.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN)
    return res.status(401).json({ ok: false, error: 'No autorizado' });

  try {
    const lotes = await query(`
      SELECT
        l.id, l.slug, l.nombre, l.variedad, l.proceso,
        l.cantidad_kg, l.sca_score, l.precio_calculado,
        l.estado, l.foto_url, l.notas_sensoriales,
        l.created_at, l.updated_at,
        c.nombre  AS caficultor_nombre,
        c.municipio AS caficultor_municipio,
        c.finca, c.altitud_msnm,
        (SELECT COUNT(*) FROM ofertas o WHERE o.lote_id = l.id)           AS total_ofertas,
        (SELECT COUNT(*) FROM ofertas o WHERE o.lote_id = l.id AND o.estado = 'pendiente') AS ofertas_pendientes,
        (SELECT COUNT(*) FROM solicitudes_muestra sm WHERE sm.lote_id = l.id) AS total_muestras
      FROM lotes l
      JOIN caficultores c ON c.id = l.caficultor_id
      ORDER BY l.updated_at DESC
    `);

    return res.status(200).json({ ok: true, data: lotes, total: lotes.length });
  } catch (err) {
    console.error('[admin/lotes]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
