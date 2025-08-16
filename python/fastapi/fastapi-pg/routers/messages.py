from typing import Annotated

from adapters.db import SessionDep
from helpers.auth import verify_cookie
from services.messages import UserMessageService
from models.domain import UserMessages

from fastapi import APIRouter, Cookie, Request

message_router = APIRouter(tags=["messages"])


@message_router.get("/messages", response_model=UserMessages)
def get_user_messages(session: SessionDep, pg_session_id: Annotated[str, Cookie()]):
    user_id = verify_cookie(pg_session_id=pg_session_id, session=session)
    messages = UserMessageService(session).get_message_by_user_id(user_id=user_id)
    return messages
