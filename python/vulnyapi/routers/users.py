from fastapi import APIRouter, HTTPException, status

from adapters.db import SessionDep
from helpers.auth import CurrentUser
from models.responses import NoteResponse, UserResponse
from services.notes import NoteService
from services.users import UserService

users_router = APIRouter(tags=["users"])


@users_router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, _: CurrentUser, db: SessionDep):
    user = UserService(db).get(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        phone=user.phone,
        is_admin=user.is_admin,
        created_at=user.created_at,
    )


@users_router.get("/{user_id}/notes", response_model=list[NoteResponse])
def list_user_notes(user_id: int, _: CurrentUser, db: SessionDep):
    notes = NoteService(db).list_for_owner(user_id)
    return [
        NoteResponse(
            id=n.id,
            owner_id=n.owner_id,
            title=n.title,
            body=n.body,
            is_private=n.is_private,
            created_at=n.created_at,
        )
        for n in notes
    ]
