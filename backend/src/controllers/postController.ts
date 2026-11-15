import { RequestHandler } from "express";
import * as postService from "../services/postService";

// GET /api/posts
export const getAllPosts: RequestHandler = async (_req, res, next) => {
  try {
    const posts = await postService.getAllPosts();

    res.json({ posts });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id
export const getPostById: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid post ID." });
      return;
    }

    const post = await postService.getPostById(id);

    if (!post) {
      res.status(404).json({ message: "Post not found." });
      return;
    }

    res.json({ post });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts
export const createPost: RequestHandler = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      !title.trim() ||
      !content.trim() ||
      title.trim().length > 255
    ) {
      res.status(400).json({
        message:
          "Valid title (maximum 255 characters) and content are required.",
      });
      return;
    }

    const post = await postService.createPost(
      req.session.userId!,
      title.trim(),
      content.trim(),
    );

    res.status(201).json({
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/posts/:id
export const updatePost: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid post ID." });
      return;
    }

    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      !title.trim() ||
      !content.trim() ||
      title.trim().length > 255
    ) {
      res.status(400).json({
        message:
          "Valid title (maximum 255 characters) and content are required.",
      });
      return;
    }

    const post = await postService.updatePost(
      id,
      req.session.userId!,
      title.trim(),
      content.trim(),
    );

    if (!post) {
      res.status(404).json({
        message: "Post not found or you are not the owner.",
      });
      return;
    }

    res.json({
      message: "Post updated successfully.",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id
export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid post ID." });
      return;
    }

    const deleted = await postService.deletePost(id);

    if (!deleted) {
      res.status(404).json({ message: "Post not found." });
      return;
    }

    res.json({ message: "Post deleted successfully." });
  } catch (error) {
    next(error);
  }
};
