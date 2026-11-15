import { RequestHandler } from "express";

export const authenticate: RequestHandler = (req, res, next) => {
  // Check whether the user has logged in
  if (!req.session.userId || !req.session.role) {
    res.status(401).json({
      message: "Unauthorized. Please login first.",
    });
    return;
  }

  next();
};
