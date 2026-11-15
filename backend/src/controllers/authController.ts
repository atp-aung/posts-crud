import { RequestHandler } from "express";
import * as authService from "../services/authService";

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      res.status(400).json({
        message:
          "Valid username, email and password (at least 8 characters) are required.",
      });
      return;
    }

    const user = await authService.signup(
      username.trim(),
      email.trim().toLowerCase(),
      password,
    );

    res.status(201).json({
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Username or email already exists."
    ) {
      res.status(409).json({ message: error.message });
      return;
    }

    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        message: "Email and password are required.",
      });
      return;
    }

    const user = await authService.login(email.trim().toLowerCase(), password);

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    // Regenerate session ID after login to prevent session fixation.
    req.session.regenerate((error) => {
      if (error) {
        next(error);
        return;
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      req.session.save((saveError) => {
        if (saveError) {
          next(saveError);
          return;
        }

        res.json({
          message: "Login successful.",
          user,
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("posts_crud.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.json({ message: "Logout successful." });
  });
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ message: "Please login first." });
      return;
    }

    const user = await authService.getCurrentUser(req.session.userId);

    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ message: "User account no longer exists." });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      newPassword.length < 8
    ) {
      res.status(400).json({
        message:
          "Current password and a new password (at least 8 characters) are required.",
      });
      return;
    }

    if (!req.session.userId) {
      res.status(401).json({ message: "Please login first." });
      return;
    }

    const result = await authService.changePassword(
      req.session.userId,
      currentPassword,
      newPassword,
    );

    if (result === "not-found") {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (result === "incorrect-password") {
      res.status(400).json({ message: "Current password is incorrect." });
      return;
    }

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};
