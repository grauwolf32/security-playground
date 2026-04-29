import { db } from "../connection";
import { Account } from "../../types/models";

export const accountsRepo = {
  byId(id: number): Account | undefined {
    return db.prepare("SELECT * FROM accounts WHERE id = ?").get(id) as
      | Account
      | undefined;
  },

  forOwner(ownerId: number): Account[] {
    return db
      .prepare("SELECT * FROM accounts WHERE owner_id = ? ORDER BY id")
      .all(ownerId) as Account[];
  },

  insert(ownerId: number, currency: string): Account {
    const info = db
      .prepare(
        "INSERT INTO accounts (owner_id, currency, balance_minor) VALUES (?, ?, 0)",
      )
      .run(ownerId, currency);
    return this.byId(Number(info.lastInsertRowid))!;
  },

  setBalance(id: number, balanceMinor: number): void {
    db.prepare("UPDATE accounts SET balance_minor = ? WHERE id = ?").run(
      balanceMinor,
      id,
    );
  },
};
