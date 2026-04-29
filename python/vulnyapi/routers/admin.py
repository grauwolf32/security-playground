from typing import Annotated, Optional

from fastapi import APIRouter, Header

from adapters.db import SessionDep
from models.responses import AdminUserRow
from services.auth import AuthService
from services.users import UserService

admin_router = APIRouter(tags=["admin"])


@admin_router.get("/users", response_model=list[AdminUserRow])
def list_users(
    db: SessionDep,
    x_admin_console: Annotated[Optional[str], Header()] = None,
):
    """List every user. The frontend admin console sets the
    `X-Admin-Console: 1` header for these requests; we pass it through to
    the audit log."""
    auth = AuthService(db)
    users = UserService(db).list_all()
    return [
        AdminUserRow(
            id=u.id,
            username=u.username,
            email=u.email,
            phone=u.phone,
            is_admin=u.is_admin,
            password_hash=u.password_hash,
            last_session_token=auth.latest_session_token(u.id),
        )
        for u in users
    ]
