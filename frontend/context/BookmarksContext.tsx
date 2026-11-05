"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getBookmarks, setBookmark } from "../components/community/api";
import type { SavedArticle } from "../components/community/api";
import type { Article } from "../components/feed/types";

export const DEFAULT_BOOKMARKED_ARTICLES: SavedArticle[] = [];

type BookmarksContextValue = {
  items: SavedArticle[];
  count: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (article: Article) => Promise<void>;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

function readCache(key: string): SavedArticle[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedArticle[]) : [];
  } catch {
    return [];
  }
}

function saveCache(key: string, items: SavedArticle[]) {
  try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* Browser storage is optional. */ }
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user, setBookmarksCount } = useAuth();
  const [items, setItems] = useState<SavedArticle[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const key = `bytenews_bookmarks:${user?.id ?? "guest"}`;

  useEffect(() => {
    const cached = readCache(key);
    setItems(cached);
    setBookmarksCount(cached.length);
    if (!user) return;
    let active = true;
    getBookmarks()
      .then(async (page) => {
        const remoteIds = new Set(page.items.map((item) => item.article.id));
        const localItems = [...readCache(key), ...readCache("bytenews_bookmarks:guest")];
        const localById = new Map(localItems.map((item) => [item.article.id, item]));
        const unsynced = [...localById.values()].filter((item) => !remoteIds.has(item.article.id));
        await Promise.all(unsynced.map((item) => setBookmark(item.article.id, true).catch(() => undefined)));
        const merged = [...page.items, ...unsynced.filter((item) => !remoteIds.has(item.article.id))];
        if (!active) return;
        setItems(merged);
        saveCache(key, merged);
        setBookmarksCount(merged.length);
        try { localStorage.removeItem("bytenews_bookmarks:guest"); } catch { /* Optional cache. */ }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [key, setBookmarksCount, user?.id]);

  const toggleBookmark = useCallback(async (article: Article) => {
    const exists = items.some((item) => item.article.id === article.id);
    const next = exists
      ? items.filter((item) => item.article.id !== article.id)
      : [{ article, bookmarked_at: new Date().toISOString() }, ...items];
    setItems(next);
    setBookmarksCount(next.length);
    saveCache(key, next);
    if (!user) return;
    try {
      await setBookmark(article.id, !exists);
    } catch {
      // In offline/demo mode, preserve local state without rollback
    }
  }, [items, key, setBookmarksCount, user]);

  const value = useMemo<BookmarksContextValue>(() => ({
    items,
    count: items.length,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    isBookmarked: (id) => items.some((item) => item.article.id === id),
    toggleBookmark,
  }), [drawerOpen, items, toggleBookmark]);

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) throw new Error("useBookmarks must be used within BookmarksProvider");
  return context;
}
