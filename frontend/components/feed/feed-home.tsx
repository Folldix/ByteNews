"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
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
  if (active) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={true}
        onClick={onClick}
        className="relative size-[32px] cursor-pointer shrink-0 transition"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="31" height="31" rx="11.5" fill="#ECFDF5" stroke="#6EE7B7" />
          <path d="M10 11.2002V20.6854C10 22.0464 10 22.7268 10.2041 23.1433C10.5824 23.9151 11.4116 24.3588 12.2637 24.2454C12.7234 24.1842 13.2896 23.8067 14.4221 23.0518L14.4248 23.0499C14.8737 22.7507 15.0981 22.6011 15.333 22.5181C15.7642 22.3656 16.2348 22.3656 16.666 22.5181C16.9013 22.6012 17.1266 22.7515 17.5773 23.0519C18.7098 23.8069 19.2767 24.1841 19.7364 24.2452C20.5885 24.3586 21.4176 23.9151 21.7959 23.1433C22 22.7269 22 22.0462 22 20.6854V11.1969C22 10.079 22 9.5192 21.7822 9.0918C21.5905 8.71547 21.2837 8.40973 20.9074 8.21799C20.4796 8 19.9203 8 18.8002 8H13.2002C12.0801 8 11.5196 8 11.0918 8.21799C10.7155 8.40973 10.4097 8.71547 10.218 9.0918C10 9.51962 10 10.0801 10 11.2002Z" fill="#059669" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={false}
      onClick={onClick}
      className="group/bm relative size-[32px] cursor-pointer shrink-0 transition"
    >
      <div className="group-hover/bm:hidden">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="31" height="31" rx="11.5" fill="white" fillOpacity="0.8" stroke="#E2E8F0" />
          <path d="M10 20.6854V11.2002C10 10.0801 10 9.51962 10.218 9.0918C10.4097 8.71547 10.7155 8.40973 11.0918 8.21799C11.5196 8 12.0801 8 13.2002 8H18.8002C19.9203 8 20.4796 8 20.9074 8.21799C21.2837 8.40973 21.5905 8.71547 21.7822 9.0918C22 9.5192 22 10.079 22 11.1969V20.6854C22 22.0462 22 22.7269 21.7959 23.1433C21.4176 23.9151 20.5885 24.3586 19.7364 24.2452C19.2767 24.1841 18.7098 23.8069 17.5773 23.0519C17.1266 22.7515 16.9013 22.6012 16.666 22.5181C16.2348 22.3656 15.7642 22.3656 15.333 22.5181C15.0981 22.6011 14.8737 22.7507 14.4248 23.0499L14.4221 23.0518C13.2896 23.8067 12.7234 24.1842 12.2637 24.2454C11.4116 24.3588 10.5824 23.9151 10.2041 23.1433C10 22.7268 10 22.0464 10 20.6854Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="hidden group-hover/bm:block">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="31" height="31" rx="11.5" fill="white" stroke="#CBD5E1" />
          <path d="M10 20.6854V11.2002C10 10.0801 10 9.51962 10.218 9.0918C10.4097 8.71547 10.7155 8.40973 11.0918 8.21799C11.5196 8 12.0801 8 13.2002 8H18.8002C19.9203 8 20.4796 8 20.9074 8.21799C21.2837 8.40973 21.5905 8.71547 21.7822 9.0918C22 9.5192 22 10.079 22 11.1969V20.6854C22 22.0462 22 22.7269 21.7959 23.1433C21.4176 23.9151 20.5885 24.3586 19.7364 24.2452C19.2767 24.1841 18.7098 23.8069 17.5773 23.0519C17.1266 22.7515 16.9013 22.6012 16.666 22.5181C16.2348 22.3656 15.7642 22.3656 15.333 22.5181C15.0981 22.6011 14.8737 22.7507 14.4248 23.0499L14.4221 23.0518C13.2896 23.8067 12.7234 24.1842 12.2637 24.2454C11.4116 24.3588 10.5824 23.9151 10.2041 23.1433C10 22.7268 10 22.0464 10 20.6854Z" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

function getCategoryDesign(category: string | null) {
  const value = category?.toLowerCase() ?? "";
  if (value.includes("інтелект") || value === "ші" || value.includes("ai")) {
    return {
      strip: "bg-[#10b981]",
      badge: "bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.35)] text-[#059669]",
    };
  }
  if (value.includes("кібер") || value.includes("безпек")) {
    return {
      strip: "bg-[#f43f5e]",
      badge: "bg-[rgba(244,63,94,0.12)] border-[rgba(244,63,94,0.35)] text-[#e11d48]",
    };
  }
  if (value.includes("заліз") || value.includes("чіп")) {
    return {
      strip: "bg-[#8b5cf6]",
      badge: "bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.35)] text-[#7c3aed]",
    };
  }
  if (value.includes("game") || value.includes("3d") || value.includes("ігр")) {
    return {
      strip: "bg-[#f59e0b]",
      badge: "bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.35)] text-[#d97706]",
    };
  }
  if (value.includes("стартап") || value.includes("ринок")) {
    return {
      strip: "bg-[#14b8a6]",
      badge: "bg-[rgba(20,184,166,0.12)] border-[rgba(20,184,166,0.35)] text-[#0d9488]",
    };
  }
  if (value.includes("розроб") || value.includes("dev")) {
    return {
      strip: "bg-[#0284c7]",
      badge: "bg-[rgba(2,132,199,0.12)] border-[rgba(2,132,199,0.35)] text-[#0369a1]",
    };
  }
  return {
    strip: "bg-[#0284c7]",
    badge: "bg-[rgba(2,132,199,0.12)] border-[rgba(2,132,199,0.35)] text-[#0369a1]",
  };
}

function ArticleCover({ article, large = false }: { article: Article; large?: boolean }) {
  if (large) {
    return (
      <div className="relative isolate overflow-hidden bg-slate-100 w-full h-[256px] rounded-[16px] border border-[#e2e8f0]">
        {article.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.cover_image_url} alt="" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(45,212,191,.48),transparent_24%),radial-gradient(ellipse_at_30%_75%,rgba(59,130,246,.32),transparent_40%),linear-gradient(135deg,#0f172a,#13243b_52%,#0f766e)]" />
        )}
      </div>
    );
  }
  return (
    <div className="relative isolate overflow-hidden bg-slate-100 size-full">
      {article.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.cover_image_url} alt="" className="size-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      ) : (
        <div className="size-full bg-[radial-gradient(ellipse_at_72%_35%,rgba(45,212,191,.48),transparent_24%),radial-gradient(ellipse_at_30%_75%,rgba(59,130,246,.32),transparent_40%),linear-gradient(135deg,#0f172a,#13243b_52%,#0f766e)]" />
      )}
    </div>
  );
}

function ArticleCard({ article, bookmarked, onBookmark }: { article: Article; bookmarked: boolean; onBookmark: () => void }) {
  const { setActiveView } = useAuth();
  const design = getCategoryDesign(article.category);
  const authorAvatar = article.author_avatar || "/images/avatar-1.png";

  return (
    <article className="group relative overflow-hidden backdrop-blur-[10px] bg-white/82 hover:bg-white/95 border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-[16px] p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)] hover:shadow-[0px_16px_32px_-4px_rgba(15,23,42,0.1)] flex flex-col justify-between gap-[14px] transition-all duration-300">
      {/* Верхня 4px смужка */}
      <div className={`absolute inset-x-0 top-0 h-[4px] ${design.strip}`} />

      <div>
        {/* Шапка картки */}
        <div className="flex items-center justify-between w-full mb-[14px]">
          <div className="flex items-center gap-[8px]">
            <span className={`px-[10px] py-[2px] rounded-full border font-mono font-bold text-[11px] leading-[1.5] ${design.badge}`}>
              {article.category ?? "Технології"}
            </span>
            <span className="bg-[#f1f5f9] rounded-full px-[10px] py-[4px] inline-flex items-center gap-[4px] font-mono font-normal text-[11px] leading-[1.5] text-[#475569]">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M6.5 3.16667V6.5H9.83333M6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5Z" stroke="#94A3B8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{article.read_time_min} хв</span>
            </span>
          </div>

          <BookmarkButton active={bookmarked} onClick={onBookmark} />
        </div>

        {/* Обкладинка + Заголовок */}
        <a href={`/articles/${article.slug}`} className="flex flex-col gap-[24px] items-start w-full cursor-pointer">
          <div className="w-full h-[180px] rounded-[16px] border border-[#e2e8f0] overflow-hidden relative shrink-0">
            <ArticleCover article={article} />
          </div>
          <h3 className="font-sans font-extrabold text-[16px] leading-[1.25] tracking-[-0.32px] text-[#0f172a] group-hover:text-[#047857] transition-colors text-left w-full">
            {article.title}
          </h3>
        </a>

        {/* Опис (lead) */}
        {article.lead && (
          <p className="mt-[12px] font-sans font-normal text-[13px] leading-[1.45] text-[#475569] line-clamp-3">
            {article.lead}
          </p>
        )}

        {/* Ряд тегів */}
        {article.tags.length > 0 && (
          <div className="py-[10px] flex flex-wrap gap-[6px] items-center w-full">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-[#f1f5f9] border border-[#e2e8f0] rounded-[6px] px-[8px] py-[2px] font-mono font-extrabold text-[11px] leading-[1.25] tracking-[-0.22px] text-[#475569] hover:border-[#10b981] hover:text-[#059669] transition cursor-pointer"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Підвал картки */}
      <div className="border-t border-[#e2e8f0] pt-[14px] flex items-center justify-between w-full">
        {/* Ліворуч: блок автора Lite */}
        <button
          type="button"
          onClick={() => setActiveView("profile")}
          className="group/author flex items-center gap-[8px] text-left cursor-pointer focus:outline-hidden"
          aria-label={`Переглянути профіль автора ${article.author ?? "Олексій Коваленко"}`}
        >
          <div className="size-[24px] rounded-full shrink-0 overflow-hidden border border-[#cbd5e1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={authorAvatar}
              alt={article.author ?? "Олексій Коваленко"}
              className="size-full object-cover"
            />
          </div>
          <span className="font-sans font-medium text-[11px] leading-[1.25] tracking-[-0.22px] text-[#334155] group-hover/author:underline">
            {article.author ?? "Олексій Коваленко"}
          </span>
        </button>

        {/* Праворуч: Статистика */}
        <div className="flex items-center gap-[16px] text-[#475569]">
          {/* Перегляди */}
          <div className="flex items-center gap-[4px]">
            <svg width="19" height="12" viewBox="0 0 20.6943 13.9999" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#94a3b8]">
              <path d="M10.3474 12.9999C6.8167 12.9999 3.7134 10.5478 1.93397 8.77881C1.4643 8.31189 1.22945 8.07837 1.07996 7.62012C0.973345 7.29328 0.973345 6.70673 1.07996 6.3799C1.22945 5.92165 1.46431 5.68802 1.93397 5.22111C3.7134 3.45208 6.8167 1 10.3474 1C13.878 1 16.9807 3.45208 18.7601 5.22111C19.2295 5.6877 19.4649 5.92181 19.6143 6.3799C19.7209 6.70674 19.7209 7.29328 19.6143 7.62012C19.4649 8.07819 19.2294 8.31226 18.7601 8.77881C16.9807 10.5478 13.878 12.9999 10.3474 12.9999ZM10.3472 9C9.2426 9 8.34717 8.10457 8.34717 7C8.34717 5.89543 9.2426 5 10.3472 5C11.4517 5 12.3472 5.89543 12.3472 7C12.3472 8.10457 11.4517 9 10.3472 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-mono text-[12px] leading-[1.6] text-[#475569]">{article.views_count}</span>
          </div>

          {/* Лайки */}
          <div className="flex items-center gap-[4px]">
            <svg width="18" height="16" viewBox="0 0 20 17.96" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#94a3b8]">
              <path d="M1 5.95983C1 -0.0401966 8 -0.540197 10 4.15424C12 -0.540197 19 -0.0401966 19 5.95983C19 11.9599 10 16.96 10 16.96C10 16.96 1 11.9599 1 5.95983Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-mono text-[12px] leading-[1.6] text-[#475569]">{article.likes_count}</span>
          </div>

          {/* Коментарі */}
          <div className="flex items-center gap-[4px]">
            <svg width="18" height="17" viewBox="0 0 20 18.9195" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#94a3b8]">
              <path d="M5.12357 15.7012L3.59961 16.9203C2.76744 17.5861 2.35115 17.9191 2.00098 17.9195C1.69644 17.9198 1.40845 17.7813 1.21846 17.5433C1 17.2696 1 16.7369 1 15.6712V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40974 1.71547 1.71548 1.40974 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H15.8002C16.9203 1 17.4796 1 17.9074 1.21799C18.2837 1.40974 18.5905 1.71547 18.7822 2.0918C19 2.5192 19 3.079 19 4.19691V11.8036C19 12.9215 19 13.4805 18.7822 13.9079C18.5905 14.2842 18.2843 14.5905 17.908 14.7822C17.4806 15 16.921 15 15.8031 15H7.12207C6.70604 15 6.49878 15 6.29981 15.0408C6.12328 15.0771 5.95216 15.1368 5.79168 15.2188C5.61281 15.3101 5.45249 15.4384 5.13478 15.6926L5.12357 15.7012Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-mono text-[12px] leading-[1.6] text-[#475569]">{article.comments_count ?? 0}</span>
          </div>
        </div>
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

/** Блок «Найбільше читають»: 3 компактні картки новин */
function MostReadBlock({ items, bookmarked, onBookmark }: { items: Article[]; bookmarked: Set<string>; onBookmark: (id: string) => void }) {
  const displayItems = items.length ? items.slice(0, 3) : FALLBACK_POPULAR;

  return (
    <div className="flex flex-col gap-[10px] h-full">
      {/* Шапка блоку */}
      <div className="flex items-start justify-between w-full uppercase shrink-0">
        <p className="leading-none">
          <span className="text-[12px] leading-[1.5] tracking-[0.6px]">🔥 </span>
          <span className="font-mono font-bold text-[12px] leading-[1.5] text-[#64748b] tracking-[0.6px]">
            НАЙБІЛЬШЕ ЧИТАЮТЬ
          </span>
        </p>
        <p className="font-sans font-bold text-[11px] leading-[1.5] text-[#059669] tracking-[0.55px]">
          ЗА 24 ГОД
        </p>
      </div>

      {/* Список карток */}
      <div className="flex flex-col gap-[10px] flex-1">
        {displayItems.map((item, index) => {
          const idx = String(index + 1).padStart(2, "0");
          const isItemBookmarked = bookmarked.has(item.id);
          return (
            <div
              key={item.id}
              className="backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0] rounded-[16px] p-[18px] shadow-[0px_10px_25px_-4px_rgba(15,23,42,0.04)] flex flex-col justify-between items-center flex-1 w-full transition hover:border-[#cbd5e1] group"
            >
              {/* Верхній блок: Шапка + Текст заголовка */}
              <div className="w-full flex flex-col mb-auto">
                {/* Рядок категорії та закладки */}
                <div className="flex items-center justify-between p-[10px] w-full shrink-0">
                  <div className="flex items-center gap-[6px]">
                    <span className="font-mono font-bold text-[12px] leading-[1.35] text-[#94a3b8] tracking-[0.6px] whitespace-nowrap">
                      {idx}
                    </span>
                    <span className="bg-[#f1f5f9] rounded-[100px] px-[8px] py-[2px] font-mono font-medium text-[11px] leading-[1.5] text-[#334155] tracking-[0.55px] whitespace-nowrap">
                      {item.category || "Новини"}
                    </span>
                  </div>
                  {/* Закладка */}
                  <button
                    type="button"
                    aria-label={isItemBookmarked ? "Прибрати із закладок" : "Зберегти в закладки"}
                    onClick={() => onBookmark(item.id)}
                    className="group/bms relative cursor-pointer shrink-0 transition"
                  >
                    {isItemBookmarked ? (
                      <svg width="14" height="18.263" viewBox="0 0 14 18.263" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4.2002V13.6854C1 15.0464 1 15.7268 1.20412 16.1433C1.58245 16.9151 2.41158 17.3588 3.26367 17.2454C3.72341 17.1842 4.28964 16.8067 5.4221 16.0518L5.42482 16.0499C5.87369 15.7507 6.09815 15.6011 6.33295 15.5181C6.76421 15.3656 7.23476 15.3656 7.66602 15.5181C7.90129 15.6012 8.12664 15.7515 8.57732 16.0519C9.70978 16.8069 10.2767 17.1841 10.7364 17.2452C11.5885 17.3586 12.4176 16.9151 12.7959 16.1433C13 15.7269 13 15.0462 13 13.6854V4.19691C13 3.079 13 2.5192 12.7822 2.0918C12.5905 1.71547 12.2837 1.40974 11.9074 1.21799C11.4796 1 10.9203 1 9.8002 1H4.2002C3.08009 1 2.51962 1 2.0918 1.21799C1.71547 1.40974 1.40974 1.71547 1.21799 2.0918C1 2.51962 1 3.08009 1 4.2002Z" fill="#059669" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <>
                        <div className="group-hover/bms:hidden">
                          <svg width="14" height="18.263" viewBox="0 0 14 18.263" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4.2002V13.6854C1 15.0464 1 15.7268 1.20412 16.1433C1.58245 16.9151 2.41158 17.3588 3.26367 17.2454C3.72341 17.1842 4.28964 16.8067 5.4221 16.0518L5.42482 16.0499C5.87369 15.7507 6.09815 15.6011 6.33295 15.5181C6.76421 15.3656 7.23476 15.3656 7.66602 15.5181C7.90129 15.6012 8.12664 15.7515 8.57732 16.0519C9.70978 16.8069 10.2767 17.1841 10.7364 17.2452C11.5885 17.3586 12.4176 16.9151 12.7959 16.1433C13 15.7269 13 15.0462 13 13.6854V4.19691C13 3.079 13 2.5192 12.7822 2.0918C12.5905 1.71547 12.2837 1.40974 11.9074 1.21799C11.4796 1 10.9203 1 9.8002 1H4.2002C3.08009 1 2.51962 1 2.0918 1.21799C1.71547 1.40974 1.40974 1.71547 1.21799 2.0918C1 2.51962 1 3.08009 1 4.2002Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="hidden group-hover/bms:block">
                          <svg width="14" height="18.263" viewBox="0 0 14 18.263" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4.2002V13.6854C1 15.0464 1 15.7268 1.20412 16.1433C1.58245 16.9151 2.41158 17.3588 3.26367 17.2454C3.72341 17.1842 4.28964 16.8067 5.4221 16.0518L5.42482 16.0499C5.87369 15.7507 6.09815 15.6011 6.33295 15.5181C6.76421 15.3656 7.23476 15.3656 7.66602 15.5181C7.90129 15.6012 8.12664 15.7515 8.57732 16.0519C9.70978 16.8069 10.2767 17.1841 10.7364 17.2452C11.5885 17.3586 12.4176 16.9151 12.7959 16.1433C13 15.7269 13 15.0462 13 13.6854V4.19691C13 3.079 13 2.5192 12.7822 2.0918C12.5905 1.71547 12.2837 1.40974 11.9074 1.21799C11.4796 1 10.9203 1 9.8002 1H4.2002C3.08009 1 2.51962 1 2.0918 1.21799C1.71547 1.40974 1.40974 1.71547 1.21799 2.0918C1 2.51962 1 3.08009 1 4.2002Z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </>
                    )}
                  </button>
                </div>

                {/* Заголовок публікації */}
                <div className="w-full">
                  <a
                    href={`/articles/${item.slug}`}
                    className="block w-full font-mono font-bold text-[14px] leading-[1.35] tracking-[0.7px] text-[#0f172a] group-hover:text-[#059669] transition-colors"
                  >
                    {item.title}
                  </a>
                </div>
              </div>

              {/* Час публікації та статистика */}
              <div className="border-t border-[#f1f5f9] py-[8px] flex items-center justify-between w-full shrink-0">
                <p className="font-mono font-normal text-[11px] leading-[1.5] text-[#64748b] tracking-[0.55px] whitespace-nowrap">
                  {item.time_label || relativeTime(item.published_at)}
                </p>
                <div className="flex items-center gap-[16px] whitespace-nowrap text-[#475569]">
                  {/* eye */}
                  <div className="flex items-center gap-[4px] leading-none">
                    <svg width="19" height="12" viewBox="0 0 20.6943 13.9999" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#94a3b8]">
                      <path d="M10.3474 12.9999C6.8167 12.9999 3.7134 10.5478 1.93397 8.77881C1.4643 8.31189 1.22945 8.07837 1.07996 7.62012C0.973345 7.29328 0.973345 6.70673 1.07996 6.3799C1.22945 5.92165 1.46431 5.68802 1.93397 5.22111C3.7134 3.45208 6.8167 1 10.3474 1C13.878 1 16.9807 3.45208 18.7601 5.22111C19.2295 5.6877 19.4649 5.92181 19.6143 6.3799C19.7209 6.70674 19.7209 7.29328 19.6143 7.62012C19.4649 8.07819 19.2294 8.31226 18.7601 8.77881C16.9807 10.5478 13.878 12.9999 10.3474 12.9999ZM10.3472 9C9.2426 9 8.34717 8.10457 8.34717 7C8.34717 5.89543 9.2426 5 10.3472 5C11.4517 5 12.3472 5.89543 12.3472 7C12.3472 8.10457 11.4517 9 10.3472 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-mono font-normal text-[12px] leading-[1.6] text-[#475569]">{item.views_count}</span>
                  </div>
                  {/* comment */}
                  <div className="flex items-center gap-[4px] leading-none">
                    <svg width="18" height="17" viewBox="0 0 20 18.9195" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#94a3b8]">
                      <path d="M5.12357 15.7012L3.59961 16.9203C2.76744 17.5861 2.35115 17.9191 2.00098 17.9195C1.69644 17.9198 1.40845 17.7813 1.21846 17.5433C1 17.2696 1 16.7369 1 15.6712V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40974 1.71547 1.71548 1.40974 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H15.8002C16.9203 1 17.4796 1 17.9074 1.21799C18.2837 1.40974 18.5905 1.71547 18.7822 2.0918C19 2.5192 19 3.079 19 4.19691V11.8036C19 12.9215 19 13.4805 18.7822 13.9079C18.5905 14.2842 18.2843 14.5905 17.908 14.7822C17.4806 15 16.921 15 15.8031 15H7.12207C6.70604 15 6.49878 15 6.29981 15.0408C6.12328 15.0771 5.95216 15.1368 5.79168 15.2188C5.61281 15.3101 5.45249 15.4384 5.13478 15.6926L5.12357 15.7012Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-mono font-normal text-[12px] leading-[1.6] text-[#475569]">{item.comments_count ?? 0}</span>
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
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <circle cx="4" cy="4" r="4" fill="#10B981" />
          </svg>
          <h2 className="font-mono font-bold text-[12px] leading-none text-[#1e293b] tracking-[0.6px] uppercase">
            ХРОНІКА ПОДІЙ
          </h2>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-[8px] py-[2px] font-mono font-medium text-[10px] leading-none text-[#047857] tracking-[0.5px]">
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
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <circle cx="4" cy="4" r="3" className="fill-white stroke-[#10B981] stroke-2 transition-colors duration-150 ease-out group-hover:fill-[#10B981]" />
                </svg>
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
                    <span className="inline-flex items-center justify-center bg-[#ffe4e6] text-[#be123c] font-mono font-bold text-[9px] leading-none px-[8px] py-[2px] rounded-[16px] uppercase tracking-[0.45px]">
                      ВАЖЛИВО
                    </span>
                  )}
                </div>
                <p className="mt-[6px] font-sans font-normal text-[12px] leading-[1.4] text-[#1e293b] transition-colors duration-150 ease-out group-hover:text-[#047857]">
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
    <section className="backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0] rounded-[16px] p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)] flex flex-col gap-[12px] items-start relative overflow-hidden w-full">
      {/* Декоративне світіння */}
      <div className="absolute right-[-30px] top-[-30px] size-[140px] pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 208 208" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#glow_f)">
            <circle cx="104" cy="104" r="64" fill="#10B981" fillOpacity="0.15" />
          </g>
          <defs>
            <filter id="glow_f" x="0" y="0" width="208" height="208" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="20" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* reporter_logo (36x36) */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <rect width="36" height="36" rx="16" fill="#10B981" fillOpacity="0.15" />
        <rect x="0.5" y="0.5" width="35" height="35" rx="15.5" stroke="#10B981" strokeOpacity="0.3" />
        <path d="M18 13.6813L10 21.8938V26H26M10 26L14 26L22 17.7875M18 13.6813L20.8686 10.7365L20.8704 10.7347C21.2652 10.3293 21.463 10.1263 21.691 10.0502C21.8919 9.98325 22.1082 9.98325 22.3091 10.0502C22.5369 10.1262 22.7345 10.3291 23.1288 10.7338L24.8686 12.5199C25.2646 12.9264 25.4627 13.1297 25.5369 13.3641C25.6022 13.5703 25.6021 13.7924 25.5369 13.9986C25.4628 14.2328 25.265 14.4359 24.8695 14.8418L24.8686 14.8427L22 17.7875M18 13.6813L22 17.7875" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <h3 className="font-mono font-bold text-[14px] text-[#0f172a] leading-none">
        Бажаєте писати для ByteNews?
      </h3>
      <p className="font-sans font-normal text-[12px] leading-[1.45] text-[#475569]">
        Перемкніть профіль у режим репортера, щоб публікувати технічні розслідування, репортажі та аналітику.
      </p>
      <button
        type="button"
        onClick={handleAction}
        className="w-full py-[16px] px-[10px] rounded-[12px] bg-[#0f172a] hover:bg-[#059669] text-white font-mono font-bold text-[12px] leading-none flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-[0.99]"
      >
        Кабінет репортера
      </button>
    </section>
  );
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
      <div className="w-[1296px] mx-auto pb-16 pt-6">

        {/* 1. Верхня секція: Головна новина (8 колонок) + Найбільше читають (4 колонки) */}
        <section aria-labelledby="hero-heading" className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-[8px] rounded-full bg-[#10b981]" />
              <h2 id="hero-heading" className="font-mono font-bold text-[12px] leading-[1.5] text-[#0f172a] tracking-[0.6px] uppercase">
                ГОЛОВНА НОВИНА & ТРЕНДИ ДНЯ
              </h2>
            </div>
            <div className="inline-flex items-center gap-[6px]">
              <svg viewBox="0 0 16 10" fill="none" className="w-[14px] h-[8px] text-[#059669] shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 1 9.5 6.5 6 3 1 8" />
                <polyline points="11 1 15 1 15 5" />
              </svg>
              <span className="font-mono font-bold text-[12px] leading-[1.5] text-[#64748b] tracking-[0.6px] uppercase">
                ТОП-ОГЛЯД
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* Ліва колонка: Головна новина (Hero) */}
            <div className="col-span-8 flex flex-col">
              {hero ? (
                <article className="backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0]/90 rounded-[24px] p-[24px] sm:p-[32px] shadow-[0px_10px_25px_-4px_rgba(15,23,42,0.04)] hover:shadow-[0px_18px_36px_-6px_rgba(15,23,42,0.08)] hover:border-[#cbd5e1] transition-all duration-200 ease-out flex flex-col gap-[24px] justify-between h-full">
                  {/* Верхній рядок із бейджами та закладкою */}
                  <div className="bg-white flex items-center justify-between p-[10px] rounded-[16px] w-full shrink-0">
                    <div className="flex gap-[8px] items-center">
                      <span className="bg-[#d1fae5] border border-[#6ee7b7] text-[#065f46] font-mono font-bold text-[12px] leading-[1.5] px-[12px] py-[4px] rounded-full inline-flex items-center gap-[8px]">
                        <Sparkles className="size-[12px] text-[#065f46] shrink-0" />
                        <span>{hero.category ?? "Штучний Інтелект"}</span>
                      </span>
                      <span className="bg-[#f1f5f9] text-[#475569] font-mono font-normal text-[12px] leading-[1.5] px-[10px] py-[4px] rounded-full inline-flex items-center gap-[8px]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-[12px] text-[#475569] shrink-0" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{hero.read_time_min} хв читання</span>
                      </span>
                    </div>
                    <BookmarkButton active={bookmarked.has(hero.id)} onClick={() => toggleBookmark(hero.id)} />
                  </div>

                  {/* Обкладинка + Заголовок */}
                  <a href={`/articles/${hero.slug}`} className="cursor-pointer flex flex-col gap-[24px] items-start w-full group">
                    <ArticleCover article={hero} large />
                    <h3 className="font-extrabold text-[#0f172a] text-[26px] sm:text-[30px] leading-[1.25] tracking-[-0.6px] text-left w-full group-hover:text-[#059669] transition-colors">
                      {hero.title}
                    </h3>
                  </a>

                  {/* Опис (lead) */}
                  {hero.lead && (
                    <p className="font-normal text-[#475569] text-[15px] leading-[1.6] w-full">
                      {hero.lead}
                    </p>
                  )}

                  {/* Теги */}
                  {hero.tags.length > 0 && (
                    <div className="flex gap-[6px] items-center flex-wrap py-[10px] w-full">
                      {hero.tags.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setTag(slugForTag(topic))}
                          className="bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center px-[10px] py-[3px] rounded-[8px] font-mono font-extrabold text-[#475569] text-[11px] tracking-[-0.22px] hover:border-emerald-300 hover:text-emerald-800 transition cursor-pointer"
                        >
                          #{topic}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Підвал картки */}
                  <div className="border-t border-[#e2e8f0] flex items-center justify-between pb-[10px] pt-[24px] px-[10px] w-full">
                    <button
                      type="button"
                      onClick={() => setActiveView("profile")}
                      className="group/author flex gap-[12px] items-center text-left cursor-pointer focus:outline-hidden"
                      aria-label={`Переглянути профіль автора ${hero.author ?? "Олександр Коваленко"}`}
                    >
                      <div className="size-[40px] rounded-full shrink-0 overflow-hidden border border-[#cbd5e1] transition-colors duration-150 ease-out group-hover/author:border-[#10b981]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={hero.author_avatar || "/images/avatar-kovalenko.png"}
                          alt={hero.author ?? "Олександр Коваленко"}
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col items-start justify-center">
                        <div className="flex items-center">
                          <span className="font-sans font-bold text-[12px] leading-[1.6] text-[#0f172a] transition-colors duration-150 ease-out group-hover/author:text-[#047857]">
                            {hero.author ?? "Олександр Коваленко"}
                          </span>
                          <span className="size-[6px] rounded-full bg-[#10b981] ml-[4px] shrink-0" aria-label="Онлайн" />
                        </div>
                        <span className="font-mono font-normal text-[11px] leading-[1.6] text-[#475569]">
                          {hero.author_role ?? "Head of AI Engineering"} • {hero.time_label || relativeTime(hero.published_at)}
                        </span>
                      </div>
                    </button>

                    <div className="flex gap-[12px] items-center shrink-0">
                      <div className="flex gap-[16px] items-center">
                        <div className="flex gap-[4px] items-center text-[#475569]">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-[14px] text-[#94a3b8]" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          <span className="font-mono font-normal text-[12px] leading-[1.6]">{hero.views_count}</span>
                        </div>
                        <div className="flex gap-[4px] items-center text-[#475569]">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-[14px] text-[#94a3b8]" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.502 49.188 49.188 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.998Z" />
                          </svg>
                          <span className="font-mono font-normal text-[12px] leading-[1.6]">{hero.comments_count ?? 48}</span>
                        </div>
                      </div>
                      <a
                        href={`/articles/${hero.slug}`}
                        className="bg-[#0f172a] hover:bg-[#059669] text-white font-mono font-normal text-[12px] leading-[1.6] px-[16px] py-[8px] rounded-[12px] inline-flex items-center gap-[6px] transition cursor-pointer"
                      >
                        <span>Читати</span>
                        <svg viewBox="0 0 10 10" fill="none" className="size-[10px] shrink-0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 9L9 1M9 1H3M9 1V7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 h-full flex items-center justify-center">
                  {loading ? "Завантажуємо головну новину…" : "Головна новина з’явиться після першої публікації."}
                </div>
              )}
            </div>

            {/* Права колонка: 1) Найбільше читають (3 картки) */}
            <div className="col-span-4 flex flex-col">
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
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Ліва колонка: Каталог публікацій */}
          <div className="col-span-8 min-w-0">
            <section aria-labelledby="articles-heading">
              {/* Шапка секції Всі новини та Перемикач */}
              <div className="flex flex-wrap items-end justify-between border-b border-[#e2e8f0] pb-[16px] mb-[24px] gap-4">
                {/* Ліва частина */}
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center gap-[8px]">
                    <h2 id="articles-heading" className="text-[24px] font-extrabold text-[#0f172a] leading-normal">
                      {query ? `Результати пошуку` : (activeCategory ?? "Всі новини")}
                    </h2>
                    <span className="bg-[#e2e8f0]/70 rounded-full px-[10px] py-[2px] text-[14px] font-medium text-[#334155] min-w-[37px] text-center">
                      {sortedCatalogArticles.length}
                    </span>
                  </div>
                  <p className="text-[12px] font-normal text-[#64748b]">
                    {query ? `За запитом «${query}»` : "Останні оновлення індустрії"}
                  </p>
                </div>

                {/* Права частина: Перемикач Новин */}
                <div className="bg-[#e2e8f0]/60 p-[4px] rounded-[12px] inline-flex items-center gap-[4px]">
                  <button
                    type="button"
                    onClick={() => setSortBy("fresh")}
                    className={`px-[12px] py-[6px] font-mono text-[14px] tracking-[0.7px] leading-[1.35] transition-all cursor-pointer ${
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
                    className={`px-[12px] py-[6px] font-mono text-[14px] tracking-[0.7px] leading-[1.35] transition-all cursor-pointer ${
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
                    className={`px-[12px] py-[6px] font-mono text-[14px] tracking-[0.7px] leading-[1.35] transition-all cursor-pointer ${
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
                <div className="grid gap-6 grid-cols-2">
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
                  <div className="grid gap-6 grid-cols-2">
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
          <aside className="col-span-4 flex flex-col gap-[20px]">
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
