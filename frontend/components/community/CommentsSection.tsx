"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { MessageSquare, Reply, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { createComment, getComments } from "./api";
import type { CommentNode } from "./api";

function Thread({ comment, depth, onReply }: { comment: CommentNode; depth: number; onReply: (comment: CommentNode) => void }) {
  return (
    <article className={`border-l pl-2.5 sm:pl-4 ${depth ? "ml-1 sm:ml-2 border-emerald-200" : "border-slate-200"}`}>
      <div className="rounded-xl bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2"><span className="grid size-8 place-items-center overflow-hidden rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-500">{comment.author_avatar_url ? <img src={comment.author_avatar_url} alt="" className="size-full object-cover"/> : comment.author_name.slice(0, 2).toUpperCase()}</span><span className="text-xs font-bold text-slate-800">{comment.author_name}</span><time className="font-mono text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleString("uk-UA")}</time></div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.text}</p>
        <button type="button" onClick={() => onReply(comment)} className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"><Reply className="size-3.5"/>Відповісти</button>
      </div>
      {comment.replies.length > 0 && <div className="mt-3 space-y-3">{comment.replies.map((reply) => <Thread key={reply.id} comment={reply} depth={depth + 1} onReply={onReply}/>)}</div>}
    </article>
  );
}

export function CommentsSection({ articleId }: { articleId: string }) {
  const { user, openAuthModal } = useAuth();
  const [items, setItems] = useState<CommentNode[]>([]);
  const [total, setTotal] = useState(0);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<CommentNode | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const page = await getComments(articleId);
      setItems(page.items);
      setTotal(page.total);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося завантажити коментарі.");
    }
  }, [articleId]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) { openAuthModal(); return; }
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await createComment(articleId, text, replyTo?.id);
      setText("");
      setReplyTo(null);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося опублікувати коментар.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="comments" className="mt-12 scroll-mt-28">
      <div className="mb-5 flex items-center gap-2"><MessageSquare className="size-5 text-emerald-700"/><h2 className="text-xl font-extrabold tracking-tight">Обговорення</h2><span className="rounded-full bg-slate-200 px-2 py-1 font-mono text-[10px] text-slate-600">{total}</span></div>
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
        {replyTo && <div className="mb-2 flex items-center justify-between text-xs text-slate-500">Відповідь для {replyTo.author_name}<button type="button" onClick={() => setReplyTo(null)} className="font-semibold text-emerald-700">Скасувати</button></div>}
        <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={5000} rows={3} placeholder={user ? "Поділіться думкою або поставте запитання…" : "Увійдіть, щоб долучитися до обговорення"} className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-emerald-500" onFocus={() => { if (!user) openAuthModal(); }} />
        <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] text-slate-400">{text.length}/5000</span><button disabled={!text.trim() || submitting} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"><Send className="size-3.5"/>{submitting ? "Надсилаємо…" : "Надіслати"}</button></div>
        {error && <p role="alert" className="mt-3 text-xs text-rose-700">{error}</p>}
      </form>
      <div className="mt-5 space-y-4">{items.map((comment) => <Thread key={comment.id} comment={comment} depth={0} onReply={setReplyTo}/>)}</div>
      {!items.length && <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Ще немає коментарів. Будьте першими.</p>}
    </section>
  );
}
