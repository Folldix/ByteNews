"use client";

import { useEffect, useState } from "react";
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
      const updated = await votePoll(poll.id, optionId, poll);
      setPoll(updated);
    } catch {
      try {
        localStorage.setItem(`bytenews_poll_vote:${poll.id}`, optionId);
      } catch {}
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
    <section className="backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0] rounded-[16px] p-3.5 sm:p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)] flex flex-col gap-[12px] h-full">
      {/* Шапка опитування */}
      <div className="border-b border-[#e2e8f0] pb-[12px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-[8px]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M6.33334 7.99997V16.9999M6.33334 7.99997H2.42188C1.92405 7.99997 1.67539 7.99997 1.48525 8.10896C1.31799 8.20483 1.18211 8.3577 1.09689 8.54586C1 8.75977 1 9.04 1 9.60005V16.9999H6.33334M6.33334 7.99997V2.6001C6.33334 2.04005 6.33334 1.75981 6.43022 1.5459C6.51544 1.35774 6.65132 1.20487 6.81858 1.109C7.00872 1.00001 7.25739 1.00001 7.75521 1.00001H10.2441C10.7419 1.00001 10.9914 1.00001 11.1815 1.109C11.3488 1.20487 11.4842 1.35774 11.5694 1.5459C11.6663 1.75981 11.6667 2.04005 11.6667 2.6001V4.99998M6.33334 16.9999H11.6667M11.6667 16.9999L17 17V6.60007C17 6.04002 16.9997 5.75979 16.9028 5.54588C16.8176 5.35772 16.6826 5.20485 16.5154 5.10898C16.3252 4.99998 16.0756 4.99998 15.5778 4.99998H11.6667M11.6667 16.9999V4.99998" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono font-bold text-[11px] sm:text-[12px] text-[#1e293b] tracking-[0.6px] uppercase">
            ОПИТУВАННЯ ТИЖНЯ
          </span>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] text-[#64748b] tracking-[0.55px] shrink-0">
          {poll.total_votes} голосів
        </span>
      </div>

      {/* Питання */}
      <h3 className="font-sans font-bold text-[13px] sm:text-[14px] leading-[1.35] text-[#0f172a] w-full break-words">
        {poll.question}
      </h3>

      {/* Список варіантів */}
      <div className="flex flex-col gap-[8px] w-full flex-1">
        {poll.options.map((option) => {
          if (isVoted) {
            const isSelected = option.id === poll.selected_option_id;
            if (isSelected) {
              return (
                <div
                  key={option.id}
                  className="relative overflow-hidden rounded-[12px] border border-[#10b981] bg-[rgba(236,253,245,0.8)] px-[12px] py-[8px] min-h-[40px] flex items-center justify-between w-full gap-2"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-[rgba(16,185,129,0.25)] transition-all duration-500"
                    style={{ width: `${option.percentage}%` }}
                  />
                  <div className="relative flex items-center gap-[10px] min-w-0 flex-1">
                    <div className="relative size-[16px] shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 size-full">
                        <path d="M15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8Z" fill="#10B981" stroke="#10B981" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10.0002 10.0001" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1.00011 5.00012L3.66696 9.00011L9.00011 1.00011" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <span className="font-sans font-bold text-[12px] sm:text-[13px] text-[#1e293b] leading-tight break-words">
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
                className="relative overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-[rgba(255,255,255,0.5)] px-[12px] py-[8px] min-h-[40px] flex items-center justify-between w-full gap-2"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[rgba(148,163,184,0.15)] transition-all duration-500"
                  style={{ width: `${option.percentage}%` }}
                />
                <div className="relative flex items-center gap-[10px] min-w-0 flex-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8Z" stroke="#CBD5E1" />
                  </svg>
                  <span className="font-sans font-normal text-[12px] sm:text-[13px] text-[#334155] leading-tight break-words">
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
              className="w-full min-h-[42px] bg-white/80 hover:bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-[12px] px-[12px] py-[8px] flex items-center gap-[10px] text-left transition cursor-pointer active:scale-[0.99]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M15.5 8C15.5 12.1421 12.1421 15.5 8 15.5C3.85786 15.5 0.5 12.1421 0.5 8C0.5 3.85786 3.85786 0.5 8 0.5C12.1421 0.5 15.5 3.85786 15.5 8Z" stroke="#CBD5E1" />
              </svg>
              <span className="font-sans font-bold text-[12px] sm:text-[13px] text-[#1e293b] leading-tight break-words">
                {option.option_text}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
