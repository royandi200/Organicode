// api/cron/precio-bolsa.js — Actualiza precio Bolsa ICE (café Contrato C) + TRM
//
// Fuentes (gratuitas, sin API key):
//   - Yahoo Finance (símbolo KC=F, Coffee Futures) — precio en centavos USD/lb
//   - datos.gov.co (Socrata, dataset oficial Banco de la República) — TRM COP/USD
//
// Alimenta DOS tablas porque el resto del código las usa por separado:
//   - precios_bolsa     → la lee calcularPrecio() (REGISTRAR_LOTE, CONSULTAR_PRECIO)
//   - precios_historico → la lee calcularPrecioLote() (CONSULTAR_PRECIO_LOTE,
//                         HACER_OFERTA) y /api/precios/actual (web pública)
//
// Protegido por CRON_SECRET. Acepta:
//   - Header "Authorization: Bearer <CRON_SECRET>" (formato que usa Vercel Cron)
//   - Query string ?secret=<CRON_SECRET> (para cron externo, ver instrucciones)

import { query, execute } from '../_lib/db.js';

const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/KC=F?interval=1d&range=5d';
const TRM_URL   = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde DESC&$limit=1';

const LB_TO_KG = 2.2046;

async function fetchPrecioICE() {
  const res = await fetch(YAHOO_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OrganicodeBot/1.0)' },
  });
  if (!res.ok) throw new Error(`Yahoo Finance respondió ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  const precioCentavosLb =
    result?.meta?.regularMarketPrice ??
    result?.indicators?.quote?.[0]?.close?.filter((v) => v != null)?.pop();
  if (!precioCentavosLb) throw new Error('No se pudo leer el precio de KC=F en la respuesta de Yahoo Finance');
  return Number(precioCentavosLb) / 100; // centavos/lb → USD/lb
}

async function fetchTRM() {
  const res = await fetch(TRM_URL);
  if (!res.ok) throw new Error(`datos.gov.co respondió ${res.status}`);
  const json = await res.json();
  const trm = json?.[0]?.valor;
  if (!trm) throw new Error('No se pudo leer la TRM en la respuesta de datos.gov.co');
  return Number(trm);
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const CRON_SECRET = process.env.CRON_SECRET;
  const authHeader  = req.headers?.authorization || '';
  const tokenHeader = authHeader.replace('Bearer ', '');
  const tokenQuery  = req.query?.secret;
  if (CRON_SECRET && tokenHeader !== CRON_SECRET && tokenQuery !== CRON_SECRET) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }

  // Diferenciales — son decisión de negocio, no datos de mercado.
  // Configurables por env var, con el mismo default que ya usa el resto
  // del código como fallback (0.30 / 0.10 / 0.50).
  const diferencialColombia = Number(process.env.DIFERENCIAL_COLOMBIA_USD_LB ?? 0.30);
  const diferencialHuila    = Number(process.env.DIFERENCIAL_HUILA_USD_LB    ?? 0.10);
  const diferencialTraza    = Number(process.env.DIFERENCIAL_TRAZA_USD_KG    ?? 0.50);

  const resultado = { ice: null, trm: null, errores: [] };

  let precioIceUsdLb = null;
  try {
    precioIceUsdLb = await fetchPrecioICE();
    resultado.ice = precioIceUsdLb;
  } catch (e) {
    resultado.errores.push(`ICE: ${e.message}`);
  }

  let trm = null;
  try {
    trm = await fetchTRM();
    resultado.trm = trm;
  } catch (e) {
    resultado.errores.push(`TRM: ${e.message}`);
  }

  // Si ambas fuentes fallaron no escribimos nada — mejor mantener el
  // último precio válido en BD que insertar una fila vacía.
  if (precioIceUsdLb == null && trm == null) {
    return res.status(502).json({ ok: false, ...resultado });
  }

  try {
    if (precioIceUsdLb != null) {
      await execute(
        `INSERT INTO precios_bolsa (precio_ice_usd_lb, diferencial_colombia, diferencial_huila, tasa_trm, timestamp)
         VALUES (?, ?, ?, ?, NOW())`,
        [precioIceUsdLb, diferencialColombia, diferencialHuila, trm]
      );
    }

    if (precioIceUsdLb != null) {
      const precioIceKg = precioIceUsdLb * LB_TO_KG;
      await execute(
        `INSERT INTO precios_historico
           (precio_ice_usd, precio_ice_kg, trm_cop, diferencial_col, diferencial_hui, diferencial_trace, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [precioIceUsdLb, precioIceKg, trm, diferencialColombia, diferencialHuila, diferencialTraza]
      );
    }

    return res.status(200).json({ ok: true, ...resultado, timestamp: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message, ...resultado });
  }
}
