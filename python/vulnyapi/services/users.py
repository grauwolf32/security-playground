from typing import Optional

from sqlmodel import Session, select

from models.domain import User


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, user_id: int) -> Optional[User]:
        return self.db.get(User, user_id)

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.exec(select(User).where(User.username == username)).first()

    def get_by_phone(self, phone: str) -> Optional[User]:
        return self.db.exec(select(User).where(User.phone == phone)).first()

    def create(
        self,
        *,
        username: str,
        email: str,
        phone: str,
        password_hash: str,
    ) -> User:
        user = User(
            username=username,
            email=email,
            phone=phone,
            password_hash=password_hash,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def list_all(self) -> list[User]:
        return list(self.db.exec(select(User)).all())

    def set_password_hash(self, user: User, password_hash: str) -> None:
        user.password_hash = password_hash
        self.db.add(user)
        self.db.commit()
