import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { UserRole } from "../types/user";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: Date;
}

// Get all users
export async function getAllUsers() {
  const [users] = await pool.execute<UserRow[]>(
    `SELECT id, username, email, role, created_at
     FROM users
     ORDER BY created_at DESC`,
  );

  return users;
}

// Get one user
export async function getUserById(id: number) {
  const [users] = await pool.execute<UserRow[]>(
    `SELECT id, username, email, role, created_at
     FROM users
     WHERE id = ?`,
    [id],
  );

  return users[0] ?? null;
}

// Delete user
export async function deleteUser(id: number, currentAdminId: number) {
  // Prevent admin from deleting their own account
  if (id === currentAdminId) {
    return "cannot-delete-self";
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the target user row
    const [users] = await connection.execute<UserRow[]>(
      "SELECT id, role FROM users WHERE id = ? FOR UPDATE",
      [id],
    );

    const user = users[0];

    if (!user) {
      await connection.rollback();
      return "not-found";
    }

    // Do not allow deletion of the last admin
    if (user.role === "admin") {
      const [admins] = await connection.execute<RowDataPacket[]>(
        `SELECT id FROM users
         WHERE role = 'admin'
         FOR UPDATE`,
      );

      if (admins.length <= 1) {
        await connection.rollback();
        return "last-admin";
      }
    }

    // ON DELETE SET NULL preserves the user's posts
    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [id],
    );

    await connection.commit();

    return result.affectedRows > 0 ? "success" : "not-found";
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
