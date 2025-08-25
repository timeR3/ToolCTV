'use server';

import mysql from 'mysql2/promise';

// Create a connection pool. This is more efficient than creating a new connection for every query.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, params: any[]) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Example of how to use it:
// import { query } from './db';
// const users = await query('SELECT * FROM users WHERE id = ?', [userId]);

export default pool;
