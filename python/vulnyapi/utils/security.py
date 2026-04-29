"""Security primitives: JWT, password hashing, raw-SQL helpers.

The JWT secret is loaded from the environment but falls back to a hard-coded
default — convenient for local dev, dangerous if shipped.
"""

import os
from datetime import datetime, timedelta
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import text
from sqlmodel import Session

JWT_SECRET = os.environ.get("VULNYAPI_JWT_SECRET", "dev-secret-change-me")
JWT_ALG = "HS256"
JWT_TTL_MINUTES = 60 * 24

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _pwd.verify(password, password_hash)
    except ValueError:
        return False


def issue_token(user_id: int) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_TTL_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        return None
    sub = payload.get("sub")
    if sub is None:
        return None
    try:
        return int(sub)
    except (TypeError, ValueError):
        return None


def raw_query(session: Session, sql: str, **params: Any) -> list[dict]:
    """Execute a raw SQL string and return rows as dicts.

    Callers are expected to interpolate parameters themselves; this is a
    convenience wrapper for ad-hoc queries from the search endpoints.
    """
    rows = session.exec(text(sql), params=params).all()
    return [dict(row._mapping) for row in rows]
