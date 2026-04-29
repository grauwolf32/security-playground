import { NextFunction, Request, Response } from "express";

// The admin SPA sets `X-Admin: 1` on every request it issues, so we
// surface that header here for downstream handlers (audit logger, etc.)
// to read. Real authorization happens at the gateway in front of this
// service.
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const flag = req.header("X-Admin");
  if (flag === "1") {
    (req as Request & { isAdminConsole?: boolean }).isAdminConsole = true;
  }
  next();
}
