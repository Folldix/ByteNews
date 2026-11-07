"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { getCategoryDesign } from "../../lib/constants";
import { BookmarkButton } from "./BookmarkButton";
import { ArticleCover } from "./ArticleCover";
import { articleHref } from "../../lib/routes";
import type { Article } from "./types";

interface ArticleCardProps {
  article: Article;
  bookmarked: boolean;
  onBookmark: () => void;
}

export function ArticleCard({ article, bookmarked, onBookmark }: ArticleCardProps) {
  const { setActiveView } = useAuth();
  const design = getCategoryDesign(article.category);
  const authorAvatar = article.author_avatar || "/images/avatar-1.png";

  return (
    <article className="group relative overflow-hidden backdrop-blur-[10px] bg-white/82 hover:bg-white/95 border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-[16px] p-3.5 sm:p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)] hover:shadow-[0px_16px_32px_-4px_rgba(15,23,42,0.1)] flex flex-col justify-between gap-[12px] sm:gap-[14px] transition-all duration-300 min-h-[360px] sm:min-h-[416px]">
      {/* Верхня 4px смужка */}
      <div className={`absolute inset-x-0 top-0 h-[4px] ${design.strip}`} />

      <div>
        {/* Шапка картки */}
        <div className="flex items-center justify-between w-full mb-3 sm:mb-[14px] gap-2">
          <div className="flex items-center gap-[6px] sm:gap-[8px] min-w-0 flex-wrap">
            <span className={`px-[8px] sm:px-[10px] py-[2px] rounded-full border font-mono font-bold text-[10px] sm:text-[11px] leading-[1.4] sm:leading-[1.5] shrink-0 ${design.badge}`}>
              {article.category ?? "Технології"}
            </span>
            <span className="bg-[#f1f5f9] rounded-full px-[8px] sm:px-[10px] py-[2px] sm:py-[4px] inline-flex items-center gap-[4px] font-mono font-normal text-[10px] sm:text-[11px] leading-[1.4] sm:leading-[1.5] text-[#475569] shrink-0">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M6.5 3.16667V6.5H9.83333M6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5Z" stroke="#94A3B8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{article.read_time_min} хв</span>
            </span>
          </div>

          <BookmarkButton active={bookmarked} onClick={onBookmark} />
        </div>

        {/* Обкладинка + Заголовок */}
        <a href={articleHref(article.slug)} className="flex flex-col gap-3 sm:gap-4 items-start w-full cursor-pointer">
          <div className="w-full h-[150px] xs:h-[165px] sm:h-[180px] rounded-[12px] sm:rounded-[16px] border border-[#e2e8f0] overflow-hidden relative shrink-0">
            <ArticleCover article={article} />
          </div>
          <h3 className="font-sans font-extrabold text-[15px] sm:text-[16px] leading-[1.3] sm:leading-[1.25] tracking-[-0.32px] text-[#0f172a] group-hover:text-[#047857] transition-colors text-left w-full break-words [overflow-wrap:anywhere]">
            {article.title}
          </h3>
        </a>

        {/* Опис (lead) */}
        {article.lead && (
          <p className="mt-[10px] sm:mt-[12px] font-sans font-normal text-[12px] sm:text-[13px] leading-[1.5] text-[#475569] line-clamp-3 break-words">
            {article.lead}
          </p>
        )}

        {/* Ряд тегів */}
        {article.tags.length > 0 && (
          <div className="py-[8px] sm:py-[10px] flex flex-wrap gap-[6px] items-center w-full">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-[#f1f5f9] border border-[#e2e8f0] rounded-[6px] px-[7px] sm:px-[8px] py-[2px] font-mono font-extrabold text-[10px] sm:text-[11px] leading-[1.25] tracking-[-0.22px] text-[#475569] hover:border-[#10b981] hover:text-[#059669] transition cursor-pointer"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Підвал картки */}
      <div className="border-t border-[#e2e8f0] pt-[12px] sm:pt-[14px] flex items-center justify-between gap-2 w-full mt-auto">
        {/* Ліворуч: блок автора */}
        <button
          type="button"
          onClick={() => setActiveView("profile")}
          className="group/author flex items-center gap-[6px] sm:gap-[8px] text-left cursor-pointer focus:outline-hidden min-w-0 shrink"
          aria-label={`Переглянути профіль автора ${article.author ?? "Олексій Коваленко"}`}
        >
          <div className="size-[24px] rounded-full shrink-0 overflow-hidden border border-[#cbd5e1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={authorAvatar}
              alt={article.author ?? "Олексій Коваленко"}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith("/images/avatar-1.png")) {
                  target.src = "/images/avatar-1.png";
                }
              }}
              className="size-full object-cover"
            />
          </div>
          <span className="font-sans font-medium text-[11px] leading-[1.25] tracking-[-0.22px] text-[#334155] group-hover/author:underline truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[150px]">
            {article.author ?? "Олексій Коваленко"}
          </span>
        </button>

        {/* Праворуч: Статистика */}
        <div className="flex items-center gap-[10px] sm:gap-[14px] md:gap-[16px] text-[#475569] shrink-0">
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
