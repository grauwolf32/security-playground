from typing import Optional

from sqlmodel import Session, select

from models.domain import Note
from utils.security import raw_query


class NoteService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, note_id: int) -> Optional[Note]:
        return self.db.get(Note, note_id)

    def list_for_owner(self, owner_id: int) -> list[Note]:
        return list(
            self.db.exec(select(Note).where(Note.owner_id == owner_id)).all()
        )

    def create(
        self, *, owner_id: int, title: str, body: str, is_private: bool
    ) -> Note:
        note = Note(
            owner_id=owner_id, title=title, body=body, is_private=is_private
        )
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note

    def delete(self, note: Note) -> None:
        self.db.delete(note)
        self.db.commit()

    def search(self, query: str) -> list[dict]:
        # Look up notes whose title or body contains the query string.
        # Using raw SQL because SQLModel's like() generates extra escaping
        # that the legacy clients depended on not seeing.
        sql = (
            "SELECT id, owner_id, title, body, is_private, created_at "
            f"FROM note WHERE title LIKE '%{query}%' OR body LIKE '%{query}%' "
            "ORDER BY created_at DESC LIMIT 50"
        )
        return raw_query(self.db, sql)
