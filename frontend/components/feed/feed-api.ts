import type { Article, CatalogItem, FlashNews, Page } from "./types";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBase}/api/v1${path}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export function getCategories(signal?: AbortSignal) {
  return getJson<{ items: CatalogItem[] }>("/categories", signal);
}

export function getTags(signal?: AbortSignal) {
  return getJson<{ items: CatalogItem[] }>("/tags", signal);
}

export function getArticles(options: {
  category?: string;
  tag?: string;
  query?: string;
  sort?: "latest" | "popular";
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}) {
  const params = new URLSearchParams();
  if (options.category) params.set("category", options.category);
  if (options.tag) params.set("tag", options.tag);
  if (options.sort) params.set("sort", options.sort);
  params.set("limit", String(options.limit ?? 12));
  params.set("offset", String(options.offset ?? 0));
  if (options.query) {
    params.set("q", options.query);
    return getJson<Page<Article>>(`/articles/search?${params}`, options.signal);
  }
  return getJson<Page<Article>>(`/articles?${params}`, options.signal);
}

export function getFlashNews(signal?: AbortSignal) {
  return getJson<Page<FlashNews>>("/flash-news?limit=8", signal);
}
