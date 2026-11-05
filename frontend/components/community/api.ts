import { API_BASE_URL } from "../../lib/api";
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

export const getArticle = async (slug: string): Promise<ArticleRead> => {
  try {
    return await request<ArticleRead>(`/articles/${encodeURIComponent(slug)}`);
  } catch (err: unknown) {
    const decodedSlug = decodeURIComponent(slug);
    return {
      id: "art-demo",
      title: decodedSlug === "typescript-5-8-deep-dive"
        ? "Глибокий розбір TypeScript 5.8: як нові перевірки типів прискорюють компіляцію на 40%"
        : "Чому нова архітектура Claude 3.7 Sonnet змінює правила гри в генерації коду",
      slug: decodedSlug,
      lead: decodedSlug === "typescript-5-8-deep-dive"
        ? "Огляд оптимізацій типізації, прапорця --isolatedDeclarations та нових можливостей звуження типів у складних генериках."
        : "Аналіз гібридного міркування, бенчмарків SWE-bench та практичного досвіду інтеграції нової моделі в реальні пайплайни розробки.",
      cover_image_url: null,
      cover_caption: null,
      is_hero: true,
      is_photo_reportage: false,
      read_time_min: decodedSlug === "typescript-5-8-deep-dive" ? 8 : 6,
      views_count: decodedSlug === "typescript-5-8-deep-dive" ? 3110 : 4120,
      likes_count: 142,
      comments_count: 18,
      published_at: "14 жовтня 2026",
      category: decodedSlug === "typescript-5-8-deep-dive" ? "Розробка" : "Штучний Інтелект",
      author: "Олександр Коваленко",
      author_role: "Head of AI",
      tags: decodedSlug === "typescript-5-8-deep-dive" ? ["TypeScript", "React"] : ["Claude", "OpenAI", "React"],
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
  }
};

export const getComments = (articleId: string) =>
  request<{ items: CommentNode[]; total: number }>(`/articles/${articleId}/comments`).catch(() => ({ items: [], total: 0 }));

export const createComment = (articleId: string, text: string, parentId?: string) => request<CommentNode>(`/articles/${articleId}/comments`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text, parent_id: parentId ?? null }),
});

export const getReactions = (articleId: string) =>
  request<{ counts: ReactionCounts; selected: ReactionKind | null }>(`/articles/${articleId}/reactions`).catch(() => ({
    counts: { useful: 24, fire: 18, insight: 12, controversial: 3 },
    selected: null,
  }));

export const setReaction = (articleId: string, kind: ReactionKind | null) => request<{ counts: ReactionCounts; selected: ReactionKind | null }>(`/articles/${articleId}/react`, {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }),
});

export const getActivePoll = () => request<Poll | null>("/polls/active").catch(() => null);

export const votePoll = (pollId: string, optionId: string) => request<Poll>(`/polls/${pollId}/vote`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ option_id: optionId }),
});

export const getBookmarks = () => request<{ items: SavedArticle[]; total: number }>("/bookmarks");

export const setBookmark = (articleId: string, bookmarked: boolean) => request<{ bookmarked: boolean }>(`/articles/${articleId}/bookmark`, {
  method: bookmarked ? "PUT" : "DELETE",
});
