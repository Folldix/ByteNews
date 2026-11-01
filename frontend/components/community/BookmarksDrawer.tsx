"use client";

import { useEffect } from "react";
import { Bookmark, X } from "lucide-react";
import { useBookmarks } from "../../context/BookmarksContext";

export function BookmarksDrawer() {
  const { items, drawerOpen, closeDrawer, toggleBookmark } = useBookmarks();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeDrawer(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer, drawerOpen]);

  if (!drawerOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDrawer(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="bookmarks-title" className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-slate-200 bg-[#f8fafc] shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-emerald-700">ByteNews / Reading list</p><h2 id="bookmarks-title" className="mt-1 text-xl font-extrabold">Закладки <span className="ml-1 rounded-full bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">{items.length}</span></h2></div>
          <button type="button" onClick={closeDrawer} aria-label="Закрити закладки" className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"><X className="size-4" /></button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><Bookmark className="mx-auto size-7 text-slate-300"/><h3 className="mt-3 font-bold text-slate-800">Список поки порожній</h3><p className="mt-1 text-sm leading-6 text-slate-500">Зберігайте статті зі стрічки або сторінки читання.</p></div></div> : items.map(({ article }) => (
            <article key={article.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700">{article.category ?? "Технології"} · {article.read_time_min} хв</p><a onClick={closeDrawer} href={`/articles/${article.slug}`} className="mt-1.5 block text-base font-bold leading-6 text-slate-900 hover:text-emerald-800">{article.title}</a><p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{article.lead}</p></div><button type="button" onClick={() => void toggleBookmark(article).catch(() => undefined)} aria-label="Прибрати із закладок" className="shrink-0 rounded-full p-2 text-emerald-700 hover:bg-emerald-50"><Bookmark className="size-4 fill-current"/></button></div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
