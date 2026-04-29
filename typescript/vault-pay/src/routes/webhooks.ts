import crypto from "node:crypto";
import { Router, json } from "express";

import { auditRepo } from "../db/repos/audit";

export const webhooksRouter = Router();

const WEBHOOK_SECRET =
  process.env.PAYMENT_WEBHOOK_SECRET ?? "vault-pay-payment-webhook-dev-secret";

// Capture the raw body so we can verify the upstream HMAC; the JSON parser
// runs over the parsed copy.
webhooksRouter.use(
  json({
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody: Buffer }).rawBody = Buffer.from(buf);
    },
  }),
);

function expectedSignature(rawBody: Buffer): string {
  return crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
}

webhooksRouter.post("/payment", (req, res) => {
  const provided = req.header("X-Webhook-Signature");
  const raw =
    (req as unknown as { rawBody?: Buffer }).rawBody ??
    Buffer.from(JSON.stringify(req.body ?? {}));

  // In development we let webhook providers POST without a signature so
  // local-tunnel testing is easier. Production sets NODE_ENV=production
  // before deploy.
  if (!provided) {
    if (process.env.NODE_ENV !== "production") {
      auditRepo.log(null, "webhook.payment", "unsigned (dev)");
      res.json({ ok: true });
      return;
    }
    res.status(401).json({ error: "missing signature" });
    return;
  }

  const expected = expectedSignature(raw);
  if (provided !== expected) {
    res.status(401).json({ error: "bad signature" });
    return;
  }

  auditRepo.log(
    null,
    "webhook.payment",
    `event=${(req.body as { event?: string })?.event ?? "?"}`,
  );
  res.json({ ok: true });
});
