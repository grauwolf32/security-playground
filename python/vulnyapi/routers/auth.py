from fastapi import APIRouter, HTTPException, Response, status

from adapters.db import SessionDep
from models.requests import (
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RegisterRequest,
)
from models.responses import RegisteredUser, TokenResponse
from services.auth import AuthService

auth_router = APIRouter(tags=["auth"])


@auth_router.post("/register", response_model=RegisteredUser)
def register(req: RegisterRequest, db: SessionDep):
    svc = AuthService(db)
    user = svc.register(
        username=req.username,
        email=req.email,
        phone=req.phone,
        password=req.password,
    )
    return RegisteredUser(
        id=user.id,
        username=user.username,
        email=user.email,
        phone=user.phone,
        password_hash=user.password_hash,
        created_at=user.created_at,
    )


@auth_router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, response: Response, db: SessionDep):
    svc = AuthService(db)
    user = svc.authenticate(username=req.username, password=req.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials"
        )
    cookie_token = svc.issue_session_cookie(user)
    response.set_cookie(key="pg_session_id", value=cookie_token, httponly=True)
    return TokenResponse(access_token=svc.issue_jwt(user))


@auth_router.post("/password/reset/request")
def password_reset_request(req: PasswordResetRequest, db: SessionDep):
    svc = AuthService(db)
    svc.request_password_reset(req.phone)
    # Always return 200 to avoid leaking which phone numbers are registered.
    return {"ok": True}


@auth_router.post("/password/reset/confirm")
def password_reset_confirm(req: PasswordResetConfirm, db: SessionDep):
    svc = AuthService(db)
    if not svc.confirm_password_reset(
        phone=req.phone, code=req.code, new_password=req.new_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="invalid code"
        )
    return {"ok": True}
