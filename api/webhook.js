// api/webhook.js — Organicode Emilio v2.0
// Caficultores + Compradores — estructura única
// Respuesta SIEMPRE: { ok, action, mensaje, data, error }
// Soporta "action" y "acti@n" (BuilderBot AI)

import { query } from './_lib/db.js';
import { randomUUID, createHash } from 'crypto';
import Pusher from 'pusher';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS GENERALES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getPusher() {
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET) return null;
  return new Pusher({ appId: PUSHER_APP_ID, key: PUSHER_KEY, secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER || 'us2', useTLS: true });
}

function makeResponse(ok, action, mensaje, data = null, error = null) {
  return { ok, action: action || null, mensaje: mensaje || null, data, error: error || null };
}

function safeStr(val, max = 2000) {
  if (val === null || val === undefined) return null;
  try {
    const s = typeof val === 'string' ? val : JSON.stringify(val);
    return s.replace(/[\uD800-\uDFFF]/g, '?').slice(0, max);
  } catch { return '[serialize error]'; }
}

function sanitizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  return digits.length >= 7 ? digits.slice(0, 20) : null;
}

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
    } catch { /* continúa */ }
  }
  return null;
}

function normalizePayload(payload) {
  if (!payload) return null;
  if (payload['acti@n'] && !payload.action) return { ...payload, action: payload['acti@n'] };
  return payload;
}

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100);
}

function generarHash(lote_id, caficultor_id, timestamp) {
  return createHash('sha256').update(`${lote_id}:${caficultor_id}:${timestamp}`).digest('hex');
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
  const difProceso = { 'natural': 0.80, 'honey': 0.50, 'anaerobico': 1.20, 'anaeróbico': 1.20, 'lavado': 0 };
  const procKey = (proceso || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS COMPRADORES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function resolveLoteId(lote_id, lote_slug) {
  if (lote_id) return lote_id;
  if (!lote_slug) return null;
  const rows = await query('SELECT id FROM lotes WHERE slug = ? LIMIT 1', [lote_slug]);
  return rows.length ? rows[0].id : null;
}

async function getLoteConPrecio(lote_id) {
  const rows = await query(`
    SELECT l.*, p.precio_ice_usd, p.precio_ice_kg, p.trm_cop,
           p.diferencial_col, p.diferencial_hui, p.diferencial_trace
    FROM lotes l
    LEFT JOIN (SELECT * FROM precios_historico ORDER BY recorded_at DESC LIMIT 1) p ON 1=1
    WHERE l.id = ?
  `, [lote_id]);
  return rows[0] || null;
}

function calcularPrecioLote(lote, precio) {
  const iceKg    = precio?.precio_ice_kg  || 4.80;
  const dCol     = (precio?.diferencial_col  || 0.40) * 2.2046;
  const dHui     = (precio?.diferencial_hui  || 0.10) * 2.2046;
  const dTrace   = precio?.diferencial_trace || 0.50;
  const scaScore = parseFloat(lote.sca_score) || 84;
  const scaPrima = scaScore >= 90 ? 20 : scaScore >= 88 ? 12 : scaScore >= 86 ? 6 : scaScore >= 84 ? 2 : 0;
  const base = iceKg + dCol + dHui + dTrace;
  const exw  = base + scaPrima;
  return { exw: +exw.toFixed(2), fob: +(exw + 0.77).toFixed(2), cif_eu: +(exw + 1.97).toFixed(2),
           base: +base.toFixed(2), sca_prima: scaPrima };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGGING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function saveLog({ tipo = 'general', from_number, action, raw_body, parsed_json, response, status_code, error, duration_ms }) {
  try {
    await query(
      `INSERT INTO webhook_logs
         (tipo, from_number, action, raw_body, parsed_json, response, status_code, error, duration_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safeStr(tipo, 20),
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
    console.error('[webhook:saveLog:FAIL]', JSON.stringify({
      error: e.message, action: safeStr(action, 50), from_number: safeStr(from_number, 50),
      status_code, duration_ms, timestamp: new Date().toISOString(),
    }));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HANDLER PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json(makeResponse(false, null, null, null, 'Método no permitido'));

  const startTime = Date.now();
  const rawBody   = req.body;

  console.log('[webhook:IN]', JSON.stringify({
    keys: rawBody ? Object.keys(rawBody) : 'no-body',
    timestamp: new Date().toISOString(),
  }));

  const reply = async (statusCode, responseObj, logExtra = {}) => {
    const duration_ms = Date.now() - startTime;
    await saveLog({ ...logExtra, raw_body: rawBody, response: responseObj, status_code: statusCode, duration_ms });
    return res.status(statusCode).json(responseObj);
  };

  try {
    // ── Parsear payload ──────────────────────────────────────
    let raw = null;
    if (typeof rawBody?.body === 'string')                raw = extractActionJSON(rawBody.body);
    if (!raw && typeof rawBody?.info === 'string')        raw = extractActionJSON(rawBody.info);
    if (!raw && (rawBody?.['acti@n'] || rawBody?.action)) raw = rawBody;
    if (!raw && typeof rawBody === 'string')              raw = extractActionJSON(rawBody);

    console.log('[webhook:PARSE]', JSON.stringify({ found: !!raw, action: raw?.['acti@n'] || raw?.action || null }));

    const payload = normalizePayload(raw);

    if (!payload) {
      return await reply(400,
        makeResponse(false, null, null, null, 'No se encontró acción válida en el mensaje'),
        { action: 'PARSE_ERROR', error: 'No JSON action found' }
      );
    }

    const { action, from, data = {} } = payload;
    const cleanFrom = sanitizePhone(from) || safeStr(from, 50);
    const logBase   = { action, from_number: cleanFrom, parsed_json: payload };

    if (!action) return await reply(400, makeResponse(false, null, null, null, 'Falta action / acti@n'), { error: 'Falta action' });

    // ══════════════════════════════════════════════════════════════════════
    // SECCIÓN A — CAFICULTORES
    // ══════════════════════════════════════════════════════════════════════

    // ── A1. REGISTRAR_CAFICULTOR ──────────────────────────────────────────
    if (action === 'REGISTRAR_CAFICULTOR') {
      const { nombre, finca, vereda, municipio, departamento, altitud_msnm, storytelling } = data;
      if (!nombre || !municipio) {
        return await reply(400, makeResponse(false, action, null, null, 'Faltan campos: nombre, municipio'), { ...logBase, error: 'Campos faltantes' });
      }
      const existing = await query('SELECT id FROM caficultores WHERE telefono_wa = ? LIMIT 1', [cleanFrom]);
      if (existing.length) {
        await query(
          `UPDATE caficultores SET nombre=?, finca=?, vereda=?, municipio=?, departamento=?,
           altitud_msnm=?, storytelling=?, updated_at=NOW() WHERE id=?`,
          [nombre, finca||null, vereda||null, municipio, departamento||'Huila', altitud_msnm||null, storytelling||null, existing[0].id]
        );
        return await reply(200, makeResponse(true, action, `Datos actualizados, ${nombre}! Tu perfil en Organicode está al día.`, { caficultor_id: existing[0].id }), { ...logBase, tipo: 'caficultor' });
      }
      const newId = randomUUID();
      await query(
        `INSERT INTO caficultores (id, nombre, finca, vereda, municipio, departamento, altitud_msnm, telefono_wa, storytelling, activo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [newId, nombre, finca||null, vereda||null, municipio, departamento||'Huila', altitud_msnm||null, cleanFrom, storytelling||null]
      );
      return await reply(200, makeResponse(true, action, `Bienvenido a Organicode, ${nombre}! Ya puedes registrar tus lotes.`, { caficultor_id: newId }), { ...logBase, tipo: 'caficultor' });
    }

    // ── A2. REGISTRAR_LOTE ────────────────────────────────────────────────
    if (action === 'REGISTRAR_LOTE') {
      const { variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, fecha_cosecha } = data;
      if (!variedad || !proceso || !cantidad_kg) {
        return await reply(400, makeResponse(false, action, null, null, 'Faltan campos: variedad, proceso, cantidad_kg'), { ...logBase, error: 'Campos faltantes' });
      }
      const caficultores = await query('SELECT id, nombre, finca, municipio FROM caficultores WHERE telefono_wa = ? AND activo = 1 LIMIT 1', [cleanFrom]);
      if (!caficultores.length) {
        return await reply(404, makeResponse(false, action, null, null, 'No encontré tu perfil. Primero regístrate.'), { ...logBase, error: 'No encontrado' });
      }
      const caf = caficultores[0];
      let precioBase = 2.50;
      try { const r = await query('SELECT precio_ice_usd_lb FROM precios_bolsa ORDER BY timestamp DESC LIMIT 1'); if (r.length) precioBase = Number(r[0].precio_ice_usd_lb); } catch {}
      const precio_calculado = calcularPrecio(variedad, proceso, sca_score, precioBase);
      const baseSlug = slugify(`${variedad}-${caf.finca || caf.municipio}-${new Date().getFullYear()}`);
      const slugCheck = await query('SELECT COUNT(*) as cnt FROM lotes WHERE slug LIKE ?', [`${baseSlug}%`]);
      const slug = `${baseSlug}${slugCheck[0].cnt > 0 ? `-${slugCheck[0].cnt + 1}` : ''}`;
      const newId = randomUUID();
      await query(
        `INSERT INTO lotes (id, caficultor_id, slug, nombre, variedad, proceso, tipo_secado, cantidad_kg, humedad, rendimiento, sca_score, notas_sensoriales, fecha_cosecha, precio_calculado, estado, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador', NOW(), NOW())`,
        [newId, caf.id, slug, `${variedad} ${caf.finca || caf.municipio}`, variedad, proceso, tipo_secado||null,
         Number(cantidad_kg), humedad||null, rendimiento||null, sca_score||null, notas_sensoriales||null, fecha_cosecha||null, precio_calculado]
      );
      const sacos = Math.round(Number(cantidad_kg) / 70);
      return await reply(200, makeResponse(true, action,
        `Lote registrado! ${variedad} - ${proceso}. ${cantidad_kg}kg (~${sacos} sacos). Precio estimado: $${precio_calculado} USD/kg. ¿Confirmas la publicación?`,
        { lote_id: newId, slug, precio_calculado, caficultor_id: caf.id }
      ), { ...logBase, tipo: 'caficultor' });
    }

    // ── A3. CONFIRMAR_PUBLICACION ─────────────────────────────────────────
    if (action === 'CONFIRMAR_PUBLICACION') {
      const { lote_id } = data;
      if (!lote_id) return await reply(400, makeResponse(false, action, null, null, 'Falta lote_id'), { ...logBase, error: 'Falta lote_id' });
      const lotes = await query(
        `SELECT l.id, l.variedad, l.slug, l.precio_calculado, l.caficultor_id, c.nombre
         FROM lotes l JOIN caficultores c ON l.caficultor_id = c.id
         WHERE l.id = ? AND c.telefono_wa = ? LIMIT 1`,
        [lote_id, cleanFrom]
      );
      if (!lotes.length) return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado.'), { ...logBase, error: 'No encontrado' });
      const lote = lotes[0];
      const timestamp = new Date().toISOString();
      const hash = generarHash(lote.id, lote.caficultor_id, timestamp);
      const urlPublica = `${process.env.FRONTEND_URL || 'https://organicode.vercel.app'}/lote/${lote.slug}`;
      await query(`UPDATE lotes SET estado='publicado', hash_registro=?, fecha_cosecha=COALESCE(fecha_cosecha, CURDATE()), updated_at=NOW() WHERE id=?`, [hash, lote.id]);
      try {
        const pusher = getPusher();
        if (pusher) await pusher.trigger('organicode-admin', 'lote-publicado', { lote_id: lote.id, slug: lote.slug, variedad: lote.variedad, caficultor: lote.nombre, precio: lote.precio_calculado, timestamp });
      } catch (e) { console.warn('[webhook] Pusher skipped:', e.message); }
      return await reply(200, makeResponse(true, action,
        `Tu lote de ${lote.variedad} ya está publicado! 🔗 ${urlPublica} | 🔐 #${hash.slice(0, 12).toUpperCase()}`,
        { lote_id: lote.id, slug: lote.slug, url: urlPublica, hash: hash.slice(0, 12) }
      ), { ...logBase, tipo: 'caficultor' });
    }

    // ── A4. CONSULTAR_MIS_LOTES ───────────────────────────────────────────
    if (action === 'CONSULTAR_MIS_LOTES') {
      const caficultores = await query('SELECT id, nombre FROM caficultores WHERE telefono_wa = ? AND activo = 1 LIMIT 1', [cleanFrom]);
      if (!caficultores.length) return await reply(404, makeResponse(false, action, null, null, 'No encontré tu perfil. Regístrate primero.'), { ...logBase, error: 'No encontrado' });
      const caf = caficultores[0];
      const lotes = await query(`SELECT id, slug, nombre, variedad, proceso, cantidad_kg, sca_score, precio_calculado, estado FROM lotes WHERE caficultor_id = ? AND estado != 'archivado' ORDER BY created_at DESC LIMIT 10`, [caf.id]);
      if (!lotes.length) return await reply(200, makeResponse(true, action, `Hola ${caf.nombre}, aún no tienes lotes registrados. ¡Registra tu primer lote!`, { lotes: [] }), { ...logBase, tipo: 'caficultor' });
      const tags = { borrador: '[borrador]', publicado: '[publicado]', ofertado: '[ofertado]', vendido: '[vendido]' };
      const resumen = lotes.map((l, i) => `${i + 1}. ${tags[l.estado] || ''} ${l.variedad} - ${l.cantidad_kg}kg | $${l.precio_calculado}/kg`).join('\n');
      return await reply(200, makeResponse(true, action, `Tus lotes, ${caf.nombre}:\n\n${resumen}`, { lotes }), { ...logBase, tipo: 'caficultor' });
    }

    // ── A5. CONSULTAR_PRECIO ──────────────────────────────────────────────
    if (action === 'CONSULTAR_PRECIO') {
      const { lote_id, variedad, proceso, sca_score } = data;
      if (lote_id) {
        const lotes = await query(`SELECT l.variedad, l.proceso, l.sca_score, l.precio_calculado, l.cantidad_kg FROM lotes l JOIN caficultores c ON l.caficultor_id = c.id WHERE l.id = ? AND c.telefono_wa = ? LIMIT 1`, [lote_id, cleanFrom]);
        if (!lotes.length) return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado.'), { ...logBase, error: 'No encontrado' });
        const l = lotes[0];
        return await reply(200, makeResponse(true, action, `${l.variedad} | ${l.proceso} | SCA: ${l.sca_score || 'N/D'} | $${l.precio_calculado} USD/kg FOB | Total: $${(l.precio_calculado * l.cantidad_kg).toFixed(0)} USD`, { precio_calculado: l.precio_calculado }), { ...logBase, tipo: 'caficultor' });
      }
      if (!variedad || !proceso) return await reply(400, makeResponse(false, action, null, null, 'Falta lote_id o variedad + proceso'), { ...logBase, error: 'Faltan datos' });
      let precioBase = 2.50;
      try { const r = await query('SELECT precio_ice_usd_lb FROM precios_bolsa ORDER BY timestamp DESC LIMIT 1'); if (r.length) precioBase = Number(r[0].precio_ice_usd_lb); } catch {}
      const precio = calcularPrecio(variedad, proceso, sca_score, precioBase);
      return await reply(200, makeResponse(true, action, `Precio estimado para ${variedad} (${proceso}): $${precio} USD/kg FOB. Bolsa NY: $${precioBase}/lb. Diferencial Colombia + Huila incluido.`, { precio_calculado: precio }), { ...logBase, tipo: 'caficultor' });
    }

    // ── A6. SUBIR_FOTO_LOTE ───────────────────────────────────────────────
    if (action === 'SUBIR_FOTO_LOTE') {
      const { lote_id, foto_url } = data;
      if (!lote_id || !foto_url) return await reply(400, makeResponse(false, action, null, null, 'Faltan lote_id y foto_url'), { ...logBase, error: 'Faltan datos' });
      const result = await query(`UPDATE lotes l JOIN caficultores c ON l.caficultor_id = c.id SET l.foto_url = ?, l.updated_at = NOW() WHERE l.id = ? AND c.telefono_wa = ?`, [foto_url, lote_id, cleanFrom]);
      if (!result.affectedRows) return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado o no te pertenece.'), { ...logBase, error: 'No encontrado' });
      return await reply(200, makeResponse(true, action, 'Foto actualizada! La imagen ya aparece en la ficha de tu lote.', { lote_id, foto_url }), { ...logBase, tipo: 'caficultor' });
    }

    // ── A7. ACTUALIZAR_ESTADO_LOTE ────────────────────────────────────────
    if (action === 'ACTUALIZAR_ESTADO_LOTE') {
      const { lote_id, estado } = data;
      const estadosValidos = ['borrador', 'publicado', 'ofertado', 'vendido', 'archivado'];
      if (!lote_id || !estado || !estadosValidos.includes(estado)) {
        return await reply(400, makeResponse(false, action, null, null, `Estado inválido. Usa: ${estadosValidos.join(', ')}`), { ...logBase, error: 'Estado inválido' });
      }
      const result = await query(`UPDATE lotes l JOIN caficultores c ON l.caficultor_id = c.id SET l.estado = ?, l.updated_at = NOW() WHERE l.id = ? AND c.telefono_wa = ?`, [estado, lote_id, cleanFrom]);
      if (!result.affectedRows) return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado.'), { ...logBase, error: 'No encontrado' });
      return await reply(200, makeResponse(true, action, `Estado del lote actualizado a: ${estado}.`, { lote_id, estado }), { ...logBase, tipo: 'caficultor' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECCIÓN B — COMPRADORES
    // ══════════════════════════════════════════════════════════════════════

    // ── B1. REGISTRAR_COMPRADOR ───────────────────────────────────────────
    if (action === 'REGISTRAR_COMPRADOR') {
      const { nombre_contacto, empresa, email_contacto, pais, cargo, volumen_estimado_kg } = data;
      const existing = await query('SELECT id FROM compradores WHERE telefono_wa = ? LIMIT 1', [cleanFrom]);
      if (existing.length) {
        await query(
          `UPDATE compradores SET nombre_contacto=COALESCE(?,nombre_contacto), empresa=COALESCE(?,empresa),
           email_contacto=COALESCE(?,email_contacto), pais=COALESCE(?,pais), cargo=COALESCE(?,cargo),
           volumen_estimado_kg=COALESCE(?,volumen_estimado_kg), updated_at=NOW() WHERE id=?`,
          [nombre_contacto||null, empresa||null, email_contacto||null, pais||null, cargo||null, volumen_estimado_kg||null, existing[0].id]
        );
        return await reply(200, makeResponse(true, action, `Perfil actualizado, ${nombre_contacto || 'estimado comprador'}! Escribe CATALOGO para ver los lotes disponibles.`, { comprador_id: existing[0].id }), { ...logBase, tipo: 'comprador' });
      }
      const newId = randomUUID();
      await query(
        `INSERT INTO compradores (id, telefono_wa, nombre_contacto, empresa, email_contacto, pais, cargo, volumen_estimado_kg, nivel_interes, activo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'nuevo', 1, NOW(), NOW())`,
        [newId, cleanFrom, nombre_contacto||null, empresa||null, email_contacto||null, pais||null, cargo||null, volumen_estimado_kg||null]
      );
      return await reply(200, makeResponse(true, action, `Bienvenido a Organicode, ${nombre_contacto || 'estimado comprador'}! Escribe CATALOGO para explorar los lotes del Huila.`, { comprador_id: newId }), { ...logBase, tipo: 'comprador' });
    }

    // ── B2. CONSULTAR_CATALOGO ────────────────────────────────────────────
    if (action === 'CONSULTAR_CATALOGO') {
      const { variedad, proceso, sca_min, precio_max_usd } = data;
      let sql = `SELECT l.id, l.slug, l.variedad, l.proceso, l.cantidad_kg, l.sca_score,
                        l.precio_calculado, l.notas_sensoriales, c.finca, c.municipio
                 FROM lotes l JOIN caficultores c ON l.caficultor_id = c.id
                 WHERE l.estado = 'publicado'`;
      const params = [];
      if (variedad)       { sql += ' AND l.variedad LIKE ?';       params.push(`%${variedad}%`); }
      if (proceso)        { sql += ' AND l.proceso LIKE ?';        params.push(`%${proceso}%`); }
      if (sca_min)        { sql += ' AND l.sca_score >= ?';        params.push(Number(sca_min)); }
      if (precio_max_usd) { sql += ' AND l.precio_calculado <= ?'; params.push(Number(precio_max_usd)); }
      sql += ' ORDER BY l.sca_score DESC, l.precio_calculado ASC LIMIT 8';
      const lotes = await query(sql, params);
      if (!lotes.length) return await reply(200, makeResponse(true, action, 'No encontré lotes con esos filtros. Intenta sin filtros escribiendo CATALOGO.', { lotes: [] }), { ...logBase, tipo: 'comprador' });
      const lista = lotes.map((l, i) =>
        `${i + 1}. ${l.variedad} | ${l.proceso} | ${l.cantidad_kg}kg | SCA: ${l.sca_score || 'N/D'} | $${l.precio_calculado}/kg | ${l.finca || l.municipio}`
      ).join('\n');
      return await reply(200, makeResponse(true, action, `Lotes disponibles:\n\n${lista}\n\nEscribe PRECIO [número] para más detalles.`, { lotes }), { ...logBase, tipo: 'comprador' });
    }

    // ── B3. CONSULTAR_PRECIO_LOTE ─────────────────────────────────────────
    if (action === 'CONSULTAR_PRECIO_LOTE') {
      const { lote_id, lote_slug } = data;
      const id = await resolveLoteId(lote_id, lote_slug);
      if (!id) return await reply(400, makeResponse(false, action, null, null, 'Falta lote_id o lote_slug'), { ...logBase, error: 'Faltan datos' });
      const lote = await getLoteConPrecio(id);
      if (!lote) return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado.'), { ...logBase, error: 'No encontrado' });
      const precios = calcularPrecioLote(lote, lote);
      return await reply(200, makeResponse(true, action,
        `${lote.variedad} | ${lote.proceso} | SCA: ${lote.sca_score || 'N/D'} pts\n💰 EXW: $${precios.exw}/kg | FOB: $${precios.fob}/kg | CIF EU: $${precios.cif_eu}/kg\n📦 ${lote.cantidad_kg}kg disponibles | Prima SCA: $${precios.sca_prima}/kg`,
        { lote_id: id, precios, lote }
      ), { ...logBase, tipo: 'comprador' });
    }

    // ── B4. HACER_OFERTA ──────────────────────────────────────────────────
    if (action === 'HACER_OFERTA') {
      const { lote_id, lote_slug, precio_oferta, incoterm, volumen_sacos, mensaje, empresa, email_contacto, pais_destino } = data;
      if (!precio_oferta) return await reply(400, makeResponse(false, action, null, null, 'Falta precio_oferta'), { ...logBase, error: 'Faltan datos' });
      const id = await resolveLoteId(lote_id, lote_slug);
      if (!id) return await reply(400, makeResponse(false, action, null, null, 'Falta lote_id o lote_slug'), { ...logBase, error: 'Faltan datos' });
      const lote = await getLoteConPrecio(id);
      if (!lote) return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado.'), { ...logBase, error: 'No encontrado' });
      if (!['publicado', 'ofertado'].includes(lote.estado)) return await reply(400, makeResponse(false, action, null, null, `Este lote no está disponible (estado: ${lote.estado}).`), { ...logBase, error: 'Lote no disponible' });
      const precios = calcularPrecioLote(lote, lote);
      const precioMin = precios.fob * 0.92;
      if (Number(precio_oferta) < precioMin) {
        return await reply(400, makeResponse(false, action,
          `Oferta por debajo del mínimo aceptable. Precio FOB: $${precios.fob}/kg. Mínimo de oferta: $${precioMin.toFixed(2)}/kg.`,
          { precio_min: precioMin.toFixed(2), precio_fob: precios.fob }
        ), { ...logBase, error: 'oferta_bajo_minimo', tipo: 'comprador' });
      }
      const ofertaId = randomUUID();
      await query(
        `INSERT INTO ofertas (id, lote_id, telefono_comprador, empresa, email_contacto, pais_destino,
         precio_oferta, incoterm, volumen_sacos, mensaje, estado, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW(), NOW())`,
        [ofertaId, id, cleanFrom, empresa||null, email_contacto||null, pais_destino||null,
         Number(precio_oferta), incoterm||'FOB', volumen_sacos||null, mensaje||null]
      );
      await query(`UPDATE lotes SET estado='ofertado', updated_at=NOW() WHERE id=?`, [id]);
      try {
        const pusher = getPusher();
        if (pusher) await pusher.trigger('organicode-admin', 'nueva-oferta', {
          oferta_id: ofertaId, lote_id: id, variedad: lote.variedad, precio_oferta: Number(precio_oferta),
          empresa: empresa || cleanFrom, incoterm: incoterm || 'FOB', timestamp: new Date().toISOString()
        });
      } catch (e) { console.warn('[webhook] Pusher skipped:', e.message); }
      return await reply(200, makeResponse(true, action,
        `Oferta enviada! $${precio_oferta}/kg ${incoterm || 'FOB'} para ${lote.variedad}. El caficultor recibirá tu propuesta y responderá pronto.`,
        { oferta_id: ofertaId, lote_id: id, precio_oferta: Number(precio_oferta) }
      ), { ...logBase, tipo: 'comprador' });
    }

    // ── B5. SOLICITAR_MUESTRA ─────────────────────────────────────────────
    if (action === 'SOLICITAR_MUESTRA') {
      const { lote_id, lote_slug, nombre_contacto, empresa, email_contacto, direccion_entrega, ciudad_destino, pais_destino, zip_code } = data;
      const id = await resolveLoteId(lote_id, lote_slug);
      if (!id) return await reply(400, makeResponse(false, action, null, null, 'Falta lote_id o lote_slug'), { ...logBase, error: 'Faltan datos' });
      const lote = await query('SELECT id, variedad, proceso, estado FROM lotes WHERE id = ? LIMIT 1', [id]);
      if (!lote.length) return await reply(404, makeResponse(false, action, null, null, 'Lote no encontrado.'), { ...logBase, error: 'No encontrado' });
      if (lote[0].estado === 'vendido') return await reply(400, makeResponse(false, action, null, null, 'Este lote ya fue vendido. Escribe CATALOGO para ver otros.'), { ...logBase, error: 'Lote vendido' });
      const muestraId = randomUUID();
      await query(
        `INSERT INTO muestras (id, lote_id, telefono_comprador, nombre_contacto, empresa, email_contacto,
         direccion_entrega, ciudad_destino, pais_destino, zip_code, estado, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'solicitada', NOW(), NOW())`,
        [muestraId, id, cleanFrom, nombre_contacto||null, empresa||null, email_contacto||null,
         direccion_entrega||null, ciudad_destino||null, pais_destino||null, zip_code||null]
      );
      try {
        const pusher = getPusher();
        if (pusher) await pusher.trigger('organicode-admin', 'nueva-muestra', {
          muestra_id: muestraId, lote_id: id, variedad: lote[0].variedad, empresa: empresa || cleanFrom,
          ciudad_destino, pais_destino, timestamp: new Date().toISOString()
        });
      } catch (e) { console.warn('[webhook] Pusher skipped:', e.message); }
      return await reply(200, makeResponse(true, action,
        `Solicitud de muestra registrada para ${lote[0].variedad} (${lote[0].proceso}). Pronto recibirás los detalles de envío.`,
        { muestra_id: muestraId, lote_id: id }
      ), { ...logBase, tipo: 'comprador' });
    }

    // ── B6. CONSULTAR_MIS_OFERTAS ─────────────────────────────────────────
    if (action === 'CONSULTAR_MIS_OFERTAS') {
      const ofertas = await query(
        `SELECT o.id, o.precio_oferta, o.incoterm, o.volumen_sacos, o.estado, o.created_at,
                l.variedad, l.proceso, l.cantidad_kg
         FROM ofertas o JOIN lotes l ON o.lote_id = l.id
         WHERE o.telefono_comprador = ? ORDER BY o.created_at DESC LIMIT 10`,
        [cleanFrom]
      );
      if (!ofertas.length) return await reply(200, makeResponse(true, action, 'Aún no has hecho ofertas. Escribe CATALOGO para ver los lotes disponibles.', { ofertas: [] }), { ...logBase, tipo: 'comprador' });
      const estadoTag = { pendiente: '⏳', aceptada: '✅', rechazada: '❌', en_negociacion: '🤝' };
      const lista = ofertas.map((o, i) =>
        `${i + 1}. ${estadoTag[o.estado] || ''} ${o.variedad} | ${o.proceso} | $${o.precio_oferta}/kg ${o.incoterm} | ${o.estado}`
      ).join('\n');
      return await reply(200, makeResponse(true, action, `Tus ofertas:\n\n${lista}`, { ofertas }), { ...logBase, tipo: 'comprador' });
    }

    // ── B7. CONFIRMAR_INTERES ─────────────────────────────────────────────
    if (action === 'CONFIRMAR_INTERES') {
      const { lote_id, nivel_interes } = data;
      await query(
        `INSERT INTO compradores (id, telefono_wa, nivel_interes, activo, created_at, updated_at)
         VALUES (?, ?, ?, 1, NOW(), NOW())
         ON DUPLICATE KEY UPDATE nivel_interes='alto', updated_at=NOW()`,
        [randomUUID(), cleanFrom, nivel_interes || 'alto']
      );
      try {
        const pusher = getPusher();
        if (pusher) await pusher.trigger('organicode-admin', 'lead-caliente', {
          telefono: cleanFrom, lote_id: lote_id || null, nivel_interes: nivel_interes || 'alto',
          timestamp: new Date().toISOString()
        });
      } catch (e) { console.warn('[webhook] Pusher skipped:', e.message); }
      return await reply(200, makeResponse(true, action, 'Interés registrado. Nuestro equipo se pondrá en contacto contigo pronto.', { nivel_interes: nivel_interes || 'alto' }), { ...logBase, tipo: 'comprador' });
    }

    // ── Acción desconocida ────────────────────────────────────────────────
    const accionesValidas = [
      'REGISTRAR_CAFICULTOR','REGISTRAR_LOTE','CONFIRMAR_PUBLICACION','CONSULTAR_MIS_LOTES',
      'CONSULTAR_PRECIO','SUBIR_FOTO_LOTE','ACTUALIZAR_ESTADO_LOTE',
      'REGISTRAR_COMPRADOR','CONSULTAR_CATALOGO','CONSULTAR_PRECIO_LOTE',
      'HACER_OFERTA','SOLICITAR_MUESTRA','CONSULTAR_MIS_OFERTAS','CONFIRMAR_INTERES'
    ];
    return await reply(400,
      makeResponse(false, action, null, null, `Acción desconocida: "${action}". Válidas: ${accionesValidas.join(', ')}`),
      { ...logBase, error: `Acción desconocida: ${action}` }
    );

  } catch (err) {
    console.error('[webhook:ERROR]', err.message);
    const duration_ms = Date.now() - startTime;
    await saveLog({ raw_body: rawBody, error: err.message, status_code: 500, duration_ms });
    return res.status(500).json(makeResponse(false, null, null, null, err.message));
  }
};
