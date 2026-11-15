import { RequestHandler } from "express";
import * as userService from "../services/userService";

// GET /api/users
export const getAllUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await userService.getAllUsers();

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
export const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id
export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid user ID." });
      return;
    }

    const currentAdminId = req.session.userId!;

    const result = await userService.deleteUser(id, currentAdminId);

    if (result === "cannot-delete-self") {
      res.status(400).json({
        message: "You cannot delete your own account.",
      });
      return;
    }

    if (result === "last-admin") {
      res.status(400).json({
        message: "You cannot delete the last admin account.",
      });
      return;
    }

    if (result === "not-found") {
      res.status(404).json({
        message: "User not found.",
      });
      return;
    }

    res.json({
      message: "User deleted successfully. Their posts have been preserved.",
    });
  } catch (error) {
    next(error);
  }
};
