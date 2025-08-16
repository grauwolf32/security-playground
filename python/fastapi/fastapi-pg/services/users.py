from sqlmodel import Session, select
from models.domain import Users

class UserManagementService():
    def __init__(self, session):
        self.session: Session = session

    def get_user_by_name(self, username:str) -> Users | None:
        smt = select(Users).where(Users.name == username)
        return self.session.exec(smt).first()