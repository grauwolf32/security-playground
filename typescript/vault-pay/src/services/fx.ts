import axios from "axios";

import { FxQuoteDto } from "../types/responses";
import { FxQuoteRequest } from "../types/requests";

const DEFAULT_PROVIDER =
  process.env.FX_PROVIDER_URL ?? "https://fx.internal/quote";

export const fxService = {
  async quote(req: FxQuoteRequest): Promise<FxQuoteDto> {
    const provider = req.provider ?? DEFAULT_PROVIDER;
    const resp = await axios.get(provider, {
      params: { base: req.base, quote: req.quote },
      timeout: 5_000,
    });
    const rate = Number(resp.data?.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("provider returned no rate");
    }
    return {
      base: req.base,
      quote: req.quote,
      rate,
      amountMinor: req.amountMinor,
      convertedMinor: Math.round(req.amountMinor * rate),
      provider,
    };
  },
};
