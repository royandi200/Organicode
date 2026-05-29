// api/compradores.js — POST /api/compradores
// Registra un nuevo comprador (desde landing o catálogo)
import { getPool, corsHeaders } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders()).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).setHeaders(corsHeaders()).json({ ok: false, error: 'Método no permitido' });
  }

  const { nombre, empresa, email, pais, telefono, tipo } = req.body;

  if (!nombre || !email) {
    return res.status(400).setHeaders(corsHeaders()).json({ ok: false, error: 'nombre y email son requeridos' });
  }

  try {
    const pool = getPool();

    // Verificar si ya existe
    const [[existe]] = await pool.query(
      'SELECT id FROM compradores WHERE email = ? LIMIT 1',
      [email]
    );

    if (existe) {
      return res.status(200).setHeaders(corsHeaders()).json({
        ok: true,
        data: { id: existe.id },
        message: 'Comprador ya registrado'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO compradores (nombre, empresa, email, pais, telefono, tipo)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      nombre,
      empresa  || null,
      email,
      pais     || null,
      telefono || null,
      tipo     || 'importador'
    ]);

    return res.status(201).setHeaders(corsHeaders()).json({
      ok: true,
      data: { id: result.insertId },
      message: 'Comprador registrado exitosamente'
    });
  } catch (err) {
    console.error('[API /compradores]', err);
    return res.status(500).setHeaders(corsHeaders()).json({ ok: false, error: err.message });
  }
}
