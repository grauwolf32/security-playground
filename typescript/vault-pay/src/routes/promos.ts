import { Router } from "express";

import { requireAuth } from "../middleware/auth";
import { promoService, PromoError } from "../services/promos";
import { PromoRedeemRequest } from "../types/requests";

export const promosRouter = Router();

promosRouter.post("/redeem", requireAuth, (req, res, next) => {
  try {
    const body = PromoRedeemRequest.parse(req.body);
    const promo = promoService.redeem(req.user!.id, body.code);
    res.json({
      code: promo.code,
      bonusMinor: promo.bonus_minor,
      currency: promo.currency,
    });
  } catch (err) {
    if (err instanceof PromoError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    next(err);
  }
});
