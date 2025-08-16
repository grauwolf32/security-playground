from models.domain import Messages
from pydantic import BaseModel

from fastapi import HTTPException


class LoginResponse(BaseModel):
    success: bool

class GetMessagesResponse(BaseModel):
    sent: list[Messages]
    received: list[Messages]
