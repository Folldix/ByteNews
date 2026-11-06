import { API_BASE_URL } from "../../lib/api";
import { FALLBACK_ARTICLES } from "../feed/feed-api";
import type { Article } from "../feed/types";
import type { ReactionKind, ReactionCounts } from "./types";

export type ArticleBlock = { id: string; block_type: string; order_index: number; content_payload: Record<string, unknown> };
export type ArticleRead = Article & {
  cover_caption: string | null;
  published_at: string;
  category: string;
  author: string;
  author_role: string | null;
  blocks: ArticleBlock[];
  reaction_counts: ReactionCounts;
  my_reaction: ReactionKind | null;
  is_bookmarked: boolean;
};
export type CommentNode = {
  id: string;
  article_id: string;
  parent_id: string | null;
  text: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  created_at: string;
  replies: CommentNode[];
};
export type Poll = {
  id: string;
  question: string;
  closes_at: string | null;
  total_votes: number;
  selected_option_id: string | null;
  options: { id: string; option_text: string; votes_count: number; percentage: number }[];
};
export type SavedArticle = { article: Article; bookmarked_at: string };

export const DEFAULT_DEMO_POLL: Poll = {
  id: "poll-ai-agents-2026",
  question: "Яку архітектуру ШІ-агентів ви вважаєте найбільш перспективною для production у 2026 році?",
  closes_at: null,
  total_votes: 771,
  selected_option_id: null,
  options: [
    { id: "opt-swarm", option_text: "Мультиагентні мережі (Swarm)", votes_count: 216, percentage: 28 },
    { id: "opt-hybrid", option_text: "Гібридні моделі (Extended Thinking)", votes_count: 318, percentage: 41 },
    { id: "opt-react", option_text: "ReAct з автономними кроками", votes_count: 142, percentage: 18 },
    { id: "opt-local-rag", option_text: "Локальні моделі з RAG", votes_count: 95, percentage: 12 },
  ],
};

export const DEFAULT_DEMO_COMMENTS: CommentNode[] = [
  {
    id: "comm-1",
    article_id: "art-demo",
    parent_id: null,
    text: "Дуже ґрунтовний аналіз! Гібридне мислення дійсно дає помітний буст у завданнях системного проектування.",
    author_id: "user-demchenko",
    author_name: "Ігор Демченко",
    author_avatar_url: "/images/avatar-2.png",
    created_at: new Date(Date.now() - 45 * 60_000).toISOString(),
    replies: [
      {
        id: "comm-1-1",
        article_id: "art-demo",
        parent_id: "comm-1",
        text: "Погоджуюсь. Особливо вражає швидкість генерації та зменшення галюцинацій у складних типах TypeScript.",
        author_id: "user-bondar",
        author_name: "Марина Бондар",
        author_avatar_url: "/images/avatar-4.png",
        created_at: new Date(Date.now() - 20 * 60_000).toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: "comm-2",
    article_id: "art-demo",
    parent_id: null,
    text: "Цікаво, як це вплине на вартість API при масштабуванні на велику команду розробників.",
    author_id: "user-savchuk",
    author_name: "Віталій Савчук",
    author_avatar_url: "/images/avatar-3.png",
    created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    replies: [],
  },
];

function authHeaders(): HeadersInit {
  try {
    const token = localStorage.getItem("bytenews_access_token") || sessionStorage.getItem("bytenews_access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch { /* Keep the HTTP status message. */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const getDemoArticle = (slug: string): ArticleRead => {
  const decodedSlug = decodeURIComponent(slug);
  const found = FALLBACK_ARTICLES.find((a) => a.slug === decodedSlug);
  return {
    id: found?.id ?? "art-demo",
    title: found?.title ?? (decodedSlug === "typescript-5-8-deep-dive"
      ? "Глибокий розбір TypeScript 5.8: як нові перевірки типів прискорюють компіляцію на 40%"
      : "Anthropic представила Claude 3.7 Sonnet: гібридне мислення та новий еталон кодингу"),
    slug: decodedSlug,
    lead: found?.lead ?? (decodedSlug === "typescript-5-8-deep-dive"
      ? "Огляд оптимізацій типізації, прапорця --isolatedDeclarations та нових можливостей звуження типів у складних генериках."
      : "Нова модель поєднує миттєві відповіді для повсякденних задач із керованим ланцюжком роздумів для складного архітектурного рефакторингу та змагального програмування."),
    cover_image_url: found?.cover_image_url ?? (decodedSlug === "typescript-5-8-deep-dive" ? null : "/images/hero-claude.png"),
    cover_caption: null,
    is_hero: found?.is_hero ?? true,
    is_photo_reportage: found?.is_photo_reportage ?? false,
    read_time_min: found?.read_time_min ?? (decodedSlug === "typescript-5-8-deep-dive" ? 8 : 4),
    views_count: found?.views_count ?? (decodedSlug === "typescript-5-8-deep-dive" ? 3110 : 4280),
    likes_count: found?.likes_count ?? 142,
    comments_count: found?.comments_count ?? (decodedSlug === "typescript-5-8-deep-dive" ? 18 : 48),
    published_at: found?.time_label ?? "25 хв тому",
    category: found?.category ?? (decodedSlug === "typescript-5-8-deep-dive" ? "Розробка" : "Штучний Інтелект"),
    author: found?.author ?? "Олександр Коваленко",
    author_role: found?.author_role ?? "Head of AI Engineering",
    author_avatar: found?.author_avatar ?? "/images/avatar-kovalenko.png",
    tags: found?.tags ?? (decodedSlug === "typescript-5-8-deep-dive" ? ["TypeScript", "React"] : ["AI", "LLM", "Claude", "Кодинг", "Benchmark"]),
    blocks: [
      {
        id: "b-1",
        block_type: "paragraph",
        order_index: 0,
        content_payload: {
          text: "Сучасний стек інженерії все більше спирається на агентні системи, де моделі нового покоління демонструють високу точність аналізу та надійність генерації коду.",
        },
      },
      {
        id: "b-2",
        block_type: "heading",
        order_index: 1,
        content_payload: {
          text: "Гібридне міркування та архітектурні зміни",
          level: 2,
        },
      },
      {
        id: "b-3",
        block_type: "paragraph",
        order_index: 2,
        content_payload: {
          text: "Головна інновація полягає у поєднанні швидкого інференсу для стандартних задач із динамічним розширеним міркуванням для складної системної аналітики.",
        },
      },
      {
        id: "b-4",
        block_type: "callout",
        order_index: 3,
        content_payload: {
          text: "Новий підхід дозволяє прискорити ітерації рефакторингу на 35% при одночасному зменшенні помилок компіляції.",
        },
      },
    ],
    reaction_counts: { useful: 24, fire: 18, insight: 12, controversial: 3 },
    my_reaction: null,
    is_bookmarked: false,
  };
};

export const getArticle = async (slug: string): Promise<ArticleRead> => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return getDemoArticle(slug);
  }
  try {
    return await request<ArticleRead>(`/articles/${encodeURIComponent(slug)}`);
  } catch (err: unknown) {
    return getDemoArticle(slug);
  }
};

function getLocalDemoComments(articleId: string): CommentNode[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(`bytenews_demo_comments:${articleId}`) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return DEFAULT_DEMO_COMMENTS;
}

function saveLocalDemoComments(articleId: string, comments: CommentNode[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(`bytenews_demo_comments:${articleId}`, JSON.stringify(comments));
    }
  } catch {}
}

function addDemoComment(articleId: string, text: string, parentId?: string): CommentNode {
  const comments = [...getLocalDemoComments(articleId)];
  const newComment: CommentNode = {
    id: `comm-${Date.now()}`,
    article_id: articleId,
    parent_id: parentId ?? null,
    text,
    author_id: "demo-user",
    author_name: "Олександр Коваленко",
    author_avatar_url: "/images/avatar-kovalenko.png",
    created_at: new Date().toISOString(),
    replies: [],
  };

  if (parentId) {
    const attachReply = (list: CommentNode[]): boolean => {
      for (const item of list) {
        if (item.id === parentId) {
          item.replies.push(newComment);
          return true;
        }
        if (item.replies.length > 0 && attachReply(item.replies)) return true;
      }
      return false;
    };
    if (!attachReply(comments)) {
      comments.push(newComment);
    }
  } else {
    comments.push(newComment);
  }

  saveLocalDemoComments(articleId, comments);
  return newComment;
}

export const getComments = async (articleId: string): Promise<{ items: CommentNode[]; total: number }> => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    const items = getLocalDemoComments(articleId);
    const countTotal = (list: CommentNode[]): number =>
      list.reduce((acc, c) => acc + 1 + countTotal(c.replies), 0);
    return { items, total: countTotal(items) };
  }
  try {
    return await request<{ items: CommentNode[]; total: number }>(`/articles/${articleId}/comments`);
  } catch {
    const items = getLocalDemoComments(articleId);
    const countTotal = (list: CommentNode[]): number =>
      list.reduce((acc, c) => acc + 1 + countTotal(c.replies), 0);
    return { items, total: countTotal(items) };
  }
};

export const createComment = async (articleId: string, text: string, parentId?: string): Promise<CommentNode> => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return addDemoComment(articleId, text, parentId);
  }
  try {
    return await request<CommentNode>(`/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, parent_id: parentId ?? null }),
    });
  } catch {
    return addDemoComment(articleId, text, parentId);
  }
};

export const getReactions = async (articleId: string): Promise<{ counts: ReactionCounts; selected: ReactionKind | null }> => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    let selected: ReactionKind | null = null;
    try {
      selected = (localStorage.getItem(`bytenews_reaction:${articleId}`) as ReactionKind) || null;
    } catch {}
    const baseCounts: ReactionCounts = { useful: 24, fire: 18, insight: 12, controversial: 3 };
    if (selected && selected in baseCounts) {
      baseCounts[selected] += 1;
    }
    return { counts: baseCounts, selected };
  }
  try {
    return await request<{ counts: ReactionCounts; selected: ReactionKind | null }>(`/articles/${articleId}/reactions`);
  } catch {
    let selected: ReactionKind | null = null;
    try {
      selected = (localStorage.getItem(`bytenews_reaction:${articleId}`) as ReactionKind) || null;
    } catch {}
    const baseCounts: ReactionCounts = { useful: 24, fire: 18, insight: 12, controversial: 3 };
    if (selected && selected in baseCounts) {
      baseCounts[selected] += 1;
    }
    return { counts: baseCounts, selected };
  }
};

export const setReaction = async (
  articleId: string,
  kind: ReactionKind | null
): Promise<{ counts: ReactionCounts; selected: ReactionKind | null }> => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    try {
      if (kind) {
        localStorage.setItem(`bytenews_reaction:${articleId}`, kind);
      } else {
        localStorage.removeItem(`bytenews_reaction:${articleId}`);
      }
    } catch {}
    const baseCounts: ReactionCounts = { useful: 24, fire: 18, insight: 12, controversial: 3 };
    if (kind && kind in baseCounts) {
      baseCounts[kind] += 1;
    }
    return { counts: baseCounts, selected: kind };
  }
  try {
    return await request<{ counts: ReactionCounts; selected: ReactionKind | null }>(`/articles/${articleId}/react`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
  } catch {
    try {
      if (kind) {
        localStorage.setItem(`bytenews_reaction:${articleId}`, kind);
      } else {
        localStorage.removeItem(`bytenews_reaction:${articleId}`);
      }
    } catch {}
    const baseCounts: ReactionCounts = { useful: 24, fire: 18, insight: 12, controversial: 3 };
    if (kind && kind in baseCounts) {
      baseCounts[kind] += 1;
    }
    return { counts: baseCounts, selected: kind };
  }
};

export const getActivePoll = async (): Promise<Poll | null> => {
  let poll: Poll | null = null;
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    poll = DEFAULT_DEMO_POLL;
  } else {
    try {
      const res = await request<Poll | null>("/polls/active");
      if (res) poll = res;
    } catch {
      poll = DEFAULT_DEMO_POLL;
    }
  }

  if (!poll) return null;

  let selectedId = poll.selected_option_id;
  if (!selectedId) {
    try {
      selectedId = localStorage.getItem(`bytenews_poll_vote:${poll.id}`);
    } catch {}
  }

  if (selectedId) {
    return {
      ...poll,
      selected_option_id: selectedId,
    };
  }

  return poll;
};

export const votePoll = async (
  pollId: string,
  optionId: string,
  currentPoll?: Poll | null
): Promise<Poll> => {
  const updateDemoPoll = () => {
    try {
      localStorage.setItem(`bytenews_poll_vote:${pollId}`, optionId);
    } catch {}

    const basePoll = currentPoll && currentPoll.id === pollId ? currentPoll : DEFAULT_DEMO_POLL;
    const updatedOptions = basePoll.options.map((opt) => {
      const isSelected = opt.id === optionId;
      const count = isSelected ? opt.votes_count + 1 : opt.votes_count;
      return { ...opt, votes_count: count };
    });
    const newTotal = basePoll.total_votes + 1;
    const finalOptions = updatedOptions.map((opt) => ({
      ...opt,
      percentage: Math.round((opt.votes_count / newTotal) * 100),
    }));
    return {
      ...basePoll,
      total_votes: newTotal,
      selected_option_id: optionId,
      options: finalOptions,
    };
  };

  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return updateDemoPoll();
  }

  try {
    const res = await request<Poll>(`/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option_id: optionId }),
    });
    const finalSelectedId = res.selected_option_id || optionId;
    try {
      localStorage.setItem(`bytenews_poll_vote:${pollId}`, finalSelectedId);
    } catch {}
    return {
      ...res,
      selected_option_id: finalSelectedId,
    };
  } catch {
    return updateDemoPoll();
  }
};

export const getBookmarks = async (): Promise<{ items: SavedArticle[]; total: number }> => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return { items: [], total: 0 };
  }
  return request<{ items: SavedArticle[]; total: number }>("/bookmarks").catch(() => ({ items: [], total: 0 }));
};

export const setBookmark = async (articleId: string, bookmarked: boolean): Promise<{ bookmarked: boolean }> => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return { bookmarked };
  }
  return request<{ bookmarked: boolean }>(`/articles/${articleId}/bookmark`, {
    method: bookmarked ? "PUT" : "DELETE",
  }).catch(() => ({ bookmarked }));
};
