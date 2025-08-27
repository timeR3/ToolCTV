'use server';

import mysql from 'mysql2/promise';
import { logDetailedError } from './error-logger'; // Import the new logger

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
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error: unknown) {
    // Intercept database errors to provide more helpful feedback.
    if (error instanceof Error) {
      if ((error as any).code === 'ER_ACCESS_DENIED_ERROR') {
        logDetailedError("Database Connection", error, { sql, params, hint: "Check DB_USER and DB_PASSWORD" });
        throw new Error("Database access denied. Please check your DB_USER and DB_PASSWORD environment variables.");
      }
      if ((error as any).code === 'ER_BAD_DB_ERROR') {
          logDetailedError("Database Connection", error, { sql, params, hint: `Database '${process.env.DB_DATABASE}' not found.` });
          throw new Error(`Database not found. Please check your DB_DATABASE environment variable.`);
      }
    }
    
    // For all other errors, use the detailed logger and re-throw
    logDetailedError("Database Query Execution", error, { sql, params });
    
    if (error instanceof Error) {
      throw new Error(`Database query failed: ${error.message}`);
    } else {
      throw new Error("An unknown database error occurred during query execution.");
    }
  } finally {
    if (connection) connection.release();
  }
}
