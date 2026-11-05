"use client";

import React, { useEffect } from "react";
import type { FlashNews } from "./types";

interface FlashNewsModalProps {
  item: FlashNews | null;
  onClose: () => void;
  relativeTime: (value: string | null) => string;
}

export function FlashNewsModal({ item, onClose, relativeTime }: FlashNewsModalProps) {
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="flash-title"
        className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-rose-600">
            <span className="size-2 animate-pulse rounded-full bg-rose-500" />
            Оперативна новина
          </span>
          <button
            onClick={onClose}
            aria-label="Закрити"
            className="grid size-9 place-items-center rounded-full bg-slate-100 text-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            ×
          </button>
        </div>
        <p className="mt-5 font-mono text-xs text-slate-400">
          {item.source_name} <span className="px-1">·</span>
          {item.time_label || relativeTime(item.published_at)}
        </p>
        <h2 id="flash-title" className="mt-3 text-2xl font-bold leading-tight tracking-[-.03em] text-slate-900">
          {item.title}
        </h2>
        {item.summary && <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>}
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Читати джерело <span aria-hidden="true">↗</span>
        </a>
      </section>
    </div>
  );
}
