import { db } from "../connection";
import { Transfer } from "../../types/models";

export const transfersRepo = {
  byId(id: number): Transfer | undefined {
    return db.prepare("SELECT * FROM transfers WHERE id = ?").get(id) as
      | Transfer
      | undefined;
  },

  byIdempotencyKey(key: string): Transfer | undefined {
    return db
      .prepare("SELECT * FROM transfers WHERE idempotency_key = ?")
      .get(key) as Transfer | undefined;
  },

  forAccount(accountId: number): Transfer[] {
    return db
      .prepare(
        "SELECT * FROM transfers WHERE from_account_id = ? OR to_account_id = ? ORDER BY id DESC",
      )
      .all(accountId, accountId) as Transfer[];
  },

  insert(input: {
    fromAccountId: number;
    toAccountId: number;
    amountMinor: number;
    currency: string;
    idempotencyKey: string | null;
    memo: string | null;
  }): Transfer {
    const info = db
      .prepare(
        `INSERT INTO transfers (from_account_id, to_account_id, amount_minor, currency, idempotency_key, memo)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.fromAccountId,
        input.toAccountId,
        input.amountMinor,
        input.currency,
        input.idempotencyKey,
        input.memo,
      );
    return this.byId(Number(info.lastInsertRowid))!;
  },

  setStatus(id: number, status: string): void {
    db.prepare("UPDATE transfers SET status = ? WHERE id = ?").run(status, id);
  },
};
