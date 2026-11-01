"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getActivePoll, votePoll } from "./api";
import type { Poll } from "./api";

export function CommunityPoll() {
  const { user, openAuthModal } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getActivePoll().then((result) => {
      if (!active) return;
      setPoll(result);
      setSelected(result?.selected_option_id ?? "");
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function submitVote() {
    if (!poll || !selected || busy) return;
    if (!user) {
      openAuthModal();
      setMessage("Увійдіть, щоб проголосувати.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await votePoll(poll.id, selected);
      setPoll(result);
      setSelected(result.selected_option_id ?? selected);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не вдалося зафіксувати голос.");
    } finally {
      setBusy(false);
    }
  }

  if (!poll) return null;
  const showResults = !!poll.selected_option_id;
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-24px_rgba(15,23,42,.25)]">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[.17em] text-emerald-700">Спільнота / опитування</p>
      <h2 className="mt-2 text-base font-bold leading-6 text-slate-900">{poll.question}</h2>
      <div className="mt-4 space-y-2.5">{poll.options.map((option) => <label key={option.id} className={`relative block overflow-hidden rounded-xl border px-3 py-3 text-sm ${selected === option.id ? "border-emerald-300" : "border-slate-200"} ${showResults ? "cursor-default" : "cursor-pointer hover:border-slate-300"}`}>
        {showResults && <span className="absolute inset-y-0 left-0 bg-emerald-50 transition-[width] duration-500" style={{ width: `${option.percentage}%` }} />}
        <span className="relative flex items-center justify-between gap-3"><span className="flex items-center gap-2"><input type="radio" name={`poll-${poll.id}`} checked={selected === option.id} disabled={showResults} onChange={() => setSelected(option.id)} className="accent-emerald-600" />{option.option_text}</span>{showResults && <span className="font-mono text-xs font-bold text-slate-600">{option.percentage}%</span>}</span>
      </label>)}</div>
      {message && <p role="status" className="mt-3 text-xs text-rose-700">{message}</p>}
      {!showResults && <button type="button" disabled={!selected || busy} onClick={() => void submitVote()} className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Голосуємо…" : "Проголосувати"}</button>}
      {showResults && <p className="mt-3 font-mono text-[10px] text-slate-400">{poll.total_votes.toLocaleString("uk-UA")} голосів · ваш вибір враховано</p>}
    </section>
  );
}
