import { query, execute } from '../_lib/db.js';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'organicode-admin-2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.query?.token || req.headers?.authorization?.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN)
    return res.status(401).json({ ok: false, error: 'No autorizado' });

  // GET /api/admin/muestras
  if (req.method === 'GET') {
    try {
      const muestras = await query(`
        SELECT
          sm.id, sm.lote_id, sm.comprador_id, sm.telefono_solicitante,
          sm.empresa, sm.pais_destino, sm.gramos_solicitados,
          sm.estado, sm.numero_guia, sm.courier, sm.costo_envio_usd,
          sm.direccion_entrega, sm.notas, sm.created_at, sm.updated_at,
          l.slug  AS lote_slug,
          l.nombre AS lote_nombre,
          l.variedad, l.proceso, l.sca_score
        FROM solicitudes_muestra sm
        JOIN lotes l ON l.id = sm.lote_id
        ORDER BY sm.created_at DESC
        LIMIT 100
      `);
      return res.status(200).json({ ok: true, data: muestras, total: muestras.length });
    } catch (err) {
      console.error('[admin/muestras GET]', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST /api/admin/muestras  { id, estado, numero_guia, courier }
  if (req.method === 'POST') {
    const { id, estado, numero_guia, courier, costo_envio_usd } = req.body || {};
    if (!id || !estado)
      return res.status(400).json({ ok: false, error: 'id y estado son requeridos' });
    try {
      await execute(
        `UPDATE solicitudes_muestra
         SET estado = ?, numero_guia = ?, courier = ?, costo_envio_usd = ?, updated_at = NOW()
         WHERE id = ?`,
        [estado, numero_guia || null, courier || null, costo_envio_usd || null, id]
      );
      return res.status(200).json({ ok: true, data: { id, estado }, message: `Muestra #${id} actualizada a "${estado}"` });
    } catch (err) {
      console.error('[admin/muestras POST]', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ ok: false, error: 'Método no permitido' });
}
