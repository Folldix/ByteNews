"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getArticles, getCategories, getFlashNews, getTags } from "./feed-api";
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

const DEFAULT_TOPICS = ["Claude", "React", "TypeScript", "Linux", "ZeroDay", "OpenAI", "Rust", "GPU"];

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
      className={`grid size-10 shrink-0 place-items-center rounded-full border transition ${active ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white/80 text-slate-500 hover:border-slate-400 hover:text-slate-900"}`}
    >
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" className="size-[18px]" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.75A1.75 1.75 0 0 1 8.5 3h7a1.75 1.75 0 0 1 1.75 1.75V21l-5.25-3.5L6.75 21V4.75Z" />
      </svg>
    </button>
  );
}

function ArticleCover({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <div className={`relative isolate overflow-hidden bg-slate-900 ${large ? "aspect-[16/8] rounded-2xl sm:aspect-[16/7]" : "aspect-[16/9] rounded-xl"}`}>
      {article.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.cover_image_url} alt="" className="absolute inset-0 z-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(45,212,191,.48),transparent_24%),radial-gradient(ellipse_at_30%_75%,rgba(59,130,246,.32),transparent_40%),linear-gradient(135deg,#0f172a,#13243b_52%,#0f766e)]" />
      )}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2 sm:bottom-5 sm:left-5">
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-white backdrop-blur">{article.category ?? "Технології"}</span>
        {article.is_photo_reportage && <span className="rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-950">Фоторепортаж</span>}
      </div>
      <span className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-slate-950/35 px-3 py-1 font-mono text-xs text-white backdrop-blur">{article.read_time_min} хв читання</span>
    </div>
  );
}

function ArticleMeta({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
      <span className="inline-flex items-center gap-2 font-medium text-slate-700">
        <span className="grid size-7 place-items-center rounded-full bg-slate-200 font-mono text-[10px] font-bold text-slate-600">{(article.author ?? "BN").slice(0, 2).toUpperCase()}</span>
        {article.author ?? "Редакція ByteNews"}{article.author_role && <span className="font-normal text-slate-400">/ {article.author_role}</span>}
      </span>
      <span>{relativeTime(article.published_at)}</span>
      <span className="font-mono">{article.views_count.toLocaleString("uk-UA")} переглядів</span>
      {article.comments_count != null && <span className="font-mono">{article.comments_count.toLocaleString("uk-UA")} коментарів</span>}
    </div>
  );
}

function ArticleCard({ article, bookmarked, onBookmark }: { article: Article; bookmarked: boolean; onBookmark: () => void }) {
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_-24px_rgba(15,23,42,.25)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:p-4">
      <a href={`/articles/${article.slug}`} className="block"><ArticleCover article={article} /></a>
      <div className="px-1 pb-1 pt-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[.15em] text-emerald-700">{article.category ?? "Технології"} <span className="text-slate-300">/</span> {article.read_time_min} хв</span>
          <BookmarkButton active={bookmarked} onClick={onBookmark} />
        </div>
        <a href={`/articles/${article.slug}`} className="text-lg font-bold leading-snug tracking-[-.025em] text-slate-900 decoration-emerald-400 decoration-2 underline-offset-4 group-hover:underline">{article.title}</a>
        {article.lead && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{article.lead}</p>}
        {article.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{article.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500">#{tag}</span>)}</div>}
        <div className="mt-4 border-t border-slate-100 pt-3"><ArticleMeta article={article} /></div>
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
        <div className="flex items-center justify-between gap-4"><span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-rose-600"><span className="size-2 animate-pulse rounded-full bg-rose-500" />Оперативна новина</span><button onClick={onClose} aria-label="Закрити" className="grid size-9 place-items-center rounded-full bg-slate-100 text-lg text-slate-500 hover:bg-slate-200">×</button></div>
        <p className="mt-5 font-mono text-xs text-slate-400">{item.source_name} <span className="px-1">·</span>{relativeTime(item.published_at)}</p>
        <h2 id="flash-title" className="mt-3 text-2xl font-bold leading-tight tracking-[-.03em] text-slate-900">{item.title}</h2>
        {item.summary && <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>}
        <a href={item.url} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Читати джерело <span aria-hidden="true">↗</span></a>
      </section>
    </div>
  );
}

function Timeline({ items, onSelect }: { items: FlashNews[]; onSelect: (item: FlashNews) => void }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(15,23,42,.25)]">
      <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.17em] text-rose-600">Live desk</p><h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Оперативно</h2></div><span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-60" /><span className="relative inline-flex size-2.5 rounded-full bg-rose-500" /></span></div>
      <div className="mt-5 space-y-0">
        {items.length === 0 ? <p className="py-4 text-sm leading-6 text-slate-500">Оперативні оновлення з’являться тут після надходження новин.</p> : items.map((item, index) => (
          <button key={item.id} onClick={() => onSelect(item)} className="group relative block w-full pb-5 pl-5 text-left last:pb-0">
            {index < items.length - 1 && <span className="absolute bottom-0 left-[5px] top-2 w-px bg-slate-200" />}
            <span className="absolute left-0 top-1.5 size-[11px] rounded-full border-2 border-white bg-emerald-500 ring-1 ring-emerald-200" />
            <span className="font-mono text-[10px] text-slate-400">{relativeTime(item.published_at)} <span className="px-1">·</span>{item.source_name}</span>
            <span className="mt-1.5 block text-sm font-semibold leading-5 text-slate-800 group-hover:text-emerald-800">{item.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Trending({ items, bookmarked, onBookmark }: { items: Article[]; bookmarked: Set<string>; onBookmark: (id: string) => void }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_12px_35px_-22px_rgba(15,23,42,.8)]">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[.17em] text-emerald-300">Редакційний радар</p><h2 className="mt-1 text-lg font-bold tracking-tight">Найбільше читають <span className="font-mono text-xs font-medium text-slate-400">/ 24 год</span></h2>
      <ol className="mt-3 divide-y divide-white/10">{items.slice(0, 3).map((item, index) => <li key={item.id} className="flex gap-3 py-3.5"><span className="font-mono text-xl font-light leading-8 text-emerald-300/70">0{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><span className="font-mono text-[9px] uppercase tracking-[.13em] text-slate-400">{item.category ?? "Новини"} <span className="px-1">·</span>{relativeTime(item.published_at)}</span><button aria-label="Зберегти матеріал" aria-pressed={bookmarked.has(item.id)} onClick={() => onBookmark(item.id)} className="shrink-0 text-slate-500 transition hover:text-emerald-300">{bookmarked.has(item.id) ? "◆" : "◇"}</button></div><a href={`/articles/${item.slug}`} className="mt-1 block text-sm font-semibold leading-5 text-slate-100 hover:text-emerald-200">{item.title}</a><p className="mt-1 font-mono text-[10px] text-slate-500">{item.views_count.toLocaleString("uk-UA")} переглядів</p></div></li>)}</ol>
      {items.length === 0 && <p className="py-4 text-sm text-slate-400">Щойно опубліковані матеріали скоро з’являться тут.</p>}
    </section>
  );
}

export function FeedHome() {
  const [categories, setCategories] = useState<CatalogItem[]>(DEFAULT_CATEGORIES);
  const [topics, setTopics] = useState<CatalogItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [popular, setPopular] = useState<Article[]>([]);
  const [flashNews, setFlashNews] = useState<FlashNews[]>([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [query, setQuery] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [selectedFlash, setSelectedFlash] = useState<FlashNews | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
    setQuery(initialQuery);
    setDraftQuery(initialQuery);
    setReady(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getCategories(controller.signal), getTags(controller.signal), getArticles({ sort: "popular", limit: 3, signal: controller.signal }), getFlashNews(controller.signal)])
      .then(([categoryPage, tagPage, popularPage, flashPage]) => {
        if (categoryPage.items.length) setCategories([{ id: "all", name: "Всі новини", slug: "" }, ...categoryPage.items]);
        setTopics(tagPage.items);
        setPopular(popularPage.items);
        setFlashNews(flashPage.items);
      })
      .catch(() => { /* The main feed request reports API errors below. */ });
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

  const toggleBookmark = useCallback((id: string) => {
    setBookmarked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

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

  return (
    <main className="min-h-screen bg-[#f6f8fa] text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-7 sm:px-6 lg:px-10 lg:pt-10">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-emerald-700">ByteNews <span className="text-slate-300">/</span> Feed & discovery</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.05em] sm:text-4xl">Технології <span className="text-slate-400">у фокусі.</span></h1></div>
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:inline-flex">Щоденний інженерний дайджест</span>
        </div>

        <nav aria-label="Рубрики" className="-mx-4 mb-7 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0"><div className="flex min-w-max gap-2">
          {categories.map((item) => <button key={item.id} onClick={() => { setCategory(item.slug); setTag(""); }} className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition ${category === item.slug && !tag ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"}`}>{item.name}</button>)}
        </div></nav>

        <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0">
            <section aria-labelledby="hero-heading" className="mb-8">
              <div className="mb-3 flex items-center justify-between"><h2 id="hero-heading" className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-slate-500"><span className="mr-2 text-emerald-600">●</span>Головна новина <span className="px-1 text-slate-300">&</span> тренди дня</h2><span className="font-mono text-[10px] text-slate-400">01 / TODAY</span></div>
              {hero ? <article className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-3 shadow-[0_18px_55px_-42px_rgba(15,23,42,.5)] sm:p-5">
                <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><ArticleCover article={hero} large />
                  <div className="px-1 pb-2 lg:px-3"><div className="mb-3 flex items-start justify-between gap-4"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">{hero.category ?? "Технології"}</span><span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] font-medium text-slate-500">{hero.read_time_min} хв читання</span></div><BookmarkButton active={bookmarked.has(hero.id)} onClick={() => toggleBookmark(hero.id)} /></div>
                    <a href={`/articles/${hero.slug}`}><h3 className="text-2xl font-extrabold leading-[1.12] tracking-[-.04em] text-slate-950 sm:text-3xl">{hero.title}</h3></a>
                    {hero.lead && <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{hero.lead}</p>}
                    {hero.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{hero.tags.slice(0, 4).map((topic) => <button key={topic} onClick={() => setTag(slugForTag(topic))} className="rounded-md border border-slate-200 px-2 py-1 font-mono text-[10px] text-slate-500 hover:border-emerald-300 hover:text-emerald-800">#{topic}</button>)}</div>}
                    <div className="mt-5"><ArticleMeta article={hero} /></div>
                    <a href={`/articles/${hero.slug}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-emerald-700">Читати <span aria-hidden="true">↗</span></a>
                  </div>
                </div>
              </article> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{loading ? "Завантажуємо головну новину…" : "Головна новина з’явиться після першої публікації."}</div>}
            </section>

            <section aria-label="Популярні теми" className="mb-8 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 sm:px-5"><div className="flex items-center gap-4"><h2 className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-slate-400"># Теми</h2><div className="flex min-w-0 gap-2 overflow-x-auto scrollbar-none">{(topics.length ? topics : DEFAULT_TOPICS.map((name) => ({ id: name, name, slug: name.toLowerCase() }))).map((topic) => <button key={topic.id} onClick={() => { setTag(topic.slug); setCategory(""); }} aria-pressed={tag === topic.slug} className={`shrink-0 rounded-full px-3 py-2 font-mono text-[11px] transition ${tag === topic.slug ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>#{topic.name}</button>)}</div></div></section>

            <section aria-labelledby="articles-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Каталог публікацій <span className="px-1">/</span>{activeCategory}</p><div className="mt-1 flex items-center gap-2"><h2 id="articles-heading" className="text-2xl font-extrabold tracking-[-.04em]">{query ? `Результати пошуку` : activeCategory}</h2><span className="grid min-w-7 place-items-center rounded-full bg-slate-200 px-2 py-1 font-mono text-[10px] font-bold text-slate-600">{total}</span></div></div>
                <form onSubmit={(event) => { event.preventDefault(); setQuery(draftQuery.trim()); }} className="flex w-full max-w-sm items-center rounded-full border border-slate-200 bg-white p-1.5 focus-within:border-emerald-400"><label htmlFor="feed-search" className="sr-only">Пошук статей</label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="ml-2 size-4 text-slate-400" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path strokeLinecap="round" d="m16 16 4.5 4.5"/></svg><input id="feed-search" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Пошук у стрічці…" className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-xs outline-none placeholder:text-slate-400"/><button className="rounded-full bg-slate-900 px-4 py-2 text-[10px] font-bold text-white hover:bg-emerald-700">Знайти</button></form>
              </div>
              {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}. Перевірте доступність API та адресу `NEXT_PUBLIC_API_BASE_URL`.</div>}
              {loading ? <div className="grid gap-4 md:grid-cols-2"><div className="h-72 animate-pulse rounded-2xl bg-slate-200"/><div className="h-72 animate-pulse rounded-2xl bg-slate-200"/></div> : articles.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-emerald-700">Нічого не знайдено</span><h3 className="mt-2 text-xl font-bold tracking-tight">Спробуйте інший запит або рубрику</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{query ? `За запитом «${query}» поки немає публікацій. Перевірте написання або очистьте пошук.` : "У цій рубриці ще немає публікацій. Загляньте трохи згодом."}</p><button onClick={() => { setQuery(""); setDraftQuery(""); setCategory(""); setTag(""); }} className="mt-5 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900">Показати всі новини</button></div> : <>
                <div className="grid gap-4 md:grid-cols-2">{listArticles.map((article) => <ArticleCard key={article.id} article={article} bookmarked={bookmarked.has(article.id)} onBookmark={() => toggleBookmark(article.id)} />)}</div>
                {articles.length < total && <div className="mt-6 text-center"><button disabled={loadingMore} onClick={loadMore} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-900 disabled:opacity-50">{loadingMore ? "Завантажуємо…" : "Завантажити ще"} <span className="ml-2 font-mono text-slate-400">{Math.max(total - articles.length, 0)}+</span></button></div>}
              </>}
            </section>
          </div>

          <aside className="grid gap-5 md:grid-cols-2 xl:sticky xl:top-6 xl:grid-cols-1"><Trending items={popular} bookmarked={bookmarked} onBookmark={toggleBookmark} /><Timeline items={flashNews} onSelect={setSelectedFlash} /><section className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[.17em] text-emerald-800">ByteNews / Open feed</p><h2 className="mt-2 text-base font-bold tracking-tight text-slate-900">Новини для ваших інструментів</h2><p className="mt-2 text-sm leading-6 text-slate-600">Публічний JSON-фід доступний для інтеграції з іншими сервісами.</p><code className="mt-4 block overflow-x-auto rounded-xl bg-slate-950 px-3 py-3 font-mono text-[10px] text-emerald-200">GET /api/v1/public/feed</code></section></aside>
        </div>
      </div>
      <FlashNewsModal item={selectedFlash} onClose={() => setSelectedFlash(null)} />
    </main>
  );
}
