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
        : "Anthropic представила Claude 3.7 Sonnet: гібридне мислення та новий еталон кодингу",
      slug: decodedSlug,
      lead: decodedSlug === "typescript-5-8-deep-dive"
        ? "Огляд оптимізацій типізації, прапорця --isolatedDeclarations та нових можливостей звуження типів у складних генериках."
        : "Нова модель поєднує миттєві відповіді для повсякденних задач із керованим ланцюжком роздумів для складного архітектурного рефакторингу та змагального програмування.",
      cover_image_url: decodedSlug === "typescript-5-8-deep-dive" ? null : "/images/hero-claude.png",
      cover_caption: null,
      is_hero: true,
      is_photo_reportage: false,
      read_time_min: decodedSlug === "typescript-5-8-deep-dive" ? 8 : 4,
      views_count: decodedSlug === "typescript-5-8-deep-dive" ? 3110 : 4280,
      likes_count: 142,
      comments_count: decodedSlug === "typescript-5-8-deep-dive" ? 18 : 48,
      published_at: "25 хв тому",
      category: decodedSlug === "typescript-5-8-deep-dive" ? "Розробка" : "Штучний Інтелект",
      author: "Олександр Коваленко",
      author_role: "Head of AI Engineering",
      tags: decodedSlug === "typescript-5-8-deep-dive" ? ["TypeScript", "React"] : ["AI", "LLM", "Claude", "Кодинг", "Benchmark"],
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

export const getActivePoll = async (): Promise<Poll | null> => {
  let poll: Poll | null = null;
  try {
    const res = await request<Poll | null>("/polls/active");
    if (res) poll = res;
  } catch {
    // Демо-режим при недоступності бекенду
    poll = DEFAULT_DEMO_POLL;
  }

  if (!poll) return null;

  // Перевіряємо локально збережений голос для цього опитування (якщо користувач гість)
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
  }
};

export const getBookmarks = () => request<{ items: SavedArticle[]; total: number }>("/bookmarks");

export const setBookmark = (articleId: string, bookmarked: boolean) => request<{ bookmarked: boolean }>(`/articles/${articleId}/bookmark`, {
  method: bookmarked ? "PUT" : "DELETE",
}).catch(() => ({ bookmarked }));
