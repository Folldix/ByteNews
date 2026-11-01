"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const SUGGESTED_TOPICS = ["Штучний Інтелект", "Розробка", "Кібербезпека", "GameDev & 3D", "Залізо & Чіпи", "Стартапи & Ринок"];

export function ReporterVerificationModal({ onClose }: { onClose: () => void }) {
  const { user, upgradeToReporter } = useAuth();
  const [handle, setHandle] = useState(user?.handle ?? "");
  const [roleTitle, setRoleTitle] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await upgradeToReporter({ handle, role_title: roleTitle, topics });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося оновити профіль.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="reporter-title" className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-emerald-700">ByteNews / Reporter</p><h2 id="reporter-title" className="mt-2 text-2xl font-extrabold tracking-tight">Стати автором</h2><p className="mt-2 text-sm leading-6 text-slate-600">Підтвердіть публічний нікнейм, підпис і теми, про які плануєте писати.</p></div>
          <button type="button" onClick={onClose} aria-label="Закрити" className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xl text-slate-500 hover:bg-slate-200">×</button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-semibold text-slate-700">Нікнейм
            <input required minLength={3} maxLength={80} pattern="[A-Za-z0-9_]+" value={handle} onChange={(event) => setHandle(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-emerald-500" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Посада або авторський підпис
            <input required minLength={2} maxLength={150} value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} placeholder="Наприклад, Backend-розробник" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <fieldset><legend className="mb-2 text-xs font-semibold text-slate-700">Теми публікацій (оберіть одну або кілька)</legend><div className="flex flex-wrap gap-2">{SUGGESTED_TOPICS.map((topic) => <label key={topic} className={`cursor-pointer rounded-full border px-3 py-2 text-xs transition ${topics.includes(topic) ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}><input className="sr-only" type="checkbox" checked={topics.includes(topic)} onChange={() => setTopics((selected) => selected.includes(topic) ? selected.filter((item) => item !== topic) : [...selected, topic])} />{topic}</label>)}</div></fieldset>
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
          <button disabled={saving || topics.length === 0} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Зберігаємо…" : "Підтвердити профіль автора"}</button>
        </form>
      </section>
    </div>
  );
}
