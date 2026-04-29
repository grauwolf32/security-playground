import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (typeof err === "object" && err && "status" in err) {
    const status = Number((err as { status: unknown }).status) || 500;
    const message = (err as { message?: string }).message ?? "error";
    res.status(status).json({ error: message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "internal" });
}
