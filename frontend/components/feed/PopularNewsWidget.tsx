"use client";

import React from "react";
import { FALLBACK_POPULAR } from "./feed-api";
import type { Article } from "./types";

interface PopularNewsWidgetProps {
  items: Article[];
  bookmarked: Set<string>;
  onBookmark: (id: string) => void;
  relativeTime: (value: string | null) => string;
}

export function PopularNewsWidget({
  items,
  bookmarked,
  onBookmark,
  relativeTime,
}: PopularNewsWidgetProps) {
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
