import { RequestHandler } from "express";

export const authorizeAdmin: RequestHandler = (req, res, next) => {
  // Check whether the logged-in user is an admin
  if (req.session.role !== "admin") {
    res.status(403).json({
      message: "Forbidden. Admin permission required.",
    });
    return;
  }

  next();
};
