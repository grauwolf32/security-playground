import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";

import { usersRepo } from "../db/repos/users";
import { User } from "../types/models";

const JWT_SECRET = process.env.JWT_SECRET ?? "vault-pay-dev-jwt-secret";
const JWT_TTL = "24h";

const CHALLENGE_SECRET =
  process.env.TWO_FACTOR_CHALLENGE_SECRET ?? "vault-pay-2fa-challenge";
const CHALLENGE_TTL = "5m";

export interface ChallengeClaims {
  sub: string;
  scope: "2fa-pending";
  iat: number;
  exp: number;
}

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  issueAccessToken(user: User): string {
    return jwt.sign(
      { sub: String(user.id), email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_TTL },
    );
  },

  decodeAccessToken(token: string): { sub: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        sub: string;
        email: string;
      };
      return decoded;
    } catch {
      return null;
    }
  },

  issueChallengeToken(user: User): string {
    return jwt.sign(
      { sub: String(user.id), scope: "2fa-pending" },
      CHALLENGE_SECRET,
      { expiresIn: CHALLENGE_TTL },
    );
  },

  decodeChallengeToken(token: string): ChallengeClaims | null {
    try {
      return jwt.verify(token, CHALLENGE_SECRET) as ChallengeClaims;
    } catch {
      return null;
    }
  },

  // Verify a 6-digit TOTP code against the user's stored secret. The code
  // is checked with `===` against the *current* window's expected digits.
  verifyTotp(user: User, code: string): boolean {
    if (!user.totp_secret) return false;
    const expected = authenticator.generate(user.totp_secret);
    return expected === code;
  },

  userFromAuthHeader(header: string | undefined): User | null {
    if (!header) return null;
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) return null;
    const claims = this.decodeAccessToken(token);
    if (!claims) return null;
    return usersRepo.byId(Number(claims.sub)) ?? null;
  },
};
