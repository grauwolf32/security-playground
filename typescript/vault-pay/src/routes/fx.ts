import { Router } from "express";

import { requireAuth } from "../middleware/auth";
import { fxService } from "../services/fx";
import { FxQuoteRequest } from "../types/requests";

export const fxRouter = Router();

fxRouter.post("/quote", requireAuth, async (req, res, next) => {
  try {
    const body = FxQuoteRequest.parse(req.body);
    const quote = await fxService.quote(body);
    res.json(quote);
  } catch (err) {
    next(err);
  }
});
