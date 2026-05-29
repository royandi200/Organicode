import { query, execute } from './_lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  const { nombre, empresa, email, pais, telefono, tipo } = req.body;
  if (!nombre || !email) return res.status(400).json({ ok: false, error: 'nombre y email requeridos' });

  try {
    const existe = await query('SELECT id FROM compradores WHERE email = ? LIMIT 1', [email]);
    if (existe.length) return res.status(200).json({ ok: true, data: { id: existe[0].id }, message: 'Ya registrado' });

    const result = await execute(
      'INSERT INTO compradores (nombre, empresa, email, pais, telefono, tipo) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, empresa || null, email, pais || null, telefono || null, tipo || 'importador']
    );
    return res.status(201).json({ ok: true, data: { id: result.insertId } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
