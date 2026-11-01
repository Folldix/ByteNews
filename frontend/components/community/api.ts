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

export const getArticle = (slug: string) => request<ArticleRead>(`/articles/${encodeURIComponent(slug)}`);
export const getComments = (articleId: string) => request<{ items: CommentNode[]; total: number }>(`/articles/${articleId}/comments`);
export const createComment = (articleId: string, text: string, parentId?: string) => request<CommentNode>(`/articles/${articleId}/comments`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text, parent_id: parentId ?? null }),
});
export const getReactions = (articleId: string) => request<{ counts: ReactionCounts; selected: ReactionKind | null }>(`/articles/${articleId}/reactions`);
export const setReaction = (articleId: string, kind: ReactionKind | null) => request<{ counts: ReactionCounts; selected: ReactionKind | null }>(`/articles/${articleId}/react`, {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }),
});
export const getActivePoll = () => request<Poll | null>("/polls/active");
export const votePoll = (pollId: string, optionId: string) => request<Poll>(`/polls/${pollId}/vote`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ option_id: optionId }),
});
export const getBookmarks = () => request<{ items: SavedArticle[]; total: number }>("/bookmarks");
export const setBookmark = (articleId: string, bookmarked: boolean) => request<{ bookmarked: boolean }>(`/articles/${articleId}/bookmark`, {
  method: bookmarked ? "PUT" : "DELETE",
});
