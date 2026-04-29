import { db } from "../connection";
import { Card } from "../../types/models";

export const cardsRepo = {
  byId(id: number): Card | undefined {
    return db.prepare("SELECT * FROM cards WHERE id = ?").get(id) as
      | Card
      | undefined;
  },

  forUser(userId: number): Card[] {
    return db
      .prepare("SELECT * FROM cards WHERE user_id = ? ORDER BY id DESC")
      .all(userId) as Card[];
  },

  insert(input: {
    userId: number;
    panEncrypted: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    cardholderName: string;
  }): Card {
    const info = db
      .prepare(
        `INSERT INTO cards (user_id, pan_encrypted, last4, expiry_month, expiry_year, cardholder_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.userId,
        input.panEncrypted,
        input.last4,
        input.expiryMonth,
        input.expiryYear,
        input.cardholderName,
      );
    return this.byId(Number(info.lastInsertRowid))!;
  },
};
