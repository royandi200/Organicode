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
    const ofertas = await query(`
      SELECT
        o.id, o.lote_id, o.comprador_id, o.telefono_comprador,
        o.empresa, o.email_contacto, o.pais_destino,
        o.precio_oferta, o.incoterm, o.volumen_sacos, o.volumen_kg,
        o.mensaje, o.estado, o.motivo_rechazo,
        o.notificado_wa, o.created_at, o.updated_at,
        l.slug       AS lote_slug,
        l.nombre     AS lote_nombre,
        l.variedad   AS lote_variedad,
        l.proceso    AS lote_proceso,
        l.sca_score  AS lote_sca,
        l.precio_calculado AS lote_precio_fob,
        c.municipio  AS caficultor_municipio,
        c.finca      AS caficultor_finca
      FROM ofertas o
      JOIN lotes l ON l.id = o.lote_id
      JOIN caficultores c ON c.id = l.caficultor_id
      ORDER BY o.created_at DESC
      LIMIT 100
    `);

    // KPIs rápidos
    const kpis = {
      total:      ofertas.length,
      pendientes: ofertas.filter(o => o.estado === 'pendiente').length,
      aceptadas:  ofertas.filter(o => o.estado === 'aceptada').length,
      rechazadas: ofertas.filter(o => o.estado === 'rechazada').length,
      valor_total_usd: ofertas
        .filter(o => o.estado !== 'rechazada')
        .reduce((s, o) => s + (parseFloat(o.precio_oferta) * (o.volumen_kg || (o.volumen_sacos * 70))), 0)
        .toFixed(2),
    };

    return res.status(200).json({ ok: true, data: ofertas, kpis, total: ofertas.length });
  } catch (err) {
    console.error('[admin/ofertas]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
