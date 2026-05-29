// api/lotes.js — GET /api/lotes
// Retorna todos los lotes publicados con datos del caficultor
import { getPool, corsHeaders } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end();
  }

  try {
    const pool = getPool();
    const [lotes] = await pool.query(`
      SELECT
        l.id,
        l.slug,
        l.nombre,
        l.variedad,
        l.proceso,
        l.tipo_secado,
        l.cantidad_kg,
        l.sca_score,
        l.notas_sensoriales,
        l.foto_url,
        l.estado,
        l.precio_calculado,
        l.fecha_cosecha,
        c.nombre      AS caficultor_nombre,
        c.finca       AS caficultor_finca,
        c.municipio   AS caficultor_municipio,
        c.altitud_msnm
      FROM lotes l
      JOIN caficultores c ON c.id = l.caficultor_id
      WHERE l.estado IN ('publicado', 'ofertado')
      ORDER BY l.created_at DESC
    `);

    return res.status(200).setHeaders(corsHeaders()).json({ ok: true, data: lotes });
  } catch (err) {
    console.error('[API /lotes]', err);
    return res.status(500).setHeaders(corsHeaders()).json({ ok: false, error: err.message });
  }
}
