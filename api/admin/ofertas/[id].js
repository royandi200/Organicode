import { query, execute } from '../../_lib/db.js';
import Pusher from 'pusher';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'organicode-admin-2026';

let _pusher = null;
function getPusher() {
  if (_pusher) return _pusher;
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET) return null;
  _pusher = new Pusher({ appId: PUSHER_APP_ID, key: PUSHER_KEY, secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER || 'us2', useTLS: true });
  return _pusher;
}

async function notificar(canal, evento, datos) {
  try { const p = getPusher(); if (p) await p.trigger(canal, evento, datos); }
  catch (e) { console.warn('[pusher]', e.message); }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.query?.token || req.headers?.authorization?.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN)
    return res.status(401).json({ ok: false, error: 'No autorizado' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ ok: false, error: 'id requerido' });

  // GET — detalle de una oferta
  if (req.method === 'GET') {
    const rows = await query(`
      SELECT o.*, l.slug, l.nombre AS lote_nombre, l.variedad, l.proceso, l.sca_score,
             l.precio_calculado, c.municipio, c.finca
      FROM ofertas o
      JOIN lotes l ON l.id = o.lote_id
      JOIN caficultores c ON c.id = l.caficultor_id
      WHERE o.id = ? LIMIT 1
    `, [id]);
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Oferta no encontrada' });
    return res.status(200).json({ ok: true, data: rows[0] });
  }

  // POST — cambiar estado (aceptar / rechazar / negociando)
  if (req.method === 'POST') {
    const { estado, motivo_rechazo } = req.body || {};
    const estadosValidos = ['aceptada', 'rechazada', 'negociando', 'pendiente'];
    if (!estado || !estadosValidos.includes(estado))
      return res.status(400).json({ ok: false, error: `estado debe ser uno de: ${estadosValidos.join(', ')}` });

    try {
      // Obtener oferta actual + datos del lote
      const rows = await query(`
        SELECT o.*, l.slug, l.nombre AS lote_nombre, l.variedad, l.proceso
        FROM ofertas o JOIN lotes l ON l.id = o.lote_id
        WHERE o.id = ? LIMIT 1
      `, [id]);
      if (!rows.length) return res.status(404).json({ ok: false, error: 'Oferta no encontrada' });
      const oferta = rows[0];

      // Actualizar estado de la oferta
      await execute(
        'UPDATE ofertas SET estado = ?, motivo_rechazo = ?, updated_at = NOW() WHERE id = ?',
        [estado, motivo_rechazo || null, id]
      );

      // Si se acepta: marcar lote como vendido
      if (estado === 'aceptada') {
        await execute("UPDATE lotes SET estado = 'vendido' WHERE id = ?", [oferta.lote_id]);
      }
      // Si se rechaza: volver el lote a publicado (si estaba ofertado)
      if (estado === 'rechazada') {
        await execute(
          "UPDATE lotes SET estado = 'publicado' WHERE id = ? AND estado = 'ofertado'",
          [oferta.lote_id]
        );
      }

      // Notificar via Pusher al comprador (para el canal buyer)
      await notificar('organicode-compradores', 'oferta-actualizada', {
        oferta_id: parseInt(id),
        estado,
        empresa:    oferta.empresa,
        lote_slug:  oferta.slug,
        variedad:   oferta.variedad,
        motivo:     motivo_rechazo || null,
        timestamp:  new Date().toISOString(),
      });

      // Notificar panel admin
      await notificar('organicode-admin', 'oferta-gestionada', {
        oferta_id: parseInt(id), estado, lote_slug: oferta.slug,
        timestamp: new Date().toISOString(),
      });

      const msg = estado === 'aceptada'
        ? `✅ Oferta #${id} aceptada. El lote ha sido marcado como vendido.`
        : estado === 'rechazada'
        ? `❌ Oferta #${id} rechazada.${motivo_rechazo ? ` Motivo: ${motivo_rechazo}` : ''}`
        : `🔄 Oferta #${id} en negociación.`;

      return res.status(200).json({ ok: true, data: { oferta_id: parseInt(id), estado }, message: msg });
    } catch (err) {
      console.error('[admin/ofertas/:id]', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ ok: false, error: 'Método no permitido' });
}
