export interface User {
  id: number;
  email: string;
  display_name: string;
  phone: string | null;
  password_hash: string;
  totp_secret: string | null;
  is_admin: number;
  created_at: string;
}

export interface Account {
  id: number;
  owner_id: number;
  currency: string;
  balance_minor: number;
  created_at: string;
}

export interface Transfer {
  id: number;
  from_account_id: number;
  to_account_id: number;
  amount_minor: number;
  currency: string;
  idempotency_key: string | null;
  status: string;
  memo: string | null;
  created_at: string;
}

export interface Card {
  id: number;
  user_id: number;
  pan_encrypted: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  created_at: string;
}

export interface Promo {
  id: number;
  code: string;
  bonus_minor: number;
  currency: string;
  used: number;
  redeemed_by: number | null;
  created_at: string;
}

export interface AuditEntry {
  id: number;
  user_id: number | null;
  action: string;
  details: string | null;
  created_at: string;
}

export type TransferStatus = "pending" | "settled" | "cancelled" | "failed";
