import { Router } from "express";

import { cardsRepo } from "../db/repos/cards";
import { auditRepo } from "../db/repos/audit";
import { requireAuth } from "../middleware/auth";
import { decryptPan, encryptPan, last4 } from "../services/crypto";
import { CardCreateRequest } from "../types/requests";

export const cardsRouter = Router();

cardsRouter.post("/", requireAuth, (req, res, next) => {
  try {
    const body = CardCreateRequest.parse(req.body);
    const card = cardsRepo.insert({
      userId: req.user!.id,
      panEncrypted: encryptPan(body.pan),
      last4: last4(body.pan),
      expiryMonth: body.expiryMonth,
      expiryYear: body.expiryYear,
      cardholderName: body.cardholderName,
    });
    auditRepo.log(
      req.user!.id,
      "card.create",
      `last4=${card.last4} expiry=${card.expiry_month}/${card.expiry_year}`,
    );
    res.status(201).json({
      id: card.id,
      last4: card.last4,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      cardholderName: card.cardholder_name,
    });
  } catch (err) {
    next(err);
  }
});

cardsRouter.get("/:cardId/full", requireAuth, (req, res) => {
  const card = cardsRepo.byId(Number(req.params.cardId));
  if (!card) {
    res.status(404).json({ error: "card not found" });
    return;
  }
  res.json({
    id: card.id,
    pan: decryptPan(card.pan_encrypted),
    last4: card.last4,
    expiryMonth: card.expiry_month,
    expiryYear: card.expiry_year,
    cardholderName: card.cardholder_name,
  });
});
