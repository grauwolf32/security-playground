# vault-pay

Mid-sized intentionally-vulnerable TypeScript/Express service used as a fixture
for the `contractor` agent evaluation pipeline. Models a small P2P money
transfer / ledger API: users have multi-currency accounts, send transfers to
each other, redeem promo codes, store payment cards, and trigger FX quotes.

The code is shaped like a normal small fintech backend; the flaws are
deliberate and chosen to look like things a junior developer might commit.
Do not run any of this against real funds.

## Endpoints

```
POST   /auth/register
POST   /auth/login
POST   /auth/2fa/verify

GET    /me

GET    /accounts/:accountId
GET    /accounts/:accountId/transactions

POST   /transfers
GET    /transfers/:transferId
POST   /transfers/:transferId/cancel

POST   /cards
GET    /cards/:cardId/full

POST   /promos/redeem

POST   /fx/quote

GET    /admin/audit

POST   /webhooks/payment
```

## Vulnerabilities (intentional)

- **finance / TOCTOU on balance** — `POST /transfers` reads the balance, then
  applies the debit in a separate statement; concurrent requests can over-spend.
- **finance / negative amount** — the transfer route validates `amount` is a
  number, not that it is positive. Sending `-100` *credits* the sender.
- **finance / idempotency-key bypass** — `Idempotency-Key` is recorded *after*
  the debit lands; concurrent retries debit twice.
- **finance / double refund** — `POST /transfers/:id/cancel` re-credits funds
  without checking that the transfer is still in `pending` state.
- **finance / promo race condition** — `POST /promos/redeem` checks `used`
  before incrementing; concurrent calls all observe `used=false`.
- **datasec / PAN reversible storage** — cards are encrypted with AES-256-CBC
  using a static key from `process.env.CARD_ENC_KEY` with a hard-coded
  fallback; `GET /cards/:id/full` returns the decrypted PAN.
- **datasec / sensitive logging** — promo codes and card last4s are logged on
  every request via the audit middleware.
- **appsec / IDOR** — `/accounts/:accountId`, `/accounts/:accountId/transactions`,
  `/transfers/:transferId`, `/cards/:cardId/full` resolve resources by id with
  no ownership check.
- **appsec / SSRF** — `POST /fx/quote` calls an outbound URL passed in the
  request body (`provider` field).
- **appsec / Broken Access Control** — `/admin/*` is gated by an
  `X-Admin: 1` header that is read but never enforced.
- **appsec / TOTP replay** — `/auth/2fa/verify` checks a 6-digit code by
  string equality and does not record consumed codes; the same code works
  inside its 30s window any number of times.
- **appsec / webhook signature timing-leak** — `/webhooks/payment` compares
  the HMAC signature with `===` (not constant-time) and bypasses the check
  entirely if the header is missing in `NODE_ENV=development`.
- **ddos / brute force** — `/auth/login` and `/auth/2fa/verify` have no
  rate-limit, lockout, or backoff.
```
