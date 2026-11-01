from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status

from app.auth.dependencies import require_reporter
from app.cms.schemas import MediaUploadResult
from app.config import settings
from app.models.user import User

router = APIRouter(prefix="/api/v1/media", tags=["media"])

_IMAGE_FORMATS: dict[str, tuple[str, str]] = {
    "image/jpeg": (".jpg", "image/jpeg"),
    "image/png": (".png", "image/png"),
    "image/gif": (".gif", "image/gif"),
    "image/webp": (".webp", "image/webp"),
}


def sniff_image_type(data: bytes) -> str | None:
    """Detect the supported image format from its file signature."""
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


@router.post("/upload", response_model=MediaUploadResult, status_code=status.HTTP_201_CREATED)
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(require_reporter),
) -> MediaUploadResult:
    del user  # Role dependency validates the caller; no personal media metadata is persisted.
    declared_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    if declared_type not in _IMAGE_FORMATS:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, GIF, or WebP image")

    contents = await file.read(settings.media_max_bytes + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    if len(contents) > settings.media_max_bytes:
        raise HTTPException(status_code=413, detail="The uploaded image exceeds the size limit")
    detected_type = sniff_image_type(contents)
    if detected_type is None or detected_type != declared_type:
        raise HTTPException(status_code=415, detail="The file contents do not match the declared image type")

    extension = _IMAGE_FORMATS[detected_type][0]
    filename = f"{uuid4().hex}{extension}"
    storage_path = Path(settings.media_storage_path).expanduser().resolve()
    storage_path.mkdir(parents=True, exist_ok=True)
    (storage_path / filename).write_bytes(contents)

    configured_base = settings.media_public_base_url
    base_url = configured_base.strip().rstrip("/") if configured_base and configured_base.strip() else str(request.base_url).rstrip("/")
    return MediaUploadResult(
        url=f"{base_url}/uploads/{filename}",
        filename=filename,
        content_type=detected_type,
        size=len(contents),
    )
