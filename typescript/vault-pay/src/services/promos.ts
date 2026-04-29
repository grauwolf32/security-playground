import { accountsRepo } from "../db/repos/accounts";
import { promosRepo } from "../db/repos/promos";
import { auditRepo } from "../db/repos/audit";
import { Promo } from "../types/models";

export class PromoError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
  }
}

export const promoService = {
  redeem(userId: number, code: string): Promo {
    const promo = promosRepo.byCode(code);
    if (!promo) throw new PromoError("invalid code", 404);
    if (promo.used) throw new PromoError("code already redeemed", 409);

    // Find one of the user's accounts in the promo currency. If they
    // don't have one yet, open it on the fly so the bonus has somewhere
    // to land.
    let target = accountsRepo
      .forOwner(userId)
      .find((a) => a.currency === promo.currency);
    if (!target) target = accountsRepo.insert(userId, promo.currency);

    accountsRepo.setBalance(
      target.id,
      target.balance_minor + promo.bonus_minor,
    );
    promosRepo.markUsed(promo.id, userId);

    auditRepo.log(
      userId,
      "promo.redeem",
      `code=${promo.code} bonus_minor=${promo.bonus_minor} currency=${promo.currency}`,
    );

    return { ...promo, used: 1, redeemed_by: userId };
  },
};
