// api/webhook.js — Organicode Co-Pilot Caficultor (A2)
// Patrón idéntico a bardj-ai/api/webhook.js
// Respuesta SIEMPRE: { ok, action, mensaje, data, error }

import { query } from './_lib/db.js';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import Pusher from 'pusher';

// ── Helpers ────────────────────────────────────────────────

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
    return s.slice(0, max);
  } catch { return '[serialize error]'; }
}

function sanitizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  return digits.length >= 7 ? digits.slice(0, 20) : null;
}

// Extrae el primer JSON válido con campo "action" del texto del mensaje
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
      if (parsed.action) return parsed;
    } catch { /* sigue */ }
  }
  return null;
}

// Genera slug URL-friendly desde texto
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

// SHA-256 para hash de trazabilidad
function generarHash(lote_id, caficultor_id, timestamp) {
  return createHash('sha256')
    .update(`${lote_id}:${caficultor_id}:${timestamp}`)
    .digest('hex');
}

// Calcula precio estimado por variedad + proceso + sca_score
function calcularPrecio(variedad, proceso, sca_score, precio_bolsa_usd = 2.50) {
  // Base: precio ICE × 2.2046 (lb → kg)
  let base = precio_bolsa_usd * 2.2046;

  // Diferencial Colombia + Huila
  base += 0.30 + 0.10;

  // Diferencial por variedad
  const difVariedad = {
    'geisha': 10.00, 'bourbon rosado': 5.00, 'pink bourbon': 5.00,
    'wush wush': 4.50, 'colombia': 0.50, 'castillo': 0.30,
    'caturra': 0.20, 'típica': 0.20, 'tabi': 1.50,
  };
  const varKey = (variedad || '').toLowerCase();
  for (const [k, v] of Object.entries(difVariedad)) {
    if (varKey.includes(k)) { base += v; break; }
  }

  // Diferencial por proceso
  const difProceso = {
    'natural': 0.80, 'honey': 0.50, 'anaeróbico': 1.20,
    'anaerobico': 1.20, 'lavado': 0,
  };
  const procKey = (proceso || '').toLowerCase();
  for (const [k, v] of Object.entries(difProceso)) {
    if (procKey.includes(k)) { base += v; break; }
  }

  // Bono SCA
  const sca = Number(sca_score) || 0;
  if (sca >= 90) base += 3.00;
  else if (sca >= 88) base += 1.50;
  else if (sca >= 86) base += 0.80;
  else if (sca >= 85) base += 0.30;

  return Math.round(base * 100) / 100;
}

// ── Logging ────────────────────────────────────────────────

async function saveLog({ from_number, action, raw_body, parsed_json, response, status_code, error, duration_ms }) {
  try {
    await query(
      `INSERT INTO webhook_logs (tipo, from_number, action, raw_body, parsed_json, response, status_code, error, duration_ms)
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
    console.error('[webhook] saveLog error:', e.message);
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

  const reply = async (statusCode, responseObj, logExtra = {}) => {
    const duration_ms = Date.now() - startTime;
    await saveLog({ ...logExtra, raw_body: rawBody, response: responseObj, status_code: statusCode, duration_ms });
    return res.status(statusCode).json(responseObj);
  };

  try {
    // Parsear payload — mismo patrón que bardj-ai
    let payload = null;
    if (typeof rawBody?.body === 'string')                    payload = extractActionJSON(rawBody.body);
    if (!payload && typeof rawBody?.info === 'string')        payload = extractActionJSON(rawBody.info);
    if (!payload && rawBody?.action)                          payload = rawBody;
    if (!payload && typeof rawBody === 'string')              payload = extractActionJSON(rawBody);

    if (!payload) {
      return await reply(400,
        makeResponse(false, null, null, null, 'No se encontró acción válida en el mensaje'),
        { action: 'PARSE_ERROR', error: 'No JSON action found' }
      );
    }

    const { action, from, data = {} } = payload;
    const cleanFrom = sanitizePhone(from) || safeStr(from, 50);
    const logBase   = { action, from_number: cleanFrom, parsed_json: payload };

    if (!action) return await reply(400, makeResponse(false, null, null, null, 'Falta action'), { error: 'Falta action' });

    // ══════════════════════════════════════════════════════════
    // A1. REGISTRAR_CAFICULTOR
    // Registra o actualiza datos del caficultor por número WhatsApp
    // ══════════════════════════════════════════════════════════
    if (action === 'REGISTRAR_CAFICULTOR') {
      const { nombre, finca, vereda, municipio, departamento, altitud_msnm, storytelling } = data;

      if (!nombre || !municipio) {
        return await reply(400,
          makeResponse(false, action, null, null, 'Faltan campos requeridos: nombre, municipio'),
          { ...logBase, error: 'Campos faltantes' }
        );
      }

      // Verificar si ya existe por teléfono
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
            `✅ Datos actualizados, ${nombre}! Tu perfil en Organicode está al día.`,
            { caficultor_id: existing[0].id, nombre, municipio }
          ),
          logBase
        );
      }

      // Crear nuevo caficultor
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
          `🌿 ¡Bienvenido a Organicode, ${nombre}! Tu finca *${finca || municipio}* ya está registrada.\n\nAhora puedes registrar tus lotes de café con el comando REGISTRAR_LOTE.`,
          { caficultor_id: newId, nombre, municipio }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // A2. REGISTRAR_LOTE
    // Registra un nuevo lote en estado borrador
    // ══════════════════════════════════════════════════════════
    if (action === 'REGISTRAR_LOTE') {
      const { variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, fecha_cosecha } = data;

      if (!variedad || !proceso || !cantidad_kg) {
        return await reply(400,
          makeResponse(false, action, null, null, 'Faltan campos: variedad, proceso, cantidad_kg'),
          { ...logBase, error: 'Campos faltantes' }
        );
      }

      // Identificar caficultor por teléfono
      const caficultores = await query(
        'SELECT id, nombre, finca, municipio FROM caficultores WHERE telefono_wa = ? AND activo = 1 LIMIT 1',
        [cleanFrom]
      );

      if (!caficultores.length) {
        return await reply(404,
          makeResponse(false, action, null, null,
            '❌ No encontré tu perfil. Primero regístrate con REGISTRAR_CAFICULTOR.'
          ),
          { ...logBase, error: 'Caficultor no encontrado' }
        );
      }

      const caficultor = caficultores[0];

      // Calcular precio estimado
      let precioBase = 2.50; // USD/lb ICE — usar precio dinámico cuando esté el cron
      try {
        const precioRows = await query(
          'SELECT precio_ice_usd_lb FROM precios_bolsa ORDER BY timestamp DESC LIMIT 1'
        );
        if (precioRows.length) precioBase = Number(precioRows[0].precio_ice_usd_lb);
      } catch (e) { /* usar default */ }

      const precio_calculado = calcularPrecio(variedad, proceso, sca_score, precioBase);

      // Generar slug único
      const baseSlug = slugify(`${variedad}-${caficultor.finca || caficultor.municipio}-${new Date().getFullYear()}`);
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
          `☕ Lote registrado!\n\n*${variedad}* — ${proceso}\n📦 ${cantidad_kg} kg (~${sacos} sacos)\n💰 Precio estimado: *$${precio_calculado} USD/kg*\n\n¿Confirmas la publicación? Responde con CONFIRMAR_PUBLICACION o guarda como borrador.`,
          { lote_id: newId, slug, precio_calculado, caficultor_id: caficultor.id }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // A3. CONFIRMAR_PUBLICACION
    // Cambia estado del lote de borrador → publicado y genera hash
    // ══════════════════════════════════════════════════════════
    if (action === 'CONFIRMAR_PUBLICACION') {
      const { lote_id } = data;

      if (!lote_id) {
        return await reply(400,
          makeResponse(false, action, null, null, 'Falta lote_id'),
          { ...logBase, error: 'Falta lote_id' }
        );
      }

      // Verificar que el lote pertenece al caficultor
      const lotes = await query(
        `SELECT l.id, l.variedad, l.slug, l.precio_calculado, l.caficultor_id, c.nombre
         FROM lotes l JOIN caficultores c ON l.caficultor_id = c.id
         WHERE l.id = ? AND c.telefono_wa = ? LIMIT 1`,
        [lote_id, cleanFrom]
      );

      if (!lotes.length) {
        return await reply(404,
          makeResponse(false, action, null, null, '❌ Lote no encontrado o no te pertenece.'),
          { ...logBase, error: 'Lote no encontrado' }
        );
      }

      const lote = lotes[0];
      const timestamp  = new Date().toISOString();
      const hash       = generarHash(lote.id, lote.caficultor_id, timestamp);
      const urlPublica = `${process.env.FRONTEND_URL || 'https://organicode.app'}/lote/${lote.slug}`;

      await query(
        `UPDATE lotes SET estado='publicado', hash_registro=?, fecha_cosecha=COALESCE(fecha_cosecha, CURDATE()), updated_at=NOW()
         WHERE id=?`,
        [hash, lote.id]
      );

      // Notificar dashboard admin por Pusher
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
          `🚀 ¡Tu lote de *${lote.variedad}* ya está publicado!\n\n🔗 Comparte este link con compradores:\n${urlPublica}\n\n🔒 Registro de autenticidad: #${hash.slice(0, 12).toUpperCase()}`,
          { lote_id: lote.id, slug: lote.slug, url: urlPublica, hash: hash.slice(0, 12) }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // A4. CONSULTAR_MIS_LOTES
    // Retorna lotes activos del caficultor
    // ══════════════════════════════════════════════════════════
    if (action === 'CONSULTAR_MIS_LOTES') {
      const caficultores = await query(
        'SELECT id, nombre FROM caficultores WHERE telefono_wa = ? AND activo = 1 LIMIT 1',
        [cleanFrom]
      );

      if (!caficultores.length) {
        return await reply(404,
          makeResponse(false, action, null, null, '❌ No encontré tu perfil. Regístrate primero con REGISTRAR_CAFICULTOR.'),
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
            `Hola ${caficultor.nombre}, aún no tienes lotes registrados. Usa REGISTRAR_LOTE para comenzar. ☕`,
            []
          ),
          logBase
        );
      }

      const estadoEmoji = { borrador: '📝', publicado: '✅', ofertado: '🤝', vendido: '💰', archivado: '📦' };
      const resumen = lotes.map((l, i) =>
        `${i + 1}. ${estadoEmoji[l.estado] || '•'} *${l.variedad}* — ${l.cantidad_kg}kg\n   $${l.precio_calculado}/kg · ${l.estado}`
      ).join('\n\n');

      return await reply(200,
        makeResponse(true, action,
          `☕ *Tus lotes, ${caficultor.nombre}:*\n\n${resumen}`,
          lotes
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // A5. CONSULTAR_PRECIO
    // Retorna precio actual del lote con desglose
    // ══════════════════════════════════════════════════════════
    if (action === 'CONSULTAR_PRECIO') {
      const { lote_id, variedad, proceso, sca_score } = data;

      // Si mandan lote_id, buscar en BD
      if (lote_id) {
        const lotes = await query(
          `SELECT l.variedad, l.proceso, l.sca_score, l.precio_calculado, l.cantidad_kg
           FROM lotes l JOIN caficultores c ON l.caficultor_id = c.id
           WHERE l.id = ? AND c.telefono_wa = ? LIMIT 1`,
          [lote_id, cleanFrom]
        );
        if (!lotes.length) {
          return await reply(404,
            makeResponse(false, action, null, null, '❌ Lote no encontrado.'),
            { ...logBase, error: 'Lote no encontrado' }
          );
        }
        const lote = lotes[0];
        return await reply(200,
          makeResponse(true, action,
            `💰 *Precio estimado tu lote:*\n\nVariedad: ${lote.variedad}\nProceso: ${lote.proceso}\nSCA: ${lote.sca_score || 'N/D'} pts\n\n*$${lote.precio_calculado} USD/kg FOB*\n_(${lote.cantidad_kg}kg = $${(lote.precio_calculado * lote.cantidad_kg).toFixed(0)} USD total estimado)_`,
            { precio_calculado: lote.precio_calculado, variedad: lote.variedad }
          ),
          logBase
        );
      }

      // Calcular precio sobre la marcha sin lote_id
      if (!variedad || !proceso) {
        return await reply(400,
          makeResponse(false, action, null, null, 'Falta lote_id o los campos variedad + proceso'),
          { ...logBase, error: 'Faltan datos' }
        );
      }

      let precioBase = 2.50;
      try {
        const rows = await query('SELECT precio_ice_usd_lb FROM precios_bolsa ORDER BY timestamp DESC LIMIT 1');
        if (rows.length) precioBase = Number(rows[0].precio_ice_usd_lb);
      } catch (e) { /* default */ }

      const precio = calcularPrecio(variedad, proceso, sca_score, precioBase);
      return await reply(200,
        makeResponse(true, action,
          `💰 Precio estimado para *${variedad}* (${proceso}):\n\n*$${precio} USD/kg FOB*\n\nPrecio bolsa NY: $${precioBase}/lb\nDiferencial Colombia + Huila incluido.`,
          { precio_calculado: precio, variedad, proceso, sca_score }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // A6. SUBIR_FOTO_LOTE
    // Actualiza foto_url del lote
    // ══════════════════════════════════════════════════════════
    if (action === 'SUBIR_FOTO_LOTE') {
      const { lote_id, foto_url } = data;

      if (!lote_id || !foto_url) {
        return await reply(400,
          makeResponse(false, action, null, null, 'Faltan lote_id y foto_url'),
          { ...logBase, error: 'Faltan datos' }
        );
      }

      const result = await query(
        `UPDATE lotes l JOIN caficultores c ON l.caficultor_id = c.id
         SET l.foto_url = ?, l.updated_at = NOW()
         WHERE l.id = ? AND c.telefono_wa = ?`,
        [foto_url, lote_id, cleanFrom]
      );

      if (!result.affectedRows) {
        return await reply(404,
          makeResponse(false, action, null, null, '❌ Lote no encontrado o no te pertenece.'),
          { ...logBase, error: 'Lote no encontrado' }
        );
      }

      return await reply(200,
        makeResponse(true, action,
          '📸 ¡Foto actualizada! La imagen ya aparece en la ficha de tu lote.',
          { lote_id, foto_url }
        ),
        logBase
      );
    }

    // ══════════════════════════════════════════════════════════
    // A7. ACTUALIZAR_ESTADO_LOTE
    // Cambia estado: borrador→publicado, publicado→archivado, etc.
    // ══════════════════════════════════════════════════════════
    if (action === 'ACTUALIZAR_ESTADO_LOTE') {
      const { lote_id, estado } = data;
      const estadosValidos = ['borrador', 'publicado', 'ofertado', 'vendido', 'archivado'];

      if (!lote_id || !estado || !estadosValidos.includes(estado)) {
        return await reply(400,
          makeResponse(false, action, null, null, `Estado inválido. Usa: ${estadosValidos.join(', ')}`),
          { ...logBase, error: 'Estado inválido' }
        );
      }

      const result = await query(
        `UPDATE lotes l JOIN caficultores c ON l.caficultor_id = c.id
         SET l.estado = ?, l.updated_at = NOW()
         WHERE l.id = ? AND c.telefono_wa = ?`,
        [estado, lote_id, cleanFrom]
      );

      if (!result.affectedRows) {
        return await reply(404,
          makeResponse(false, action, null, null, '❌ Lote no encontrado o no te pertenece.'),
          { ...logBase, error: 'Lote no encontrado' }
        );
      }

      return await reply(200,
        makeResponse(true, action,
          `✅ Estado del lote actualizado a *${estado}*.`,
          { lote_id, estado }
        ),
        logBase
      );
    }

    // ── Acción desconocida ─────────────────────────────────
    return await reply(400,
      makeResponse(false, action, null, null, `Acción desconocida: "${action}". Acciones válidas: REGISTRAR_CAFICULTOR, REGISTRAR_LOTE, CONFIRMAR_PUBLICACION, CONSULTAR_MIS_LOTES, CONSULTAR_PRECIO, SUBIR_FOTO_LOTE, ACTUALIZAR_ESTADO_LOTE`),
      { ...logBase, error: `Acción desconocida: ${action}` }
    );

  } catch (err) {
    console.error('[webhook]', err.message);
    const duration_ms = Date.now() - startTime;
    await saveLog({ raw_body: rawBody, error: err.message, status_code: 500, duration_ms });
    return res.status(500).json(makeResponse(false, null, null, null, err.message));
  }
};
