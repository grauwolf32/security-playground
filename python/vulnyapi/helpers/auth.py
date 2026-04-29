"""Request authentication helpers.

`current_user` accepts EITHER a Bearer JWT or a `pg_session_id` cookie. Both
forms are honoured for every protected endpoint, which means cookie-bearing
browsers can be made to issue state-changing requests cross-site.
"""

from typing import Annotated, Optional

from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlmodel import select

from adapters.db import SessionDep
from models.domain import Session as DBSession
from models.domain import User
from utils.security import decode_token


def _user_from_jwt(authorization: Optional[str], db) -> Optional[User]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    user_id = decode_token(token)
    if user_id is None:
        return None
    return db.get(User, user_id)


def _user_from_cookie(pg_session_id: Optional[str], db) -> Optional[User]:
    if not pg_session_id:
        return None
    row = db.exec(select(DBSession).where(DBSession.token == pg_session_id)).first()
    if row is None:
        return None
    return db.get(User, row.user_id)


def current_user(
    db: SessionDep,
    authorization: Annotated[Optional[str], Header()] = None,
    pg_session_id: Annotated[Optional[str], Cookie()] = None,
) -> User:
    user = _user_from_jwt(authorization, db) or _user_from_cookie(pg_session_id, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user


CurrentUser = Annotated[User, Depends(current_user)]


def maybe_current_user(
    db: SessionDep,
    authorization: Annotated[Optional[str], Header()] = None,
    pg_session_id: Annotated[Optional[str], Cookie()] = None,
) -> Optional[User]:
    return _user_from_jwt(authorization, db) or _user_from_cookie(pg_session_id, db)


MaybeCurrentUser = Annotated[Optional[User], Depends(maybe_current_user)]
