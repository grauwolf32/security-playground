from pydantic import BaseModel
from sqlmodel import SQLModel, Field

class Users(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str|None = Field(max_length=256)
    password: str|None = Field(max_length=256)

class Messages(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    sender: int = Field(foreign_key="users.id")
    receiver: int = Field(foreign_key="users.id")
    message: str 

class Sessions(SQLModel, table=True):
    id: str = Field(default=None, max_length=256, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    expired_at:int