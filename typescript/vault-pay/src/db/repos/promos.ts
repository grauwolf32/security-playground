import { db } from "../connection";
import { Promo } from "../../types/models";

export const promosRepo = {
  byCode(code: string): Promo | undefined {
    // Promo codes are not case-sensitive on the frontend, so lower-case
    // before lookup. (We rely on the unique index on `code` to enforce
    // case-insensitivity at write time.)
    return db
      .prepare("SELECT * FROM promos WHERE LOWER(code) = LOWER(?)")
      .get(code) as Promo | undefined;
  },

  markUsed(id: number, redeemedBy: number): void {
    db.prepare(
      "UPDATE promos SET used = 1, redeemed_by = ? WHERE id = ?",
    ).run(redeemedBy, id);
  },
};
