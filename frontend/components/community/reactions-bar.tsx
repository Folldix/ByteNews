"use client";

import { useState } from "react";

import { EMPTY_REACTION_COUNTS } from "./types";
import type { ReactionCounts, ReactionKind } from "./types";

type ReactionOption = {
  kind: ReactionKind;
  label: string;
  // Шлях до іконки в папці frontend/public
  iconSrc: string;
  // Розмір іконки в пікселях
  iconWidth: number;
  iconHeight: number;
  // Фон, обводка і колір тексту вибраної кнопки (кожна реакція має свій колір)
  activeClass: string;
};

const OPTIONS: ReactionOption[] = [
  {
    kind: "useful",
    label: "Корисно",
    iconSrc: "/icons/reactions/check.svg",
    iconWidth: 17.73,
    iconHeight: 8.49,
    activeClass: "border-[#00D492] bg-[#D0FAE5] font-bold text-[#004F3B]",
  },
  {
    kind: "fire",
    label: "Вогонь",
    iconSrc: "/icons/reactions/fire.svg",
    iconWidth: 11.67,
    iconHeight: 15.83,
    activeClass: "border-[#FF637E] bg-[#FFE4E6] font-bold text-[#8B0836]",
  },
  {
    kind: "insight",
    label: "Інсайт",
    iconSrc: "/icons/reactions/bulb.svg",
    iconWidth: 10,
    iconHeight: 16,
    activeClass: "border-[#FFB900] bg-[#FEF3C6] font-bold text-[#7B3306]",
  },
  {
    kind: "controversial",
    label: "Спірно",
    iconSrc: "/icons/reactions/question.svg",
    iconWidth: 16.67,
    iconHeight: 16.67,
    activeClass: "border-[#C27AFF] bg-[#F3E8FF] font-bold text-[#59168B]",
  },
];

type ReactionsBarProps = {
  // Початкові лічильники. Якщо не передати, усі почнуться з 0
  initialCounts?: ReactionCounts;
  // Яку реакцію користувач уже поставив (або null, якщо ще ніяку)
  initialSelected?: ReactionKind | null;
  // Викликається після кліку. Сюди пізніше підключу запит до бекенду
  onReact?: (kind: ReactionKind | null) => Promise<{ counts: ReactionCounts; selected: ReactionKind | null } | void> | { counts: ReactionCounts; selected: ReactionKind | null } | void;
};

export function ReactionsBar({
  initialCounts = EMPTY_REACTION_COUNTS,
  initialSelected = null,
  onReact,
}: ReactionsBarProps) {
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [selected, setSelected] = useState<ReactionKind | null>(initialSelected);

  async function handleClick(kind: ReactionKind) {
    // Запам'ятовуємо старий стан, щоб повернути його, якщо запит не вдасться
    const previousCounts = counts;
    const previousSelected = selected;

    // Повторний клік по вибраній реакції знімає її
    const nextSelected = selected === kind ? null : kind;

    const nextCounts = { ...counts };
    if (selected) nextCounts[selected] -= 1; // забираємо стару реакцію
    if (nextSelected) nextCounts[nextSelected] += 1; // додаємо нову

    // Оновлюємо екран одразу, не чекаючи відповіді сервера
    setCounts(nextCounts);
    setSelected(nextSelected);

    try {
      const serverState = await onReact?.(nextSelected);
      if (serverState) {
        setCounts(serverState.counts);
        setSelected(serverState.selected);
      }
    } catch {
      setCounts(previousCounts);
      setSelected(previousSelected);
    }
  }

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
      <h3 className="mb-3.5 text-[11px] font-bold uppercase leading-none tracking-[0.01em] text-[#475569]">
        ОЦІНІТЬ МАТЕРІАЛ:
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-4">
        {OPTIONS.map((option) => {
          const isActive = option.kind === selected;
          return (
            <button
              key={option.kind}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleClick(option.kind)}
              className={
                "flex h-10 sm:h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border px-2 sm:px-3 text-[10.5px] sm:text-[11px] leading-none transition-colors min-w-0 cursor-pointer " +
                (isActive
                  ? option.activeClass
                  : "border-[#E2E8F0] bg-white font-medium text-[#334155] hover:bg-slate-50")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={option.iconSrc}
                alt=""
                aria-hidden="true"
                style={{ width: option.iconWidth, height: option.iconHeight }}
              />
              <span className="truncate">
                {option.label} ({counts[option.kind]})
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
