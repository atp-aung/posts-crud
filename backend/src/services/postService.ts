import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";

interface PostRow extends RowDataPacket {
  id: number;
  user_id: number | null;
  title: string;
  content: string;
  author: string;
  created_at: Date;
  updated_at: Date;
}

// Get all posts
export async function getAllPosts() {
  const [posts] = await pool.execute<PostRow[]>(
    `SELECT
       posts.id,
       posts.user_id,
       posts.title,
       posts.content,
       COALESCE(users.username, 'Deleted User') AS author,
       posts.created_at,
       posts.updated_at
     FROM posts
     LEFT JOIN users ON posts.user_id = users.id
     ORDER BY posts.created_at DESC`,
  );

  return posts;
}

// Get one post
export async function getPostById(id: number) {
  const [posts] = await pool.execute<PostRow[]>(
    `SELECT
       posts.id,
       posts.user_id,
       posts.title,
       posts.content,
       COALESCE(users.username, 'Deleted User') AS author,
       posts.created_at,
       posts.updated_at
     FROM posts
     LEFT JOIN users ON posts.user_id = users.id
     WHERE posts.id = ?`,
    [id],
  );

  return posts[0] ?? null;
}

// Create post
export async function createPost(
  userId: number,
  title: string,
  content: string,
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO posts (user_id, title, content)
     VALUES (?, ?, ?)`,
    [userId, title, content],
  );

  return getPostById(result.insertId);
}

// Update own post only
export async function updatePost(
  id: number,
  userId: number,
  title: string,
  content: string,
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE posts
     SET title = ?, content = ?
     WHERE id = ? AND user_id = ?`,
    [title, content, id, userId],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getPostById(id);
}

// Delete any post (Admin only; middleware protects this route)
export async function deletePost(id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM posts WHERE id = ?",
    [id],
  );

  return result.affectedRows > 0;
}
