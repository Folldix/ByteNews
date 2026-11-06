"use client";

import { useEffect, useState } from "react";

export function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Перемикання комбінацією Shift + G
      if (e.shiftKey && (e.key === "G" || e.key === "g")) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Плаваюча кнопка перемикання сітки (прихована на мобільних і планшетах) */}
      <div className="hidden lg:block fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-mono text-xs font-semibold shadow-lg transition-all cursor-pointer backdrop-blur-md ${
            visible
              ? "bg-rose-600 text-white shadow-rose-500/25 ring-2 ring-rose-400"
              : "bg-white/95 text-slate-700 hover:bg-white hover:text-slate-900 border border-slate-200 shadow-slate-900/10"
          }`}
          title="Гаряча клавіша: Shift + G"
          aria-label="Перемкнути видимість 12-колонкової сітки"
        >
          <span>📐</span>
          <span>Сітка 12 col</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${
              visible ? "bg-rose-700/80 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            Shift+G
          </span>
        </button>
      </div>

      {/* Напівпрозорий оверлей 12 колонок */}
      {visible && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
          <div className="w-full max-w-[1296px] px-4 sm:px-6 lg:px-8 mx-auto h-full">
            <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-4 sm:gap-6 h-full">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-rose-500/10 border-x border-rose-500/25 h-full flex justify-center pt-20"
                >
                  <span className="font-mono text-[10px] font-bold text-rose-600/70 bg-white/90 rounded px-1.5 py-0.5 h-fit shadow-xs border border-rose-200">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
