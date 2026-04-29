import { Router } from "express";

import { auditRepo } from "../db/repos/audit";
import { usersRepo } from "../db/repos/users";
import { authService } from "../services/auth";
import {
  LoginRequest,
  RegisterRequest,
  TwoFactorVerifyRequest,
} from "../types/requests";
import { LoginResponse } from "../types/responses";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = RegisterRequest.parse(req.body);
    const existing = usersRepo.byEmail(body.email);
    if (existing) {
      res.status(409).json({ error: "email already registered" });
      return;
    }
    const passwordHash = await authService.hashPassword(body.password);
    const user = usersRepo.insert({
      email: body.email,
      displayName: body.displayName,
      phone: body.phone ?? null,
      passwordHash,
      totpSecret: null,
    });
    auditRepo.log(user.id, "auth.register", `email=${user.email}`);
    res
      .status(201)
      .json({ accessToken: authService.issueAccessToken(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = LoginRequest.parse(req.body);
    const user = usersRepo.byEmail(body.email);
    if (!user) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }
    const ok = await authService.verifyPassword(body.password, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }
    if (user.totp_secret) {
      const challenge: LoginResponse = {
        challengeToken: authService.issueChallengeToken(user),
        twoFactorRequired: true,
      };
      res.json(challenge);
      return;
    }
    const completed: LoginResponse = {
      accessToken: authService.issueAccessToken(user),
      twoFactorRequired: false,
    };
    res.json(completed);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/2fa/verify", (req, res, next) => {
  try {
    const body = TwoFactorVerifyRequest.parse(req.body);
    const claims = authService.decodeChallengeToken(body.challengeToken);
    if (!claims || claims.scope !== "2fa-pending") {
      res.status(401).json({ error: "invalid challenge" });
      return;
    }
    const user = usersRepo.byId(Number(claims.sub));
    if (!user) {
      res.status(401).json({ error: "invalid challenge" });
      return;
    }
    if (!authService.verifyTotp(user, body.code)) {
      res.status(401).json({ error: "invalid code" });
      return;
    }
    res.json({ accessToken: authService.issueAccessToken(user) });
  } catch (err) {
    next(err);
  }
});
