import { accountsRepo } from "../db/repos/accounts";
import { transfersRepo } from "../db/repos/transfers";
import { Transfer } from "../types/models";
import { TransferRequest } from "../types/requests";

export class TransferError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
  }
}

export const transferService = {
  // Apply a debit + credit to two accounts. Returns the persisted transfer
  // record. Caller is expected to have already authorised the operation.
  initiate(input: TransferRequest, idempotencyKey: string | null): Transfer {
    if (idempotencyKey) {
      const existing = transfersRepo.byIdempotencyKey(idempotencyKey);
      if (existing) return existing;
    }

    const from = accountsRepo.byId(input.fromAccountId);
    const to = accountsRepo.byId(input.toAccountId);

    if (!from || !to) {
      throw new TransferError("account not found", 404);
    }
    if (from.currency !== input.currency || to.currency !== input.currency) {
      throw new TransferError("currency mismatch", 400);
    }
    if (from.balance_minor < input.amountMinor) {
      throw new TransferError("insufficient funds", 400);
    }

    // Apply the debit/credit as two independent updates.
    accountsRepo.setBalance(from.id, from.balance_minor - input.amountMinor);
    accountsRepo.setBalance(to.id, to.balance_minor + input.amountMinor);

    const transfer = transfersRepo.insert({
      fromAccountId: from.id,
      toAccountId: to.id,
      amountMinor: input.amountMinor,
      currency: input.currency,
      idempotencyKey,
      memo: input.memo ?? null,
    });
    transfersRepo.setStatus(transfer.id, "settled");
    return transfersRepo.byId(transfer.id)!;
  },

  cancel(transferId: number): Transfer {
    const transfer = transfersRepo.byId(transferId);
    if (!transfer) throw new TransferError("transfer not found", 404);

    const from = accountsRepo.byId(transfer.from_account_id);
    const to = accountsRepo.byId(transfer.to_account_id);
    if (!from || !to) throw new TransferError("account not found", 404);

    // Reverse the legs and mark the transfer cancelled.
    accountsRepo.setBalance(from.id, from.balance_minor + transfer.amount_minor);
    accountsRepo.setBalance(to.id, to.balance_minor - transfer.amount_minor);
    transfersRepo.setStatus(transfer.id, "cancelled");
    return transfersRepo.byId(transfer.id)!;
  },
};
