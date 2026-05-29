// api/webhook-buyer.js — POST /api/webhook-buyer
// Recibe acciones del comprador: HACER_OFERTA o SOLICITAR_MUESTRA
import { getPool, corsHeaders } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).setHeaders(corsHeaders()).json({ ok: false, error: 'Método no permitido' });
  }

  const {
    tipo,          // 'HACER_OFERTA' | 'SOLICITAR_MUESTRA'
    lote_id,
    lote_slug,
    empresa,
    email_contacto,
    pais_destino,
    precio_oferta,
    incoterm,
    volumen_sacos,
    mensaje
  } = req.body;

  if (!tipo || (!lote_id && !lote_slug)) {
    return res.status(400).setHeaders(corsHeaders()).json({
      ok: false,
      error: 'tipo y lote_id o lote_slug son requeridos'
    });
  }

  try {
    const pool = getPool();

    // Resolver lote_id desde slug si es necesario
    let resolvedLoteId = lote_id;
    if (!resolvedLoteId && lote_slug) {
      const [[lote]] = await pool.query(
        'SELECT id FROM lotes WHERE slug = ? LIMIT 1',
        [lote_slug]
      );
      if (!lote) {
        return res.status(404).setHeaders(corsHeaders()).json({ ok: false, error: 'Lote no encontrado' });
      }
      resolvedLoteId = lote.id;
    }

    if (tipo === 'HACER_OFERTA') {
      if (!precio_oferta) {
        return res.status(400).setHeaders(corsHeaders()).json({ ok: false, error: 'precio_oferta requerido' });
      }

      const [result] = await pool.query(`
        INSERT INTO ofertas
          (lote_id, empresa, email_contacto, pais_destino, precio_oferta, incoterm, volumen_sacos, mensaje, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
      `, [
        resolvedLoteId,
        empresa       || null,
        email_contacto|| null,
        pais_destino  || null,
        precio_oferta,
        incoterm      || 'FOB',
        volumen_sacos || null,
        mensaje       || null
      ]);

      // Actualizar estado del lote a 'ofertado'
      await pool.query(
        "UPDATE lotes SET estado = 'ofertado' WHERE id = ? AND estado = 'publicado'",
        [resolvedLoteId]
      );

      return res.status(201).setHeaders(corsHeaders()).json({
        ok: true,
        data: { oferta_id: result.insertId },
        message: 'Oferta recibida. Te contactaremos en menos de 24 horas.'
      });
    }

    if (tipo === 'SOLICITAR_MUESTRA') {
      const [result] = await pool.query(`
        INSERT INTO ofertas
          (lote_id, empresa, email_contacto, pais_destino, precio_oferta, incoterm, volumen_sacos, mensaje, estado)
        VALUES (?, ?, ?, ?, 0, 'EXW', 1, 'Solicitud de muestra (200g)', 'pendiente')
      `, [
        resolvedLoteId,
        empresa        || null,
        email_contacto || null,
        pais_destino   || null
      ]);

      return res.status(201).setHeaders(corsHeaders()).json({
        ok: true,
        data: { solicitud_id: result.insertId },
        message: 'Muestra solicitada. Te enviamos los detalles por email.'
      });
    }

    return res.status(400).setHeaders(corsHeaders()).json({
      ok: false,
      error: `tipo '${tipo}' no reconocido. Usar HACER_OFERTA o SOLICITAR_MUESTRA`
    });

  } catch (err) {
    console.error('[API /webhook-buyer]', err);
    return res.status(500).setHeaders(corsHeaders()).json({ ok: false, error: err.message });
  }
}
