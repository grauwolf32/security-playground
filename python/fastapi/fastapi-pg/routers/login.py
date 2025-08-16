from fastapi import APIRouter, Depends, HTTPException
from models.responses import LoginResponse
from models.requests import LoginRequest
from models.domain import Users
from adapters.db import SessionDep
from services.users import UserManagementService
from utils.security import verify_user_password

login_router = APIRouter(tags=["login"])

@login_router.post("/login", response_model=LoginResponse)
def login(session:SessionDep, req:LoginRequest):
    user = UserManagementService(session=session).get_user_by_name(req.username)

    if user.password is None:
        return LoginResponse(success=False)
    
    is_valid = verify_user_password(password=req.password, password_hash=user.password)
    return LoginResponse(success=is_valid)
