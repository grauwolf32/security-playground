import { z } from "zod";

export const RegisterRequest = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  phone: z.string().min(5).max(32).optional(),
  password: z.string().min(8).max(128),
});
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginRequest = z.infer<typeof LoginRequest>;

export const TwoFactorVerifyRequest = z.object({
  // Issued by /auth/login when the account has TOTP enabled.
  challengeToken: z.string(),
  code: z.string().length(6),
});
export type TwoFactorVerifyRequest = z.infer<typeof TwoFactorVerifyRequest>;

export const TransferRequest = z.object({
  fromAccountId: z.number().int(),
  toAccountId: z.number().int(),
  // Sub-unit (e.g. cents). Validated upstream as a number.
  amountMinor: z.number().int(),
  currency: z.string().length(3),
  memo: z.string().max(280).optional(),
});
export type TransferRequest = z.infer<typeof TransferRequest>;

export const CardCreateRequest = z.object({
  pan: z.string().min(13).max(19),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(2024).max(2099),
  cardholderName: z.string().min(1).max(100),
});
export type CardCreateRequest = z.infer<typeof CardCreateRequest>;

export const PromoRedeemRequest = z.object({
  code: z.string().min(2).max(64),
});
export type PromoRedeemRequest = z.infer<typeof PromoRedeemRequest>;

export const FxQuoteRequest = z.object({
  base: z.string().length(3),
  quote: z.string().length(3),
  amountMinor: z.number().int().positive(),
  // Optional FX provider URL; defaults to the configured upstream when
  // omitted. Useful for testing against staging providers.
  provider: z.string().url().optional(),
});
export type FxQuoteRequest = z.infer<typeof FxQuoteRequest>;
