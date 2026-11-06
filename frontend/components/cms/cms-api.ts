import { API_BASE_URL } from "../../lib/api";

export type ArticleStatus = "draft" | "published";
export type Category = { id: string; name: string; slug: string };

export type EditorBlock =
  | { block_type: "text"; content_payload: { text: string } }
  | { block_type: "heading"; content_payload: { text: string; level: 2 | 3 } }
  | { block_type: "image"; content_payload: { url: string; alt: string; caption?: string; credit?: string } }
  | { block_type: "quote"; content_payload: { text: string; author?: string; source?: string } }
  | { block_type: "code"; content_payload: { code: string; language: string } }
  | { block_type: "callout"; content_payload: { text: string } };

export type EditorArticle = {
  id: string;
  title: string;
  slug: string;
  lead: string | null;
  cover_image_url: string | null;
  cover_caption: string | null;
  is_hero: boolean;
  is_photo_reportage: boolean;
  status: ArticleStatus;
  category_id: string;
  author_id: string;
  read_time_min: number;
  views_count: number;
  likes_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
  blocks: Array<EditorBlock & { id?: string; order_index?: number }>;
};

export type ArticlePayload = {
  title: string;
  slug?: string;
  lead: string | null;
  cover_image_url: string | null;
  cover_caption: string | null;
  category_id: string;
  status: ArticleStatus;
  tags: string[];
  blocks: EditorBlock[];
  is_hero: boolean;
  is_photo_reportage: boolean;
};

async function request<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new Error("Не вдалося з’єднатися з API. Перевірте, чи запущений бекенд.");
  }
  if (!response.ok) {
    let message = `Помилка API (${response.status})`;
    try {
      const body = await response.json() as { detail?: unknown };
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((item) => item.msg).filter(Boolean).join("; ") || message;
    } catch { /* Keep the HTTP status as the readable fallback. */ }
    if (response.status === 401) message = "Сесія завершилася. Увійдіть у профіль і спробуйте ще раз.";
    if (response.status === 403) message = "Створення та редагування доступне лише авторам.";
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getEditorCategories() {
  return request<{ items: Category[] }>("/categories", null);
}

export function listMyArticles(token: string) {
  return request<{ items: EditorArticle[]; total: number; limit: number; offset: number }>("/articles/mine?limit=100", token);
}

export function getEditorArticle(token: string, id: string) {
  return request<EditorArticle>(`/articles/${encodeURIComponent(id)}/edit`, token);
}

export function createEditorArticle(token: string, payload: ArticlePayload) {
  return request<EditorArticle>("/articles", token, { method: "POST", body: JSON.stringify(payload) });
}

export function updateEditorArticle(token: string, id: string, payload: ArticlePayload) {
  return request<EditorArticle>(`/articles/${encodeURIComponent(id)}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteEditorArticle(token: string, id: string) {
  return request<void>(`/articles/${encodeURIComponent(id)}`, token, { method: "DELETE" });
}

export function uploadEditorImage(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<{ url: string; filename: string; content_type: string; size: number }>("/media/upload", token, {
    method: "POST",
    body: form,
  });
}
