import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { CreatePostInput, Post } from "../types/post";

export async function getAllPosts(): Promise<Post[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM posts ORDER BY id DESC",
  );

  return rows as Post[];
}

export async function createPost(input: CreatePostInput): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO posts (title, content) VALUES (?, ?)",
    [input.title, input.content ?? null],
  );

  return result.insertId;
}

export async function updatePost(
  id: number,
  input: CreatePostInput,
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE posts SET title = ?, content = ? WHERE id = ?",
    [input.title, input.content ?? null, id],
  );

  return result.affectedRows > 0;
}

export async function deletePost(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM posts WHERE id = ?",
    [id],
  );

  return result.affectedRows > 0;
}
