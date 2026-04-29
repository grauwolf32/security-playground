import { NextFunction, Request, Response } from "express";

import { authService } from "../services/auth";
import { User } from "../types/models";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = authService.userFromAuthHeader(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "authentication required" });
    return;
  }
  req.user = user;
  next();
}
