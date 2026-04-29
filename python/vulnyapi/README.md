# vulnyapi

Mid-sized intentionally-vulnerable FastAPI service used as a fixture for the
`contractor` agent evaluation pipeline. The code looks plausible but contains
deliberate flaws covering each of the analyzer's focus areas (appsec, datasec,
ddos). Do not use any of this in production.

## Domain

Personal-notes API: users register, log in (JWT or session cookie), create
private notes, search them, and share notes via a tester webhook. There is an
`/admin` surface and a file upload for attachments.

## Endpoints

```
POST   /auth/register
POST   /auth/login
POST   /auth/password/reset/request
POST   /auth/password/reset/confirm

GET    /users/{user_id}
GET    /users/{user_id}/notes

POST   /notes
DELETE /notes/{note_id}
GET    /notes/search

POST   /webhooks/test

GET    /admin/users

POST   /files/upload
```

## Vulnerabilities (intentional)

- **appsec / IDOR** — `/users/{user_id}`, `/users/{user_id}/notes`, `DELETE /notes/{note_id}` resolve resources by integer id without an ownership check.
- **appsec / SQLi** — `/notes/search` builds the `WHERE` clause with f-string interpolation.
- **appsec / SSRF** — `/webhooks/test` issues an outbound HTTP request to a user-supplied URL with no scheme/host validation.
- **appsec / CSRF** — state-changing endpoints accept the `pg_session_id` cookie without an anti-CSRF token; `application/x-www-form-urlencoded` is supported on `/notes`.
- **appsec / Path Traversal** — `/files/upload` writes to a path constructed from the client-supplied filename.
- **appsec / Broken Access Control** — `/admin/users` is gated by a header check that is not enforced server-side.
- **datasec / Credential Exposure** — `/auth/register` returns the bcrypt password hash; `/admin/users` returns hashed passwords.
- **datasec / PII Exposure** — `/users/{user_id}` exposes phone/email regardless of caller identity.
- **ddos / Brute Force** — `/auth/login` has no rate-limit, lockout, or backoff.
- **ddos / SMS Bomb & OTP Brute Force** — `/auth/password/reset/request` calls the SMS gateway with no per-phone throttle; `/auth/password/reset/confirm` has no attempt counter.
