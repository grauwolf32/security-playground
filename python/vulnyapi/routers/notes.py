from fastapi import APIRouter, HTTPException, Query, status

from adapters.db import SessionDep
from helpers.auth import CurrentUser
from models.requests import CreateNoteRequest
from models.responses import NoteResponse
from services.notes import NoteService

notes_router = APIRouter(tags=["notes"])


@notes_router.post("", response_model=NoteResponse)
def create_note(req: CreateNoteRequest, user: CurrentUser, db: SessionDep):
    note = NoteService(db).create(
        owner_id=user.id,
        title=req.title,
        body=req.body,
        is_private=req.is_private,
    )
    return NoteResponse(
        id=note.id,
        owner_id=note.owner_id,
        title=note.title,
        body=note.body,
        is_private=note.is_private,
        created_at=note.created_at,
    )


@notes_router.delete("/{note_id}")
def delete_note(note_id: int, _: CurrentUser, db: SessionDep):
    svc = NoteService(db)
    note = svc.get(note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    svc.delete(note)
    return {"ok": True}


@notes_router.get("/search")
def search_notes(
    q: str = Query(..., min_length=1, max_length=200),
    db: SessionDep = None,
):
    return NoteService(db).search(q)
