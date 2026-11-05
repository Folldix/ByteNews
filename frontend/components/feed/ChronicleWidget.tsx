"use client";

import React from "react";
import { FALLBACK_FLASH_NEWS } from "./feed-api";
import type { FlashNews } from "./types";

interface ChronicleWidgetProps {
  items: FlashNews[];
  onSelect: (item: FlashNews) => void;
}

export function ChronicleWidget({ items, onSelect }: ChronicleWidgetProps) {
  const displayItems = items.length ? items : FALLBACK_FLASH_NEWS;

  return (
    <section className="backdrop-blur-[10px] bg-white/82 border border-[#e2e8f0] rounded-[16px] px-[15px] py-[10px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)]">
      {/* Шапка хроніки */}
      <div className="border-b border-[#e2e8f0] pt-[10px] pb-[14px] flex items-center justify-between">
        <div className="inline-flex items-center gap-[8px]">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <circle cx="4" cy="4" r="4" fill="#10B981" />
          </svg>
          <h2 className="font-mono font-bold text-[12px] leading-none text-[#1e293b] tracking-[0.6px] uppercase">
            ХРОНІКА ПОДІЙ
          </h2>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-[8px] py-[2px] font-mono font-medium text-[10px] leading-none text-[#047857] tracking-[0.5px]">
          В реальному часі
        </span>
      </div>

      {/* Елементи подій */}
      <div className="pt-[14px]">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const timeStr =
            item.time_label ||
            (item.published_at
              ? new Date(item.published_at).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
              : "Щойно");
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex gap-[12px] items-stretch text-left w-full group cursor-pointer"
            >
              {/* Ліва колонка пінів */}
              <div className="flex flex-col items-center pt-[3px] shrink-0">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <circle
                    cx="4"
                    cy="4"
                    r="3"
                    className="fill-white stroke-[#10B981] stroke-2 transition-colors duration-150 ease-out group-hover:fill-[#10B981]"
                  />
                </svg>
                {!isLast && <div className="w-[2px] flex-1 bg-[#e2e8f0] my-[2px]" />}
              </div>

              {/* Права колонка тексту */}
              <div className={`flex-1 ${!isLast ? "pb-[20px]" : "pb-[10px]"}`}>
                <div className="flex items-center gap-[5px] flex-wrap leading-none">
                  <span className="font-mono font-bold text-[11px] leading-none text-[#334155] tracking-[0.55px]">
                    {timeStr}
                  </span>
                  <span className="font-mono font-bold text-[11px] leading-none text-[#94a3b8]">•</span>
                  <span className="font-mono font-normal text-[11px] leading-none text-[#64748b]">
                    {item.category || item.source_name}
                  </span>
                  {item.is_important && (
                    <span className="inline-flex items-center justify-center bg-[#ffe4e6] text-[#be123c] font-mono font-bold text-[9px] leading-none px-[8px] py-[2px] rounded-[16px] uppercase tracking-[0.45px]">
                      ВАЖЛИВО
                    </span>
                  )}
                </div>
                <p className="mt-[6px] font-sans font-normal text-[12px] leading-[1.4] text-[#1e293b] transition-colors duration-150 ease-out group-hover:text-[#047857]">
                  {item.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
