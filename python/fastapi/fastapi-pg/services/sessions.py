import time

from models.domain import Sessions
from sqlmodel import Session, select
from utils.security import generate_session_id


class SessionManagementService:
    def __init__(self, session):
        self.session: Session = session

    def get_session_by_id(self, session_id: str) -> Sessions | None:
        stmt = select(Sessions).where(
            Sessions.id == session_id and Sessions.expired_at > int(time.time())
        )
        return self.session.exec(stmt).first()

    def create_session(self, user_id: int) -> str:
        session_id = generate_session_id()
        self.session.add(
            Sessions(id=session_id, user_id=user_id, expired_at=int(time.time()) + 3600)
        )
        self.session.commit()
        return session_id
