"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Trash2, X } from "lucide-react";
import { useBookmarks } from "../../context/BookmarksContext";

export function BookmarksDrawer() {
  const { items, drawerOpen, closeDrawer, toggleBookmark } = useBookmarks();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer, drawerOpen]);

  if (!drawerOpen || !mounted) return null;

  const countLabel =
    items.length === 1
      ? "1 стаття"
      : items.length >= 2 && items.length <= 4
      ? `${items.length} статті`
      : `${items.length} статей`;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/50 backdrop-blur-[20px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDrawer();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmarks-modal-title"
        className="w-full max-w-[580px] bg-white border border-[#e2e8f0] rounded-[24px] shadow-[0px_20px_40px_-8px_rgba(15,23,42,0.2)] pb-[30px] pt-[10px] px-[10px] flex flex-col gap-[10px]"
      >
        {/* Шапка модального вікна */}
        <div className="border-b border-[#f1f5f9] px-[24px] py-[20px] flex items-center justify-between w-full">
          <div className="flex items-center gap-[10px]">
            <div className="size-[36px] rounded-[10px] bg-[#ecfdf5] grid place-items-center text-[#059669] shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
                <path d="M6.75 4.75A1.75 1.75 0 0 1 8.5 3h7a1.75 1.75 0 0 1 1.75 1.75V21l-5.25-3.5L6.75 21V4.75Z" />
              </svg>
            </div>
            <div className="flex flex-col gap-[4px]">
              <h2
                id="bookmarks-modal-title"
                className="font-mono font-bold text-[15px] text-[#0f172a] leading-none"
              >
                Збережені матеріали
              </h2>
              <p className="font-mono font-normal text-[11px] text-[#64748b] leading-none">
                {countLabel} для відкладеного читання
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Закрити вікно закладок"
            className="size-[32px] rounded-[10px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] grid place-items-center transition cursor-pointer shrink-0"
          >
            <X className="size-[18px] stroke-[2.2]" />
          </button>
        </div>

        {/* Список збережених статей */}
        <div className="px-[24px] pt-[6px] flex flex-col gap-[12px] w-full max-h-[65vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-12 text-center font-mono text-[13px] text-[#64748b]">
              Список закладок порожній
            </div>
          ) : (
            items.map(({ article }) => (
              <div
                key={article.id}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] px-[16px] py-[16px] flex items-center justify-between gap-4 w-full"
              >
                {/* Ліва текстова частина */}
                <div className="flex flex-col gap-[4px] min-w-0 flex-1">
                  <div className="flex items-center gap-[10px]">
                    <span className="font-mono font-bold text-[13px] text-[#007a55] leading-normal">
                      {article.category ?? "Технології"}
                    </span>
                    <span className="size-[4px] rounded-full bg-[#94a3b8] shrink-0" />
                    <div className="flex items-center gap-[6px]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-[13px] text-[#94a3b8]"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="font-mono font-normal text-[11px] text-[#94a3b8] leading-normal">
                        {article.read_time_min} хв
                      </span>
                    </div>
                  </div>
                  <p
                    className="font-sans font-bold text-[14px] text-[#0f172a] truncate leading-normal"
                    title={article.title}
                  >
                    {article.title}
                  </p>
                </div>

                {/* Права частина з кнопками */}
                <div className="flex items-center gap-[15px] shrink-0">
                  <a
                    href={`/articles/${article.slug}`}
                    onClick={closeDrawer}
                    aria-label={`Читати: ${article.title}`}
                    className="size-[32px] rounded-[10px] bg-white border border-[#cbd5e1] text-[#64748b] hover:border-[#10b981] hover:text-[#059669] grid place-items-center transition cursor-pointer"
                  >
                    <ArrowRight className="size-[16px] stroke-[2]" />
                  </a>

                  <button
                    type="button"
                    onClick={() => void toggleBookmark(article)}
                    aria-label="Видалити із закладок"
                    className="size-[32px] rounded-[10px] text-[#64748b] hover:bg-rose-50 hover:text-rose-600 grid place-items-center transition cursor-pointer"
                  >
                    <Trash2 className="size-[18px] stroke-[1.8]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
