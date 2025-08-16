from models.domain import Messages, UserMessages
from sqlmodel import Session, select


class UserMessageService:
    def __init__(self, session):
        self.session: Session = session

    def get_message_by_user_id(self, user_id: int) -> UserMessages:
        stmt = select(Messages).where(Messages.sender == user_id)
        sent = self.session.exec(stmt)

        stmt = select(Messages).where(Messages.receiver == user_id)
        received = self.session.exec(stmt)

        return UserMessages(
            sent=[message for message in sent],
            received=[message for message in received],
        )
