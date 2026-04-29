import { Router } from "express";

import { transfersRepo } from "../db/repos/transfers";
import { requireAuth } from "../middleware/auth";
import { transferService, TransferError } from "../services/transfers";
import { TransferRequest } from "../types/requests";

export const transfersRouter = Router();

transfersRouter.post("/", requireAuth, (req, res, next) => {
  try {
    const body = TransferRequest.parse(req.body);
    const idempotencyKey =
      typeof req.header("Idempotency-Key") === "string"
        ? (req.header("Idempotency-Key") as string)
        : null;
    const transfer = transferService.initiate(body, idempotencyKey);
    res.status(201).json({
      id: transfer.id,
      fromAccountId: transfer.from_account_id,
      toAccountId: transfer.to_account_id,
      amountMinor: transfer.amount_minor,
      currency: transfer.currency,
      status: transfer.status,
      memo: transfer.memo,
      createdAt: transfer.created_at,
    });
  } catch (err) {
    if (err instanceof TransferError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
});

transfersRouter.get("/:transferId", requireAuth, (req, res) => {
  const transfer = transfersRepo.byId(Number(req.params.transferId));
  if (!transfer) {
    res.status(404).json({ error: "transfer not found" });
    return;
  }
  res.json({
    id: transfer.id,
    fromAccountId: transfer.from_account_id,
    toAccountId: transfer.to_account_id,
    amountMinor: transfer.amount_minor,
    currency: transfer.currency,
    status: transfer.status,
    memo: transfer.memo,
    createdAt: transfer.created_at,
  });
});

transfersRouter.post("/:transferId/cancel", requireAuth, (req, res, next) => {
  try {
    const transfer = transferService.cancel(Number(req.params.transferId));
    res.json({
      id: transfer.id,
      status: transfer.status,
    });
  } catch (err) {
    if (err instanceof TransferError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
});
