import { query, execute } from './_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  const { tipo, lote_id, lote_slug, empresa, email_contacto, pais_destino, precio_oferta, incoterm, volumen_sacos, mensaje } = req.body;
  if (!tipo || (!lote_id && !lote_slug)) return res.status(400).json({ ok: false, error: 'tipo y lote requeridos' });

  try {
    let resolvedLoteId = lote_id;
    if (!resolvedLoteId && lote_slug) {
      const rows = await query('SELECT id FROM lotes WHERE slug = ? LIMIT 1', [lote_slug]);
      if (!rows.length) return res.status(404).json({ ok: false, error: 'Lote no encontrado' });
      resolvedLoteId = rows[0].id;
    }

    if (tipo === 'HACER_OFERTA') {
      if (!precio_oferta) return res.status(400).json({ ok: false, error: 'precio_oferta requerido' });
      const result = await execute(
        `INSERT INTO ofertas (lote_id, empresa, email_contacto, pais_destino, precio_oferta, incoterm, volumen_sacos, mensaje, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
        [resolvedLoteId, empresa || null, email_contacto || null, pais_destino || null, precio_oferta, incoterm || 'FOB', volumen_sacos || null, mensaje || null]
      );
      await execute("UPDATE lotes SET estado = 'ofertado' WHERE id = ? AND estado = 'publicado'", [resolvedLoteId]);
      return res.status(201).json({ ok: true, data: { oferta_id: result.insertId }, message: 'Oferta recibida.' });
    }

    if (tipo === 'SOLICITAR_MUESTRA') {
      const result = await execute(
        `INSERT INTO ofertas (lote_id, empresa, email_contacto, pais_destino, precio_oferta, incoterm, volumen_sacos, mensaje, estado)
         VALUES (?, ?, ?, ?, 0, 'EXW', 1, 'Solicitud de muestra (200g)', 'pendiente')`,
        [resolvedLoteId, empresa || null, email_contacto || null, pais_destino || null]
      );
      return res.status(201).json({ ok: true, data: { solicitud_id: result.insertId }, message: 'Muestra solicitada.' });
    }

    return res.status(400).json({ ok: false, error: `tipo '${tipo}' no reconocido` });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
