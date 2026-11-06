"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DigestModal } from "./community/DigestModal";
import { useFeedFilters } from "../context/FeedContext";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../lib/constants";

const FOOTER_CATEGORIES = CATEGORIES.filter((c) => c.slug !== "");

export function Footer() {
  const [digestOpen, setDigestOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { category: activeCategory, setCategory, setTag } = useFeedFilters();
  const { setActiveView } = useAuth();

  const handleCategoryClick = (slug: string) => {
    setCategory(slug);
    setTag("");
    setActiveView("feed");
    if (pathname !== "/") {
      router.push("/");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <footer className="w-full bg-white/90 backdrop-blur-[15px] border-t border-[#e2e8f0] mt-auto">
        <div className="w-full max-w-[1296px] px-4 sm:px-6 lg:px-8 mx-auto">
          {/* Верхній блок: 4 інформаційні колонки */}
          <div className="pt-[24px] pb-[24px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-[30px]">
            {/* Колонка 1: Логотип бренду та опис */}
            <div>
              <a href="/" className="inline-flex items-center gap-[10px]">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[#0f172a] flex items-center justify-center shrink-0">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="36" rx="10" fill="#0F172A" />
                    <path d="M21 13L26 18L21 23M15 23L10 18L15 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-sans font-bold text-[20px] leading-tight text-[#0f172a]">
                  Byte<span className="text-[#10b981]">News</span>
                </span>
              </a>
              <p className="text-[12px] leading-[18px] text-[#475569] max-w-full sm:max-w-[251px] mt-[10px]">
                Незалежне українське медіа про інженерію, штучний інтелект, кіберзахист та архітектуру систем. Пишемо для розробників, архітекторів та техлідів.
              </p>
            </div>

            {/* Колонка 2: РУБРИКИ */}
            <div>
              <h4 className="font-sans font-bold text-[12px] text-[#0f172a] tracking-wider mb-[8px]">
                РУБРИКИ
              </h4>
              <ul className="space-y-[8px]">
                {FOOTER_CATEGORIES.map((item) => {
                  const isActive = activeCategory === item.slug;
                  return (
                    <li key={item.slug}>
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(item.slug)}
                        className={`text-left inline-block text-[12px] leading-[18px] transition-colors cursor-pointer ${
                          isActive
                            ? "text-[#059669] font-bold"
                            : "text-[#475569] hover:text-[#059669]"
                        }`}
                      >
                        › {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Колонка 3: Стандарти редакції */}
            <div>
              <h4 className="font-sans font-bold text-[12px] text-[#0f172a] tracking-wider mb-[12px]">
                Стандарти редакції
              </h4>
              <ul className="space-y-[12px] mb-[12px]">
                <li className="flex items-center gap-[14px]">
                  <svg width="18" height="20" viewBox="0 0 18 19.8468" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M12 7L8 11L6 9M17 8.16505C17 14.7333 12.0319 17.6781 9.92578 18.6314L9.92313 18.6326C9.70162 18.7328 9.59058 18.7831 9.33887 18.8263C9.17946 18.8537 8.82154 18.8537 8.66214 18.8263C8.40942 18.7829 8.29723 18.7325 8.07395 18.6314C5.9678 17.6781 1 14.7333 1 8.16504V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40974 1.71547 1.71547 1.40974 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H13.8002C14.9203 1 15.4796 1 15.9074 1.21799C16.2837 1.40974 16.5905 1.71547 16.7822 2.0918C17 2.5192 17 3.079 17 4.19691V8.16505Z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[12px] leading-[18px] text-[#475569]">
                    Фактчекінг першоджерел та CVE
                  </span>
                </li>
                <li className="flex items-center gap-[14px]">
                  <svg width="18" height="20" viewBox="0 0 18 19.8468" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M12 7L8 11L6 9M17 8.16505C17 14.7333 12.0319 17.6781 9.92578 18.6314L9.92313 18.6326C9.70162 18.7328 9.59058 18.7831 9.33887 18.8263C9.17946 18.8537 8.82154 18.8537 8.66214 18.8263C8.40942 18.7829 8.29723 18.7325 8.07395 18.6314C5.9678 17.6781 1 14.7333 1 8.16504V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40974 1.71547 1.71547 1.40974 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H13.8002C14.9203 1 15.4796 1 15.9074 1.21799C16.2837 1.40974 16.5905 1.71547 16.7822 2.0918C17 2.5192 17 3.079 17 4.19691V8.16505Z" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[12px] leading-[18px] text-[#475569]">
                    Технічний аудит кодових прикладів
                  </span>
                </li>
                <li className="flex items-center gap-[14px]">
                  <svg width="18" height="20" viewBox="0 0 18 19.8468" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M12 7L8 11L6 9M17 8.16505C17 14.7333 12.0319 17.6781 9.92578 18.6314L9.92313 18.6326C9.70162 18.7328 9.59058 18.7831 9.33887 18.8263C9.17946 18.8537 8.82154 18.8537 8.66214 18.8263C8.40942 18.7829 8.29723 18.7325 8.07395 18.6314C5.9678 17.6781 1 14.7333 1 8.16504V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40974 1.71547 1.71547 1.40974 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H13.8002C14.9203 1 15.4796 1 15.9074 1.21799C16.2837 1.40974 16.5905 1.71547 16.7822 2.0918C17 2.5192 17 3.079 17 4.19691V8.16505Z" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[12px] leading-[18px] text-[#475569]">
                    Етичні норми та відсутність клікбейту
                  </span>
                </li>
              </ul>

              {/* Кнопка Отримувати щоденний дайджест */}
              <button
                type="button"
                onClick={() => setDigestOpen(true)}
                className="group w-full sm:w-auto max-w-[260px] min-h-[36px] px-[12px] py-[6px] bg-white hover:bg-[#ecfdf5] border border-[#e2e8f0] hover:border-[#a7f3d0] rounded-[12px] flex items-center justify-center sm:justify-start gap-[6px] text-[#1e293b] hover:text-[#065f46] text-[11px] font-bold transition-colors cursor-pointer active:scale-[0.99]"
              >
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M2 2L8.10764 6.61227L8.10967 6.61396C8.78785 7.11129 9.12714 7.3601 9.49876 7.45622C9.82723 7.54117 10.1725 7.54117 10.501 7.45622C10.8729 7.36001 11.2132 7.11047 11.8926 6.61227C11.8926 6.61227 15.8101 3.60594 18 2M1 11.8002V4.2002C1 3.08009 1 2.51962 1.21799 2.0918C1.40974 1.71547 1.71547 1.40974 2.0918 1.21799C2.51962 1 3.08009 1 4.2002 1H15.8002C16.9203 1 17.4796 1 17.9074 1.21799C18.2837 1.40974 18.5905 1.71547 18.7822 2.0918C19 2.5192 19 3.079 19 4.19691V11.8036C19 12.9215 19 13.4805 18.7822 13.9079C18.5905 14.2842 18.2837 14.5905 17.9074 14.7822C17.48 15 16.921 15 15.8031 15H4.19691C3.079 15 2.5192 15 2.0918 14.7822C1.71547 14.5905 1.40974 14.2842 1.21799 13.9079C1 13.4801 1 12.9203 1 11.8002Z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-bold text-[#1e293b] group-hover:text-[#065f46] transition-colors">
                  Отримувати щоденний дайджест
                </span>
              </button>
            </div>

            {/* Колонка 4: Канали зв'язку */}
            <div>
              <h4 className="font-sans font-bold text-[12px] text-[#0f172a] tracking-wider mb-[12px]">
                Канали зв&apos;язку
              </h4>
              <ul className="space-y-[12px]">
                <li>
                  <a
                    href="https://t.me/bytenews_live"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-[8px] text-[12px] leading-[18px] text-[#475569] hover:text-[#047857] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                      <path d="M7.0035 8.99635L10.8175 5.18225M14.7191 2.85458L11.4997 13.3179C11.2112 14.2556 11.0668 14.7247 10.818 14.8802C10.6021 15.015 10.3349 15.0376 10.0998 14.94C9.82874 14.8275 9.60873 14.3883 9.16985 13.5105L7.1307 9.43217C7.06105 9.29287 7.02619 9.22352 6.97967 9.16316C6.93839 9.1096 6.89075 9.06135 6.83719 9.02007C6.77821 8.9746 6.71001 8.94051 6.57694 8.87398L2.48924 6.83011C1.61147 6.39122 1.17254 6.17157 1.06007 5.9005C0.962526 5.66542 0.984771 5.39793 1.11963 5.18208C1.27514 4.93319 1.74417 4.7886 2.68216 4.49999L13.1453 1.28051C13.8828 1.05361 14.2516 0.940249 14.5007 1.03169C14.7176 1.11134 14.8887 1.28221 14.9683 1.49917C15.0597 1.74813 14.9463 2.1168 14.7196 2.85349L14.7191 2.85458Z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>@bytenews_live (Telegram)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/rss.xml"
                    className="inline-flex items-center gap-[8px] text-[12px] leading-[18px] text-[#475569] hover:text-[#b45309] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                      <path d="M3.63401 8.82574C4.19319 8.12636 4.86929 7.56804 5.62062 7.18519C6.37195 6.80235 7.182 6.60338 8.0019 6.60004C8.8218 6.5967 9.63349 6.78942 10.3871 7.16613C11.1407 7.54285 11.8204 8.09554 12.3837 8.79034M1.00004 4.56145C1.89471 3.44246 2.97649 2.54913 4.17861 1.93659C5.38074 1.32404 6.67869 1.00541 7.99053 1.00007C9.30237 0.994727 10.6006 1.30307 11.8064 1.90582C13.0121 2.50856 14.0987 3.39178 15 4.50346M8.0228 15C7.35986 15 6.82245 14.3732 6.82245 13.6C6.82245 12.8268 7.35986 12.2 8.0228 12.2C8.68574 12.2 9.22315 12.8268 9.22315 13.6C9.22315 14.3732 8.68574 15 8.0228 15Z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>bytenews.dev/rss.xml</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:editor@bytenews.dev"
                    className="inline-flex items-center gap-[8px] text-[12px] leading-[18px] text-[#475569] hover:text-[#0369a1] transition-colors"
                  >
                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                      <path d="M1.77778 1.85715L6.52816 5.81052L6.52975 5.81197C7.05722 6.23825 7.32111 6.45151 7.61015 6.5339C7.86562 6.60672 8.13417 6.60672 8.38965 6.5339C8.67894 6.45144 8.94361 6.23755 9.47201 5.81052C9.47201 5.81052 12.519 3.23367 14.2222 1.85715M1 10.2573V3.74303C1 2.78294 1 2.30254 1.16955 1.93583C1.31868 1.61327 1.55648 1.3512 1.84918 1.18685C2.18193 1 2.61785 1 3.48904 1H12.5113C13.3825 1 13.8174 1 14.1502 1.18685C14.4429 1.3512 14.6815 1.61327 14.8306 1.93583C15 2.30218 15 2.782 15 3.74021V10.2602C15 11.2184 15 11.6976 14.8306 12.0639C14.6815 12.3865 14.4429 12.649 14.1502 12.8133C13.8178 13 13.383 13 12.5135 13H3.48649C2.617 13 2.1816 13 1.84918 12.8133C1.55648 12.649 1.31868 12.3865 1.16955 12.0639C1 11.6972 1 11.2174 1 10.2573Z" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>editor@bytenews.dev</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Нижня частина: Копірайт та посилання */}
          <div className="min-h-[43px] py-3 sm:py-0 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px]">
            <div className="font-mono text-[#64748b] leading-none text-center sm:text-left">
              © 2026 ByteNews Media. Усі права захищено.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-[10px] sm:gap-[12px] text-[#64748b] leading-none">
              <a href="#editorial" className="hover:text-[#0f172a] transition-colors">
                Редакційна політика
              </a>
              <span className="w-[4px] h-[4px] rounded-full bg-[#94a3b8] shrink-0" />
              <a href="#privacy" className="hover:text-[#0f172a] transition-colors">
                Конфіденційність
              </a>
              <span className="w-[4px] h-[4px] rounded-full bg-[#94a3b8] shrink-0" />
              <a
                href="#region"
                className="inline-flex items-center gap-[4px] text-[#047857] font-semibold hover:opacity-85 transition-opacity"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M0.5 6.5H3.83333M0.5 6.5C0.5 9.81371 3.18629 12.5 6.5 12.5M0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5M3.83333 6.5H9.16667M3.83333 6.5C3.83333 9.81371 5.02724 12.5 6.5 12.5M3.83333 6.5C3.83333 3.18629 5.02724 0.5 6.5 0.5M9.16667 6.5H12.5M9.16667 6.5C9.16667 3.18629 7.97276 0.5 6.5 0.5M9.16667 6.5C9.16667 9.81371 7.97276 12.5 6.5 12.5M12.5 6.5C12.5 3.18629 9.81371 0.5 6.5 0.5M12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5" stroke="#047857" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Україна</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
      <DigestModal isOpen={digestOpen} onClose={() => setDigestOpen(false)} />
    </>
  );
}
