"use client";

import React, { useState } from "react";
import { Search, Mail, User, Bookmark, LayoutGrid } from "lucide-react";
import { Icon } from "./Icon";
import { useAuth } from "../context/AuthContext";

// Список рубрик новинного порталу
const CATEGORIES = [
  "Всі новини",
  "Штучний Інтелект",
  "Розробка",
  "Кібербезпека",
  "GameDev & 3D",
  "Залізо & Чіпи",
  "Стартапи & Ринок",
];

export function Header() {
  const { user, openAuthModal, setActiveView, activeView } = useAuth();
  const [activeCategory, setActiveCategory] = useState("Всі новини");

  const isAuthenticated = !!user;
  const isReporter = user?.role === "reporter";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#e2e8f0]">
      <div className="max-w-[1296px] mx-auto px-4">
        {/* Верхня навігаційна панель */}
        <div className="flex items-center gap-[10px] py-[10px] min-h-[67px]">
          
          {/* Логотип бренду */}
          <button
            type="button"
            onClick={() => setActiveView("feed")}
            className="flex items-center gap-[8px] shrink-0 text-left cursor-pointer"
          >
            <div className="w-[36px] h-[36px] rounded-[10px] bg-[#0f172a] flex items-center justify-center">
              <Icon name="logo" className="w-[18px] h-[12px] text-white" />
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-sans font-extrabold text-[20px] leading-[22px] text-[#0f172a]">
                Byte<span className="text-[#059669]">News</span>
              </span>
              <span className="font-mono font-extrabold text-[10px] leading-[12px] text-[#0f172a] uppercase">
                IT & TECH DIGEST
              </span>
            </div>
          </button>

          {/* Блок пошуку */}
          <div className="flex-1 h-[40px] bg-white border border-[#e2e8f0] rounded-[12px] px-[22px] flex items-center gap-[7px]">
            <Search className="w-[18px] h-[18px] text-[#94a3b8] shrink-0" />
            <input
              type="text"
              placeholder="Пошук новин, технологій, тегів..."
              className="w-full bg-transparent font-mono font-medium text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </div>

          {/* Панель дій користувача (Гість або Авторизований) */}
          {!isAuthenticated ? (
            /* Стан гостя */
            <div className="flex items-center gap-[10px]">
              {/* Кнопка Дайджест */}
              <button 
                type="button"
                className="h-[34px] px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] hover:bg-slate-50 transition cursor-pointer"
              >
                <Mail className="w-[18px] h-[14px] text-[#1e293b]" />
                <span className="font-sans font-semibold text-[12px] text-[#1e293b]">
                  Дайджест
                </span>
              </button>

              {/* Кнопка входу */}
              <button
                type="button"
                onClick={openAuthModal}
                title="Увійти в акаунт"
                className="h-[32px] px-[12px] bg-white/90 border border-[#e2e8f0] rounded-[12px] flex items-center gap-[7px] hover:bg-slate-100 transition cursor-pointer"
              >
                <User className="w-[16px] h-[18px] text-[#0f172a]" />
                <span className="font-bold text-[12px] text-[#0f172a]">
                  Увійти
                </span>
              </button>
            </div>
          ) : (
            /* Стан авторизованого користувача */
            <div className="flex items-center gap-[10px]">
              {/* Кнопка стрічки (лише на сторінці профілю) */}
              {activeView === "profile" && (
                <button 
                  type="button"
                  onClick={() => setActiveView("feed")}
                  className="h-[36px] px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] hover:bg-slate-50 transition cursor-pointer"
                >
                  <LayoutGrid className="w-[18px] h-[18px] text-[#059669]" />
                  <span className="font-sans font-semibold text-[12px] text-[#334155]">
                    Стрічка
                  </span>
                </button>
              )}

              {/* Кнопка закладок */}
              <button 
                type="button"
                className="h-[34px] px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] hover:bg-slate-50 transition cursor-pointer"
              >
                <Bookmark className="w-[14px] h-[16px] text-[#1e293b]" />
                <span className="font-sans font-semibold text-[12px] text-[#1e293b]">
                  Закладки
                </span>
              </button>

              {/* Кнопка дайджесту */}
              <button 
                type="button"
                className="h-[34px] px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[6px] hover:bg-slate-50 transition cursor-pointer"
              >
                <Mail className="w-[18px] h-[14px] text-[#1e293b]" />
                <span className="font-sans font-semibold text-[12px] text-[#1e293b]">
                  Дайджест
                </span>
              </button>

              {/* Профіль користувача */}
              <button
                type="button"
                onClick={() => setActiveView("profile")}
                title="Перейти в особистий кабінет"
                className="h-[46px] px-[12px] bg-white border border-[#e2e8f0] rounded-[14px] flex items-center gap-[8px] hover:bg-slate-50 transition cursor-pointer text-left"
              >
                <div className="relative">
                  <div className="w-[28px] h-[28px] rounded-[8px] overflow-hidden bg-[#111315] border border-white/60 shadow-xs flex items-center justify-center shrink-0">
                    <img
                      src={user.avatar_url || "/avatars/Avatar_1.png"}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Зелена цяточка статусу */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-[8px] h-[8px] rounded-full bg-[#10b981] border border-white" />
                </div>
                <div className="flex flex-col leading-tight">
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

        {/* Ряд фільтрів за рубриками */}
        <div className="border-t border-[#e2e8f0] py-[8px] flex items-center gap-[4px] overflow-x-auto">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-[12px] py-[4px] rounded-full font-mono font-bold text-[12px] transition cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#0f172a] text-white"
                    : "text-[#475569] hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
