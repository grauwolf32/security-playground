import express from "express";

import { applyMigrations } from "./db/connection";
import { errorHandler } from "./middleware/errors";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { accountsRouter } from "./routes/accounts";
import { cardsRouter } from "./routes/cards";
import { fxRouter } from "./routes/fx";
import { meRouter } from "./routes/me";
import { promosRouter } from "./routes/promos";
import { transfersRouter } from "./routes/transfers";
import { webhooksRouter } from "./routes/webhooks";

export function buildApp(): express.Express {
  applyMigrations();

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.use("/auth", authRouter);
  app.use("/me", meRouter);
  app.use("/accounts", accountsRouter);
  app.use("/transfers", transfersRouter);
  app.use("/cards", cardsRouter);
  app.use("/promos", promosRouter);
  app.use("/fx", fxRouter);
  app.use("/admin", adminRouter);
  app.use("/webhooks", webhooksRouter);

  app.use(errorHandler);
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 4444);
  buildApp().listen(port, () => {
    console.log(`vault-pay listening on :${port}`);
  });
}
