from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=2, max_length=64)
    email: EmailStr
    phone: str = Field(min_length=5, max_length=32)
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


class PasswordResetRequest(BaseModel):
    phone: str


class PasswordResetConfirm(BaseModel):
    phone: str
    code: str
    new_password: str


class CreateNoteRequest(BaseModel):
    title: str
    body: str
    is_private: bool = True


class WebhookTestRequest(BaseModel):
    url: str
    payload: Optional[dict] = None


class FileUploadMeta(BaseModel):
    filename: str
    description: Optional[str] = None
