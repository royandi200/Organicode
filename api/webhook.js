// api/webhook.js — Organicode Co-Pilot Caficultor
// Respuesta SIEMPRE: { ok, action, mensaje, data, error }
// Soporta tanto "action" como "acti@n" (BuilderBot AI)

import { query } from './_lib/db.js';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import Pusher from 'pusher';

// ── Helpers ──────────────────────────────────────────────

function getPusher() {
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET) return null;
  return new Pusher({ appId: PUSHER_APP_ID, key: PUSHER_KEY, secret: PUSHER_SECRET, cluster: PUSHER_CLUSTER || 'us2', useTLS: true });
}

function makeResponse(ok, action, mensaje, data = null, error = null) {
  return { ok, action: action || null, mensaje: mensaje || null, data, error: error || null };
}

function safeStr(val, max = 2000) {
  if (val === null || val === undefined) return null;
  try {
    const s = typeof val === 'string' ? val : JSON.stringify(val);
    // Eliminar caracteres fuera de BMP (emojis compuestos) para compatibilidad utf8mb3
    return s.replace(/[\uD800-\uDFFF]/g, '?').slice(0, max);
  } catch { return '[serialize error]'; }
}

function sanitizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  return digits.length >= 7 ? digits.slice(0, 20) : null;
}

// Extrae el primer JSON válido que tenga "action" O "acti@n"
function extractActionJSON(raw) {
  if (typeof raw !== 'string') return null;
  const matches = [];
  let depth = 0, start = -1;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '{') { if (depth === 0) start = i; depth++; }
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) { matches.push(raw.slice(start, i + 1)); start = -1; }
    }
  }
  for (const block of matches) {
    try {
      const parsed = JSON.parse(block);
      if (parsed['acti@n'] || parsed.action) return parsed;
    } catch { /* sigue */ }
  }
  return null;
}

// Normaliza el payload: unifica acti@n → action internamente
function normalizePayload(payload) {
  if (!payload) return null;
  if (payload['acti@n'] && !payload.action) {
    return { ...payload, action: payload['acti@n'] };
  }
  return payload;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

function generarHash(lote_id, caficultor_id, timestamp) {
  return createHash('sha256')
    .update(`${lote_id}:${caficultor_id}:${timestamp}`)
    .digest('hex');
}

function calcularPrecio(variedad, proceso, sca_score, precio_bolsa_usd = 2.50) {
  let base = precio_bolsa_usd * 2.2046;
  base += 0.30 + 0.10;

  const difVariedad = {
    'geisha': 10.00, 'bourbon rosado': 5.00, 'pink bourbon': 5.00,
    'wush wush': 4.50, 'colombia': 0.50, 'castillo': 0.30,
    'caturra': 0.20, 'tipica': 0.20, 'tabi': 1.50,
  };
  const varKey = (variedad || '').toLowerCase();
  for (const [k, v] of Object.entries(difVariedad)) {
    if (varKey.includes(k)) { base += v; break; }
  }

  const difProceso = {
    'natural': 0.80, 'honey': 0.50, 'anaerobico': 1.20,
    'anaeróbico': 1.20, 'lavado': 0,
  };
  const procKey = (proceso || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [k, v] of Object.entries(difProceso)) {
    if (procKey.includes(k)) { base += v; break; }
  }

  const sca = Number(sca_score) || 0;
  if (sca >= 90) base += 3.00;
  else if (sca >= 88) base += 1.50;
  else if (sca >= 86) base += 0.80;
  else if (sca >= 85) base += 0.30;

  return Math.round(base * 100) / 100;
}

// ── Logging ──────────────────────────────────────────────

async function saveLog({ from_number, action, raw_body, parsed_json, response, status_code, error, duration_ms }) {
  try {
    await query(
      `INSERT INTO webhook_logs
         (tipo, from_number, action, raw_body, parsed_json, response, status_code, error, duration_ms)
       VALUES ('caficultor', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safeStr(from_number, 50) || null,
        safeStr(action, 50)      || null,
        safeStr(raw_body, 2000),
        safeStr(parsed_json, 2000),
        safeStr(response, 4000),
        status_code != null ? Number(status_code) : 200,
        safeStr(error, 500)      || null,
        duration_ms != null ? Number(duration_ms) : null,
      ]
    );
  } catch (e) {
    // ⚠️ Log de emergencia — siempre visible en Vercel logs aunque falle la BD
    console.error('[webhook:saveLog:FAIL]', JSON.stringify({
      error:       e.message,
      action:      safeStr(action, 50),
      from_number: safeStr(from_number, 50),
      status_code,
      duration_ms,
      timestamp:   new Date().toISOString(),
    }));
  }
}

// ── Handler Principal ─────────────────────────────────────

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json(makeResponse(false, null, null, null, 'Method not allowed'));

  const startTime = Date.now();
  const rawBody   = req.body;

  // Log de entrada — siempre visible en Vercel aunque falle todo lo demás
  console.log('[webhook:IN]', JSON.stringify({
    keys:      rawBody ? Object.keys(rawBody) : 'no-body',
    bodyType:  typeof rawBody?.body,
    infoType:  typeof rawBody?.info,
    timestamp: new Date().toISOString(),
  }));

  const reply = async (statusCode, responseObj, logExtra = {}) => {
    const duration_ms = Date.now() - startTime;
    await saveLog({ ...logExtra, raw_body: rawBody, response: responseObj, status_code: statusCode, duration_ms });
    return res.status(statusCode).json(responseObj);
  };

  try {
    // ── Parsear payload: acepta "action" y "acti@n" ────────────────────
    let raw = null;
    if (typeof rawBody?.body === 'string')                raw = extractActionJSON(rawBody.body);
    if (!raw && typeof rawBody?.info === 'string')        raw = extractActionJSON(rawBody.info);
    if (!raw && (rawBody?.['acti@n'] || rawBody?.action)) raw = rawBody;
    if (!raw && typeof rawBody === 'string')              raw = extractActionJSON(rawBody);

    // Log de parsing — debug
    console.log('[webhook:PARSE]', JSON.stringify({
      found: !!raw,
      action: raw?.['acti@n'] || raw?.action || null,
    }));

    const payload = normalizePayload(raw);

    if (!payload) {
      return await reply(400,
        makeResponse(false, null, null, null, 'No se encontro accion valida en el mensaje'),
        { action: 'PARSE_ERROR', error: 'No JSON action found' }
      );
    }

    const { action, from, data = {} } = payload;
    const cleanFrom = sanitizePhone(from) || safeStr(from, 50);
    const logBase   = { action, from_number: cleanFrom, parsed_json: payload };

    if (!action) return await reply(400, makeResponse(false, null, null, null, 'Falta action / acti@n'), { error: 'Falta action' });

    // ══════════════════════════════════════════════════════════
    // 1. REGISTRAR_CAFICULTOR
    // ══════════════════════════════════════════════════════════
    if (action === 'REGISTRAR_CAFICULTOR') {
      const { nombre, finca, vereda, municipio, departamento, altitud_msnm, storytelling } = data;

      if (!nombre || !municipio) {
        return await reply(400,
          makeResponse(false, action, null, null, 'Faltan campos requeridos: nombre, municipio'),
          { ...logBase, error: 'Campos faltantes' }
        );
      }

      const existing = await query(
        'SELECT id, nombre FROM caficultores WHERE telefono_wa = ? LIMIT 1',
        [cleanFrom]
      );

      if (existing.length) {
        await query(
          `UPDATE caficultores SET nombre=?, finca=?, vereda=?, municipio=?, departamento=?,
           altitud_msnm=?, storytelling=?, updated_at=NOW() WHERE id=?`,
          [nombre, finca || null, vereda || null, municipio, departamento || 'Huila',
           altitud_msnm || null, storytelling || null, existing[0].id]
        );
        return await reply(200,
          makeResponse(true, action,
            `Datos actualizados, ${nombre}! Tu perfil en Organicode esta al dia.`,
            { caficultor_id: existing[0].id, nombre, municipio }
          ),
          logBase
        );
      }

      const newId = randomUUID();
      await query(
        `INSERT INTO caficultores (id, nombre, finca, vereda, municipio, departamento,
         altitud_msnm, telefono_wa, storytelling, activo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [newId, nombre, finca || null, vereda || null, municipio, departamento || 'Huila',
         altitud_msnm || null, cleanFrom, storytelling || null]
      );

      return await reply(200,
        makeResponse(true, action,
          `Bienvenido a Organicode, ${nombre}! Tu finca ${finca || municipio} ya esta registrada. Ahora puedes registrar tus lotes de cafe.`,
          { caficultor_id: newId, nombre, municipio }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // 2. REGISTRAR_LOTE
    // ══════════════════════════════════════════════════════════
    if (action === 'REGISTRAR_LOTE') {
      const { variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, fecha_cosecha } = data;

      if (!variedad || !proceso || !cantidad_kg) {
        return await reply(400,
          makeResponse(false, action, null, null, 'Faltan campos: variedad, proceso, cantidad_kg'),
          { ...logBase, error: 'Campos faltantes' }
        );
      }

      const caficultores = await query(
        'SELECT id, nombre, finca, municipio FROM caficultores WHERE telefono_wa = ? AND activo = 1 LIMIT 1',
        [cleanFrom]
      );

      if (!caficultores.length) {
        return await reply(404,
          makeResponse(false, action, null, null, 'No encontre tu perfil. Primero registrate.'),
          { ...logBase, error: 'Caficultor no encontrado' }
        );
      }

      const caficultor = caficultores[0];

      let precioBase = 2.50;
      try {
        const precioRows = await query('SELECT precio_ice_usd_lb FROM precios_bolsa ORDER BY timestamp DESC LIMIT 1');
        if (precioRows.length) precioBase = Number(precioRows[0].precio_ice_usd_lb);
      } catch (e) { /* usar default */ }

      const precio_calculado = calcularPrecio(variedad, proceso, sca_score, precioBase);

      const baseSlug  = slugify(`${variedad}-${caficultor.finca || caficultor.municipio}-${new Date().getFullYear()}`);
      const slugCheck = await query('SELECT COUNT(*) as cnt FROM lotes WHERE slug LIKE ?', [`${baseSlug}%`]);
      const suffix    = slugCheck[0].cnt > 0 ? `-${slugCheck[0].cnt + 1}` : '';
      const slug      = `${baseSlug}${suffix}`;

      const newId = randomUUID();
      await query(
        `INSERT INTO lotes (id, caficultor_id, slug, nombre, variedad, proceso, tipo_secado,
         cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, fecha_cosecha,
         precio_calculado, estado, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador', NOW(), NOW())`,
        [
          newId, caficultor.id, slug,
          `${variedad} ${caficultor.finca || caficultor.municipio}`,
          variedad, proceso, tipo_secado || null,
          Number(cantidad_kg), humedad || null, rendimiento || null,
          sca_score || null, notas_sensoriales || null,
          fecha_cosecha || null, precio_calculado
        ]
      );

      const sacos = Math.round(Number(cantidad_kg) / 70);
      return await reply(200,
        makeResponse(true, action,
          `Lote registrado! ${variedad} - ${proceso}. ${cantidad_kg}kg (~${sacos} sacos). Precio estimado: $${precio_calculado} USD/kg. Confirmas la publicacion?`,
          { lote_id: newId, slug, precio_calculado, caficultor_id: caficultor.id }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // 3. CONFIRMAR_PUBLICACION
    // ══════════════════════════════════════════════════════════
    if (action === 'CONFIRMAR_PUBLICACION') {
      const { lote_id } = data;

      if (!lote_id) {
        return await reply(400,
          makeResponse(false, action, null, null, 'Falta lote_id'),
          { ...logBase, error: 'Falta lote_id' }
        );
      }

      const lotes = await query(
        `SELECT l.id, l.variedad, l.slug, l.precio_calculado, l.caficultor_id, c.nombre
         FROM lotes l JOIN caficultores c ON l.caficultor_id = c.id
         WHERE l.id = ? AND c.telefono_wa = ? LIMIT 1`,
        [lote_id, cleanFrom]
      );

      if (!lotes.length) {
        return await reply(404,
          makeResponse(false, action, null, null, 'Lote no encontrado o no te pertenece.'),
          { ...logBase, error: 'Lote no encontrado' }
        );
      }

      const lote      = lotes[0];
      const timestamp = new Date().toISOString();
      const hash      = generarHash(lote.id, lote.caficultor_id, timestamp);
      const urlPublica = `${process.env.FRONTEND_URL || 'https://organicode.vercel.app'}/lote/${lote.slug}`;

      await query(
        `UPDATE lotes SET estado='publicado', hash_registro=?, fecha_cosecha=COALESCE(fecha_cosecha, CURDATE()), updated_at=NOW()
         WHERE id=?`,
        [hash, lote.id]
      );

      try {
        const pusher = getPusher();
        if (pusher) {
          await pusher.trigger('organicode-admin', 'lote-publicado', {
            lote_id: lote.id, slug: lote.slug, variedad: lote.variedad,
            caficultor: lote.nombre, precio: lote.precio_calculado, timestamp
          });
        }
      } catch (e) { console.warn('[webhook] Pusher skipped:', e.message); }

      return await reply(200,
        makeResponse(true, action,
          `Tu lote de ${lote.variedad} ya esta publicado! Comparte este link con compradores: ${urlPublica} | Autenticidad: #${hash.slice(0, 12).toUpperCase()}`,
          { lote_id: lote.id, slug: lote.slug, url: urlPublica, hash: hash.slice(0, 12) }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // 4. CONSULTAR_MIS_LOTES
    // ══════════════════════════════════════════════════════════
    if (action === 'CONSULTAR_MIS_LOTES') {
      const caficultores = await query(
        'SELECT id, nombre FROM caficultores WHERE telefono_wa = ? AND activo = 1 LIMIT 1',
        [cleanFrom]
      );

      if (!caficultores.length) {
        return await reply(404,
          makeResponse(false, action, null, null, 'No encontre tu perfil. Registrate primero.'),
          { ...logBase, error: 'Caficultor no encontrado' }
        );
      }

      const caficultor = caficultores[0];
      const lotes = await query(
        `SELECT id, slug, nombre, variedad, proceso, cantidad_kg, sca_score, precio_calculado, estado, created_at
         FROM lotes WHERE caficultor_id = ? AND estado != 'archivado'
         ORDER BY created_at DESC LIMIT 10`,
        [caficultor.id]
      );

      if (!lotes.length) {
        return await reply(200,
          makeResponse(true, action,
            `Hola ${caficultor.nombre}, aun no tienes lotes registrados. Empieza con tu primer lote!`,
            { caficultor: { nombre: caficultor.nombre }, lotes: [] }
          ),
          logBase
        );
      }

      const estadoTag = { borrador: '[borrador]', publicado: '[publicado]', ofertado: '[ofertado]', vendido: '[vendido]', archivado: '[archivado]' };
      const resumen = lotes.map((l, i) =>
        `${i + 1}. ${estadoTag[l.estado] || ''} ${l.variedad} - ${l.cantidad_kg}kg | $${l.precio_calculado}/kg | ${l.estado}`
      ).join('\n');

      return await reply(200,
        makeResponse(true, action,
          `Tus lotes, ${caficultor.nombre}:\n\n${resumen}`,
          { caficultor: { nombre: caficultor.nombre }, lotes }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // 5. CONSULTAR_PRECIO
    // ══════════════════════════════════════════════════════════
    if (action === 'CONSULTAR_PRECIO') {
      const { lote_id, variedad, proceso, sca_score } = data;

      if (lote_id) {
        const lotes = await query(
          `SELECT l.variedad, l.proceso, l.sca_score, l.precio_calculado, l.cantidad_kg
           FROM lotes l JOIN caficultores c ON l.caficultor_id = c.id
           WHERE l.id = ? AND c.telefono_wa = ? LIMIT 1`,
          [lote_id, cleanFrom]
        );
        if (!lotes.length) {
          return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado.'), { ...logBase, error: 'Lote no encontrado' });
        }
        const lote = lotes[0];
        return await reply(200,
          makeResponse(true, action,
            `Precio estimado: ${lote.variedad} | ${lote.proceso} | SCA: ${lote.sca_score || 'N/D'} pts | $${lote.precio_calculado} USD/kg FOB | Total: $${(lote.precio_calculado * lote.cantidad_kg).toFixed(0)} USD`,
            { precio_calculado: lote.precio_calculado, variedad: lote.variedad }
          ),
          logBase
        );
      }

      if (!variedad || !proceso) {
        return await reply(400, makeResponse(false, action, null, null, 'Falta lote_id o los campos variedad + proceso'), { ...logBase, error: 'Faltan datos' });
      }

      let precioBase = 2.50;
      try {
        const rows = await query('SELECT precio_ice_usd_lb FROM precios_bolsa ORDER BY timestamp DESC LIMIT 1');
        if (rows.length) precioBase = Number(rows[0].precio_ice_usd_lb);
      } catch (e) { /* default */ }

      const precio = calcularPrecio(variedad, proceso, sca_score, precioBase);
      return await reply(200,
        makeResponse(true, action,
          `Precio estimado para ${variedad} (${proceso}): $${precio} USD/kg FOB. Precio bolsa NY: $${precioBase}/lb. Diferencial Colombia + Huila incluido.`,
          { precio_calculado: precio, variedad, proceso, sca_score }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // 6. SUBIR_FOTO_LOTE
    // ══════════════════════════════════════════════════════════
    if (action === 'SUBIR_FOTO_LOTE') {
      const { lote_id, foto_url } = data;
      if (!lote_id || !foto_url) {
        return await reply(400, makeResponse(false, action, null, null, 'Faltan lote_id y foto_url'), { ...logBase, error: 'Faltan datos' });
      }
      const result = await query(
        `UPDATE lotes l JOIN caficultores c ON l.caficultor_id = c.id
         SET l.foto_url = ?, l.updated_at = NOW()
         WHERE l.id = ? AND c.telefono_wa = ?`,
        [foto_url, lote_id, cleanFrom]
      );
      if (!result.affectedRows) {
        return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado o no te pertenece.'), { ...logBase, error: 'Lote no encontrado' });
      }
      return await reply(200, makeResponse(true, action, 'Foto actualizada! La imagen ya aparece en la ficha de tu lote.', { lote_id, foto_url }), logBase);
    }

    // ══════════════════════════════════════════════════════════
    // 7. ACTUALIZAR_ESTADO_LOTE
    // ══════════════════════════════════════════════════════════
    if (action === 'ACTUALIZAR_ESTADO_LOTE') {
      const { lote_id, estado } = data;
      const estadosValidos = ['borrador', 'publicado', 'ofertado', 'vendido', 'archivado'];

      if (!lote_id || !estado || !estadosValidos.includes(estado)) {
        return await reply(400,
          makeResponse(false, action, null, null, `Estado invalido. Usa: ${estadosValidos.join(', ')}`),
          { ...logBase, error: 'Estado invalido' }
        );
      }

      const result = await query(
        `UPDATE lotes l JOIN caficultores c ON l.caficultor_id = c.id
         SET l.estado = ?, l.updated_at = NOW()
         WHERE l.id = ? AND c.telefono_wa = ?`,
        [estado, lote_id, cleanFrom]
      );

      if (!result.affectedRows) {
        return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado o no te pertenece.'), { ...logBase, error: 'Lote no encontrado' });
      }

      return await reply(200,
        makeResponse(true, action, `Estado del lote actualizado a ${estado}.`, { lote_id, estado }),
        logBase
      );
    }

    // ── Accion desconocida ─────────────────────────────────
    return await reply(400,
      makeResponse(false, action, null, null,
        `Accion desconocida: "${action}". Validas: REGISTRAR_CAFICULTOR, REGISTRAR_LOTE, CONFIRMAR_PUBLICACION, CONSULTAR_MIS_LOTES, CONSULTAR_PRECIO, SUBIR_FOTO_LOTE, ACTUALIZAR_ESTADO_LOTE`
      ),
      { ...logBase, error: `Accion desconocida: ${action}` }
    );

  } catch (err) {
    console.error('[webhook:ERROR]', err.message);
    const duration_ms = Date.now() - startTime;
    await saveLog({ raw_body: rawBody, error: err.message, status_code: 500, duration_ms });
    return res.status(500).json(makeResponse(false, null, null, null, err.message));
  }
};
