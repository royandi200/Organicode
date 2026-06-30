import { query, execute } from './_lib/db.js';
import Pusher from 'pusher';

// ── Pusher lazy-init ──────────────────────────────────────────────────────────
let _pusher = null;
function getPusher() {
  if (_pusher) return _pusher;
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET) return null;
  _pusher = new Pusher({
    appId:   PUSHER_APP_ID,
    key:     PUSHER_KEY,
    secret:  PUSHER_SECRET,
    cluster: PUSHER_CLUSTER || 'us2',
    useTLS:  true,
  });
  return _pusher;
}

async function notificar(canal, evento, datos) {
  try {
    const p = getPusher();
    if (p) await p.trigger(canal, evento, datos);
  } catch (e) {
    console.warn('[pusher] notificación fallida (no crítico):', e.message);
  }
}

// ── Helper: resolver slug → id ────────────────────────────────────────────────
async function resolveLoteId(lote_id, lote_slug) {
  if (lote_id) return lote_id;
  if (!lote_slug) return null;
  const rows = await query('SELECT id FROM lotes WHERE slug = ? LIMIT 1', [lote_slug]);
  return rows.length ? rows[0].id : null;
}

// ── Helper: lote con precio — JOIN caficultores para tener municipio ──────────
async function getLoteConPrecio(lote_id) {
  const rows = await query(`
    SELECT
      l.id, l.slug, l.nombre, l.variedad, l.proceso, l.cantidad_kg,
      l.sca_score, l.precio_calculado, l.estado, l.foto_url, l.notas_sensoriales,
      c.municipio, c.finca, c.nombre AS caficultor_nombre, c.altitud_msnm,
      p.precio_ice_kg, p.diferencial_col, p.diferencial_hui, p.diferencial_trace
    FROM lotes l
    JOIN caficultores c ON c.id = l.caficultor_id
    LEFT JOIN (
      SELECT precio_ice_kg, diferencial_col, diferencial_hui, diferencial_trace
      FROM precios_bolsa ORDER BY created_at DESC LIMIT 1
    ) p ON 1=1
    WHERE l.id = ?
  `, [lote_id]);
  return rows[0] || null;
}

// ── Helper: calcular precio — Number() explícito para strings de MySQL ────────
function calcularPrecioLote(lote, precio) {
  const iceKg  = Number(precio?.precio_ice_kg)    || 4.80;
  const dCol   = (Number(precio?.diferencial_col)  || 0.40) * 2.2046;
  const dHui   = (Number(precio?.diferencial_hui)  || 0.10) * 2.2046;
  const dTrace = Number(precio?.diferencial_trace) || 0.50;

  const scaScore = Number(lote.sca_score) || 84;
  const scaPrima = scaScore >= 90 ? 20
                 : scaScore >= 88 ? 12
                 : scaScore >= 86 ? 6
                 : scaScore >= 84 ? 2
                 : 0;

  const base   = iceKg + dCol + dHui + dTrace;
  const exw    = base + scaPrima;
  const fob    = +(exw + 0.77).toFixed(2);
  const cif_eu = +(exw + 1.97).toFixed(2);

  return { exw: +exw.toFixed(2), fob, cif_eu, base: +base.toFixed(2), sca_prima: scaPrima };
}

// ══ HANDLER PRINCIPAL ══════════════════════════════════════════════════
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ ok: false, error: 'Método no permitido' });

  const {
    tipo,
    telefono, nombre_contacto, empresa, email_contacto, pais, cargo, volumen_estimado_kg,
    lote_id, lote_slug,
    precio_oferta, incoterm, volumen_sacos, mensaje,
    direccion_entrega, ciudad_destino, pais_destino, zip_code,
    variedad, proceso, sca_min, precio_max_usd,
    nivel_interes,
  } = req.body;

  if (!tipo) return res.status(400).json({ ok: false, error: 'Campo "tipo" es requerido' });

  try {

    // ── 1. REGISTRAR_COMPRADOR ───────────────────────────────────────────────────────────
    if (tipo === 'REGISTRAR_COMPRADOR') {
      if (!telefono) return res.status(400).json({ ok: false, error: 'telefono requerido' });

      const existe = await query(
        'SELECT id, nombre_contacto FROM compradores WHERE telefono_wa = ? LIMIT 1',
        [telefono]
      );
      if (existe.length) {
        return res.status(200).json({
          ok: true,
          data: { comprador_id: existe[0].id, es_nuevo: false },
          message: `¡Hola de nuevo, ${existe[0].nombre_contacto}! Tu perfil ya está activo en Organicode. 🌿`,
        });
      }

      const result = await execute(
        `INSERT INTO compradores
           (telefono_wa, nombre_contacto, empresa, email_contacto, pais, cargo, volumen_estimado_kg, lead_score, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'WARM', NOW())`,
        [telefono, nombre_contacto || null, empresa || null, email_contacto || null,
         pais || null, cargo || null, volumen_estimado_kg || null]
      );
      await notificar('organicode-admin', 'nuevo-comprador', {
        comprador_id: result.insertId, nombre: nombre_contacto, empresa, pais,
        timestamp: new Date().toISOString(),
      });
      return res.status(201).json({
        ok: true,
        data: { comprador_id: result.insertId, es_nuevo: true },
        message: `¡Bienvenido a Organicode, ${nombre_contacto || 'amigo/a'}! 🎉\nTu acceso al catálogo de café de especialidad colombiano está listo.\nEscribe *CATALOGO* para explorar los lotes disponibles.`,
      });
    }

    // ── 2. CONSULTAR_CATALOGO ──────────────────────────────────────────────────────────
    if (tipo === 'CONSULTAR_CATALOGO') {
      let sql = `
        SELECT
          l.id, l.slug, l.nombre, l.variedad, l.proceso,
          l.cantidad_kg, l.sca_score, l.precio_calculado, l.estado,
          l.foto_url, l.notas_sensoriales,
          c.municipio, c.finca
        FROM lotes l
        JOIN caficultores c ON c.id = l.caficultor_id
        WHERE l.estado IN ('publicado', 'ofertado')
      `;
      const params = [];

      if (variedad)       { sql += ' AND LOWER(l.variedad) LIKE ?'; params.push(`%${variedad.toLowerCase()}%`); }
      if (proceso)        { sql += ' AND LOWER(l.proceso)  LIKE ?'; params.push(`%${proceso.toLowerCase()}%`); }
      if (sca_min)        { sql += ' AND l.sca_score >= ?';         params.push(parseFloat(sca_min)); }
      if (precio_max_usd) { sql += ' AND l.precio_calculado <= ?'; params.push(parseFloat(precio_max_usd)); }

      sql += ' ORDER BY l.sca_score DESC LIMIT 10';

      const lotes = await query(sql, params);

      if (!lotes.length) {
        return res.status(200).json({
          ok: true, data: [],
          message: 'No encontramos lotes con esos filtros ahora mismo. Escribe *CATALOGO* sin filtros para ver todos los disponibles.',
        });
      }

      const resumen = lotes.map(l =>
        `☕ *${l.variedad} ${l.proceso}* — ${l.municipio || l.finca}\n` +
        `   SCA: ${l.sca_score} pts | $${l.precio_calculado} USD/kg FOB\n` +
        `   ${l.cantidad_kg} kg disponibles\n` +
        `   👉 Ver ficha: https://organicode.lovable.app/lote/${l.slug}`
      ).join('\n\n');

      return res.status(200).json({
        ok: true,
        data: lotes,
        message: `🌿 *${lotes.length} lotes disponibles en Organicode:*\n\n${resumen}\n\n_Escribe el nombre de la variedad para ver el precio detallado o haz una oferta._`,
      });
    }

    // resolver lote_id para acciones siguientes
    const resolvedLoteId = await resolveLoteId(lote_id, lote_slug);

    // ── 3. CONSULTAR_PRECIO_LOTE ───────────────────────────────────────────────────────
    if (tipo === 'CONSULTAR_PRECIO_LOTE') {
      if (!resolvedLoteId) return res.status(400).json({ ok: false, error: 'lote_id o lote_slug requerido' });
      const lote = await getLoteConPrecio(resolvedLoteId);
      if (!lote) return res.status(404).json({ ok: false, error: 'Lote no encontrado' });
      const precios = calcularPrecioLote(lote, lote);
      return res.status(200).json({
        ok: true,
        data: { lote_slug: lote.slug, variedad: lote.variedad, proceso: lote.proceso, sca_score: lote.sca_score, precios },
        message:
          `💰 *Precio detallado — ${lote.variedad} ${lote.proceso}*\n\n` +
          `📊 Base ICE NY + diferenciales: $${precios.base} USD/kg\n` +
          `⭐ Prima SCA (${lote.sca_score} pts): +$${precios.sca_prima} USD/kg\n` +
          `─────────────────────────────\n` +
          `• EXW finca:       $${precios.exw} USD/kg\n` +
          `• FOB Cartagena:   $${precios.fob} USD/kg ✅\n` +
          `• CIF Europa:      $${precios.cif_eu} USD/kg\n\n` +
          `_Precios actualizados con Bolsa ICE NY en tiempo real._`,
      });
    }

    // ── 4. HACER_OFERTA ─────────────────────────────────────────────────────────────────
    if (tipo === 'HACER_OFERTA') {
      if (!resolvedLoteId) return res.status(400).json({ ok: false, error: 'lote_id o lote_slug requerido' });
      if (!precio_oferta)  return res.status(400).json({ ok: false, error: 'precio_oferta requerido' });

      const lote = await getLoteConPrecio(resolvedLoteId);
      if (!lote) return res.status(404).json({ ok: false, error: 'Lote no encontrado' });

      const precios   = calcularPrecioLote(lote, lote);
      const precioMin = precios.fob * 0.90;
      const ofertaNum = parseFloat(precio_oferta);

      if (ofertaNum < precioMin) {
        return res.status(422).json({
          ok: false,
          error: 'oferta_bajo_minimo',
          data: { precio_min_aceptable: +precioMin.toFixed(2), precio_ofertado: ofertaNum },
          message:
            `⚠️ Tu oferta de $${ofertaNum} USD/kg está por debajo del precio mínimo aceptable.\n\n` +
            `El precio FOB actual de este lote es $${precios.fob} USD/kg.\n` +
            `El mínimo que podemos considerar es *$${precioMin.toFixed(2)} USD/kg*.`,
        });
      }

      const result = await execute(
        `INSERT INTO ofertas
           (lote_id, empresa, email_contacto, pais_destino, precio_oferta,
            incoterm, volumen_sacos, mensaje, estado, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())`,
        [resolvedLoteId, empresa || null, email_contacto || null, pais_destino || pais || null,
         ofertaNum, incoterm || 'FOB', volumen_sacos || null, mensaje || null]
      );
      await execute(
        "UPDATE lotes SET estado = 'ofertado' WHERE id = ? AND estado = 'publicado'",
        [resolvedLoteId]
      );
      await notificar('organicode-admin', 'nueva-oferta', {
        oferta_id: result.insertId, lote_slug: lote.slug, variedad: lote.variedad,
        empresa: empresa || 'No especificada', precio_oferta: ofertaNum,
        incoterm: incoterm || 'FOB', volumen_sacos,
        pais_destino: pais_destino || pais || 'No especificado',
        timestamp: new Date().toISOString(),
      });
      return res.status(201).json({
        ok: true,
        data: { oferta_id: result.insertId, precio_aceptado: ofertaNum },
        message:
          `✅ *¡Oferta recibida!*\n\n` +
          `Lote: ${lote.variedad} ${lote.proceso}\n` +
          `Tu precio: $${ofertaNum} USD/kg ${incoterm || 'FOB'}\n` +
          `Volumen: ${volumen_sacos || '?'} sacos\n\n` +
          `Nuestro equipo revisará tu oferta en menos de *24 horas hábiles*.\n` +
          `ID de oferta: #${result.insertId}`,
      });
    }

    // ── 5. SOLICITAR_MUESTRA ───────────────────────────────────────────────────────────
    if (tipo === 'SOLICITAR_MUESTRA') {
      if (!resolvedLoteId) return res.status(400).json({ ok: false, error: 'lote_id o lote_slug requerido' });

      const lote = await query(
        'SELECT id, slug, variedad, proceso, estado FROM lotes WHERE id = ? LIMIT 1',
        [resolvedLoteId]
      );
      if (!lote.length) return res.status(404).json({ ok: false, error: 'Lote no encontrado' });
      if (lote[0].estado === 'vendido') return res.status(409).json({ ok: false, error: 'Este lote ya fue vendido.' });

      const result = await execute(
        `INSERT INTO solicitudes_muestra
           (lote_id, empresa, email_contacto, nombre_contacto, telefono_wa,
            direccion_entrega, ciudad_destino, pais_destino, zip_code,
            peso_gr, estado, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 200, 'pendiente', NOW())`,
        [resolvedLoteId, empresa || null, email_contacto || null, nombre_contacto || null,
         telefono || null, direccion_entrega || null, ciudad_destino || null,
         pais_destino || pais || null, zip_code || null]
      );
      await notificar('organicode-admin', 'nueva-muestra', {
        solicitud_id: result.insertId, lote_slug: lote[0].slug, variedad: lote[0].variedad,
        empresa: empresa || 'No especificada',
        pais_destino: pais_destino || pais || 'No especificado',
        ciudad: ciudad_destino, timestamp: new Date().toISOString(),
      });
      return res.status(201).json({
        ok: true,
        data: { solicitud_id: result.insertId },
        message:
          `📦 *¡Muestra solicitada!*\n\n` +
          `Lote: ${lote[0].variedad} ${lote[0].proceso || ''}\n` +
          `Peso: 200g | Destino: ${ciudad_destino || pais_destino || pais || 'Por confirmar'}\n\n` +
          `Recibirás el número de guía en máximo *3 días hábiles*.`,
      });
    }

    // ── 6. CONSULTAR_MIS_OFERTAS ─────────────────────────────────────────────────────
    if (tipo === 'CONSULTAR_MIS_OFERTAS') {
      if (!telefono && !email_contacto) {
        return res.status(400).json({ ok: false, error: 'telefono o email_contacto requerido' });
      }
      const filter = telefono
        ? 'o.empresa IN (SELECT empresa FROM compradores WHERE telefono_wa = ? LIMIT 1)'
        : 'o.email_contacto = ?';
      const ofertas = await query(`
        SELECT o.id, o.precio_oferta, o.incoterm, o.volumen_sacos, o.estado, o.created_at,
               l.slug, l.variedad, l.proceso, l.sca_score
        FROM ofertas o
        JOIN lotes l ON l.id = o.lote_id
        WHERE ${filter}
        ORDER BY o.created_at DESC LIMIT 10
      `, [telefono || email_contacto]);

      if (!ofertas.length) {
        return res.status(200).json({
          ok: true, data: [],
          message: 'Aún no tienes ofertas registradas. Escribe *CATALOGO* para explorar los lotes disponibles.',
        });
      }
      const estadoEmoji = { pendiente: '🟡', aceptada: '✅', rechazada: '❌', negociando: '🔄' };
      const lista = ofertas.map(o =>
        `${estadoEmoji[o.estado] || '⬜'} *Oferta #${o.id}* — ${o.variedad} ${o.proceso}\n` +
        `   $${o.precio_oferta} USD/kg ${o.incoterm} | ${o.volumen_sacos || '?'} sacos | ${o.estado.toUpperCase()}`
      ).join('\n\n');
      return res.status(200).json({
        ok: true, data: ofertas,
        message: `📋 *Tus últimas ofertas en Organicode:*\n\n${lista}`,
      });
    }

    // ── 7. CONFIRMAR_INTERES ───────────────────────────────────────────────────────────
    if (tipo === 'CONFIRMAR_INTERES') {
      if (!telefono) return res.status(400).json({ ok: false, error: 'telefono requerido' });
      await execute(
        `UPDATE compradores SET lead_score = 'HOT', nivel_interes = ?, updated_at = NOW() WHERE telefono_wa = ?`,
        [nivel_interes || 'alto', telefono]
      );
      const comprador = await query(
        'SELECT id, nombre_contacto, empresa, pais FROM compradores WHERE telefono_wa = ? LIMIT 1',
        [telefono]
      );
      const loteInfo = resolvedLoteId
        ? await query('SELECT slug, variedad, proceso, precio_calculado FROM lotes WHERE id = ? LIMIT 1', [resolvedLoteId])
        : [];
      await notificar('organicode-admin', 'lead-hot', {
        comprador_id: comprador[0]?.id, nombre: comprador[0]?.nombre_contacto,
        empresa: comprador[0]?.empresa, pais: comprador[0]?.pais,
        lote_slug: loteInfo[0]?.slug, variedad: loteInfo[0]?.variedad,
        telefono, timestamp: new Date().toISOString(),
      });
      return res.status(200).json({
        ok: true, data: { lead_score: 'HOT' },
        message:
          `🔥 *¡Perfecto! Tu interés ha quedado registrado.*\n\n` +
          `Un especialista te contactará en las próximas *2 horas*.\n` +
          `https://organicode.lovable.app/lote/${loteInfo[0]?.slug || ''}`,
      });
    }

    // ── Acción no reconocida ───────────────────────────────────────────────────
    return res.status(400).json({
      ok: false,
      error: `Acción '${tipo}' no reconocida`,
      acciones_disponibles: [
        'REGISTRAR_COMPRADOR','CONSULTAR_CATALOGO','CONSULTAR_PRECIO_LOTE',
        'HACER_OFERTA','SOLICITAR_MUESTRA','CONSULTAR_MIS_OFERTAS','CONFIRMAR_INTERES',
      ],
    });

  } catch (err) {
    console.error('[webhook-buyer] error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
