import { Router } from "express";

import { accountsRepo } from "../db/repos/accounts";
import { transfersRepo } from "../db/repos/transfers";
import { requireAuth } from "../middleware/auth";

export const accountsRouter = Router();

accountsRouter.get("/:accountId", requireAuth, (req, res) => {
  const accountId = Number(req.params.accountId);
  const account = accountsRepo.byId(accountId);
  if (!account) {
    res.status(404).json({ error: "account not found" });
    return;
  }
  res.json({
    id: account.id,
    ownerId: account.owner_id,
    currency: account.currency,
    balanceMinor: account.balance_minor,
  });
});

accountsRouter.get("/:accountId/transactions", requireAuth, (req, res) => {
  const accountId = Number(req.params.accountId);
  const account = accountsRepo.byId(accountId);
  if (!account) {
    res.status(404).json({ error: "account not found" });
    return;
  }
  const transfers = transfersRepo.forAccount(accountId);
  res.json(
    transfers.map((t) => ({
      id: t.id,
      fromAccountId: t.from_account_id,
      toAccountId: t.to_account_id,
      amountMinor: t.amount_minor,
      currency: t.currency,
      status: t.status,
      memo: t.memo,
      createdAt: t.created_at,
    })),
  );
});
