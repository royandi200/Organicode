import { query } from '../_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ ok: false, error: 'id requerido' });

  try {
    const cafRows = await query('SELECT * FROM caficultores WHERE id = ? LIMIT 1', [id]);
    if (!cafRows.length) return res.status(404).json({ ok: false, error: 'Productor no encontrado' });
    const caficultor = cafRows[0];

    const lotes = await query(`
      SELECT id, slug, nombre, variedad, proceso, sca_score, cantidad_kg,
        precio_calculado, estado, fecha_cosecha, foto_url, created_at
      FROM lotes
      WHERE caficultor_id = ?
      ORDER BY created_at DESC
    `, [id]);

    const pagos = await query(`
      SELECT p.monto_cop, p.monto_usd, p.fecha_pago, p.concepto,
        l.nombre AS lote_nombre
      FROM pagos p
      JOIN lotes l ON l.id = p.lote_id
      WHERE p.caficultor_id = ?
      ORDER BY p.fecha_pago DESC
    `, [id]).catch(() => []);

    const totalCop = pagos.reduce((s, p) => s + parseFloat(p.monto_cop || 0), 0);

    if (typeof caficultor.valores === 'string') {
      try { caficultor.valores = JSON.parse(caficultor.valores); } catch { caficultor.valores = []; }
    }

    return res.status(200).json({
      ok: true,
      data: { caficultor, lotes, pagos, totalCop }
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
