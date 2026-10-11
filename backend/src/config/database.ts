import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "posts_user",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "posts_crud",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testConnection(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    console.log("MySQL connection successful!");
  } finally {
    connection.release();
  }
}
