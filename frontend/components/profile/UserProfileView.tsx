"use client";

import React, { useEffect, useState } from "react";
import {
  PenTool,
  Share2,
  Check,
  ShieldCheck,
  UserCheck,
  Calendar,
  FileText,
  BarChart3,
  Bookmark,
  MessageSquare,
  Clock,
  Eye,
  MapPin,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ThumbsUp,
  UserPen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useBookmarks } from "../../context/BookmarksContext";
import { EditProfileModal } from "./EditProfileModal";
import { ReporterVerificationModal } from "../auth/ReporterVerificationModal";
import { ArticleCard } from "../feed/ArticleCard";

type ProfileTab = "articles" | "analytics" | "drafts" | "bookmarks" | "comments";

export function UserProfileView({ initialTab = "articles" }: { initialTab?: ProfileTab }) {
  const { user, setActiveView, openAuthModal } = useAuth();
  const { items: bookmarkedItems, toggleBookmark } = useBookmarks();

  const isReporter = user?.role === "reporter" || user?.role === "admin";
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    isReporter ? initialTab : "bookmarks"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  useEffect(() => {
    if (!isReporter && (activeTab === "articles" || activeTab === "analytics" || activeTab === "drafts")) {
      setActiveTab("bookmarks");
    }
  }, [isReporter, activeTab]);

  useEffect(() => {
    if (initialTab) {
      if (!isReporter && (initialTab === "articles" || initialTab === "analytics" || initialTab === "drafts")) {
        setActiveTab("bookmarks");
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab, isReporter]);

  // Якщо користувач гість, показуємо заглушку з кнопкою входу
  if (!user) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold font-mono text-[#0f172a]">
          Увійдіть у систему для перегляду профілю
        </h2>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={openAuthModal}
            className="px-5 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl text-xs font-mono font-bold transition shadow-sm cursor-pointer"
          >
            Увійти в акаунт
          </button>
          <button
            type="button"
            onClick={() => setActiveView("feed")}
            className="px-4 py-2.5 bg-white border border-[#e2e8f0] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-mono font-semibold transition cursor-pointer"
          >
            ← Повернутися до стрічки
          </button>
        </div>
      </div>
    );
  }

  const handleCopyProfileLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const publishedCount = user.articles?.filter((a) => a.status !== "draft").length || 0;
  const bookmarksCount = bookmarkedItems.length;

  // Формування списку вкладок відповідно до ролі
  const reporterTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "articles",
      label: `Опубліковані статті (${publishedCount})`,
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: "analytics",
      label: "Аналітика",
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
    {
      id: "drafts",
      label: "Чернетки (2)",
      icon: <PenTool className="w-3.5 h-3.5" />,
    },
    {
      id: "bookmarks",
      label: `Закладки (${bookmarksCount})`,
      icon: <Bookmark className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      id: "comments",
      label: "Коментарі (3)",
      icon: <MessageSquare className="w-3.5 h-3.5 text-sky-500" />,
    },
  ];

  const readerTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "bookmarks",
      label: `Збережені матеріали (${bookmarksCount})`,
      icon: <Bookmark className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      id: "comments",
      label: "Мої коментарі (3)",
      icon: <MessageSquare className="w-3.5 h-3.5 text-sky-500" />,
    },
  ];

  const availableTabs = isReporter ? reporterTabs : readerTabs;

  return (
    <div className="space-y-6">
      {/* 1. Верхня панель навігації: Назад + зміна акаунту */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
        <button
          type="button"
          onClick={() => setActiveView("feed")}
          className="group flex items-center gap-2 text-xs font-mono font-bold text-[#475569] hover:text-[#0f172a] transition-colors cursor-pointer py-1"
        >
          <svg
            width="18"
            height="10"
            viewBox="0 0 18 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-1"
          >
            <path
              d="M17 5H1M1 5L5 1M1 5L5 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="inline-block transition-transform duration-200 ease-out group-hover:-translate-x-1">
            Назад до головної стрічки
          </span>
        </button>

        <button
          type="button"
          onClick={openAuthModal}
          className="text-xs font-sans font-normal text-[#64748b] hover:text-[#059669] transition-colors cursor-pointer py-1"
        >
          Змінити акаунт
        </button>
      </div>

      {/* 2. Головна картка профілю */}
      <div className="relative overflow-hidden rounded-[24px] bg-white/90 backdrop-blur-md border border-[#e2e8f0] p-6 sm:p-7 shadow-sm">
        {/* Фонове декоративне світіння */}
        <div
          className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-0 transition-colors duration-500 ${
            isReporter ? "bg-emerald-200/40" : "bg-sky-200/40"
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          {/* Аватар та текстова інформація */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative shrink-0">
              <div className="w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] rounded-[22px] overflow-hidden bg-[#111315] border-2 border-white shadow-md flex items-center justify-center">
                <img
                  src={user.avatar_url || "/avatars/Avatar_1.png"}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Статусна цяточка з іконкою */}
              <span
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm transition-colors duration-300 ${
                  isReporter ? "bg-[#10b981]" : "bg-[#0284c7]"
                }`}
                title={isReporter ? "Верифікований автор" : "Учасник форуму"}
              >
                {isReporter ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono font-bold text-[22px] sm:text-[24px] tracking-tight text-[#0f172a]">
                  {user.full_name}
                </h1>
                <span className="text-xs font-mono text-slate-500">
                  @{user.handle ? user.handle.replace(/^@/, "") : "user"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-colors ${
                    isReporter
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-sky-50 border-sky-300 text-sky-800"
                  }`}
                >
                  {isReporter ? "Автор ByteNews" : "Читач / Форум"}
                </span>
              </div>

              <div className="text-[13px] sm:text-[14px] font-mono font-semibold text-[#059669]">
                {user.role_title || (isReporter ? "IT-репортер спільноти" : "Читач спільноти")}
              </div>

              <p className="text-[12px] sm:text-[13px] text-[#475569] font-sans max-w-xl leading-relaxed pt-0.5">
                {user.bio || "Учасник технологічної спільноти ByteNews."}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] sm:text-[12px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.location || "Київ, Україна"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  У спільноті з {user.joined_date || "березня 2023"}
                </span>
              </div>
            </div>
          </div>

          {/* Кнопки дій справа */}
          <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0 self-start md:self-auto w-full md:w-auto">
            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto">
              {isReporter ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("articles")}
                  className="flex-1 md:flex-initial h-[38px] px-4 rounded-[12px] bg-[#0f172a] hover:bg-[#1e293b] text-white font-mono text-[12px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <PenTool className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>+ Написати публікацію</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVerificationOpen(true)}
                  className="flex-1 md:flex-initial h-[38px] px-4 rounded-[12px] bg-[#0f172a] hover:bg-[#059669] text-white font-mono text-[12px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
                  <span>Стати автором</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="h-[34px] px-3.5 rounded-[12px] bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#1e293b] font-mono text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <UserPen className="w-3.5 h-3.5 text-slate-500" />
                <span>Редагувати профіль</span>
              </button>

              <button
                type="button"
                onClick={handleCopyProfileLink}
                title="Скопіювати посилання на профіль"
                className="h-[34px] px-3.5 rounded-[12px] bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#1e293b] font-mono text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    <span className="font-semibold text-[#10b981]">Скопійовано</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>Поділитися</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* 3. Адаптивна статистична панель (4 метрики) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#e2e8f0] font-mono">
          {isReporter ? (
            <>
              <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
                <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
                  Публікацій (Автор)
                </div>
                <div className="text-[18px] sm:text-[20px] font-extrabold text-[#0f172a]">
                  {publishedCount} статей
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
                <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
                  Охоплення (перегляди)
                </div>
                <div className="text-[18px] sm:text-[20px] font-extrabold text-[#059669]">
                  {(user.total_views || 7230).toLocaleString("uk-UA")}
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
                <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
                  Збережено у закладки
                </div>
                <div className="text-[18px] sm:text-[20px] font-extrabold text-[#0f172a]">
                  {bookmarksCount} матеріалів
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
                <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
                  Статус акаунта
                </div>
                <div className="text-[15px] sm:text-[16px] font-extrabold text-[#059669] flex items-center gap-1.5 mt-1 truncate">
                  <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span>Автор + Читач</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
                <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
                  Збережено у закладки
                </div>
                <div className="text-[18px] sm:text-[20px] font-extrabold text-[#059669]">
                  {bookmarksCount} матеріалів
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
                <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
                  Написано коментарів
                </div>
                <div className="text-[18px] sm:text-[20px] font-extrabold text-[#0f172a]">
                  {user.comments_count || 19} думок
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
                <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
                  Прочитано новин
                </div>
                <div className="text-[18px] sm:text-[20px] font-extrabold text-[#0f172a]">
                  {user.read_articles_count || 42} статті
                </div>
              </div>

              <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
                <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
                  Рівень у спільноті
                </div>
                <div className="text-[15px] sm:text-[16px] font-extrabold text-sky-700 flex items-center gap-1.5 mt-1 truncate">
                  <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Учасник форуму</span>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* 4. Банер переходу в статус автора для читачів */}
      {!isReporter && (
        <div className="relative overflow-hidden rounded-[20px] p-5 border border-emerald-200/90 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-mono">
                Бажаєте публікувати власні статті чи огляди?
              </h4>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Активуйте статус автора спільноти за 1 клік — як на форумі, без зайвої бюрократії.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsVerificationOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs self-start sm:self-auto flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Стати автором форуму</span>
          </button>
        </div>
      )}

      {/* 5. Вкладки під карткою профілю */}
      <div className="rounded-[24px] bg-white/90 backdrop-blur-md border border-[#e2e8f0] p-6 shadow-sm">
        
        {/* Навігація по вкладках */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3 font-mono text-xs overflow-x-auto no-scrollbar">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isActive
                    ? "bg-[#0f172a] text-white font-bold shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Вміст обраної вкладки */}
        <div className="mt-6">

          {/* ВКЛАДКА 1: Опубліковані статті (тільки для автора) */}
          {isReporter && activeTab === "articles" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2 border-b border-slate-100">
                <span>Показано матеріали автора {user.full_name}</span>
                <span>Сортування: За датою публікації</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {user.articles
                  ?.filter((article) => article.status !== "draft")
                  .map((article) => (
                    <article
                      key={article.id}
                      className="relative overflow-hidden rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all duration-300 bg-white group flex flex-col justify-between"
                    >
                      {/* Верхня кольорова смужка */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#10b981] opacity-90" />

                      <div>
                        {/* Категорія, дата та час читання */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-2.5">
                          <span className="inline-flex items-center justify-center font-bold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 leading-none">
                            {article.category_name}
                          </span>
                          <span>•</span>
                          <span>
                            {article.published_at
                              ? article.published_at.includes("T")
                                ? new Date(article.published_at).toLocaleDateString("uk-UA")
                                : article.published_at
                              : "Опубліковано"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {article.read_time_min} хв читання
                          </span>
                        </div>

                        {/* Заголовок статті */}
                        <h3 className="font-sans font-bold text-[16px] sm:text-[17px] text-[#0f172a] group-hover:text-[#059669] transition-colors leading-snug">
                          {article.title}
                        </h3>

                        {/* Короткий опис */}
                        <p className="text-[13px] text-slate-600 mt-2 leading-relaxed font-sans line-clamp-3">
                          {article.summary}
                        </p>
                      </div>

                      {/* Підвал статті з переглядами та коментарями */}
                      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-100 text-[12px] font-mono text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{article.views_count.toLocaleString("uk-UA")} переглядів</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          <span>{article.comments_count} коментарів</span>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>

              {(!user.articles || user.articles.filter((a) => a.status !== "draft").length === 0) && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3 bg-slate-50/50">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800 font-mono">Ще немає опублікованих репортажів</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
                    Створіть свій перший технічний репортаж або аналітичну замітку для спільноти ByteNews.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ВКЛАДКА 2: Аналітика (тільки для автора) */}
          {isReporter && activeTab === "analytics" && (
            <div className="space-y-6">
              {/* 3 ключові метрики */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                    <span>Середній час читання</span>
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#0f172a]">4 хв 18 с</div>
                  <div className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% до середнього по платформі</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                    <span>Дочитування до кінця</span>
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#0f172a]">84.6%</div>
                  <div className="text-[11px] text-slate-500 mt-1.5">
                    Високе утримання уваги аудиторії
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                    <span>Поширення у Slack / X</span>
                    <Share2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#0f172a]">1,240</div>
                  <div className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+28% за минулий місяць</span>
                  </div>
                </div>
              </div>

              {/* Прогрес-бари охоплення тем */}
              <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4 font-mono">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Найпопулярніші теми репортера:
                </h4>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-700">Штучний Інтелект & LLM моделі</span>
                      <span className="font-bold text-slate-900">54% охоплення</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "54%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-700">Архітектура систем та компілятори</span>
                      <span className="font-bold text-slate-900">32% охоплення</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: "32%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-700">Кібербезпека та аналіз 0-day</span>
                      <span className="font-bold text-slate-900">14% охоплення</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: "14%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 3: Чернетки (тільки для автора) */}
          {isReporter && activeTab === "drafts" && (
            <div className="space-y-4">
              {[
                {
                  id: "draft-1",
                  title: "Порівняльний аналіз Garbage Collector у Go 1.25 та .NET 9 на мікросервісах",
                  category: "Розробка",
                  updated: "Оновлено 2 години тому",
                  status: "На рецензуванні в техредактора",
                  statusColor: "bg-amber-100 text-amber-800 border-amber-300",
                },
                {
                  id: "draft-2",
                  title: "Вразливості в протоколах MCP (Model Context Protocol): як захистити локальні інструменти",
                  category: "Кібербезпека",
                  updated: "Оновлено вчора",
                  status: "Чернетка (30% завершено)",
                  statusColor: "bg-slate-100 text-slate-700 border-slate-300",
                },
              ].map((draft) => (
                <div
                  key={draft.id}
                  className="rounded-2xl p-5 border border-[#e2e8f0] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="font-bold text-slate-700">{draft.category}</span>
                      <span>•</span>
                      <span className="text-slate-500">{draft.updated}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${draft.statusColor}`}>
                        {draft.status}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 font-sans">
                      {draft.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
                    >
                      Продовжити редагування
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ВКЛАДКА 4: Закладки (спільна для автора та читача) */}
          {activeTab === "bookmarks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2 border-b border-slate-100">
                <span>Збережені матеріали для відкладеного читання</span>
                <span>{bookmarkedItems.length} збережено</span>
              </div>

              {bookmarkedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3 bg-slate-50/50">
                  <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800 font-mono">
                    У вас немає збережених новин
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
                    Натискайте на іконку закладки біля будь-якої новини в стрічці, щоб зберегти її сюди для читання.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView("feed")}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-bold hover:bg-emerald-600 transition-colors cursor-pointer mt-2"
                  >
                    ← Перейти до стрічки
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {bookmarkedItems.map((item) => (
                    <ArticleCard
                      key={item.article.id}
                      article={item.article}
                      bookmarked={true}
                      onBookmark={() => toggleBookmark(item.article)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ВКЛАДКА 5: Коментарі (спільна для автора та читача) */}
          {activeTab === "comments" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2 border-b border-slate-100">
                <span>Історія ваших коментарів та думок у дискусіях</span>
                <span>3 коментарі</span>
              </div>

              {[
                {
                  id: "comm-1",
                  articleTitle: "Anthropic представила Claude 3.7 Sonnet: гібридне мислення та новий еталон кодингу",
                  date: "Вчора о 14:20",
                  commentText:
                    "Гібридний режим — це саме те, чого не вистачало для складних репозиторіїв. На тестах з async Python різниця колосальна.",
                  likes: 12,
                },
                {
                  id: "comm-2",
                  articleTitle: "Огляд React 19: Actions, useOptimistic та кінець епохи forwardRef",
                  date: "3 дні тому",
                  commentText:
                    "Нарешті позбулися forwardRef, це був головний біль для типізації UI-китів. Дякую за детальний розбір!",
                  likes: 8,
                },
                {
                  id: "comm-3",
                  articleTitle: "NVIDIA анонсувала B200 Ultra з підтримкою 288GB HBM3e пам’яті",
                  date: "5 днів тому",
                  commentText:
                    "Цікаво, як це вплине на вартість тренування open-source моделей у 2026 році.",
                  likes: 4,
                },
              ].map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl p-5 border border-[#e2e8f0] bg-white space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="text-emerald-700 font-bold">Коментар під статтею:</span>
                    <span>{comment.date}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-sans">
                    «{comment.articleTitle}»
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-sans leading-relaxed">
                    {comment.commentText}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{comment.likes} вподобайок від інших читачів</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Модальне вікно редагування профілю */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Модальне вікно верифікації автора */}
      {isVerificationOpen && (
        <ReporterVerificationModal
          onClose={() => setIsVerificationOpen(false)}
        />
      )}
    </div>
  );
}
