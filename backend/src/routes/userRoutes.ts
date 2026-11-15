import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticate } from "../middleware/authenticate";
import { authorizeAdmin } from "../middleware/authorizeAdmin";

const router = Router();

// Admin only: view all users
router.get("/", authenticate, authorizeAdmin, userController.getAllUsers);

// Admin only: view one user
router.get("/:id", authenticate, authorizeAdmin, userController.getUserById);

// Admin only: delete user
router.delete("/:id", authenticate, authorizeAdmin, userController.deleteUser);

export default router;
