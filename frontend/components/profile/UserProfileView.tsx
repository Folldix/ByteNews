"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  PenTool,
  Share2,
  Check,
  ShieldCheck,
  Calendar,
  FileText,
  BarChart3,
  Bookmark,
  MessageSquare,
  Clock,
  Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ReporterVerificationModal } from "../auth/ReporterVerificationModal";
import { useBookmarks } from "../../context/BookmarksContext";

type ProfileTab = "articles" | "analytics" | "drafts" | "bookmarks" | "comments";

export function UserProfileView({ initialTab = "articles" }: { initialTab?: ProfileTab }) {
  const { user, setActiveView, logout, openAuthModal } = useAuth();
  const { openDrawer } = useBookmarks();
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReporterModal, setShowReporterModal] = useState(false);

  useEffect(() => setActiveTab(initialTab), [initialTab]);

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

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "articles",
      label: `Опубліковані статті (${user.articles?.length || 0})`,
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: "analytics",
      label: "Аналітика",
      icon: <BarChart3 className="w-3.5 h-3.5" />,
    },
    {
      id: "drafts",
      label: "Чернетки",
      icon: <PenTool className="w-3.5 h-3.5" />,
    },
    {
      id: "bookmarks",
      label: "Закладки",
      icon: <Bookmark className="w-3.5 h-3.5" />,
    },
    {
      id: "comments",
      label: "Коментарі",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Верхня панель навігації */}
      <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
        <button
          type="button"
          onClick={() => setActiveView("feed")}
          className="group flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 transition-transform duration-200" />
          <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1.5">
            Назад до головної стрічки
          </span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-mono text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Вийти з акаунта</span>
        </button>
      </div>

      {/* Головна картка профілю автора */}
      <div className="relative overflow-hidden rounded-[24px] bg-white/90 backdrop-blur-md border border-[#e2e8f0] p-6 sm:p-7 shadow-sm">
        {/* Фонове декоративне світіння */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none -z-0" />

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
              {/* Статусна цяточка з щитом */}
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center bg-[#10b981] text-white shadow-sm"
                title="Верифікований автор"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <h1 className="font-mono font-bold text-[22px] sm:text-[24px] tracking-tight text-[#0f172a]">
                {user.full_name}
              </h1>

              <div className="text-[13px] sm:text-[14px] font-mono font-semibold text-[#059669]">
                {user.role_title}
              </div>

              <p className="text-[12px] sm:text-[13px] text-[#475569] font-sans max-w-xl leading-relaxed pt-0.5">
                {user.bio}
              </p>

              <div className="flex items-center gap-1.5 pt-1 text-[11px] sm:text-[12px] font-mono text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>У спільноті з {user.joined_date}</span>
              </div>
            </div>
          </div>

          {/* Кнопки дій справа (вертикальна колонка) */}
          <div className="flex flex-col items-end gap-2.5 shrink-0 self-start md:self-auto">
            {user.role === "reader" && <button type="button" onClick={() => setShowReporterModal(true)} className="h-[38px] px-4 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[12px] font-bold transition">Стати автором</button>}
            <button
              type="button"
              className="h-[38px] px-4 rounded-[12px] bg-[#0f172a] hover:bg-[#1e293b] text-white font-mono text-[12px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
            >
              <PenTool className="w-3.5 h-3.5 text-[#34d399]" />
              <span>Написати публікацію</span>
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
                  <span>Копіювати</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* 3. Статистична панель (4 метрики) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#e2e8f0] font-mono">
          <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
            <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
              Публікацій
            </div>
            <div className="text-[18px] sm:text-[20px] font-extrabold text-[#0f172a]">
              {user.articles_count} статей
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
            <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
              Охоплення
            </div>
            <div className="text-[18px] sm:text-[20px] font-extrabold text-[#059669]">
              {user.total_views.toLocaleString("uk-UA")}
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
            <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
              Збережено у закладки
            </div>
            <div className="text-[18px] sm:text-[20px] font-extrabold text-[#0f172a]">
              {user.bookmarks_count} матеріалів
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-white/70 border border-[#e2e8f0] shadow-xs">
            <div className="text-[11px] font-medium text-slate-500 mb-1 truncate">
              Статус акаунта
            </div>
            <div className="text-[15px] sm:text-[16px] font-extrabold text-[#059669] flex items-center gap-1.5 mt-1 truncate">
              <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
              <span>{user.role === "reporter" || user.role === "admin" ? "Автор + Читач" : "Читач"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Вкладки під карткою профілю */}
      <div className="rounded-[24px] bg-white/90 backdrop-blur-md border border-[#e2e8f0] p-6 shadow-sm">
        
        {/* Навігація по вкладках */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3 font-mono text-xs overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
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

        {/* Вміст вкладок: опубліковані статті або порожній блок для вкладок без даних */}
        <div className="mt-6">
          {activeTab === "articles" || activeTab === "drafts" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2 border-b border-slate-100">
                <span>{activeTab === "drafts" ? "Чернетки автора" : `Публікації автора ${user.full_name}`}</span>
                <span>Сортування: За датою публікації</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {user.articles.filter((article) => activeTab === "drafts" ? article.status === "draft" : article.status !== "draft").map((article) => (
                  <article
                    key={article.id}
                    className="relative overflow-hidden rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all duration-300 bg-white group flex flex-col justify-between"
                  >
                    {/* Верхня кольорова смужка */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#10b981] opacity-90" />

                    <div>
                      {/* Категорія, дата та час читання */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 mb-2.5">
                        <span className="font-bold text-[#059669] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {article.category_name}
                        </span>
                        <span>•</span>
                        <span>{article.published_at ? new Date(article.published_at).toLocaleDateString("uk-UA") : "Чернетка"}</span>
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
              {user.articles.filter((article) => activeTab === "drafts" ? article.status === "draft" : article.status !== "draft").length === 0 && <p className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">{activeTab === "drafts" ? "Чернеток поки немає." : "Опублікованих статей поки немає."}</p>}
            </div>
          ) : activeTab === "analytics" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Опубліковані статті", value: user.articles_count },
                { label: "Перегляди статей", value: user.total_views },
                { label: "Матеріали у закладках", value: user.bookmarks_count },
              ].map((metric) => <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs text-slate-500">{metric.label}</p><p className="mt-2 font-mono text-2xl font-bold text-slate-900">{metric.value.toLocaleString("uk-UA")}</p></div>)}
            </div>
          ) : activeTab === "bookmarks" ? (
            <div className="py-8 text-center"><p className="text-sm text-slate-500">Перегляньте збережені матеріали у вашому списку.</p><button type="button" onClick={openDrawer} className="mt-4 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">Відкрити закладки</button></div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">Дані для цієї вкладки з’являться після підключення відповідного розділу.</div>
          )}
        </div>

      </div>
      {showReporterModal && <ReporterVerificationModal onClose={() => setShowReporterModal(false)} />}
    </div>
  );
}
