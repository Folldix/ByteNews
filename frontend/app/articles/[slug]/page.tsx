"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Bookmark, Check, Copy, Focus, MessageSquare, ArrowLeft } from "lucide-react";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { AuthModal } from "../../../components/auth/AuthModal";
import { BookmarksDrawer } from "../../../components/community/BookmarksDrawer";
import { CommentsSection } from "../../../components/community/CommentsSection";
import { ReactionsBar } from "../../../components/community/reactions-bar";
import { FontSizeControl } from "../../../components/community/font-size-control";
import { useAuth } from "../../../context/AuthContext";
import { useBookmarks } from "../../../context/BookmarksContext";
import { getArticle, setReaction } from "../../../components/community/api";
import type { ArticleRead } from "../../../components/community/api";
import type { FontSize } from "../../../components/community/font-size-control";
import type { ReactionKind } from "../../../components/community/types";

function payloadText(payload: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) if (typeof payload[key] === "string") return payload[key] as string;
  return "";
}

function ArticleContent({ article, fontSize }: { article: ArticleRead; fontSize: FontSize }) {
  const textClass = fontSize === "small" ? "text-sm leading-7" : fontSize === "large" ? "text-xl leading-9" : "text-base leading-8";
  return <div className={`wrap-long-text space-y-7 text-slate-700 ${textClass}`}>
    {article.blocks.map((block) => {
      const payload = block.content_payload;
      const text = payloadText(payload, "text", "content", "value");
      switch (block.block_type) {
        case "heading": {
          const level = payload.level === 3 ? 3 : 2;
          return level === 3 ? <h3 key={block.id} className="pt-3 text-xl font-bold leading-tight tracking-tight text-slate-900">{text}</h3> : <h2 key={block.id} className="pt-4 text-2xl font-extrabold leading-tight tracking-tight text-slate-900">{text}</h2>;
        }
        case "image": {
          const src = payloadText(payload, "url", "image_url", "src");
          if (!src) return null;
          const caption = payloadText(payload, "caption");
          const credit = payloadText(payload, "credit", "author");
          return <figure key={block.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={payloadText(payload, "alt", "caption")} className="max-h-[620px] w-full object-cover" />
            {(caption || credit) && <figcaption className="flex flex-wrap justify-between gap-2 px-4 py-3 text-xs text-slate-500"><span>{caption}</span><span>{credit}</span></figcaption>}
          </figure>;
        }
        case "code": return <pre key={block.id} className="overflow-x-auto rounded-2xl bg-slate-950 p-5 font-mono text-sm leading-6 text-emerald-100"><code>{payloadText(payload, "code", "text", "content")}</code></pre>;
        case "quote": return <blockquote key={block.id} className="border-l-4 border-emerald-400 bg-emerald-50/70 px-5 py-4 text-lg font-medium italic leading-8 text-slate-800">{text}<span className="mt-2 block text-xs not-italic text-slate-500">{payloadText(payload, "author", "source")}</span></blockquote>;
        case "callout": return <aside key={block.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-base font-semibold leading-7 text-emerald-950"><span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700">Висновок</span>{text}</aside>;
        default: return <p key={block.id} className="whitespace-pre-wrap">{text}</p>;
      }
    })}
    {!article.blocks.length && article.lead && <p>{article.lead}</p>}
  </div>;
}

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { user, openAuthModal } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [article, setArticle] = useState<ArticleRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [zenMode, setZenMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getArticle(slug).then((result) => { if (active) setArticle(result); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Не вдалося завантажити статтю."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [article, fontSize, zenMode]);

  const bookmarkArticle = useMemo(() => article ? ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    lead: article.lead,
    cover_image_url: article.cover_image_url,
    is_hero: article.is_hero,
    is_photo_reportage: article.is_photo_reportage,
    read_time_min: article.read_time_min,
    views_count: article.views_count,
    likes_count: article.likes_count,
    comments_count: article.comments_count,
    published_at: article.published_at,
    category: article.category,
    author: article.author,
    author_role: article.author_role,
    tags: article.tags,
  }) : null, [article]);

  const handleReaction = useCallback(async (kind: ReactionKind | null) => {
    if (!article) return;
    if (!user) { openAuthModal(); throw new Error("Увійдіть, щоб оцінити матеріал."); }
    const result = await setReaction(article.id, kind);
    setArticle((current) => current ? { ...current, reaction_counts: result.counts, my_reaction: result.selected } : current);
    return result;
  }, [article, openAuthModal, user]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Браузер не дозволив скопіювати посилання.");
    }
  }

  return (
    <div className="article-reader-root flex min-h-screen flex-col">
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-slate-200/70" aria-label={`Прочитано ${Math.round(progress)}%`}><div className="h-full bg-emerald-500 transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
      <Header />
      <AuthModal />
      <BookmarksDrawer />
      <main className="mx-auto w-full max-w-[1296px] flex-1 px-4 py-7 sm:py-10">
        <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-800"><ArrowLeft className="size-4"/>До стрічки</a>
        {loading ? <div className="mt-8 h-[70vh] animate-pulse rounded-3xl bg-slate-200"/> : error && !article ? <div role="alert" className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">{error}</div> : article && <>
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 items-start gap-6">
            <article className={`min-w-0 ${zenMode ? "mx-auto w-full max-w-4xl lg:col-span-12" : "lg:col-span-8"}`}>
              <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700"><span>{article.category}</span><span className="text-slate-300">/</span><span>{article.read_time_min} хв читання</span>{article.is_photo_reportage && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">Фоторепортаж</span>}</div>
                <h1 className="wrap-long-text mt-4 text-3xl font-extrabold leading-tight tracking-[-.04em] text-slate-950 sm:text-5xl">{article.title}</h1>
                {article.lead && <p className="wrap-long-text mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{article.lead}</p>}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5"><div className="text-sm font-semibold text-slate-800">{article.author}<span className="ml-2 font-normal text-slate-400">{article.author_role}</span><div className="mt-1 font-mono text-[10px] text-slate-400">{new Date(article.published_at).toLocaleString("uk-UA")} · {article.views_count.toLocaleString("uk-UA")} переглядів · {article.comments_count} коментарів</div></div><div className="flex items-center gap-2"><button type="button" aria-label={isBookmarked(article.id) ? "Прибрати із закладок" : "Додати в закладки"} aria-pressed={isBookmarked(article.id)} onClick={() => { if (bookmarkArticle) void toggleBookmark(bookmarkArticle).catch((reason) => setError(reason.message)); }} className={`grid size-10 place-items-center rounded-full border ${isBookmarked(article.id) ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-emerald-300"}`}><Bookmark className={`size-4 ${isBookmarked(article.id) ? "fill-current" : ""}`}/></button><a href="#comments" className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-500 hover:border-emerald-300" aria-label="До коментарів"><MessageSquare className="size-4"/></a></div></div>
              </header>
              {article.cover_image_url && <figure className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white"><img src={article.cover_image_url} alt={article.cover_caption ?? article.title} className="max-h-[600px] w-full object-cover"/>{article.cover_caption && <figcaption className="px-5 py-3 text-xs text-slate-500">{article.cover_caption}</figcaption>}</figure>}
              <div className="sticky top-[72px] z-30 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur"><FontSizeControl value={fontSize} onChange={setFontSize}/><div className="flex items-center gap-2"><button type="button" onClick={() => void copyLink()} className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">{copied ? <Check className="size-3.5 text-emerald-600"/> : <Copy className="size-3.5"/>}{copied ? "Скопійовано" : "Копіювати посилання"}</button><button type="button" aria-pressed={zenMode} onClick={() => setZenMode((value) => !value)} className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold ${zenMode ? "bg-emerald-100 text-emerald-800" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Focus className="size-3.5"/>{zenMode ? "Вийти з фокусу" : "Фокусне читання"}</button></div></div>
              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9"><ArticleContent article={article} fontSize={fontSize}/></div>
              {article.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{article.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">#{tag}</span>)}</div>}
              <div className="mt-7"><ReactionsBar key={article.id} initialCounts={article.reaction_counts} initialSelected={article.my_reaction} onReact={handleReaction}/></div>
              <CommentsSection articleId={article.id}/>
            </article>
            {!zenMode && <aside className="lg:col-span-4 grid gap-5 lg:sticky lg:top-24"><section className="rounded-2xl border border-slate-200 bg-white p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Автор</p><h2 className="mt-2 text-base font-bold text-slate-900">{article.author}</h2><p className="mt-1 text-sm text-slate-500">{article.author_role ?? "Автор ByteNews"}</p><div className="mt-4 grid grid-cols-2 gap-3 text-center"><div className="rounded-xl bg-slate-50 p-3"><p className="font-mono text-lg font-bold">{article.views_count.toLocaleString("uk-UA")}</p><p className="text-[10px] text-slate-400">переглядів</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="font-mono text-lg font-bold">{article.comments_count}</p><p className="text-[10px] text-slate-400">коментарів</p></div></div></section></aside>}
          </div>
          {error && <p role="alert" className="fixed bottom-20 right-4 z-40 rounded-xl bg-rose-700 px-4 py-3 text-xs text-white shadow-lg">{error}</p>}
        </>}
      </main>
      <Footer />
    </div>
  );
}
