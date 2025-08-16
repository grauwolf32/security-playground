from models.domain import Users
from sqlmodel import Session, select


class UserManagementService:
    def __init__(self, session):
        self.session: Session = session

    def get_user_by_name(self, username: str) -> Users | None:
        stmt = select(Users).where(Users.name == username)
        return self.session.exec(stmt).first()
