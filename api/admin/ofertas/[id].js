import { query, execute } from '../../_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ') || auth.replace('Bearer ', '') !== process.env.JWT_SECRET) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }

  const { id } = req.query;
  const { estado, motivo_rechazo } = req.body;
  if (!['aceptada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ ok: false, error: "estado debe ser 'aceptada' o 'rechazada'" });
  }

  try {
    const result = await execute(
      'UPDATE ofertas SET estado = ?, motivo_rechazo = ?, updated_at = NOW() WHERE id = ?',
      [estado, motivo_rechazo || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: 'Oferta no encontrada' });

    if (estado === 'aceptada') {
      const rows = await query('SELECT lote_id FROM ofertas WHERE id = ?', [id]);
      if (rows.length) await execute("UPDATE lotes SET estado = 'vendido' WHERE id = ?", [rows[0].lote_id]);
    }

    return res.status(200).json({ ok: true, message: `Oferta ${estado} correctamente` });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
