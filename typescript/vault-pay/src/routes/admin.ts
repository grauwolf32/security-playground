import { Router } from "express";

import { auditRepo } from "../db/repos/audit";
import { usersRepo } from "../db/repos/users";
import { requireAdmin } from "../middleware/requireAdmin";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/audit", (_req, res) => {
  res.json(auditRepo.recent(500));
});

adminRouter.get("/users", (_req, res) => {
  const users = usersRepo.list();
  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.display_name,
      phone: u.phone,
      isAdmin: !!u.is_admin,
      passwordHash: u.password_hash,
      totpSecret: u.totp_secret,
    })),
  );
});
