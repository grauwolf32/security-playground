import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional

from sqlmodel import Session, select

from models.domain import ResetCode, Session as DBSession, User
from services.sms import SmsGateway
from services.users import UserService
from utils.security import hash_password, issue_token, verify_password

RESET_CODE_TTL_MINUTES = 10


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserService(db)
        self.sms = SmsGateway()

    # ── registration / login ────────────────────────────────────────────

    def register(
        self, *, username: str, email: str, phone: str, password: str
    ) -> User:
        password_hash = hash_password(password)
        return self.users.create(
            username=username,
            email=email,
            phone=phone,
            password_hash=password_hash,
        )

    def authenticate(self, *, username: str, password: str) -> Optional[User]:
        user = self.users.get_by_username(username)
        if user is None:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def issue_jwt(self, user: User) -> str:
        return issue_token(user.id)

    def issue_session_cookie(self, user: User) -> str:
        token = uuid.uuid4().hex
        self.db.add(DBSession(user_id=user.id, token=token))
        self.db.commit()
        return token

    def latest_session_token(self, user_id: int) -> Optional[str]:
        row = self.db.exec(
            select(DBSession)
            .where(DBSession.user_id == user_id)
            .order_by(DBSession.created_at.desc())
        ).first()
        return row.token if row is not None else None

    # ── password reset (OTP via SMS) ────────────────────────────────────

    def request_password_reset(self, phone: str) -> bool:
        user = self.users.get_by_phone(phone)
        if user is None:
            return False
        code = f"{secrets.randbelow(1_000_000):06d}"
        self.db.add(
            ResetCode(
                user_id=user.id,
                code=code,
                expires_at=datetime.utcnow()
                + timedelta(minutes=RESET_CODE_TTL_MINUTES),
            )
        )
        self.db.commit()
        self.sms.send(phone=phone, body=f"Your reset code: {code}")
        return True

    def confirm_password_reset(
        self, *, phone: str, code: str, new_password: str
    ) -> bool:
        user = self.users.get_by_phone(phone)
        if user is None:
            return False
        row = self.db.exec(
            select(ResetCode)
            .where(ResetCode.user_id == user.id)
            .where(ResetCode.code == code)
            .where(ResetCode.used.is_(False))
            .order_by(ResetCode.expires_at.desc())
        ).first()
        if row is None:
            return False
        if row.expires_at < datetime.utcnow():
            return False
        row.used = True
        self.db.add(row)
        self.users.set_password_hash(user, hash_password(new_password))
        self.db.commit()
        return True
