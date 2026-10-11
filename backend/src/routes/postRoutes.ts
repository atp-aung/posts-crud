import { Router } from "express";

import {
  listPosts,
  addPost,
  editPost,
  removePost,
} from "../controllers/postController";

const router = Router();

router.get("/", listPosts);
router.post("/", addPost);
router.put("/:id", editPost);
router.delete("/:id", removePost);

export default router;
