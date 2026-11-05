"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getArticles, getCategories, getFlashNews, getTags, FALLBACK_POPULAR, FALLBACK_FLASH_NEWS } from "./feed-api";
import { useFeedFilters } from "../../context/FeedContext";
import { useBookmarks } from "../../context/BookmarksContext";
import { useAuth } from "../../context/AuthContext";
import { CommunityPoll } from "../community/CommunityPoll";
import type { Article, CatalogItem, FlashNews, Page } from "./types";

const DEFAULT_CATEGORIES: CatalogItem[] = [
  { id: "all", name: "Всі новини", slug: "" },
  { id: "ai", name: "Штучний Інтелект", slug: "ai" },
  { id: "development", name: "Розробка", slug: "development" },
  { id: "security", name: "Кібербезпека", slug: "cybersecurity" },
  { id: "gamedev", name: "GameDev & 3D", slug: "gamedev-3d" },
  { id: "hardware", name: "Залізо & Чіпи", slug: "hardware-chips" },
  { id: "startups", name: "Стартапи & Ринок", slug: "startups-market" },
];

const DEFAULT_TOPICS = ["Claude", "React", "TypeScript", "Linux", "ZeroDay", "UnrealEngine", "Blackwell", "Monolith"];

function relativeTime(value: string | null) {
  if (!value) return "Щойно";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return "Щойно";
  if (minutes < 60) return `${minutes} хв тому`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год тому`;
  return `${Math.floor(hours / 24)} дн тому`;
}

function BookmarkButton({ active, onClick, label = "Зберегти в закладки" }: { active: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      aria-label={active ? "Прибрати із закладок" : label}
      aria-pressed={active}
      onClick={onClick}
      className={`grid size-10 shrink-0 place-items-center rounded-full border transition cursor-pointer ${
        active ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white/80 text-slate-500 hover:border-slate-400 hover:text-slate-900"
      }`}
    >
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" className="size-[18px]" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.75A1.75 1.75 0 0 1 8.5 3h7a1.75 1.75 0 0 1 1.75 1.75V21l-5.25-3.5L6.75 21V4.75Z" />
      </svg>
    </button>
  );
}

function categoryBadgeTone(category: string | null) {
  const value = category?.toLowerCase() ?? "";
  if (value.includes("інтелект") || value === "ші") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (value.includes("розроб")) return "border-sky-200 bg-sky-50 text-sky-800";
  if (value.includes("кібер") || value.includes("безпек")) return "border-rose-200 bg-rose-50 text-rose-800";
  if (value.includes("game") || value.includes("3d") || value.includes("ігр")) return "border-orange-200 bg-orange-50 text-orange-800";
  if (value.includes("заліз") || value.includes("чіп")) return "border-cyan-200 bg-cyan-50 text-cyan-800";
  if (value.includes("стартап") || value.includes("ринок")) return "border-violet-200 bg-violet-50 text-violet-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function ArticleCover({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <div className={`relative isolate overflow-hidden bg-slate-100 ${large ? "aspect-[2.1/1] max-h-[250px] rounded-2xl" : "aspect-[16/9] rounded-xl"}`}>
      {article.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.cover_image_url} alt="" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(45,212,191,.48),transparent_24%),radial-gradient(ellipse_at_30%_75%,rgba(59,130,246,.32),transparent_40%),linear-gradient(135deg,#0f172a,#13243b_52%,#0f766e)]" />
      )}
    </div>
  );
}

function ArticleMeta({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
      <span className="inline-flex items-center gap-2 font-medium text-slate-700">
        <span className="grid size-7 place-items-center rounded-full bg-slate-200 font-mono text-[10px] font-bold text-slate-600">
          {(article.author ?? "BN").slice(0, 2).toUpperCase()}
        </span>
        {article.author ?? "Редакція ByteNews"}
        {article.author_role && <span className="font-normal text-slate-400">/ {article.author_role}</span>}
      </span>
      <span>{article.time_label || relativeTime(article.published_at)}</span>
      <span className="font-mono">{article.views_count.toLocaleString("uk-UA")} переглядів</span>
      {article.comments_count != null && <span className="font-mono">{article.comments_count.toLocaleString("uk-UA")} коментарів</span>}
    </div>
  );
}

function ArticleCard({ article, bookmarked, onBookmark }: { article: Article; bookmarked: boolean; onBookmark: () => void }) {
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_-24px_rgba(15,23,42,.25)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:p-4 flex flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide leading-none ${categoryBadgeTone(article.category)}`}>
              {article.category ?? "Технології"}
            </span>
            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[9px] leading-none text-slate-500">
              <span aria-hidden="true">◷</span>{article.read_time_min} хв
            </span>
            {article.is_photo_reportage && (
              <span className="inline-flex items-center justify-center rounded-full bg-violet-50 px-2.5 py-1 font-mono text-[9px] font-bold leading-none text-violet-700">
                Фоторепортаж
              </span>
            )}
          </div>
          <BookmarkButton active={bookmarked} onClick={onBookmark} />
        </div>
        <a href={`/articles/${article.slug}`} className="block">
          <ArticleCover article={article} />
        </a>
        <div className="px-1 pb-1 pt-3">
          <a href={`/articles/${article.slug}`} className="text-lg font-bold leading-snug tracking-[-.025em] text-slate-900 decoration-emerald-400 decoration-2 underline-offset-4 group-hover:underline">
            {article.title}
          </a>
          {article.lead && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{article.lead}</p>}
          {article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3 px-1">
        <ArticleMeta article={article} />
      </div>
    </article>
  );
}

function FlashNewsModal({ item, onClose }: { item: FlashNews | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="flash-title" className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-rose-600">
            <span className="size-2 animate-pulse rounded-full bg-rose-500" />
            Оперативна новина
          </span>
          <button onClick={onClose} aria-label="Закрити" className="grid size-9 place-items-center rounded-full bg-slate-100 text-lg text-slate-500 hover:bg-slate-200 cursor-pointer">
            ×
          </button>
        </div>
        <p className="mt-5 font-mono text-xs text-slate-400">
          {item.source_name} <span className="px-1">·</span>{item.time_label || relativeTime(item.published_at)}
        </p>
        <h2 id="flash-title" className="mt-3 text-2xl font-bold leading-tight tracking-[-.03em] text-slate-900">
          {item.title}
        </h2>
        {item.summary && <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>}
        <a href={item.url} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
          Читати джерело <span aria-hidden="true">↗</span>
        </a>
      </section>
    </div>
  );
}

/** Блок 1: Найбільше читають (3 окремі картки праворуч від Hero) */
function MostReadBlock({ items, bookmarked, onBookmark }: { items: Article[]; bookmarked: Set<string>; onBookmark: (id: string) => void }) {
  const displayItems = items.length ? items.slice(0, 3) : FALLBACK_POPULAR;

  return (
    <div className="flex flex-col gap-[10px] h-full">
      {/* Шапка блоку */}
      <div className="flex items-center justify-between px-1 pb-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px]">🔥</span>
          <span className="font-mono font-bold text-[12px] text-[#64748b] tracking-[0.6px] uppercase">
            НАЙБІЛЬШЕ ЧИТАЮТЬ
          </span>
        </div>
        <span className="inline-flex items-center font-sans font-bold text-[11px] leading-none text-[#059669] tracking-[0.55px] uppercase">
          ЗА 24 ГОД
        </span>
      </div>

      {/* Список з 3 карток з фіксованим gap-[10px] та flex-1 */}
      <div className="flex flex-col gap-[10px] flex-1">
        {displayItems.map((item, index) => {
          const idx = String(index + 1).padStart(2, "0");
          const isItemBookmarked = bookmarked.has(item.id);
          return (
            <div
              key={item.id}
              className="backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0] rounded-[16px] p-[18px] shadow-[0px_10px_25px_-4px_rgba(15,23,42,0.04)] flex flex-col justify-between gap-2.5 transition hover:border-[#cbd5e1] group min-h-[139px] flex-1"
            >
              {/* Шапка картки */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                  <span className="inline-flex items-center font-mono font-bold text-[12px] leading-none text-[#94a3b8] tracking-[0.6px]">
                    {idx}
                  </span>
                  <span className="inline-flex items-center justify-center bg-[#f1f5f9] rounded-full px-[8px] py-[3px] font-mono font-medium text-[11px] leading-none text-[#334155] tracking-[0.55px]">
                    {item.category || "Новини"}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={isItemBookmarked ? "Прибрати із закладок" : "Зберегти в закладки"}
                  onClick={() => onBookmark(item.id)}
                  className="cursor-pointer text-[#94a3b8] hover:text-[#059669] transition-colors"
                >
                  <svg viewBox="0 0 12 16" fill={isItemBookmarked ? "#10b981" : "none"} stroke={isItemBookmarked ? "#10b981" : "currentColor"} strokeWidth="1.5" className="w-[12px] h-[16px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 1.5A1 1 0 0 1 2.5.5h7a1 1 0 0 1 1 1v14l-4.5-3-4.5 3v-14Z" />
                  </svg>
                </button>
              </div>

              {/* Текст заголовка */}
              <div className="py-0.5">
                <a
                  href={`/articles/${item.slug}`}
                  className="font-mono font-bold text-[14px] leading-[1.35] tracking-[0.7px] text-[#0f172a] hover:text-[#059669] transition-colors line-clamp-2"
                >
                  {item.title}
                </a>
              </div>

              {/* Час + Статистика */}
              <div className="border-t border-[#f1f5f9] pt-[8px] flex items-center justify-between">
                <span className="font-mono font-normal text-[11px] leading-none text-[#64748b] tracking-[0.55px] whitespace-nowrap">
                  {item.time_label || relativeTime(item.published_at)}
                </span>
                <div className="flex items-center gap-[16px] whitespace-nowrap">
                  <div className="inline-flex items-center gap-[4px] leading-none text-[#475569]">
                    <svg viewBox="0 0 16 12" fill="none" className="w-[15px] h-[10px] shrink-0 text-[#475569]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 6s2.5-4.5 7-4.5S15 6 15 6s-2.5 4.5-7 4.5S1 6 1 6Z" />
                      <circle cx="8" cy="6" r="2" />
                    </svg>
                    <span className="font-mono text-[12px] leading-none">{item.views_count}</span>
                  </div>
                  <div className="inline-flex items-center gap-[4px] leading-none text-[#475569]">
                    <svg viewBox="0 0 14 14" fill="none" className="w-[12px] h-[12px] shrink-0 text-[#475569]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 9.5a2 2 0 0 1-2 2H4l-3 2.5V3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6.5Z" />
                    </svg>
                    <span className="font-mono text-[12px] leading-none">{item.comments_count ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Віджет 1: Хроніка подій */
function Timeline({ items, onSelect }: { items: FlashNews[]; onSelect: (item: FlashNews) => void }) {
  const displayItems = items.length ? items : FALLBACK_FLASH_NEWS;

  return (
    <section className="backdrop-blur-[10px] bg-white/82 border border-[#e2e8f0] rounded-[16px] px-[15px] py-[10px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)]">
      {/* Шапка хроніки */}
      <div className="border-b border-[#e2e8f0] pt-[10px] pb-[14px] flex items-center justify-between">
        <div className="inline-flex items-center gap-[8px]">
          <span className="size-[8px] rounded-full bg-[#10b981] ring-4 ring-[#10b981]/15 shrink-0" />
          <h2 className="font-mono font-bold text-[12px] leading-none text-[#1e293b] tracking-[0.6px] uppercase">
            ХРОНІКА ПОДІЙ
          </h2>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-[10px] py-[4px] font-mono font-medium text-[10px] leading-none text-[#047857] tracking-[0.5px]">
          В реальному часі
        </span>
      </div>

      {/* Елементи подій */}
      <div className="pt-[14px]">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const timeStr = item.time_label || (item.published_at ? new Date(item.published_at).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }) : "Щойно");
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex gap-[12px] items-stretch text-left w-full group cursor-pointer"
            >
              {/* Ліва колонка пінів */}
              <div className="flex flex-col items-center pt-[3px] shrink-0">
                <div className="size-[8px] rounded-full border-2 border-[#10b981] bg-white group-hover:bg-[#10b981] transition-colors" />
                {!isLast && <div className="w-[2px] flex-1 bg-[#e2e8f0] my-[2px]" />}
              </div>

              {/* Права колонка тексту */}
              <div className={`flex-1 ${!isLast ? "pb-[20px]" : "pb-[10px]"}`}>
                <div className="flex items-center gap-[5px] flex-wrap leading-none">
                  <span className="font-mono font-bold text-[11px] leading-none text-[#334155] tracking-[0.55px]">
                    {timeStr}
                  </span>
                  <span className="font-mono font-bold text-[11px] leading-none text-[#94a3b8]">•</span>
                  <span className="font-mono font-normal text-[11px] leading-none text-[#64748b]">
                    {item.category || item.source_name}
                  </span>
                  {item.is_important && (
                    <span className="inline-flex items-center justify-center bg-[#ffe4e6] text-[#be123c] font-mono font-bold text-[9px] leading-none px-[8px] py-[3px] rounded-full uppercase tracking-[0.45px]">
                      ВАЖЛИВО
                    </span>
                  )}
                </div>
                <p className="mt-[6px] font-sans font-normal text-[12px] leading-[1.4] text-[#1e293b] group-hover:text-[#059669] transition-colors">
                  {item.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Віджет 3: Бажаєте писати для ByteNews? */
function ReporterCabinetWidget() {
  const { user, openAuthModal, setActiveView } = useAuth();

  const handleAction = () => {
    if (!user) {
      openAuthModal();
    } else {
      setActiveView("profile");
    }
  };

  return (
    <section className="relative overflow-hidden backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0] rounded-[16px] p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)] flex flex-col gap-[12px] items-start">
      <div className="pointer-events-none absolute -right-8 -top-8 size-[128px] rounded-full bg-[#10b981]/20 blur-2xl" />
      <div className="size-[36px] rounded-[10px] bg-[#ecfdf5] border border-[#a7f3d0] grid place-items-center text-[#059669]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <h3 className="font-mono font-bold text-[14px] text-[#0f172a] tracking-[0.3px]">
        Бажаєте писати для ByteNews?
      </h3>
      <p className="font-sans font-normal text-[12px] leading-[1.45] text-[#475569]">
        Перемкніть профіль у режим репортера, щоб публікувати технічні розслідування, репортажі та аналітику.
      </p>
      <button
        type="button"
        onClick={handleAction}
        className="w-full py-[14px] px-[10px] rounded-[12px] bg-[#0f172a] hover:bg-[#059669] transition-colors font-mono font-bold text-[12px] text-white text-center cursor-pointer shadow-xs active:scale-[0.99]"
      >
        Кабінет репортера
      </button>
    </section>
  );
}

export function FeedHome() {
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
      .then((page: Page<Article>) => { setArticles(page.items); setTotal(page.total); })
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

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await getArticles({ category: category || undefined, tag: tag || undefined, query: query || undefined, limit: 12, offset: articles.length });
      setArticles((current) => [...current, ...page.items]);
      setTotal(page.total);
    } catch { setError("Не вдалося завантажити наступну сторінку."); }
    finally { setLoadingMore(false); }
  }

  const activeCategory = categories.find((item) => item.slug === category)?.name ?? "Всі новини";
  const slugForTag = (name: string) => topics.find((item) => item.name.toLowerCase() === name.toLowerCase())?.slug ?? name.toLowerCase().trim().replace(/\s+/g, "-");

  const topicsList = topics.length ? topics : DEFAULT_TOPICS.map((name) => ({ id: name.toLowerCase(), name, slug: name.toLowerCase() }));

  return (
    <main className="min-h-screen text-slate-900">
      <div className="max-w-[1296px] mx-auto px-4 pb-16 pt-6">

        {/* 1. Верхня секція: Головна новина (8 колонок) + Найбільше читають (4 колонки) */}
        <section aria-labelledby="hero-heading" className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#10b981]" />
              <h2 id="hero-heading" className="font-mono text-[11px] font-bold uppercase tracking-[0.6px] text-slate-700">
                Головна новина & тренди дня
              </h2>
            </div>
            <span className="inline-flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full leading-none">
              Топ-Огляд
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Ліва колонка: Головна новина (Hero) */}
            <div className="lg:col-span-8 flex flex-col">
              {hero ? (
                <article className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_14px_40px_-32px_rgba(15,23,42,.42)] flex flex-col justify-between h-full">
                  <div>
                    <div className="mb-3.5 flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider leading-none ${categoryBadgeTone(hero.category)}`}>
                          {hero.category ?? "Технології"}
                        </span>
                        <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] leading-none text-slate-600">
                          <span aria-hidden="true">◷</span>{hero.read_time_min} хв читання
                        </span>
                        {hero.is_photo_reportage && (
                          <span className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-mono text-[10px] font-bold leading-none text-violet-700">
                            Фоторепортаж
                          </span>
                        )}
                      </div>
                      <BookmarkButton active={bookmarked.has(hero.id)} onClick={() => toggleBookmark(hero.id)} />
                    </div>

                    <a href={`/articles/${hero.slug}`} className="block">
                      <ArticleCover article={hero} large />
                    </a>

                    <div className="px-1 pb-1 pt-3.5 sm:px-1.5 sm:pt-4">
                      <a href={`/articles/${hero.slug}`}>
                        <h3 className="text-xl sm:text-2xl font-extrabold leading-tight tracking-[-.035em] text-slate-950 hover:text-[#059669] transition-colors">
                          {hero.title}
                        </h3>
                      </a>
                      {hero.lead && <p className="mt-2.5 max-w-4xl line-clamp-2 text-sm leading-6 text-slate-600">{hero.lead}</p>}
                      {hero.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {hero.tags.slice(0, 5).map((topic) => (
                            <button
                              key={topic}
                              type="button"
                              onClick={() => setTag(slugForTag(topic))}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[10px] font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-800 cursor-pointer"
                            >
                              #{topic}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3.5 px-1">
                    <ArticleMeta article={hero} />
                    <a
                      href={`/articles/${hero.slug}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      Читати <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 h-full flex items-center justify-center">
                  {loading ? "Завантажуємо головну новину…" : "Головна новина з’явиться після першої публікації."}
                </div>
              )}
            </div>

            {/* Права колонка: 1) Найбільше читають (3 картки) */}
            <div className="lg:col-span-4 flex flex-col">
              <MostReadBlock
                items={popular.length ? popular : FALLBACK_POPULAR}
                bookmarked={bookmarked}
                onBookmark={toggleBookmark}
              />
            </div>
          </div>
        </section>

        {/* 2. Середня секція: # Теми на всю ширину (1296px) */}
        <section aria-label="Популярні теми" className="w-full pt-[10px] pb-[30px] flex flex-wrap items-center gap-[8px]">
          <span className="font-mono font-bold text-[16px] text-[#10b981] tracking-[0.8px]">#</span>
          <span className="font-mono font-bold text-[14px] text-[#94a3b8] tracking-[0.7px] mr-1">Теми:</span>
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
                className={`backdrop-blur-[5px] rounded-[12px] px-[12px] py-[6px] font-mono font-medium text-[12px] tracking-[0.6px] transition cursor-pointer ${
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
          <div className="lg:col-span-8 min-w-0">
            <section aria-labelledby="articles-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">
                    Каталог публікацій <span className="px-1">/</span>{activeCategory}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <h2 id="articles-heading" className="text-2xl font-extrabold tracking-[-.04em]">
                      {query ? `Результати пошуку` : activeCategory}
                    </h2>
                    <span className="grid min-w-7 place-items-center rounded-full bg-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold leading-none text-slate-600">
                      {total}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  {error}. Перевірте доступність API та адресу `NEXT_PUBLIC_API_BASE_URL`.
                </div>
              )}

              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-72 animate-pulse rounded-2xl bg-slate-200"/>
                  <div className="h-72 animate-pulse rounded-2xl bg-slate-200"/>
                </div>
              ) : articles.length === 0 ? (
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
                  <div className="grid gap-4 md:grid-cols-2">
                    {listArticles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        bookmarked={bookmarked.has(article.id)}
                        onBookmark={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                  {articles.length < total && (
                    <div className="mt-6 text-center">
                      <button
                        disabled={loadingMore}
                        onClick={loadMore}
                        className="rounded-full border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-900 disabled:opacity-50 cursor-pointer"
                      >
                        {loadingMore ? "Завантажуємо…" : "Показати більше публікацій"}{" "}
                        <span className="ml-2 font-mono text-slate-400">{Math.max(total - articles.length, 0)}+</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Права колонка: 3) Віджети */}
          <aside className="lg:col-span-4 flex flex-col gap-[20px]">
            {/* Віджет 1: Хроніка подій */}
            <Timeline items={flashNews} onSelect={setSelectedFlash} />

            {/* Віджет 2: Опитування тижня */}
            <CommunityPoll />

            {/* Віджет 3: Кабінет репортера */}
            <ReporterCabinetWidget />
          </aside>
        </div>

      </div>

      <FlashNewsModal item={selectedFlash} onClose={() => setSelectedFlash(null)} />
    </main>
  );
}
