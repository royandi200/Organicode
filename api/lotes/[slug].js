// api/lotes/[slug].js — GET /api/lotes/:slug
// Retorna el detalle completo de un lote + timeline
import { getPool, corsHeaders } from '../_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end();
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).setHeaders(corsHeaders()).json({ ok: false, error: 'slug requerido' });
  }

  try {
    const pool = getPool();

    // Lote + caficultor
    const [[lote]] = await pool.query(`
      SELECT
        l.*,
        c.nombre        AS caficultor_nombre,
        c.finca         AS caficultor_finca,
        c.vereda        AS caficultor_vereda,
        c.municipio     AS caficultor_municipio,
        c.departamento  AS caficultor_departamento,
        c.coordenadas_lat,
        c.coordenadas_lng,
        c.altitud_msnm,
        c.foto_url      AS caficultor_foto,
        c.desde_anio    AS caficultor_desde,
        c.valores       AS caficultor_valores,
        c.storytelling  AS caficultor_storytelling,
        c.telefono_wa
      FROM lotes l
      JOIN caficultores c ON c.id = l.caficultor_id
      WHERE l.slug = ?
      LIMIT 1
    `, [slug]);

    if (!lote) {
      return res.status(404).setHeaders(corsHeaders()).json({ ok: false, error: 'Lote no encontrado' });
    }

    // Timeline del lote
    const [timeline] = await pool.query(`
      SELECT evento, fecha, detalle, hash_tx
      FROM timeline_eventos
      WHERE lote_id = ?
      ORDER BY fecha ASC
    `, [lote.id]);

    // Parsear JSON fields
    if (typeof lote.caficultor_valores === 'string') {
      lote.caficultor_valores = JSON.parse(lote.caficultor_valores);
    }

    return res.status(200).setHeaders(corsHeaders()).json({
      ok: true,
      data: { ...lote, timeline }
    });
  } catch (err) {
    console.error('[API /lotes/slug]', err);
    return res.status(500).setHeaders(corsHeaders()).json({ ok: false, error: err.message });
  }
}
