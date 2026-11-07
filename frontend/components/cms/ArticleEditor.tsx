"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowDown, ArrowUp, Check, Eye, FileImage, Heading2, ImagePlus, LoaderCircle, MessageSquareQuote, Plus, Save, Send, Trash2, Type, Upload, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getStoredAccessToken } from "../../lib/api";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { editorHref } from "../../lib/routes";
import { AuthModal } from "../auth/AuthModal";
import {
  createEditorArticle,
  deleteEditorArticle,
  getEditorArticle,
  getEditorCategories,
  type ArticlePayload,
  type ArticleStatus,
  type Category,
  type EditorArticle,
  type EditorBlock,
  updateEditorArticle,
  uploadEditorImage,
} from "./cms-api";

const fieldClass = "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
const labelClass = "mb-2 block font-mono text-[11px] font-bold uppercase tracking-[.12em] text-slate-500";

function AutoResizeTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const styles = window.getComputedStyle(textarea);
    const borders = Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);
    textarea.style.height = `${textarea.scrollHeight + borders}px`;
  }, []);

  useEffect(() => { resize(); }, [props.value, resize]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      wrap="soft"
      onInput={(event) => { props.onInput?.(event); resize(); }}
      className={`${props.className ?? ""} wrap-long-text overflow-x-hidden overflow-y-hidden whitespace-pre-wrap`}
    />
  );
}

function makeBlock(type: EditorBlock["block_type"]): EditorBlock {
  switch (type) {
    case "heading": return { block_type: type, content_payload: { text: "", level: 2 } };
    case "image": return { block_type: type, content_payload: { url: "", alt: "", caption: "", credit: "" } };
    case "quote": return { block_type: type, content_payload: { text: "", author: "", source: "" } };
    case "code": return { block_type: type, content_payload: { code: "", language: "typescript" } };
    case "callout": return { block_type: type, content_payload: { text: "" } };
    default: return { block_type: "text", content_payload: { text: "" } };
  }
}

function payloadText(block: EditorBlock) {
  const payload = block.content_payload;
  if ("text" in payload) return payload.text.trim();
  if ("code" in payload) return payload.code.trim();
  if ("url" in payload) return payload.url.trim();
  return "";
}

function makeSlug(value: string) {
  const transliteration: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh", з: "z", и: "y", і: "i", ї: "yi", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya",
  };
  return value.toLowerCase().split("").map((character) => transliteration[character] ?? character)
    .join("").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 550);
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Сталася неочікувана помилка.";
}

export function ArticleEditor({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const { user, openAuthModal, setActiveView } = useAuth();
  const isReporter = user?.role === "reporter" || user?.role === "admin";
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [article, setArticle] = useState<EditorArticle | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [lead, setLead] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverCaption, setCoverCaption] = useState("");
  const [isHero, setIsHero] = useState(false);
  const [isPhotoReportage, setIsPhotoReportage] = useState(false);
  const [tagsText, setTagsText] = useState("");
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const effectiveSlug = slugTouched ? slug : makeSlug(title);
  const readingMinutes = useMemo(() => {
    const wordCount = [title, lead, ...blocks.map(payloadText)].join(" ").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [blocks, lead, title]);

  useEffect(() => {
    setToken(getStoredAccessToken());
  }, [user]);

  useEffect(() => {
    if (!user || !isReporter || !token) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      getEditorCategories(),
      articleId ? getEditorArticle(token, articleId) : Promise.resolve(null),
    ]).then(([categoryPage, savedArticle]) => {
      if (!active) return;
      setCategories(categoryPage.items);
      if (!articleId && categoryPage.items[0]) setCategoryId(categoryPage.items[0].id);
      if (savedArticle) {
        setArticle(savedArticle);
        setTitle(savedArticle.title);
        setSlug(savedArticle.slug);
        setSlugTouched(true);
        setLead(savedArticle.lead ?? "");
        setCategoryId(savedArticle.category_id);
        setCoverUrl(savedArticle.cover_image_url ?? "");
        setCoverCaption(savedArticle.cover_caption ?? "");
        setIsHero(savedArticle.is_hero);
        setIsPhotoReportage(savedArticle.is_photo_reportage);
        setTagsText(savedArticle.tags.join(", "));
        setBlocks(savedArticle.blocks.map(({ block_type, content_payload }) => ({ block_type, content_payload }) as EditorBlock));
      }
    }).catch((reason: unknown) => {
      if (active) setError(readableError(reason));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [articleId, isReporter, token, user]);

  const goToProfile = useCallback(() => {
    setActiveView("profile");
    router.push("/");
  }, [router, setActiveView]);

  const upload = async (file: File, target: string) => {
    if (!token) {
      setError("Увійдіть у профіль автора, щоб завантажити зображення.");
      return;
    }
    setUploading(target);
    setError("");
    try {
      const result = await uploadEditorImage(token, file);
      if (target === "cover") setCoverUrl(result.url);
      else {
        const index = Number(target);
        setBlocks((current) => current.map((block, blockIndex) => blockIndex === index && block.block_type === "image"
          ? { ...block, content_payload: { ...block.content_payload, url: result.url } }
          : block));
      }
      setNotice("Зображення завантажено.");
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setUploading(null);
    }
  };

  const updateBlock = (index: number, next: EditorBlock) => {
    setBlocks((current) => current.map((block, blockIndex) => blockIndex === index ? next : block));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setBlocks((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async (status: ArticleStatus) => {
    setError("");
    setNotice("");
    if (!token) { setError("Сесія не знайдена. Увійдіть знову."); return; }
    if (articleId && !article) { setError("Статтю не завантажено. Перевірте посилання або поверніться до кабінету автора."); return; }
    if (title.trim().length < 3) { setError("Заголовок має містити щонайменше 3 символи."); return; }
    if (!categoryId) { setError("Оберіть рубрику статті."); return; }
    if (slugTouched && slug.trim() && !/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(slug.trim())) {
      setError("Slug має містити латинські літери, цифри та дефіси."); return;
    }
    if (status === "published" && !lead.trim() && blocks.every((block) => !payloadText(block))) {
      setError("Для публікації додайте лід або хоча б один блок статті."); return;
    }
    const payload: ArticlePayload = {
      title: title.trim(),
      ...(slugTouched && slug.trim() ? { slug: slug.trim() } : {}),
      lead: lead.trim() || null,
      cover_image_url: coverUrl.trim() || null,
      cover_caption: coverCaption.trim() || null,
      category_id: categoryId,
      status,
      tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 30),
      blocks: blocks.filter((block) => payloadText(block)),
      is_hero: isHero,
      is_photo_reportage: isPhotoReportage,
    };
    setSaving(true);
    try {
      const saved = article
        ? await updateEditorArticle(token, article.id, payload)
        : await createEditorArticle(token, payload);
      setArticle(saved);
      setTitle(saved.title);
      setSlug(saved.slug);
      setSlugTouched(true);
      setNotice(status === "published" ? "Статтю опубліковано." : "Чернетку збережено.");
      if (!article) router.replace(editorHref(saved.id));
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setSaving(false);
    }
  };

  const removeArticle = async () => {
    if (!article || !token || !window.confirm("Видалити цю статтю назавжди?")) return;
    setSaving(true);
    try {
      await deleteEditorArticle(token, article.id);
      goToProfile();
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setSaving(false);
    }
  };

  const categoryName = categories.find((category) => category.id === categoryId)?.name ?? "Оберіть рубрику";

  if (!user) {
    return <EditorShell><Gate title="Увійдіть до профілю" message="Редактор статей доступний авторизованим авторам ByteNews."><button onClick={openAuthModal} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white">Увійти</button></Gate></EditorShell>;
  }
  if (!isReporter) {
    return <EditorShell><Gate title="Публікації доступні авторам" message="Спершу активуйте роль автора у своєму профілі, тоді зможете створювати й публікувати матеріали."><button onClick={goToProfile} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white">Відкрити профіль</button></Gate></EditorShell>;
  }
  if (!token || token === "demo-access-token") {
    return <EditorShell><Gate title="Потрібна активна сесія автора" message="Демо-профіль показує інтерфейс, але запис статей потребує входу через API."><button onClick={openAuthModal} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white">Увійти знову</button></Gate></EditorShell>;
  }

  return (
    <EditorShell>
      <main className="mx-auto w-full max-w-[1220px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        <button onClick={goToProfile} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900"><ArrowLeft size={15} /> До кабінету автора</button>
        <div className="mb-7 flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-emerald-700">ByteNews / редактор</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.04em] text-slate-950 sm:text-4xl">{article ? "Редагування статті" : "Нова публікація"}</h1><p className="mt-2 text-sm text-slate-500">Зберігайте чернетку під час роботи або публікуйте готовий матеріал.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            {article && <button onClick={removeArticle} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={15} /> Видалити</button>}
            <button onClick={() => setPreview((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"><Eye size={15} /> {preview ? "До редактора" : "Попередній перегляд"}</button>
            <button onClick={() => void save("draft")} disabled={saving || loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50"><Save size={15} /> Чернетка</button>
            <button onClick={() => void save("published")} disabled={saving || loading} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={15} /> : <Send size={15} />} Опублікувати</button>
          </div>
        </div>

        {error && <div role="alert" className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{error}</span><button aria-label="Закрити повідомлення" onClick={() => setError("")}><X size={16} /></button></div>}
        {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check size={16} />{notice}</div>}
        {loading ? <div className="grid min-h-80 place-items-center text-sm text-slate-500"><span className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={18} /> Завантажуємо редактор…</span></div> : (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                {preview ? <ArticlePreview title={title} lead={lead} coverUrl={coverUrl} coverCaption={coverCaption} blocks={blocks} category={categoryName} tags={tagsText} /> : <>
                  <label className={labelClass} htmlFor="article-title">Заголовок</label>
                  <AutoResizeTextarea id="article-title" value={title} onChange={(event) => { setTitle(event.target.value); if (!slugTouched) setSlug(makeSlug(event.target.value)); }} rows={2} maxLength={500} placeholder="Влучний заголовок вашої статті" className={`${fieldClass} resize-none text-2xl font-extrabold tracking-tight`} />
                  <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400"><span>Slug: {effectiveSlug || "згенерується із заголовка"}</span><span>{title.length}/500</span></div>
                  <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-slate-500">Налаштувати адресу вручну</summary><input aria-label="Адреса статті" value={slug} onChange={(event) => { setSlug(event.target.value); setSlugTouched(true); }} placeholder="slug-statty" className={`${fieldClass} mt-2 font-mono`} /></details>

                  <label className={`${labelClass} mt-6`} htmlFor="article-lead">Лід статті</label>
                  <AutoResizeTextarea id="article-lead" value={lead} onChange={(event) => setLead(event.target.value)} rows={3} maxLength={20000} placeholder="Коротко поясніть, про що цей матеріал і чому він важливий…" className={`${fieldClass} resize-none leading-6`} />

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div><label className={labelClass} htmlFor="article-category">Рубрика</label><select id="article-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={fieldClass}><option value="">Оберіть рубрику</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                    <div><label className={labelClass} htmlFor="article-tags">Теги</label><input id="article-tags" value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="React, TypeScript, AI" className={fieldClass} /><p className="mt-1 text-[10px] text-slate-400">Розділяйте комами, до 30 тегів.</p></div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <label className={labelClass}>Обкладинка</label>
                    <div className="grid gap-4 sm:grid-cols-[190px_1fr]">
                      <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                        {coverUrl ? <img src={coverUrl} alt="Попередній перегляд обкладинки" className="h-full w-full object-cover" /> : <span className="px-3 text-xs text-slate-400"><FileImage className="mx-auto mb-2" size={24} />JPG, PNG, GIF або WebP</span>}
                      </div>
                      <div className="space-y-3">
                        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"><Upload size={15} />{uploading === "cover" ? "Завантаження…" : "Завантажити обкладинку"}<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" disabled={!!uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, "cover"); event.currentTarget.value = ""; }} /></label>
                        <input value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} placeholder="Або вставте URL зображення" className={`${fieldClass} font-mono text-xs`} />
                        <input value={coverCaption} onChange={(event) => setCoverCaption(event.target.value)} placeholder="Підпис до обкладинки (необов’язково)" className={fieldClass} />
                        {coverUrl && <button onClick={() => setCoverUrl("")} className="text-xs font-semibold text-rose-600 hover:underline">Прибрати обкладинку</button>}
                      </div>
                    </div>
                  </div>
                </>}
              </div>

              {!preview && <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3"><div><p className={labelClass}>Тіло статті</p><h2 className="text-xl font-extrabold tracking-tight text-slate-900">Контентні блоки</h2></div><p className="font-mono text-[10px] text-slate-400">~{readingMinutes} хв читання · {blocks.length} блоків</p></div>
                {blocks.map((block, index) => <BlockCard key={`${block.block_type}-${index}`} block={block} index={index} total={blocks.length} uploading={uploading === String(index)} onChange={(next) => updateBlock(index, next)} onMove={(direction) => moveBlock(index, direction)} onUpload={(file) => void upload(file, String(index))} onRemove={() => setBlocks((current) => current.filter((_, blockIndex) => blockIndex !== index))} />)}
                <BlockToolbar onAdd={(type) => setBlocks((current) => [...current, makeBlock(type)])} />
              </div>}
            </section>

            <aside className="space-y-4 xl:sticky xl:top-28">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className={labelClass}>Стан публікації</p><div className="mt-3 flex items-center gap-2"><span className={`size-2 rounded-full ${article?.status === "published" ? "bg-emerald-500" : "bg-amber-400"}`} /><span className="text-sm font-bold text-slate-800">{article?.status === "published" ? "Опубліковано" : "Чернетка"}</span></div><p className="mt-3 text-xs leading-5 text-slate-500">{article?.published_at ? `Опубліковано ${new Date(article.published_at).toLocaleDateString("uk-UA")}` : "Зміни не з’являться у стрічці, доки не опублікуєте статтю."}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className={labelClass}>Параметри</p><dl className="space-y-3 text-xs"><div className="flex justify-between gap-2"><dt className="text-slate-500">Рубрика</dt><dd className="text-right font-semibold text-slate-800">{categoryName}</dd></div><div className="flex justify-between gap-2"><dt className="text-slate-500">Час читання</dt><dd className="font-semibold text-slate-800">~{readingMinutes} хв</dd></div><div className="flex justify-between gap-2"><dt className="text-slate-500">Теги</dt><dd className="font-semibold text-slate-800">{tagsText.split(",").filter((tag) => tag.trim()).length}/30</dd></div><div className="flex justify-between gap-2"><dt className="text-slate-500">Блоки</dt><dd className="font-semibold text-slate-800">{blocks.filter((block) => payloadText(block)).length}</dd></div></dl><div className="mt-4 space-y-3 border-t border-slate-100 pt-4"><label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-700"><input type="checkbox" checked={isHero} onChange={(event) => setIsHero(event.target.checked)} className="mt-1 accent-emerald-700" />Позначити як головну новину</label><label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-700"><input type="checkbox" checked={isPhotoReportage} onChange={(event) => setIsPhotoReportage(event.target.checked)} className="mt-1 accent-emerald-700" />Фоторепортаж</label></div></div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[.12em] text-emerald-800">Порада редактора</p><p className="mt-2 text-xs leading-5 text-emerald-950">Діліть текст на короткі логічні блоки. Додавайте заголовки, цитати та зображення, щоб читачеві було легше стежити за думкою.</p></div>
            </aside>
          </div>
        )}
      </main>
    </EditorShell>
  );
}

function EditorShell({ children }: { children: ReactNode }) {
  return <div className="cms-editor-root flex min-h-screen flex-col"><Header /><AuthModal />{children}<Footer /></div>;
}

function Gate({ title, message, children }: { title: string; message: string; children: ReactNode }) {
  return <main className="mx-auto grid min-h-[55vh] w-full max-w-3xl place-items-center px-5 py-16 text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><FileImage size={24} /></div><h1 className="mt-5 text-2xl font-extrabold text-slate-950">{title}</h1><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{message}</p><div className="mt-5">{children}</div></div></main>;
}

function BlockToolbar({ onAdd }: { onAdd: (type: EditorBlock["block_type"]) => void }) {
  const items: Array<{ type: EditorBlock["block_type"]; title: string; Icon: typeof Type }> = [
    { type: "text", title: "Текст", Icon: Type }, { type: "heading", title: "Заголовок", Icon: Heading2 }, { type: "image", title: "Зображення", Icon: ImagePlus },
    { type: "quote", title: "Цитата", Icon: MessageSquareQuote }, { type: "code", title: "Код", Icon: FileImage }, { type: "callout", title: "Виноска", Icon: Plus },
  ];
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"><p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">Додати блок</p><div className="flex flex-wrap gap-2">{items.map(({ type, title, Icon }) => <button key={type} type="button" onClick={() => onAdd(type)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"><Icon size={14} />{title}</button>)}</div></div>;
}

function BlockCard({ block, index, total, uploading, onChange, onMove, onUpload, onRemove }: {
  block: EditorBlock; index: number; total: number; uploading: boolean; onChange: (block: EditorBlock) => void;
  onMove: (direction: -1 | 1) => void; onUpload: (file: File) => void; onRemove: () => void;
}) {
  const textInput = (value: string, change: (value: string) => void, placeholder: string, rows = 3) => <AutoResizeTextarea value={value} onChange={(event) => change(event.target.value)} rows={rows} placeholder={placeholder} className={`${fieldClass} resize-none`} />;
  const setPayload = (payload: EditorBlock["content_payload"]) => onChange({ ...block, content_payload: payload } as EditorBlock);
  const names: Record<EditorBlock["block_type"], string> = { text: "Абзац", heading: "Заголовок", image: "Зображення", quote: "Цитата", code: "Фрагмент коду", callout: "Виноска" };
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3"><div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-md bg-white font-mono text-[10px] font-bold text-slate-500">{String(index + 1).padStart(2, "0")}</span><span className="font-mono text-[10px] font-bold uppercase tracking-[.1em] text-slate-600">{names[block.block_type]}</span></div><div className="flex items-center gap-1"><button aria-label="Перемістити блок вище" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-md p-1.5 text-slate-500 hover:bg-white disabled:opacity-30"><ArrowUp size={15} /></button><button aria-label="Перемістити блок нижче" disabled={index === total - 1} onClick={() => onMove(1)} className="rounded-md p-1.5 text-slate-500 hover:bg-white disabled:opacity-30"><ArrowDown size={15} /></button><button aria-label="Видалити блок" onClick={onRemove} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></div></div>
    <div className="space-y-3 p-4">
      {block.block_type === "text" && textInput(block.content_payload.text, (text) => setPayload({ text }), "Введіть текст абзацу…", 5)}
      {block.block_type === "heading" && <div className="flex gap-3"><select aria-label="Рівень заголовка" value={block.content_payload.level} onChange={(event) => setPayload({ ...block.content_payload, level: Number(event.target.value) as 2 | 3 })} className={`${fieldClass} w-28 font-mono`}><option value={2}>H2</option><option value={3}>H3</option></select>{textInput(block.content_payload.text, (text) => setPayload({ ...block.content_payload, text }), "Текст підзаголовка", 1)}</div>}
      {block.block_type === "image" && <><div className="flex flex-wrap gap-2"><label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Upload size={14} />{uploading ? "Завантаження…" : "Завантажити файл"}<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /></label><input value={block.content_payload.url} onChange={(event) => setPayload({ ...block.content_payload, url: event.target.value })} placeholder="URL зображення" className={`${fieldClass} min-w-48 flex-1`} /></div>{block.content_payload.url && <img src={block.content_payload.url} alt={block.content_payload.alt} className="max-h-72 w-full rounded-xl bg-slate-50 object-contain" />}<input value={block.content_payload.alt} onChange={(event) => setPayload({ ...block.content_payload, alt: event.target.value })} placeholder="Альтернативний опис для доступності" className={fieldClass} /><div className="grid gap-3 sm:grid-cols-2"><input value={block.content_payload.caption ?? ""} onChange={(event) => setPayload({ ...block.content_payload, caption: event.target.value })} placeholder="Підпис до фото" className={fieldClass} /><input value={block.content_payload.credit ?? ""} onChange={(event) => setPayload({ ...block.content_payload, credit: event.target.value })} placeholder="Автор / джерело фото" className={fieldClass} /></div></>}
      {block.block_type === "quote" && <>{textInput(block.content_payload.text, (text) => setPayload({ ...block.content_payload, text }), "Текст цитати…", 3)}<div className="grid gap-3 sm:grid-cols-2"><input value={block.content_payload.author ?? ""} onChange={(event) => setPayload({ ...block.content_payload, author: event.target.value })} placeholder="Автор цитати" className={fieldClass} /><input value={block.content_payload.source ?? ""} onChange={(event) => setPayload({ ...block.content_payload, source: event.target.value })} placeholder="Джерело" className={fieldClass} /></div></>}
      {block.block_type === "code" && <><div className="flex items-center gap-3"><label className="font-mono text-[10px] font-bold uppercase text-slate-500" htmlFor={`language-${index}`}>Мова</label><input id={`language-${index}`} value={block.content_payload.language} onChange={(event) => setPayload({ ...block.content_payload, language: event.target.value })} className={`${fieldClass} max-w-48 font-mono`} placeholder="typescript" /></div><textarea value={block.content_payload.code} onChange={(event) => setPayload({ ...block.content_payload, code: event.target.value })} rows={7} placeholder="Вставте фрагмент коду…" className={`${fieldClass} resize-y bg-slate-950 font-mono text-xs leading-5 text-emerald-100 placeholder:text-slate-500`} /></>}
      {block.block_type === "callout" && textInput(block.content_payload.text, (text) => setPayload({ text }), "Коротка важлива примітка…", 3)}
    </div>
  </section>;
}

function ArticlePreview({ title, lead, coverUrl, coverCaption, blocks, category, tags }: { title: string; lead: string; coverUrl: string; coverCaption: string; blocks: EditorBlock[]; category: string; tags: string }) {
  return <article className="wrap-long-text mx-auto max-w-3xl"><p className="font-mono text-[10px] font-bold uppercase tracking-[.15em] text-emerald-700">{category}</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.04em] text-slate-950">{title || "Заголовок статті"}</h2>{lead && <p className="mt-4 text-lg leading-8 text-slate-600">{lead}</p>}{coverUrl && <figure className="mt-7"><img src={coverUrl} alt="" className="max-h-[420px] w-full rounded-2xl object-cover" />{coverCaption && <figcaption className="mt-2 text-center text-xs text-slate-500">{coverCaption}</figcaption>}</figure>}<div className="prose prose-slate mt-8 max-w-none">{blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}</div>{tags && <div className="mt-8 flex flex-wrap gap-2">{tags.split(",").filter(Boolean).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] text-slate-600">#{tag.trim()}</span>)}</div>}</article>;
}

function PreviewBlock({ block }: { block: EditorBlock }) {
  if (block.block_type === "text") return <p className="whitespace-pre-wrap leading-7 text-slate-700">{block.content_payload.text}</p>;
  if (block.block_type === "heading") return block.content_payload.level === 2 ? <h2 className="mt-8 text-2xl font-bold">{block.content_payload.text}</h2> : <h3 className="mt-6 text-xl font-bold">{block.content_payload.text}</h3>;
  if (block.block_type === "image") return <figure>{block.content_payload.url && <img src={block.content_payload.url} alt={block.content_payload.alt} className="max-h-96 w-full rounded-xl object-contain" />}{block.content_payload.caption && <figcaption className="mt-2 text-center text-xs text-slate-500">{block.content_payload.caption}</figcaption>}</figure>;
  if (block.block_type === "quote") return <blockquote className="border-l-4 border-emerald-500 pl-5 italic text-slate-700"><p>{block.content_payload.text}</p>{(block.content_payload.author || block.content_payload.source) && <footer className="mt-2 text-xs not-italic text-slate-500">{[block.content_payload.author, block.content_payload.source].filter(Boolean).join(" · ")}</footer>}</blockquote>;
  if (block.block_type === "code") return <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-100"><code>{block.content_payload.code}</code></pre>;
  return <aside className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">{block.content_payload.text}</aside>;
}
