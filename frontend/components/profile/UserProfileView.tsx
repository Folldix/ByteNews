"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  UserPen,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useBookmarks } from "../../context/BookmarksContext";
import { EditProfileModal } from "./EditProfileModal";
import { ReporterVerificationModal } from "../auth/ReporterVerificationModal";
import { ArticleCard } from "../feed/ArticleCard";
import type { Article } from "../feed/types";
import { getStoredAccessToken } from "../../lib/api";
import { editorHref } from "../../lib/routes";
import { listMyArticles, type EditorArticle } from "../cms/cms-api";

type ProfileTab = "articles" | "analytics" | "drafts" | "bookmarks" | "comments";

type SortOption = "date-desc" | "date-asc" | "views-desc" | "comments-desc";

const SORT_OPTIONS: { id: SortOption; label: string; shortLabel: string }[] = [
  { id: "date-desc", label: "За датою публікації (новіші)", shortLabel: "За датою (нові)" },
  { id: "date-asc", label: "За датою публікації (давніші)", shortLabel: "За датою (старі)" },
  { id: "views-desc", label: "За кількістю переглядів", shortLabel: "За переглядами" },
  { id: "comments-desc", label: "За кількістю коментарів", shortLabel: "За коментарями" },
];

function parseArticleDate(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;

  const months: Record<string, number> = {
    січня: 0,
    лютого: 1,
    березня: 2,
    квітня: 3,
    травня: 4,
    червня: 5,
    липня: 6,
    серпня: 7,
    вересня: 8,
    жовтня: 9,
    листопада: 10,
    грудня: 11,
  };

  const parts = dateStr.trim().toLowerCase().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day).getTime();
    }
  }
  return 0;
}

export function UserProfileView({ initialTab = "articles" }: { initialTab?: ProfileTab }) {
  const router = useRouter();
  const { user, setActiveView, openAuthModal } = useAuth();
  const { items: bookmarkedItems, toggleBookmark } = useBookmarks();

  const isReporter = user?.role === "reporter" || user?.role === "admin";
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    isReporter ? initialTab : "bookmarks"
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [cmsArticles, setCmsArticles] = useState<EditorArticle[]>([]);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsError, setCmsError] = useState("");

  const sortedArticles = React.useMemo(() => {
    if (!user?.articles) return [];
    const published = user.articles.filter((a) => a.status !== "draft");
    return [...published].sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return parseArticleDate(a.published_at) - parseArticleDate(b.published_at);
        case "views-desc":
          return (b.views_count || 0) - (a.views_count || 0);
        case "comments-desc":
          return (b.comments_count || 0) - (a.comments_count || 0);
        case "date-desc":
        default:
          return parseArticleDate(b.published_at) - parseArticleDate(a.published_at);
      }
    });
  }, [user?.articles, sortOption]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

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

  useEffect(() => {
    if (!isReporter) return;
    const token = getStoredAccessToken();
    if (!token || token === "demo-access-token") {
      setCmsArticles([]);
      setCmsLoading(false);
      return;
    }
    let active = true;
    setCmsLoading(true);
    setCmsError("");
    listMyArticles(token)
      .then((page) => { if (active) setCmsArticles(page.items); })
      .catch((reason: unknown) => { if (active) setCmsError(reason instanceof Error ? reason.message : "Не вдалося завантажити публікації."); })
      .finally(() => { if (active) setCmsLoading(false); });
    return () => { active = false; };
  }, [isReporter]);

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
  const draftsCount = cmsArticles.filter((article) => article.status === "draft").length;
  const bookmarksCount = bookmarkedItems.length;
  const commentsCount = user.comments_count ?? 3;

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
      label: `Чернетки (${draftsCount})`,
      icon: <PenTool className="w-3.5 h-3.5" />,
    },
    {
      id: "bookmarks",
      label: `Закладки (${bookmarksCount})`,
      icon: <Bookmark className="w-3.5 h-3.5" />,
    },
    {
      id: "comments",
      label: `Коментарі (${commentsCount})`,
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
  ];

  const readerTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "bookmarks",
      label: `Закладки (${bookmarksCount})`,
      icon: <Bookmark className="w-3.5 h-3.5" />,
    },
    {
      id: "comments",
      label: `Коментарі (${commentsCount})`,
      icon: <MessageSquare className="w-3.5 h-3.5" />,
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
          className="group flex items-center gap-[8px] text-xs font-mono font-bold text-[#475569] hover:text-[#0f172a] transition-colors duration-150 ease-out cursor-pointer py-1"
        >
          <svg
            width="18"
            height="10"
            viewBox="0 0 18 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 stroke-[#475569] group-hover:stroke-[#0f172a] transition-colors duration-150 ease-out"
          >
            <path
              d="M17 5H1M1 5L5 1M1 5L5 9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="transition-transform duration-150 ease-out group-hover:translate-x-[2px]">
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
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white/90 backdrop-blur-md border border-[#e2e8f0] p-4 sm:p-7 shadow-sm">
        {/* Фонове декоративне світіння */}
        <div
          className={`absolute top-0 right-0 w-80 h-52 rounded-full blur-3xl pointer-events-none z-0 transition-colors duration-500 ${
            isReporter ? "bg-emerald-200/40" : "bg-sky-200/40"
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          {/* Аватар та текстова інформація */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="w-[68px] h-[68px] sm:w-[84px] sm:h-[84px] rounded-[18px] sm:rounded-[22px] overflow-hidden bg-[#111315] border-2 border-white shadow-md flex items-center justify-center">
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
                <h1 className="font-mono font-bold text-[20px] sm:text-[24px] tracking-tight text-[#0f172a] break-words">
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
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0 self-start md:self-auto w-full md:w-auto">
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 w-full md:w-auto">
              {isReporter ? (
                <button
                  type="button"
                  onClick={() => router.push("/editor")}
                  className="w-full sm:w-auto md:w-auto h-[38px] px-4 rounded-[12px] bg-[#0f172a] hover:bg-[#1e293b] text-white font-mono text-[12px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] whitespace-nowrap shrink-0"
                >
                  <PenTool className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                  <span>+ Написати публікацію</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVerificationOpen(true)}
                  className="w-full sm:w-auto md:w-auto h-[38px] px-4 rounded-[12px] bg-[#0f172a] hover:bg-[#059669] text-white font-mono text-[12px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                  <span>Стати автором</span>
                </button>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 sm:flex-initial h-[38px] px-3 sm:px-3.5 rounded-[12px] bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#1e293b] font-mono text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] whitespace-nowrap"
                >
                  <UserPen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Редагувати<span className="hidden min-[400px]:inline"> профіль</span></span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyProfileLink}
                  title="Скопіювати посилання на профіль"
                  className="flex-1 sm:flex-initial h-[38px] px-3 sm:px-3.5 rounded-[12px] bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#1e293b] font-mono text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] whitespace-nowrap"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                      <span className="font-semibold text-[#10b981]">Скопійовано</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                      <span>Поділитися</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Адаптивна статистична панель (4 метрики) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-[#e2e8f0] font-mono">
          {isReporter ? (
            <>
              <div className="relative z-10 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[#FDFEFE] border border-[#e2e8f0] shadow-xs">
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mb-1 leading-snug line-clamp-1">
                  Публікацій
                </div>
                <div className="text-[15px] sm:text-[18px] md:text-[20px] font-extrabold text-[#0f172a] leading-tight">
                  {publishedCount} статей
                </div>
              </div>

              <div className="relative z-10 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[#FDFEFE] border border-[#e2e8f0] shadow-xs">
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mb-1 leading-snug line-clamp-1">
                  Охоплення (перегляди)
                </div>
                <div className="text-[15px] sm:text-[18px] md:text-[20px] font-extrabold text-[#059669] leading-tight">
                  {(user.total_views || 7230).toLocaleString("uk-UA")}
                </div>
              </div>

              <div className="relative z-10 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[#FDFEFE] border border-[#e2e8f0] shadow-xs">
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mb-1 leading-snug line-clamp-1">
                  Збережено у закладки
                </div>
                <div className="text-[15px] sm:text-[18px] md:text-[20px] font-extrabold text-[#0f172a] leading-tight">
                  {bookmarksCount} матеріалів
                </div>
              </div>

              <div className="relative z-10 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[#FDFEFE] border border-[#e2e8f0] shadow-xs">
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mb-1 leading-snug line-clamp-1">
                  Статус акаунта
                </div>
                <div className="text-[12px] sm:text-[14px] md:text-[16px] font-extrabold text-[#059669] flex items-center gap-1.5 mt-1 leading-tight">
                  <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span>Автор + Читач</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative z-10 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[#FDFEFE] border border-[#e2e8f0] shadow-xs">
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mb-1 leading-snug line-clamp-1">
                  Збережено у закладки
                </div>
                <div className="text-[15px] sm:text-[18px] md:text-[20px] font-extrabold text-[#059669] leading-tight">
                  {bookmarksCount} матеріалів
                </div>
              </div>

              <div className="relative z-10 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[#FDFEFE] border border-[#e2e8f0] shadow-xs">
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mb-1 leading-snug line-clamp-1">
                  Написано коментарів
                </div>
                <div className="text-[15px] sm:text-[18px] md:text-[20px] font-extrabold text-[#0f172a] leading-tight">
                  {user.comments_count || 19} думок
                </div>
              </div>

              <div className="relative z-10 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[#FDFEFE] border border-[#e2e8f0] shadow-xs">
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mb-1 leading-snug line-clamp-1">
                  Прочитано новин
                </div>
                <div className="text-[15px] sm:text-[18px] md:text-[20px] font-extrabold text-[#0f172a] leading-tight">
                  {user.read_articles_count || 42} статті
                </div>
              </div>

              <div className="relative z-10 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-[#FDFEFE] border border-[#e2e8f0] shadow-xs">
                <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mb-1 leading-snug line-clamp-1">
                  Рівень у спільноті
                </div>
                <div className="text-[12px] sm:text-[14px] md:text-[16px] font-extrabold text-sky-700 flex items-center gap-1.5 mt-1 leading-tight">
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

      {/* 5. Вкладки та контент профілю */}
      <section className="space-y-6">
        
        {/* Лінія вкладок */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-[10px] font-mono text-xs overflow-x-auto no-scrollbar scroll-smooth">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group h-[36px] px-4 py-2 rounded-[12px] flex items-center gap-1.5 shrink-0 whitespace-nowrap text-[12px] font-mono transition-all duration-150 ease-out cursor-pointer ${
                  isActive
                    ? "bg-[#0f172a] text-white font-bold shadow-xs border border-transparent"
                    : "bg-white text-[#475569] font-normal hover:bg-[#f1f5f9] hover:text-[#0f172a] border border-[#e2e8f0] hover:border-slate-300"
                }`}
              >
                <span
                  className={`shrink-0 transition-colors duration-150 ${
                    isActive
                      ? "text-white"
                      : "text-[#64748b] group-hover:text-[#0f172a]"
                  }`}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Вміст обраної вкладки */}
        <div>

          {/* ВКЛАДКА 1: Опубліковані статті (тільки для автора) */}
          {isReporter && activeTab === "articles" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono text-slate-500 pb-2.5 border-b border-slate-100">
                <span>Показано матеріали автора {user.full_name}</span>

                {/* Кнопка вибору критерію сортування */}
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white border border-[#e2e8f0] text-slate-700 hover:text-slate-900 hover:border-slate-300 font-mono text-xs font-medium shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
                    title="Змінити критерій сортування"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Сортування:{" "}
                      <strong className="font-bold text-[#0f172a]">
                        {SORT_OPTIONS.find((o) => o.id === sortOption)?.shortLabel || "За датою"}
                      </strong>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        isSortDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isSortDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20 cursor-default"
                        onClick={() => setIsSortDropdownOpen(false)}
                      />
                      <div className="absolute right-0 left-auto mt-1.5 w-56 sm:w-60 max-w-[calc(100vw-32px)] rounded-[14px] bg-white border border-[#e2e8f0] shadow-lg py-1.5 z-30 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                          Критерій сортування
                        </div>
                        {SORT_OPTIONS.map((option) => {
                          const isSelected = sortOption === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setSortOption(option.id);
                                setIsSortDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-slate-50 text-[#059669] font-bold"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <span>{option.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#059669]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedArticles.map((article) => {
                  const feedArticle: Article = {
                    id: article.id,
                    title: article.title,
                    slug: article.slug,
                    lead: article.summary,
                    cover_image_url: article.cover_image_url,
                    is_hero: false,
                    is_photo_reportage: false,
                    read_time_min: article.read_time_min,
                    views_count: article.views_count,
                    likes_count: 0,
                    comments_count: article.comments_count,
                    published_at: article.published_at,
                    category: article.category_name,
                    author: user.full_name,
                    author_role: user.role_title || "IT-репортер",
                    author_avatar: user.avatar_url,
                    tags: ["Технології", "Розробка"],
                    time_label: article.published_at || undefined,
                  };
                  const isBookmarked = bookmarkedItems.some((b) => b.article.id === article.id);
                  return (
                    <div key={article.id} className="space-y-2">
                      <ArticleCard
                        article={feedArticle}
                        bookmarked={isBookmarked}
                        onBookmark={() => toggleBookmark(feedArticle)}
                      />
                      <button type="button" onClick={() => router.push(editorHref(article.id))} className="ml-1 text-xs font-semibold text-emerald-800 hover:underline">Редагувати публікацію →</button>
                    </div>
                  );
                })}
              </div>

              {sortedArticles.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3 bg-white/70">
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
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4 font-mono">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Найпопулярніші теми репортера:
                </h4>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <span className="text-slate-700">Штучний Інтелект & LLM моделі</span>
                      <span className="font-bold text-slate-900">54% охоплення</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "54%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <span className="text-slate-700">Архітектура систем та компілятори</span>
                      <span className="font-bold text-slate-900">32% охоплення</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: "32%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
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
              {cmsError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{cmsError}</div>}
              {cmsLoading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Завантажуємо статті автора…</div> : null}
              {!cmsLoading && cmsArticles.filter((article) => article.status === "draft").length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <FileText className="mx-auto size-8 text-slate-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-900">Чернеток поки немає</h3>
                  <p className="mt-1 text-sm text-slate-500">Створіть публікацію та збережіть її, щоб продовжити пізніше.</p>
                  <button type="button" onClick={() => router.push(editorHref())} className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700">Написати статтю</button>
                </div>
              )}
              {!cmsLoading && cmsArticles.filter((article) => article.status === "draft").map((draft) => (
                <div key={draft.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-xs transition hover:border-slate-300 sm:flex-row sm:items-center">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-slate-500">
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-amber-800">Чернетка</span>
                      <span>Оновлено {new Date(draft.updated_at).toLocaleDateString("uk-UA")}</span>
                      <span>·</span><span>{draft.read_time_min} хв читання</span>
                    </div>
                    <h4 className="truncate font-sans text-sm font-bold text-slate-900 sm:text-base">{draft.title || "Без назви"}</h4>
                    <p className="truncate text-xs text-slate-500">{draft.lead || "Додайте лід і продовжте роботу над матеріалом."}</p>
                  </div>
                  <button type="button" onClick={() => router.push(editorHref(draft.id))} className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-mono font-semibold text-white transition-colors hover:bg-emerald-700">Продовжити редагування</button>
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
                  className="rounded-2xl p-4 sm:p-5 border border-[#e2e8f0] bg-white space-y-2.5 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 text-slate-500 text-[11px]">
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
                    <svg
                      width="15"
                      height="14"
                      viewBox="0 0 20 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="shrink-0 text-emerald-600"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 5.95981C1 -0.0402222 8 -0.540222 10 4.15421C12 -0.540222 19 -0.0402222 19 5.95981C19 11.9598 10 16.96 10 16.96C10 16.96 1 11.9598 1 5.95981Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{comment.likes} вподобайок від інших читачів</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </section>

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
