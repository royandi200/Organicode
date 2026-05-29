// api/admin/ofertas/[id].js — POST /api/admin/ofertas/:id
// Acepta o rechaza una oferta (solo admin autenticado)
import { getPool, corsHeaders } from '../../_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).setHeaders(corsHeaders()).json({ ok: false, error: 'Método no permitido' });
  }

  // Verificación básica de token admin
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ') || auth.replace('Bearer ', '') !== process.env.JWT_SECRET) {
    return res.status(401).setHeaders(corsHeaders()).json({ ok: false, error: 'No autorizado' });
  }

  const { id } = req.query;
  const { estado, motivo_rechazo } = req.body;

  if (!['aceptada', 'rechazada'].includes(estado)) {
    return res.status(400).setHeaders(corsHeaders()).json({
      ok: false,
      error: "estado debe ser 'aceptada' o 'rechazada'"
    });
  }

  try {
    const pool = getPool();

    const [result] = await pool.query(`
      UPDATE ofertas
      SET estado = ?, motivo_rechazo = ?, updated_at = NOW()
      WHERE id = ?
    `, [estado, motivo_rechazo || null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).setHeaders(corsHeaders()).json({ ok: false, error: 'Oferta no encontrada' });
    }

    // Si se acepta, marcar el lote como vendido
    if (estado === 'aceptada') {
      const [[oferta]] = await pool.query('SELECT lote_id FROM ofertas WHERE id = ?', [id]);
      if (oferta) {
        await pool.query(
          "UPDATE lotes SET estado = 'vendido' WHERE id = ?",
          [oferta.lote_id]
        );
      }
    }

    return res.status(200).setHeaders(corsHeaders()).json({
      ok: true,
      message: `Oferta ${estado} correctamente`
    });
  } catch (err) {
    console.error('[API /admin/ofertas/id]', err);
    return res.status(500).setHeaders(corsHeaders()).json({ ok: false, error: err.message });
  }
}
