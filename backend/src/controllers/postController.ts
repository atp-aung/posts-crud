import { Request, Response } from "express";

import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
} from "../services/postService";

export async function listPosts(_req: Request, res: Response): Promise<void> {
  try {
    const posts = await getAllPosts();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve posts" });
  }
}

export async function addPost(req: Request, res: Response): Promise<void> {
  try {
    const { title, content } = req.body ?? {};

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    if (content !== undefined && typeof content !== "string") {
      res.status(400).json({ message: "Content must be a string" });
      return;
    }

    const id = await createPost({
      title: title.trim(),
      content,
    });

    res.status(201).json({
      message: "Post created successfully",
      id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create post" });
  }
}

export async function editPost(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body ?? {};

    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    if (content !== undefined && typeof content !== "string") {
      res.status(400).json({ message: "Content must be a string" });
      return;
    }

    const updated = await updatePost(id, {
      title: title.trim(),
      content,
    });

    if (!updated) {
      res.status(404).json({ message: "Post not found or unchanged" });
      return;
    }

    res.json({ message: "Post updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update post" });
  }
}

export async function removePost(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ message: "Invalid post ID" });
      return;
    }

    const deleted = await deletePost(id);

    if (!deleted) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete post" });
  }
}
