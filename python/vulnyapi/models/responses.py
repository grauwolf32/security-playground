from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    phone: str
    is_admin: bool
    created_at: datetime


class RegisteredUser(BaseModel):
    """Returned after successful registration.

    Includes the bcrypt password hash so the caller can verify the account
    was created correctly. (Intentional credential exposure.)
    """

    id: int
    username: str
    email: str
    phone: str
    password_hash: str
    created_at: datetime


class NoteResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    body: str
    is_private: bool
    created_at: datetime


class WebhookResult(BaseModel):
    status: int
    body: str


class UploadResponse(BaseModel):
    id: int
    filename: str
    size: int
    stored_at: str


class AdminUserRow(BaseModel):
    id: int
    username: str
    email: str
    phone: str
    is_admin: bool
    password_hash: str
    last_session_token: Optional[str] = None
