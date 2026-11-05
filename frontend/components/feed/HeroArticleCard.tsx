"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { BookmarkButton } from "./BookmarkButton";
import { ArticleCover } from "./ArticleCover";
import type { Article } from "./types";

interface HeroArticleCardProps {
  hero: Article | null;
  loading: boolean;
  bookmarked: boolean;
  onBookmark: () => void;
  onTagClick: (tag: string) => void;
  onProfileClick: () => void;
  relativeTime: (value: string | null) => string;
}

export function HeroArticleCard({
  hero,
  loading,
  bookmarked,
  onBookmark,
  onTagClick,
  onProfileClick,
  relativeTime,
}: HeroArticleCardProps) {
  if (!hero) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 h-full flex items-center justify-center">
        {loading ? "Завантажуємо головну новину…" : "Головна новина з’явиться після першої публікації."}
      </div>
    );
  }

  return (
    <article className="backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0]/90 rounded-[24px] p-[24px] sm:p-[32px] shadow-[0px_10px_25px_-4px_rgba(15,23,42,0.04)] hover:shadow-[0px_18px_36px_-6px_rgba(15,23,42,0.08)] hover:border-[#cbd5e1] transition-all duration-200 ease-out flex flex-col gap-[20px] sm:gap-[24px] h-full">
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
        <BookmarkButton active={bookmarked} onClick={onBookmark} />
      </div>

      {/* Обкладинка + Заголовок */}
      <a href={`/articles/${hero.slug}`} className="cursor-pointer flex flex-col gap-[20px] sm:gap-[24px] items-start w-full group">
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
        <div className="flex gap-[6px] items-center flex-wrap py-[6px] w-full">
          {hero.tags.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => onTagClick(topic)}
              className="bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center px-[10px] py-[3px] rounded-[8px] font-mono font-extrabold text-[#475569] text-[11px] tracking-[-0.22px] hover:border-emerald-300 hover:text-emerald-800 transition cursor-pointer"
            >
              #{topic}
            </button>
          ))}
        </div>
      )}

      {/* Підвал картки з фіксацією внизу (mt-auto) */}
      <div className="border-t border-[#e2e8f0] flex items-center justify-between pb-[10px] pt-[20px] sm:pt-[24px] px-[10px] w-full mt-auto">
        <button
          type="button"
          onClick={onProfileClick}
          className="group/author flex gap-[12px] items-center text-left cursor-pointer focus:outline-hidden"
          aria-label={`Переглянути профіль автора ${hero.author ?? "Олександр Коваленко"}`}
        >
          <div className="size-[40px] rounded-full shrink-0 overflow-hidden border border-[#cbd5e1] transition-colors duration-150 ease-out group-hover/author:border-[#10b981]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.author_avatar || "/images/avatar-kovalenko.png"}
              alt={hero.author ?? "Олександр Коваленко"}
              loading="eager"
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith("/images/avatar-kovalenko.png")) {
                  target.src = "/images/avatar-kovalenko.png";
                }
              }}
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
  );
}
