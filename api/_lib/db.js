import mysql from 'mysql2/promise';

let _pool;

function getPool() {
  if (!_pool) {
    _pool = mysql.createPool({
      host:     process.env.MYSQL_HOST,
      port:     parseInt(process.env.MYSQL_PORT || '3306'),
      user:     process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 30000,
      connectTimeout: 10000,
    });
  }
  return _pool;
}

export async function query(sql, params) {
  const conn = await getPool().getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

export async function execute(sql, params) {
  const conn = await getPool().getConnection();
  try {
    const [result] = await conn.execute(sql, params);
    return { insertId: result.insertId || 0, affectedRows: result.affectedRows || 0 };
  } finally {
    conn.release();
  }
}

export function getDb() {
  return getPool();
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}
