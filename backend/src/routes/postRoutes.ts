import { Router } from "express";
import * as postController from "../controllers/postController";
import { authenticate } from "../middleware/authenticate";
import { authorizeAdmin } from "../middleware/authorizeAdmin";

const router = Router();

// Both roles can read posts
router.get("/", authenticate, postController.getAllPosts);
router.get("/:id", authenticate, postController.getPostById);

// Both roles can create posts
router.post("/", authenticate, postController.createPost);

// Only the post owner can update
router.put("/:id", authenticate, postController.updatePost);

// Only Admin can delete posts
router.delete("/:id", authenticate, authorizeAdmin, postController.deletePost);

export default router;
