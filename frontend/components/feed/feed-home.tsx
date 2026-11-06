"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getArticles, getCategories, getFlashNews, getTags, FALLBACK_POPULAR } from "./feed-api";
import { useFeedFilters } from "../../context/FeedContext";
import { useBookmarks } from "../../context/BookmarksContext";
import { useAuth } from "../../context/AuthContext";
import { CommunityPoll } from "../community/CommunityPoll";
import { CATEGORIES as DEFAULT_CATEGORIES, DEFAULT_TOPICS } from "../../lib/constants";
import { HeroArticleCard } from "./HeroArticleCard";
import { ArticleCard } from "./ArticleCard";
import { PopularNewsWidget } from "./PopularNewsWidget";
import { ChronicleWidget } from "./ChronicleWidget";
import { ReporterCabinetWidget } from "./ReporterCabinetWidget";
import { FlashNewsModal } from "./FlashNewsModal";
import type { Article, CatalogItem, FlashNews, Page } from "./types";

export function relativeTime(value: string | null) {
  if (!value) return "Щойно";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return "Щойно";
  if (minutes < 60) return `${minutes} хв тому`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год тому`;
  return `${Math.floor(hours / 24)} дн тому`;
}

export function FeedHome() {
  const { setActiveView } = useAuth();
  const { category, tag, query, setCategory, setTag, setQuery } = useFeedFilters();
  const { items: bookmarkedItems, toggleBookmark: toggleSavedBookmark } = useBookmarks();
  const [categories, setCategories] = useState<CatalogItem[]>(DEFAULT_CATEGORIES);
  const [topics, setTopics] = useState<CatalogItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [popular, setPopular] = useState<Article[]>([]);
  const [flashNews, setFlashNews] = useState<FlashNews[]>([]);
  const [total, setTotal] = useState(0);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [selectedFlash, setSelectedFlash] = useState<FlashNews | null>(null);
  const [sortBy, setSortBy] = useState<"fresh" | "popular" | "discussed">("fresh");
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getCategories(controller.signal),
      getTags(controller.signal),
      getArticles({ sort: "popular", limit: 3, signal: controller.signal }),
      getFlashNews(controller.signal),
    ])
      .then(([categoryPage, tagPage, popularPage, flashPage]) => {
        if (categoryPage.items.length) setCategories([{ id: "all", name: "Всі новини", slug: "" }, ...categoryPage.items]);
        setTopics(tagPage.items);
        setPopular(popularPage.items);
        setFlashNews(flashPage.items);
      })
      .catch(() => { /* Fallbacks are handled in feed-api.ts */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getArticles({ category: category || undefined, tag: tag || undefined, query: query || undefined, limit: 12, signal: controller.signal })
      .then((page: Page<Article>) => {
        setArticles(page.items);
        setTotal(page.total);
        setVisibleCount(8);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Не вдалося завантажити стрічку.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [category, tag, query, ready]);

  const bookmarked = useMemo(() => new Set(bookmarkedItems.map((item) => item.article.id)), [bookmarkedItems]);
  const articleById = useMemo(() => new Map([...articles, ...popular, ...FALLBACK_POPULAR].map((item) => [item.id, item])), [articles, popular]);
  const toggleBookmark = useCallback((id: string) => {
    const article = articleById.get(id);
    if (article) void toggleSavedBookmark(article).catch(() => undefined);
  }, [articleById, toggleSavedBookmark]);

  const hero = useMemo(() => articles.find((item) => item.is_hero) ?? articles[0] ?? null, [articles]);
  const listArticles = useMemo(() => hero ? articles.filter((item) => item.id !== hero.id) : articles, [articles, hero]);

  const sortedCatalogArticles = useMemo(() => {
    const items = [...listArticles];
    if (sortBy === "popular") {
      return items.sort((a, b) => b.views_count - a.views_count);
    }
    if (sortBy === "discussed") {
      return items.sort((a, b) => (b.comments_count ?? 0) - (a.comments_count ?? 0));
    }
    return items;
  }, [listArticles, sortBy]);

  const visibleArticles = useMemo(() => {
    return sortedCatalogArticles.slice(0, visibleCount);
  }, [sortedCatalogArticles, visibleCount]);

  async function loadMore() {
    if (visibleCount < sortedCatalogArticles.length) {
      setVisibleCount((prev) => prev + 8);
      return;
    }
    setLoadingMore(true);
    try {
      const page = await getArticles({ category: category || undefined, tag: tag || undefined, query: query || undefined, limit: 12, offset: articles.length });
      setArticles((current) => [...current, ...page.items]);
      setTotal(page.total);
      setVisibleCount((prev) => prev + page.items.length);
    } catch { setError("Не вдалося завантажити наступну сторінку."); }
    finally { setLoadingMore(false); }
  }

  const activeCategory = categories.find((item) => item.slug === category)?.name ?? "Всі новини";
  const slugForTag = (name: string) => topics.find((item) => item.name.toLowerCase() === name.toLowerCase())?.slug ?? name.toLowerCase().trim().replace(/\s+/g, "-");

  const topicsList = topics.length ? topics : DEFAULT_TOPICS.map((name) => ({ id: name.toLowerCase(), name, slug: name.toLowerCase() }));

  return (
    <main className="min-h-screen text-slate-900">
      <div className="w-full max-w-[1296px] px-4 sm:px-6 lg:px-8 mx-auto pb-12 sm:pb-16 pt-4 sm:pt-6">

        {/* 1. Верхня секція: Головна новина (8 колонок) + Найбільше читають (4 колонки) */}
        <section aria-labelledby="hero-heading" className="mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-[8px] rounded-full bg-[#10b981] shrink-0" />
              <h2 id="hero-heading" className="font-mono font-bold text-[11px] sm:text-[12px] leading-[1.5] text-[#0f172a] tracking-[0.6px] uppercase">
                ГОЛОВНА НОВИНА & ТРЕНДИ ДНЯ
              </h2>
            </div>
            <div className="inline-flex items-center gap-[6px]">
              <svg viewBox="0 0 16 10" fill="none" className="w-[14px] h-[8px] text-[#059669] shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 1 9.5 6.5 6 3 1 8" />
                <polyline points="11 1 15 1 15 5" />
              </svg>
              <span className="font-mono font-bold text-[11px] sm:text-[12px] leading-[1.5] text-[#64748b] tracking-[0.6px] uppercase">
                ТОП-ОГЛЯД
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Ліва колонка: Головна новина (Hero) */}
            <div className="col-span-1 lg:col-span-8 flex flex-col min-w-0">
              <HeroArticleCard
                hero={hero}
                loading={loading}
                bookmarked={hero ? bookmarked.has(hero.id) : false}
                onBookmark={() => hero && toggleBookmark(hero.id)}
                onTagClick={(topic) => setTag(slugForTag(topic))}
                onProfileClick={() => setActiveView("profile")}
                relativeTime={relativeTime}
              />
            </div>

            {/* Права колонка: 1) Найбільше читають (3 картки) */}
            <div className="col-span-1 lg:col-span-4 flex flex-col min-w-0">
              <PopularNewsWidget
                items={popular.length ? popular : FALLBACK_POPULAR}
                bookmarked={bookmarked}
                onBookmark={toggleBookmark}
                relativeTime={relativeTime}
              />
            </div>
          </div>
        </section>

        {/* 2. Середня секція: # Теми на всю ширину (1296px) */}
        <section aria-label="Популярні теми" className="w-full pt-[10px] pb-[20px] sm:pb-[30px] flex flex-wrap items-center gap-[6px] sm:gap-[8px]">
          <span className="font-mono font-bold text-[15px] sm:text-[16px] text-[#10b981] tracking-[0.8px]">#</span>
          <span className="font-mono font-bold text-[13px] sm:text-[14px] text-[#94a3b8] tracking-[0.7px] mr-1">Теми:</span>
          {topicsList.map((topic) => {
            const isSelected = tag === topic.slug;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  setTag(isSelected ? "" : topic.slug);
                  if (!isSelected) setCategory("");
                }}
                aria-pressed={isSelected}
                className={`backdrop-blur-[5px] rounded-[12px] px-[10px] sm:px-[12px] py-[5px] sm:py-[6px] font-mono font-medium text-[11px] sm:text-[12px] tracking-[0.6px] transition cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-[#0f172a] border border-[#0f172a] text-white shadow-[0px_1px_1.5px_0px_rgba(15,23,42,0.15)]"
                    : "bg-white/80 border border-[#e2e8f0] text-[#475569] hover:bg-[#f1f5f9]/80 hover:border-[#cbd5e1] hover:text-[#0f172a]"
                }`}
              >
                #{topic.name}
              </button>
            );
          })}
        </section>

        {/* 3. Нижня секція: Каталог публікацій (8 колонок) + Віджети (4 колонки) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Ліва колонка: Каталог публікацій */}
          <div className="col-span-1 lg:col-span-8 min-w-0">
            <section aria-labelledby="articles-heading">
              {/* Шапка секції Всі новини та Перемикач */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#e2e8f0] pb-[16px] mb-[24px] gap-4">
                {/* Ліва частина */}
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center gap-[8px]">
                    <h2 id="articles-heading" className="text-[20px] sm:text-[24px] font-extrabold text-[#0f172a] leading-normal">
                      {query ? `Результати пошуку` : (activeCategory ?? "Всі новини")}
                    </h2>
                    <span className="bg-[#e2e8f0]/70 rounded-full px-[10px] py-[2px] text-[13px] sm:text-[14px] font-medium text-[#334155] min-w-[37px] text-center">
                      {sortedCatalogArticles.length}
                    </span>
                  </div>
                  <p className="text-[12px] font-normal text-[#64748b]">
                    {query ? `За запитом «${query}»` : "Останні оновлення індустрії"}
                  </p>
                </div>

                {/* Права частина: Перемикач Новин */}
                <div className="bg-[#e2e8f0]/60 p-[4px] rounded-[12px] w-full sm:w-auto grid grid-cols-3 sm:inline-flex items-center gap-[4px]">
                  <button
                    type="button"
                    onClick={() => setSortBy("fresh")}
                    className={`px-[8px] sm:px-[12px] py-[6px] font-mono text-[12px] sm:text-[14px] tracking-[0.6px] sm:tracking-[0.7px] leading-[1.35] transition-all cursor-pointer text-center justify-center flex items-center ${
                      sortBy === "fresh"
                        ? "bg-white rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)] font-bold text-[#475569]"
                        : "font-normal text-[#475569] hover:text-[#0f172a]"
                    }`}
                  >
                    Свіжі
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("popular")}
                    className={`px-[8px] sm:px-[12px] py-[6px] font-mono text-[12px] sm:text-[14px] tracking-[0.6px] sm:tracking-[0.7px] leading-[1.35] transition-all cursor-pointer text-center justify-center flex items-center ${
                      sortBy === "popular"
                        ? "bg-white rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)] font-bold text-[#475569]"
                        : "font-normal text-[#475569] hover:text-[#0f172a]"
                    }`}
                  >
                    Популярні
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("discussed")}
                    className={`px-[8px] sm:px-[12px] py-[6px] font-mono text-[12px] sm:text-[14px] tracking-[0.6px] sm:tracking-[0.7px] leading-[1.35] transition-all cursor-pointer text-center justify-center flex items-center truncate ${
                      sortBy === "discussed"
                        ? "bg-white rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)] font-bold text-[#475569]"
                        : "font-normal text-[#475569] hover:text-[#0f172a]"
                    }`}
                  >
                    Обговорювані
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  {error}. Перевірте доступність API та адресу `NEXT_PUBLIC_API_BASE_URL`.
                </div>
              )}

              {loading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
                  <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
                </div>
              ) : sortedCatalogArticles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-emerald-700">Нічого не знайдено</span>
                  <h3 className="mt-2 text-xl font-bold tracking-tight">Спробуйте інший запит або рубрику</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {query ? `За запитом «${query}» поки немає публікацій. Перевірте написання або очистьте пошук.` : "У цій рубриці ще немає публікацій. Загляньте трохи згодом."}
                  </p>
                  <button
                    onClick={() => { setQuery(""); setCategory(""); setTag(""); }}
                    className="mt-5 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900 cursor-pointer"
                  >
                    Показати всі новини
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                    {visibleArticles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        bookmarked={bookmarked.has(article.id)}
                        onBookmark={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                  {visibleCount < sortedCatalogArticles.length && (
                    <div className="mt-6 text-center">
                      <button
                        disabled={loadingMore}
                        onClick={loadMore}
                        className="rounded-full border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-900 disabled:opacity-50 cursor-pointer"
                      >
                        {loadingMore ? "Завантажуємо…" : "Показати більше публікацій"}{" "}
                        <span className="ml-2 font-mono text-slate-400">{Math.max(sortedCatalogArticles.length - visibleCount, 0)}+</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Права колонка: 3) Віджети */}
          <aside className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-5 min-w-0">
            {/* Віджет 1: Хроніка подій */}
            <div className="min-w-0">
              <ChronicleWidget items={flashNews} onSelect={setSelectedFlash} />
            </div>

            {/* Віджет 2: Опитування тижня */}
            <div className="min-w-0">
              <CommunityPoll />
            </div>

            {/* Віджет 3: Кабінет репортера */}
            <div className="md:col-span-2 lg:col-span-1 min-w-0">
              <ReporterCabinetWidget />
            </div>
          </aside>
        </div>

      </div>

      <FlashNewsModal item={selectedFlash} onClose={() => setSelectedFlash(null)} relativeTime={relativeTime} />
    </main>
  );
}
