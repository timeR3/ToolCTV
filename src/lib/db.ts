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
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error: any) {
    // Intercept database errors to provide more helpful feedback.
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
       console.error("Database access denied. Please check your DB_USER and DB_PASSWORD environment variables.");
       throw new Error("Database access denied. Please check your DB_USER and DB_PASSWORD environment variables.");
    }
     if (error.code === 'ER_BAD_DB_ERROR') {
        console.error(`Database not found. Please check your DB_DATABASE environment variable. The value is currently '${process.env.DB_DATABASE}'.`);
        throw new Error(`Database not found. Please check your DB_DATABASE environment variable.`);
    }
    // Re-throw other errors
    throw error;
  }
}
