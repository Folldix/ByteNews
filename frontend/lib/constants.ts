import type { CatalogItem } from "../components/feed/types";

/**
 * Єдиний реєстр рубрик новинного порталу ByteNews
 */
export const CATEGORIES: CatalogItem[] = [
  { id: "all", name: "Всі новини", slug: "" },
  { id: "ai", name: "Штучний Інтелект", slug: "ai" },
  { id: "development", name: "Розробка", slug: "development" },
  { id: "security", name: "Кібербезпека", slug: "cybersecurity" },
  { id: "gamedev", name: "GameDev & 3D", slug: "gamedev-3d" },
  { id: "hardware", name: "Залізо & Чіпи", slug: "hardware-chips" },
  { id: "startups", name: "Стартапи & Ринок", slug: "startups-market" },
];

/**
 * Популярні технічні теми (теги) для швидкої фільтрації
 */
export const DEFAULT_TOPICS: string[] = [
  "Claude",
  "React",
  "TypeScript",
  "Linux",
  "ZeroDay",
  "UnrealEngine",
  "Blackwell",
  "Monolith",
];

/**
 * Дизайн-стилі (акцентна смужка та бейдж) для відповідної рубрики
 */
export function getCategoryDesign(category: string | null): { strip: string; badge: string } {
  const value = category?.toLowerCase() ?? "";
  if (value.includes("інтелект") || value === "ші" || value.includes("ai")) {
    return {
      strip: "bg-[#10b981]",
      badge: "bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.35)] text-[#059669]",
    };
  }
  if (value.includes("кібер") || value.includes("безпек")) {
    return {
      strip: "bg-[#f43f5e]",
      badge: "bg-[rgba(244,63,94,0.12)] border-[rgba(244,63,94,0.35)] text-[#e11d48]",
    };
  }
  if (value.includes("заліз") || value.includes("чіп")) {
    return {
      strip: "bg-[#8b5cf6]",
      badge: "bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.35)] text-[#7c3aed]",
    };
  }
  if (value.includes("game") || value.includes("3d") || value.includes("ігр")) {
    return {
      strip: "bg-[#f59e0b]",
      badge: "bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.35)] text-[#d97706]",
    };
  }
  if (value.includes("стартап") || value.includes("ринок")) {
    return {
      strip: "bg-[#14b8a6]",
      badge: "bg-[rgba(20,184,166,0.12)] border-[rgba(20,184,166,0.35)] text-[#0d9488]",
    };
  }
  if (value.includes("розроб") || value.includes("dev")) {
    return {
      strip: "bg-[#0284c7]",
      badge: "bg-[rgba(2,132,199,0.12)] border-[rgba(2,132,199,0.35)] text-[#0369a1]",
    };
  }
  return {
    strip: "bg-[#0284c7]",
    badge: "bg-[rgba(2,132,199,0.12)] border-[rgba(2,132,199,0.35)] text-[#0369a1]",
  };
}
