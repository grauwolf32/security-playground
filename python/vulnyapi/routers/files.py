from pathlib import Path

from fastapi import APIRouter, File, Form, UploadFile

from adapters.db import SessionDep
from helpers.auth import CurrentUser
from models.domain import UploadedFile
from models.responses import UploadResponse

files_router = APIRouter(tags=["files"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@files_router.post("/upload", response_model=UploadResponse)
async def upload_file(
    user: CurrentUser,
    db: SessionDep,
    file: UploadFile = File(...),
    description: str = Form(""),
):
    """Save an uploaded attachment under the user's namespace."""
    target_path = UPLOAD_DIR / f"user-{user.id}" / file.filename
    target_path.parent.mkdir(parents=True, exist_ok=True)

    contents = await file.read()
    with open(target_path, "wb") as fh:
        fh.write(contents)

    record = UploadedFile(
        owner_id=user.id, filename=file.filename, size=len(contents)
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return UploadResponse(
        id=record.id,
        filename=record.filename,
        size=record.size,
        stored_at=str(target_path),
    )
