"use client";

export type FontSize = "small" | "medium" | "large";

/** Класи Tailwind для тексту статті залежно від вибраного розміру. */
export const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: "text-sm leading-relaxed",
  medium: "text-base leading-relaxed",
  large: "text-lg leading-relaxed",
};

const OPTIONS: { value: FontSize; label: string; ariaLabel: string }[] = [
  { value: "small", label: "A-", ariaLabel: "Менший шрифт" },
  { value: "medium", label: "A", ariaLabel: "Звичайний шрифт" },
  { value: "large", label: "A+", ariaLabel: "Більший шрифт" },
];

type FontSizeControlProps = {
  value: FontSize;
  onChange: (size: FontSize) => void;
};

export function FontSizeControl({ value, onChange }: FontSizeControlProps) {
  return (
    <div
      role="group"
      aria-label="Розмір шрифту"
      className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.ariaLabel}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={
              "rounded-full px-2.5 py-1 font-mono text-xs transition-colors " +
              (isActive
                ? "bg-white font-bold text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-700")
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
