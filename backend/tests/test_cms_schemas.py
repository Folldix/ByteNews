from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.cms.schemas import ArticleCreate, ArticleUpdate
from app.models.enums import BlockType
from app.cms.media import sniff_image_type


def test_block_payload_is_validated_by_block_type() -> None:
    payload = ArticleCreate.model_validate({
        "title": "Керований матеріал",
        "category_id": str(uuid4()),
        "blocks": [
            {"block_type": "text", "content_payload": {"text": "Параграф"}},
            {"block_type": "heading", "content_payload": {"text": "Розділ", "level": 3}},
            {"block_type": "image", "content_payload": {"url": "/uploads/photo.webp", "caption": "Фото"}},
            {"block_type": "code", "content_payload": {"code": "print(1)", "language": "python"}},
            {"block_type": "quote", "content_payload": {"text": "Цитата", "author": "Інженер"}},
            {"block_type": "callout", "content_payload": {"text": "Висновок"}},
        ],
        "tags": [" React ", "react", "TypeScript"],
    })
    assert [block.block_type for block in payload.blocks] == [
        BlockType.TEXT, BlockType.HEADING, BlockType.IMAGE,
        BlockType.CODE, BlockType.QUOTE, BlockType.CALLOUT,
    ]
    assert payload.tags == ["React", "TypeScript"]


@pytest.mark.parametrize(
    "block",
    [
        {"block_type": "heading", "content_payload": {"text": "No level", "level": 4}},
        {"block_type": "image", "content_payload": {"url": "javascript:alert(1)"}},
        {"block_type": "text", "content_payload": {"html": "<script>"}},
    ],
)
def test_invalid_block_payloads_are_rejected(block: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        ArticleCreate(title="Some article", category_id=uuid4(), blocks=[block])


def test_update_rejects_null_for_required_state_fields() -> None:
    with pytest.raises(ValidationError):
        ArticleUpdate.model_validate({"status": None})
    assert ArticleUpdate.model_validate({"lead": None}).lead is None


@pytest.mark.parametrize(
    ("contents", "expected"),
    [
        (b"\x89PNG\r\n\x1a\nrest", "image/png"),
        (b"\xff\xd8\xffrest", "image/jpeg"),
        (b"GIF89arest", "image/gif"),
        (b"RIFF0000WEBPrest", "image/webp"),
        (b"not an image", None),
    ],
)
def test_media_type_sniffing(contents: bytes, expected: str | None) -> None:
    assert sniff_image_type(contents) == expected
