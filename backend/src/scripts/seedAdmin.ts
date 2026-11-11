import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../config/database";

async function seedAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // Check required environment variables
    if (!username || !email || !password) {
      throw new Error(
        "ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD are required.",
      );
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    // Check whether admin email already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if ((existingUsers as { id: number }[]).length > 0) {
      console.log(
        "An account with this email already exists. No changes made.",
      );
      return;
    }

    // Hash password before saving
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin account
    await pool.execute(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')`,
      [username, email, passwordHash],
    );

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void seedAdmin();
