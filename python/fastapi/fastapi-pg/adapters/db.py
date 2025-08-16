from sqlmodel import Session, create_engine, select
from pathlib import Path
from collections.abc import Generator
from fastapi import Depends
from typing import Annotated

DB_PATH = Path(__file__).parent.parent.parent / "data" / "base.db"

engine = create_engine(f"sqlite://{str(DB_PATH)}")

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_db)]