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
    const compradores = await query(`
      SELECT
        c.id, c.nombre, c.empresa, c.email, c.telefono_wa,
        c.pais, c.segmento, c.volumen_anual_kg, c.presupuesto_usd,
        c.perfil_sensorial, c.lead_score, c.estado_crm,
        c.notas_internas, c.created_at, c.updated_at,
        (SELECT COUNT(*) FROM ofertas o WHERE o.comprador_id = c.id)                       AS total_ofertas,
        (SELECT COUNT(*) FROM ofertas o WHERE o.comprador_id = c.id AND o.estado='aceptada') AS ofertas_aceptadas,
        (SELECT COUNT(*) FROM solicitudes_muestra sm WHERE sm.comprador_id = c.id)         AS total_muestras
      FROM compradores c
      ORDER BY
        CASE c.lead_score WHEN 'HOT' THEN 0 WHEN 'WARM' THEN 1 ELSE 2 END,
        c.updated_at DESC
      LIMIT 200
    `);

    return res.status(200).json({ ok: true, data: compradores, total: compradores.length });
  } catch (err) {
    console.error('[admin/compradores]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
