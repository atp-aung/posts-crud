import bcrypt from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { UserRole } from "../types/user";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
}

export async function signup(
  username: string,
  email: string,
  password: string,
) {
  const [existing] = await pool.execute<UserRow[]>(
    "SELECT id FROM users WHERE email = ? OR username = ?",
    [email, username],
  );

  if (existing.length > 0) {
    throw new Error("Username or email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES (?, ?, ?, 'user')`,
    [username, email, passwordHash],
  );

  return {
    id: result.insertId,
    username,
    email,
    role: "user" as const,
  };
}

export async function login(email: string, password: string) {
  const [users] = await pool.execute<UserRow[]>(
    `SELECT id, username, email, password_hash, role
     FROM users
     WHERE email = ?`,
    [email],
  );

  const user = users[0];

  if (!user) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

export async function getCurrentUser(userId: number) {
  const [users] = await pool.execute<UserRow[]>(
    `SELECT id, username, email, role
     FROM users
     WHERE id = ?`,
    [userId],
  );

  return users[0] ?? null;
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  const [users] = await pool.execute<UserRow[]>(
    "SELECT id, password_hash FROM users WHERE id = ?",
    [userId],
  );

  const user = users[0];

  if (!user) {
    return "not-found";
  }

  const passwordMatch = await bcrypt.compare(
    currentPassword,
    user.password_hash,
  );

  if (!passwordMatch) {
    return "incorrect-password";
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
    newPasswordHash,
    userId,
  ]);

  return "success";
}
