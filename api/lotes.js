import { query } from './_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const lotes = await query(`
      SELECT
        l.id, l.slug, l.nombre, l.variedad, l.proceso, l.tipo_secado,
        l.cantidad_kg, l.sca_score, l.notas_sensoriales, l.foto_url,
        l.estado, l.precio_calculado, l.fecha_cosecha,
        c.nombre      AS caficultor_nombre,
        c.finca       AS caficultor_finca,
        c.municipio   AS caficultor_municipio,
        c.altitud_msnm
      FROM lotes l
      JOIN caficultores c ON c.id = l.caficultor_id
      WHERE l.estado IN ('publicado', 'ofertado')
      ORDER BY l.created_at DESC
    `);
    return res.status(200).json({ ok: true, data: lotes });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
