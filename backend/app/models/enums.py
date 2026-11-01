from enum import Enum


class UserRole(str, Enum):
    GUEST = "guest"
    READER = "reader"
    REPORTER = "reporter"
    ADMIN = "admin"


class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class BlockType(str, Enum):
    TEXT = "text"
    HEADING = "heading"
    IMAGE = "image"
    QUOTE = "quote"
    CODE = "code"
    CALLOUT = "callout"


class ReactionKind(str, Enum):
    USEFUL = "useful"
    FIRE = "fire"
    INSIGHT = "insight"
    CONTROVERSIAL = "controversial"
