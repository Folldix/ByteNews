from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user, get_optional_user
from app.community.schemas import (
    ArticleBlockItem,
    ArticleRead,
    BookmarkCreateResult,
    BookmarkPage,
    BookmarkedArticle,
    CommentCreate,
    CommentNode,
    CommentPage,
    PollOptionResult,
    PollResult,
    PollVoteCreate,
    ReactionState,
    ReactionUpdate,
)
from app.db.session import get_db
from app.models.article import Article
from app.models.community import Bookmark, Comment, Poll, PollOption, PollVote, Reaction
from app.models.enums import ArticleStatus, ReactionKind
from app.models.user import User
from app.schemas.feed import ArticleFeedItem

router = APIRouter(prefix="/api/v1", tags=["community"])


def _empty_reaction_counts() -> dict[ReactionKind, int]:
    return {kind: 0 for kind in ReactionKind}


async def _reaction_state(
    db: AsyncSession, article_id: UUID, user_id: UUID | None = None
) -> ReactionState:
    rows = (await db.execute(
        select(Reaction.kind, func.count(Reaction.id))
        .where(Reaction.article_id == article_id)
        .group_by(Reaction.kind)
    )).all()
    counts = _empty_reaction_counts()
    for kind, count in rows:
        counts[kind] = count
    selected = None
    if user_id:
        selected = await db.scalar(
            select(Reaction.kind).where(
                Reaction.article_id == article_id, Reaction.user_id == user_id
            )
        )
    return ReactionState(counts=counts, selected=selected)


async def _published_article(db: AsyncSession, article_id: UUID) -> Article:
    article = await db.scalar(
        select(Article).where(
            Article.id == article_id,
            Article.status == ArticleStatus.PUBLISHED,
            Article.published_at.is_not(None),
        )
    )
    if article is None:
        raise HTTPException(status_code=404, detail="Published article not found")
    return article


async def _poll_result(db: AsyncSession, poll: Poll, user_id: UUID | None) -> PollResult:
    options = (await db.scalars(
        select(PollOption).where(PollOption.poll_id == poll.id).order_by(PollOption.id)
    )).all()
    total_votes = sum(option.votes_count for option in options)
    selected = None
    if user_id:
        selected = await db.scalar(
            select(PollVote.option_id).where(
                PollVote.poll_id == poll.id, PollVote.user_id == user_id
            )
        )
    return PollResult(
        id=poll.id,
        question=poll.question,
        closes_at=poll.closes_at,
        total_votes=total_votes,
        selected_option_id=selected,
        options=[
            PollOptionResult(
                id=option.id,
                option_text=option.option_text,
                votes_count=option.votes_count,
                percentage=round(option.votes_count * 100 / total_votes) if total_votes else 0,
            )
            for option in options
        ],
    )


@router.get("/articles/{slug}", response_model=ArticleRead)
async def read_article(
    slug: str,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> ArticleRead:
    article = await db.scalar(
        select(Article)
        .where(Article.slug == slug, Article.status == ArticleStatus.PUBLISHED)
        .options(
            selectinload(Article.category),
            selectinload(Article.author),
            selectinload(Article.blocks),
            selectinload(Article.tags),
        )
    )
    if article is None:
        raise HTTPException(status_code=404, detail="Published article not found")
    await db.execute(
        update(Article)
        .where(Article.id == article.id)
        .values(views_count=Article.views_count + 1)
        .execution_options(synchronize_session=False)
    )
    article.views_count += 1
    await db.commit()
    bookmark_exists = False
    if user:
        bookmark_exists = await db.scalar(
            select(Bookmark.article_id).where(
                Bookmark.user_id == user.id, Bookmark.article_id == article.id
            )
        ) is not None
    reactions = await _reaction_state(db, article.id, user.id if user else None)
    comments_count = await db.scalar(
        select(func.count(Comment.id)).where(Comment.article_id == article.id)
    ) or 0
    return ArticleRead(
        id=article.id,
        title=article.title,
        slug=article.slug,
        lead=article.lead,
        cover_image_url=article.cover_image_url,
        cover_caption=article.cover_caption,
        read_time_min=article.read_time_min,
        views_count=article.views_count,
        likes_count=article.likes_count,
        comments_count=comments_count,
        is_hero=article.is_hero,
        is_photo_reportage=article.is_photo_reportage,
        published_at=article.published_at,
        category=article.category.name,
        author=article.author.full_name,
        author_role=article.author.role_title,
        blocks=[
            ArticleBlockItem(
                id=block.id,
                block_type=block.block_type.value,
                order_index=block.order_index,
                content_payload=block.content_payload,
            )
            for block in article.blocks
        ],
        tags=[tag.name for tag in article.tags],
        reaction_counts=reactions.counts,
        my_reaction=reactions.selected,
        is_bookmarked=bookmark_exists,
    )


@router.get("/articles/{article_id}/comments", response_model=CommentPage)
async def list_comments(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> CommentPage:
    await _published_article(db, article_id)
    rows = (await db.execute(
        select(Comment, User.full_name, User.avatar_url)
        .join(User, User.id == Comment.author_id)
        .where(Comment.article_id == article_id)
        .order_by(Comment.created_at, Comment.id)
    )).all()
    nodes: dict[UUID, dict[str, Any]] = {}
    children: dict[UUID | None, list[dict[str, Any]]] = defaultdict(list)
    for comment, author_name, avatar_url in rows:
        node: dict[str, Any] = {
            "id": comment.id,
            "article_id": comment.article_id,
            "parent_id": comment.parent_id,
            "text": comment.text,
            "author_id": comment.author_id,
            "author_name": author_name,
            "author_avatar_url": avatar_url,
            "created_at": comment.created_at,
            "replies": [],
        }
        nodes[comment.id] = node
        children[comment.parent_id].append(node)
    for comment_id, node in nodes.items():
        parent_id = node["parent_id"]
        if parent_id in nodes:
            nodes[parent_id]["replies"].append(node)
    roots = [node for node in children[None] if node["parent_id"] is None]
    return CommentPage(items=[CommentNode.model_validate(item) for item in roots], total=len(rows))


@router.post("/articles/{article_id}/comments", response_model=CommentNode, status_code=201)
async def create_comment(
    article_id: UUID,
    payload: CommentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CommentNode:
    await _published_article(db, article_id)
    if payload.parent_id:
        parent = await db.scalar(
            select(Comment).where(
                Comment.id == payload.parent_id, Comment.article_id == article_id
            )
        )
        if parent is None:
            raise HTTPException(status_code=404, detail="Parent comment not found for this article")
    comment = Comment(
        article_id=article_id,
        author_id=user.id,
        parent_id=payload.parent_id,
        text=payload.text,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return CommentNode(
        id=comment.id,
        article_id=comment.article_id,
        parent_id=comment.parent_id,
        text=comment.text,
        author_id=user.id,
        author_name=user.full_name,
        author_avatar_url=user.avatar_url,
        created_at=comment.created_at,
        replies=[],
    )


@router.get("/articles/{article_id}/reactions", response_model=ReactionState)
async def get_reactions(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> ReactionState:
    await _published_article(db, article_id)
    return await _reaction_state(db, article_id, user.id if user else None)


@router.put("/articles/{article_id}/react", response_model=ReactionState)
async def set_reaction(
    article_id: UUID,
    payload: ReactionUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ReactionState:
    await _published_article(db, article_id)
    existing = await db.scalar(
        select(Reaction).where(
            Reaction.article_id == article_id, Reaction.user_id == user.id
        ).with_for_update()
    )
    if existing:
        if payload.kind is None:
            await db.delete(existing)
        else:
            existing.kind = payload.kind
    elif payload.kind is not None:
        db.add(Reaction(article_id=article_id, user_id=user.id, kind=payload.kind))
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Reaction changed concurrently; retry") from exc
    return await _reaction_state(db, article_id, user.id)


@router.get("/bookmarks", response_model=BookmarkPage)
async def list_bookmarks(
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BookmarkPage:
    count = await db.scalar(
        select(func.count())
        .select_from(Bookmark)
        .join(Article, Article.id == Bookmark.article_id)
        .where(Bookmark.user_id == user.id, Article.status == ArticleStatus.PUBLISHED)
    ) or 0
    rows = (await db.execute(
        select(Bookmark, Article)
        .join(Article, Article.id == Bookmark.article_id)
        .where(user.id == Bookmark.user_id, Article.status == ArticleStatus.PUBLISHED)
        .options(
            selectinload(Article.category),
            selectinload(Article.author),
            selectinload(Article.tags),
        )
        .order_by(Bookmark.created_at.desc())
        .limit(limit)
        .offset(offset)
    )).all()
    items = []
    for bookmark, article in rows:
        comments_count = await db.scalar(
            select(func.count(Comment.id)).where(Comment.article_id == article.id)
        ) or 0
        items.append(BookmarkedArticle(
            article=ArticleFeedItem(
                id=article.id,
                title=article.title,
                slug=article.slug,
                lead=article.lead,
                cover_image_url=article.cover_image_url,
                is_hero=article.is_hero,
                is_photo_reportage=article.is_photo_reportage,
                read_time_min=article.read_time_min,
                views_count=article.views_count,
                likes_count=article.likes_count,
                comments_count=comments_count,
                published_at=article.published_at,
                category=article.category.name,
                author=article.author.full_name,
                author_role=article.author.role_title,
                tags=[tag.name for tag in article.tags],
            ),
            bookmarked_at=bookmark.created_at,
        ))
    return BookmarkPage(items=items, total=count)


@router.put("/articles/{article_id}/bookmark", response_model=BookmarkCreateResult)
async def add_bookmark(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BookmarkCreateResult:
    await _published_article(db, article_id)
    exists = await db.scalar(
        select(Bookmark.article_id).where(
            Bookmark.user_id == user.id, Bookmark.article_id == article_id
        )
    )
    if exists is None:
        db.add(Bookmark(user_id=user.id, article_id=article_id))
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
    return BookmarkCreateResult(bookmarked=True)


@router.delete("/articles/{article_id}/bookmark", response_model=BookmarkCreateResult)
async def remove_bookmark(
    article_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BookmarkCreateResult:
    bookmark = await db.scalar(
        select(Bookmark).where(
            Bookmark.user_id == user.id, Bookmark.article_id == article_id
        )
    )
    if bookmark is not None:
        await db.delete(bookmark)
        await db.commit()
    return BookmarkCreateResult(bookmarked=False)


@router.get("/polls/active", response_model=PollResult | None)
async def active_poll(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> PollResult | None:
    now = datetime.now(timezone.utc)
    poll = await db.scalar(
        select(Poll)
        .where(Poll.is_active.is_(True), (Poll.closes_at.is_(None) | (Poll.closes_at > now)))
        .order_by(Poll.created_at.desc())
        .limit(1)
    )
    if poll is None:
        return None
    return await _poll_result(db, poll, user.id if user else None)


@router.post("/polls/{poll_id}/vote", response_model=PollResult)
async def vote_poll(
    poll_id: UUID,
    payload: PollVoteCreate,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> PollResult:
    now = datetime.now(timezone.utc)
    poll = await db.scalar(
        select(Poll).where(
            Poll.id == poll_id,
            Poll.is_active.is_(True),
            (Poll.closes_at.is_(None) | (Poll.closes_at > now)),
        ).with_for_update()
    )
    if poll is None:
        raise HTTPException(status_code=404, detail="Active poll not found")
    option = await db.scalar(
        select(PollOption).where(
            PollOption.id == payload.option_id, PollOption.poll_id == poll_id
        )
    )
    if option is None:
        raise HTTPException(status_code=404, detail="Poll option not found")
    if user is not None:
        already_voted = await db.scalar(
            select(PollVote.id).where(PollVote.poll_id == poll_id, PollVote.user_id == user.id)
        )
        if already_voted is not None:
            raise HTTPException(status_code=409, detail="You have already voted in this poll")
        db.add(PollVote(poll_id=poll_id, option_id=option.id, user_id=user.id))
    await db.execute(
        update(PollOption).where(PollOption.id == option.id).values(votes_count=PollOption.votes_count + 1)
    )
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="You have already voted in this poll") from exc
    res = await _poll_result(db, poll, user.id if user else None)
    if user is None:
        res.selected_option_id = payload.option_id
    return res
