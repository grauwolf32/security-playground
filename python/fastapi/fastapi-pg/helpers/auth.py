import time
from typing import Annotated

from sqlmodel import Session
from services.sessions import SessionManagementService

from fastapi import HTTPException


def verify_cookie(pg_session_id: str | None, session: Session):
    if pg_session_id is None:
        raise HTTPException(status_code = 401, detail = "Not authenticated!")

    user_session = SessionManagementService(session).get_session_by_id(
        session_id=pg_session_id
    )

    if user_session is None:
        raise HTTPException(status_code = 401, detail = "Session not found!")

    if user_session.expired_at < int(time.time()):
        raise HTTPException(status_code = 401, detail = "Session expired!")

    return user_session.user_id
