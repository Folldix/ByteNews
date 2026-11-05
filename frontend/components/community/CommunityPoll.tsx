"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getActivePoll, votePoll, DEFAULT_DEMO_POLL } from "./api";
import type { Poll } from "./api";

export function CommunityPoll() {
  const [poll, setPoll] = useState<Poll | null>(DEFAULT_DEMO_POLL);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getActivePoll()
      .then((result) => {
        if (!active) return;
        setPoll(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function handleVote(optionId: string) {
    if (!poll || busy || poll.selected_option_id) return;
    setBusy(true);
    try {
      const updated = await votePoll(poll.id, optionId);
      setPoll(updated);
    } catch {
      const updatedOptions = poll.options.map((opt) => ({
        ...opt,
        votes_count: opt.id === optionId ? opt.votes_count + 1 : opt.votes_count,
      }));
      const newTotal = poll.total_votes + 1;
      setPoll({
        ...poll,
        total_votes: newTotal,
        selected_option_id: optionId,
        options: updatedOptions.map((opt) => ({
          ...opt,
          percentage: Math.round((opt.votes_count / newTotal) * 100),
        })),
      });
    } finally {
      setBusy(false);
    }
  }

  if (!poll) return null;
  const isVoted = !!poll.selected_option_id;

  return (
    <section className="backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0] rounded-[16px] p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)] flex flex-col gap-[12px]">
      {/* Шапка опитування */}
      <div className="border-b border-[#e2e8f0] pt-[4px] pb-[12px] flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <svg viewBox="0 0 16 16" fill="none" className="size-[16px] text-[#10b981] shrink-0" aria-hidden="true">
            <path d="M2 13V8M6 13V3M10 13V6M14 13V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono font-bold text-[12px] text-[#1e293b] tracking-[0.6px] uppercase">
            Опитування тижня
          </span>
        </div>
        <span className="font-mono font-normal text-[11px] text-[#64748b]">
          {poll.total_votes} голосів
        </span>
      </div>

      {/* Питання */}
      <h3 className="font-sans font-bold text-[13px] leading-[1.35] text-[#0f172a] tracking-[0.2px]">
        {poll.question}
      </h3>

      {/* Список варіантів */}
      <div className="flex flex-col gap-[8px]">
        {poll.options.map((option) => {
          if (isVoted) {
            const isSelected = option.id === poll.selected_option_id;
            if (isSelected) {
              return (
                <div
                  key={option.id}
                  className="relative overflow-hidden rounded-[12px] border border-[#10b981] bg-[#ecfdf5]/80 px-[12px] py-[9px] flex items-center justify-between gap-2"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-[#10b981]/20 transition-all duration-500"
                    style={{ width: `${option.percentage}%` }}
                  />
                  <div className="relative flex items-center gap-[10px] min-w-0">
                    <div className="size-[16px] rounded-full bg-[#10b981] text-white grid place-items-center shrink-0">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    <span className="font-sans font-bold text-[13px] text-[#1e293b] truncate">
                      {option.option_text}
                    </span>
                  </div>
                  <span className="relative font-mono font-bold text-[12px] text-[#047857] shrink-0">
                    {option.percentage}%
                  </span>
                </div>
              );
            }
            return (
              <div
                key={option.id}
                className="relative overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white/50 px-[12px] py-[9px] flex items-center justify-between gap-2"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[#94a3b8]/15 transition-all duration-500"
                  style={{ width: `${option.percentage}%` }}
                />
                <div className="relative flex items-center gap-[10px] min-w-0">
                  <div className="size-[16px] rounded-full border border-[#cbd5e1] shrink-0" />
                  <span className="font-sans font-normal text-[13px] text-[#334155] truncate">
                    {option.option_text}
                  </span>
                </div>
                <span className="relative font-mono font-bold text-[12px] text-[#64748b] shrink-0">
                  {option.percentage}%
                </span>
              </div>
            );
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={busy}
              onClick={() => handleVote(option.id)}
              className="w-full bg-white/80 hover:bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-[12px] px-[12px] py-[9px] flex items-center gap-[10px] text-left transition cursor-pointer"
            >
              <div className="size-[16px] rounded-full border border-[#cbd5e1] bg-white shrink-0" />
              <span className="font-sans font-bold text-[13px] text-[#1e293b]">
                {option.option_text}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
