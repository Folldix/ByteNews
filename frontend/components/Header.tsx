"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFeedFilters } from "../context/FeedContext";
import { useBookmarks } from "../context/BookmarksContext";
import { DigestModal } from "./community/DigestModal";
import { CATEGORIES } from "../lib/constants";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, openAuthModal, setActiveView, activeView } = useAuth();
  const { category, query, setCategory, setTag, setQuery } = useFeedFilters();
  const { count, openDrawer } = useBookmarks();
  const [searchText, setSearchText] = useState(query);
  const [digestOpen, setDigestOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setSearchText(query), [query]);

  const isAuthenticated = !!user;
  const isReporter = user?.role === "reporter";

  const navigateToHomeIfElsewhere = () => {
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#e2e8f0]">
        <div className="w-full max-w-[1296px] px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Верхня навігаційна панель */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 py-2 sm:py-2.5 min-h-[56px] sm:min-h-[60px] md:min-h-[64px]">
            {/* Логотип бренду */}
            <button
              type="button"
              onClick={() => {
                setActiveView("feed");
                navigateToHomeIfElsewhere();
              }}
              className="flex items-center gap-[8px] shrink-0 text-left cursor-pointer"
            >
              <div className="w-[34px] sm:w-[36px] h-[34px] sm:h-[36px] rounded-[10px] bg-[#0f172a] flex items-center justify-center shrink-0">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L17 6L12 11M6 11L1 6L6 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="font-sans font-extrabold text-[17px] sm:text-[20px] leading-[20px] sm:leading-[22px] text-[#0f172a]">
                  Byte<span className="text-[#059669]">News</span>
                </span>
                <span className="font-mono font-extrabold text-[9px] sm:text-[10px] leading-[11px] sm:leading-[12px] text-[#0f172a] uppercase">
                  IT & TECH DIGEST
                </span>
              </div>
            </button>

            {/* Блок пошуку */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(searchText.trim());
                navigateToHomeIfElsewhere();
              }}
              onClick={() => {
                searchInputRef.current?.focus();
              }}
              className="order-last lg:order-none w-full lg:w-auto basis-full lg:basis-auto flex min-w-0 lg:min-w-[200px] lg:flex-1 h-[38px] sm:h-[40px] bg-white border border-solid border-[#e2e8f0] focus-within:border-[#10b981] focus-within:shadow-[0px_2px_2.5px_0px_rgba(0,0,0,0.25)] rounded-[12px] pl-[14px] sm:pl-[18px] md:pl-[22px] pr-[12px] sm:pr-[16px] py-[8px] sm:py-[11px] items-center gap-[7px] transition-all cursor-text"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-[16px] sm:size-[18px] shrink-0 pointer-events-none">
                <path d="M13 13L19 19M8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Пошук новин, технологій, тегів..."
                aria-label="Пошук новин, технологій і тегів"
                className="w-full h-full bg-transparent font-mono font-medium text-[12px] sm:text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none cursor-text"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSearchText("");
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Очистити пошук"
                  className="p-1 text-[#94a3b8] hover:text-[#0f172a] transition shrink-0 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" />
                  </svg>
                </button>
              )}
            </form>

            {/* Панель дій користувача (Гість або Авторизований) */}
            {!isAuthenticated ? (
              /* Стан гостя: тільки Дайджест та Увійти */
              <div className="flex items-center gap-2 sm:gap-[10px] shrink-0">
                {/* Кнопка Дайджест */}
                <button
                  type="button"
                  onClick={() => setDigestOpen(true)}
                  aria-label="Дайджест"
                  className="min-h-[36px] sm:min-h-[38px] px-[10px] sm:px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M2 2L8.10764 6.61227L8.10967 6.61396C8.78785 7.11129 9.12714 7.3601 9.49876 7.45622C9.82723 7.54117 10.1725 7.54117 10.501 7.45622C10.8729 7.36001 11.2132 7.11047 11.8926 6.61227C11.8926 6.61227 15.8101 3.60594 18 2M1 11.8002V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40974 1.71547 1.71547 1.40974 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H15.8002C16.9203 1 17.4796 1 17.9074 1.21799C18.2837 1.40974 18.5905 1.71547 18.7822 2.0918C19 2.5192 19 3.079 19 4.19691V11.8036C19 12.9215 19 13.4805 18.7822 13.9079C18.5905 14.2842 18.2837 14.5905 17.9074 14.7822C17.48 15 16.921 15 15.8031 15H4.19691C3.079 15 2.5192 15 2.0918 14.7822C1.71547 14.5905 1.40974 14.2842 1.21799 13.9079C1 13.4801 1 12.9203 1 11.8002Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="#1E293B" />
                  </svg>
                  <span className="hidden md:inline font-sans font-semibold text-[12px] text-[#1e293b]">
                    Дайджест
                  </span>
                </button>

                {/* Кнопка входу */}
                <button
                  type="button"
                  onClick={openAuthModal}
                  title="Увійти в акаунт"
                  className="min-h-[36px] sm:min-h-[38px] px-[12px] bg-white/90 border border-[#e2e8f0] rounded-[12px] flex items-center gap-[7px] hover:bg-slate-100 transition cursor-pointer active:scale-95"
                >
                  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M17 19C17 16.2386 13.4183 14 9 14C4.58172 14 1 16.2386 1 19M9 11C6.23858 11 4 8.76142 4 6C4 3.23858 6.23858 1 9 1C11.7614 1 14 3.23858 14 6C14 8.76142 11.7614 11 9 11Z" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-bold text-[12px] text-[#0f172a]">
                    Увійти
                  </span>
                </button>
              </div>
            ) : (
              /* Стан авторизованого користувача: Стрічка (якщо профіль), Закладки, Дайджест, Профіль */
              <div className="flex items-center gap-1.5 sm:gap-[10px] shrink-0">
                {/* Кнопка стрічки (лише на сторінці профілю) */}
                {activeView === "profile" && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView("feed");
                      navigateToHomeIfElsewhere();
                    }}
                    aria-label="Стрічка"
                    className="min-h-[36px] sm:min-h-[38px] px-[10px] sm:px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] hover:bg-slate-50 transition cursor-pointer active:scale-95"
                  >
                    <LayoutGrid className="w-[18px] h-[18px] text-[#059669] shrink-0" />
                    <span className="hidden md:inline font-sans font-semibold text-[12px] text-[#334155]">
                      Стрічка
                    </span>
                  </button>
                )}

                {/* Кнопка закладок */}
                <button
                  type="button"
                  onClick={openDrawer}
                  aria-label="Закладки"
                  className="min-h-[36px] sm:min-h-[38px] px-[10px] sm:px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <svg width="14" height="18.263" viewBox="0 0 14 18.263" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M1 4.2002V13.6854C1 15.0464 1 15.7268 1.20412 16.1433C1.58245 16.9151 2.41158 17.3588 3.26367 17.2454C3.72341 17.1842 4.28964 16.8067 5.4221 16.0518L5.42482 16.0499C5.87369 15.7507 6.09815 15.6011 6.33295 15.5181C6.76421 15.3656 7.23476 15.3656 7.66602 15.5181C7.90129 15.6012 8.12664 15.7515 8.57732 16.0519C9.70978 16.8069 10.2767 17.1841 10.7364 17.2452C11.5885 17.3586 12.4176 16.9151 12.7959 16.1433C13 15.7269 13 15.0462 13 13.6854V4.19691C13 3.079 13 2.5192 12.7822 2.0918C12.5905 1.71547 12.2837 1.40974 11.9074 1.21799C11.4796 1 10.9203 1 9.8002 1H4.2002C3.08009 1 2.51962 1 2.0918 1.21799C1.71547 1.40974 1.40974 1.71547 1.21799 2.0918C1 2.51962 1 3.08009 1 4.2002Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="#1E293B" />
                  </svg>
                  <span className="hidden md:inline font-sans font-semibold text-[12px] text-[#1e293b]">
                    Закладки
                  </span>
                  {count > 0 && (
                    <span className="size-[16px] min-w-[16px] rounded-full bg-[#059669] text-white font-sans font-bold text-[10px] flex items-center justify-center leading-none">
                      {count}
                    </span>
                  )}
                </button>

                {/* Кнопка дайджесту */}
                <button
                  type="button"
                  onClick={() => setDigestOpen(true)}
                  aria-label="Дайджест"
                  className="min-h-[36px] sm:min-h-[38px] px-[10px] sm:px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M2 2L8.10764 6.61227L8.10967 6.61396C8.78785 7.11129 9.12714 7.3601 9.49876 7.45622C9.82723 7.54117 10.1725 7.54117 10.501 7.45622C10.8729 7.36001 11.2132 7.11047 11.8926 6.61227C11.8926 6.61227 15.8101 3.60594 18 2M1 11.8002V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40974 1.71547 1.71547 1.40974 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H15.8002C16.9203 1 17.4796 1 17.9074 1.21799C18.2837 1.40974 18.5905 1.71547 18.7822 2.0918C19 2.5192 19 3.079 19 4.19691V11.8036C19 12.9215 19 13.4805 18.7822 13.9079C18.5905 14.2842 18.2837 14.5905 17.9074 14.7822C17.48 15 16.921 15 15.8031 15H4.19691C3.079 15 2.5192 15 2.0918 14.7822C1.71547 14.5905 1.40974 14.2842 1.21799 13.9079C1 13.4801 1 12.9203 1 11.8002Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="#1E293B" />
                  </svg>
                  <span className="hidden md:inline font-sans font-semibold text-[12px] text-[#1e293b]">
                    Дайджест
                  </span>
                </button>

                {/* Профіль користувача */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveView("profile");
                    navigateToHomeIfElsewhere();
                  }}
                  title="Перейти в особистий кабінет"
                  className="min-h-[36px] sm:min-h-[42px] px-[8px] sm:px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] sm:gap-[8px] hover:bg-slate-50 transition cursor-pointer active:scale-95 text-left"
                >
                  <div className="relative shrink-0">
                    <div className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] rounded-[8px] overflow-hidden bg-[#111315] border border-white/60 shadow-xs flex items-center justify-center shrink-0">
                      <img
                        src={user.avatar_url || "/avatars/Avatar_1.png"}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Зелена цяточка статусу */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-[8px] h-[8px] rounded-full bg-[#10b981] border border-white" />
                  </div>
                  <div className="hidden md:flex flex-col leading-tight">
                    <span className="font-sans font-semibold text-[12px] text-[#1e293b]">
                      {user.full_name.split(" ")[0]}
                    </span>
                    <span className="font-sans font-semibold text-[11px] text-[#059669]">
                      {isReporter ? "Репортер" : "Читач"}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Ряд фільтрів за рубриками (приховується на сторінці профілю) */}
          {activeView !== "profile" && (
            <div className="border-t border-[#e2e8f0] py-[6px] sm:py-[8px] flex items-center gap-[4px] sm:gap-[6px] overflow-x-auto no-scrollbar scroll-smooth">
              {CATEGORIES.map((item) => {
                const isActive = category === item.slug;
                return (
                  <button
                    key={item.slug || "all"}
                    type="button"
                    onClick={() => {
                      setCategory(item.slug);
                      setTag("");
                      navigateToHomeIfElsewhere();
                    }}
                    className={`px-[12px] py-[4px] rounded-[100px] font-mono text-[12px] transition cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-[#059669] text-white font-extrabold"
                        : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] font-bold"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>
      <DigestModal isOpen={digestOpen} onClose={() => setDigestOpen(false)} />
    </>
  );
}
