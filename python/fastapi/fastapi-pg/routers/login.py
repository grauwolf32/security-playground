from adapters.db import SessionDep
from models.domain import Users
from models.requests import LoginRequest
from models.responses import LoginResponse
from services.sessions import SessionManagementService
from services.users import UserManagementService
from utils.security import verify_user_password

from fastapi import APIRouter, HTTPException, Response

login_router = APIRouter(tags=["login"])


@login_router.post("/login", response_model=LoginResponse)
def login(session: SessionDep, req: LoginRequest, response: Response):
    user = UserManagementService(session=session).get_user_by_name(req.username)

    if user.password is None:
        return LoginResponse(success=False)

    is_valid = verify_user_password(password=req.password, password_hash=user.password)
    session_id = SessionManagementService(session=session).create_session(user_id=user.id)
    response.set_cookie(key="pg_session_id", value=session_id)

    return LoginResponse(success=is_valid)
