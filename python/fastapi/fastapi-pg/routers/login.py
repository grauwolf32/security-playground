from fastapi import APIRouter, Depends, HTTPException
from models.responses import LoginResponse
from models.requests import LoginRequest
from adapters.db import SessionDep

login_router = APIRouter(tags=["login"])

@login_router.post("/login", response_model=LoginResponse)
def login(req:LoginRequest):
    return LoginResponse(success=True)
