import type { Article, CatalogItem, FlashNews, Page } from "./types";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const FALLBACK_CATEGORIES: CatalogItem[] = [
  { id: "ai", name: "Штучний Інтелект", slug: "ai" },
  { id: "development", name: "Розробка", slug: "development" },
  { id: "cybersecurity", name: "Кібербезпека", slug: "cybersecurity" },
  { id: "gamedev-3d", name: "GameDev & 3D", slug: "gamedev-3d" },
  { id: "hardware-chips", name: "Залізо & Чіпи", slug: "hardware-chips" },
  { id: "startups-market", name: "Стартапи & Ринок", slug: "startups-market" },
];

export const FALLBACK_TAGS: CatalogItem[] = [
  { id: "claude", name: "Claude", slug: "claude" },
  { id: "react", name: "React", slug: "react" },
  { id: "typescript", name: "TypeScript", slug: "typescript" },
  { id: "linux", name: "Linux", slug: "linux" },
  { id: "zeroday", name: "ZeroDay", slug: "zeroday" },
  { id: "unrealengine", name: "UnrealEngine", slug: "unrealengine" },
  { id: "blackwell", name: "Blackwell", slug: "blackwell" },
  { id: "monolith", name: "Monolith", slug: "monolith" },
];

export const FALLBACK_POPULAR: Article[] = [
  {
    id: "pop-1",
    title: "OpenAI готує реліз GPT-5 з нативною підтримкою мультимодальних агентів",
    slug: "openai-gpt-5-multimodal-agents",
    lead: "Аналіз витоків та технічних специфікацій майбутньої флагманської моделі OpenAI з динамічним розподілом обчислень.",
    cover_image_url: null,
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 5,
    views_count: 3150,
    likes_count: 120,
    comments_count: 34,
    published_at: new Date(Date.now() - 3600_000).toISOString(),
    time_label: "1 год тому",
    category: "ШІ",
    author: "Олександр Коваленко",
    author_role: "Head of AI",
    tags: ["OpenAI", "Claude"],
  },
  {
    id: "pop-2",
    title: "Огляд архітектури NVIDIA Blackwell: що зміниться для локального інференсу",
    slug: "nvidia-blackwell-architecture-overview",
    lead: "Тестування тензорних ядер п'ятого покоління та оновленого рушія Transformer Engine у робочих станціях.",
    cover_image_url: null,
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 7,
    views_count: 2840,
    likes_count: 95,
    comments_count: 29,
    published_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    time_label: "3 год тому",
    category: "Залізо",
    author: "Ігор Василенко",
    author_role: "Hardware Lead",
    tags: ["Blackwell", "GPU"],
  },
  {
    id: "pop-3",
    title: "Чому ми відмовилися від мікросервісів на користь модульного моноліту",
    slug: "why-we-abandoned-microservices-for-modular-monolith",
    lead: "Практичний досвід спрощення інфраструктури, скорочення часу деплою та вирішення проблем із розподіленими транзакціями.",
    cover_image_url: null,
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 8,
    views_count: 2190,
    likes_count: 88,
    comments_count: 64,
    published_at: new Date(Date.now() - 22 * 3600_000).toISOString(),
    time_label: "Вчора, 18:20",
    category: "Розробка",
    author: "Максим Шевченко",
    author_role: "Backend Architect",
    tags: ["Monolith", "TypeScript"],
  },
];

export const FALLBACK_FLASH_NEWS: FlashNews[] = [
  {
    id: "fn-1",
    title: "TSMC почала тестове виробництво 2-нм чіпів на заводі в Баошані",
    summary: "Новий техпроцес N2 використовує архітектуру транзисторів GAAFET (Gate-All-Around) для зменшення витоку струму.",
    source_name: "Залізо",
    url: "https://digitimes.com",
    published_at: new Date().toISOString(),
    time_label: "12:45",
    category: "Залізо",
    is_important: false,
  },
  {
    id: "fn-2",
    title: "Виявлено критичну вразливість нульового дня в популярному пакеті",
    summary: "Вразливість дозволяє віддалене виконання коду через некоректну валідацію вхідних даних у мережевому парсері.",
    source_name: "Безпека",
    url: "https://bleepingcomputer.com",
    published_at: new Date().toISOString(),
    time_label: "11:32",
    category: "Безпека",
    is_important: true,
  },
  {
    id: "fn-3",
    title: "Реліз Docker Desktop 4.30 з нативною підтримкою Wasm-контейнерів",
    summary: "Оновлений рушій дозволяє запускати WebAssembly-модулі поруч зі стандартними OCI-образами без додаткових плагінів.",
    source_name: "Розробка",
    url: "https://docker.com",
    published_at: new Date().toISOString(),
    time_label: "10:15",
    category: "Розробка",
    is_important: false,
  },
  {
    id: "fn-4",
    title: "Mistral AI залучив додаткові €600 млн інвестицій при оцінці в €6 млрд",
    summary: "Кошти підуть на розширення європейської обчислювальної інфраструктури та розробку нових відкритих мовних моделей.",
    source_name: "Стартапи",
    url: "https://techcrunch.com",
    published_at: new Date().toISOString(),
    time_label: "09:05",
    category: "Стартапи",
    is_important: false,
  },
  {
    id: "fn-5",
    title: "GitHub Copilot Workspace тепер доступний для всіх розробників у бета-режимі",
    summary: "Середовище дозволяє переходити від опису задачі в Issue до готового PR з покроковим планом реалізації.",
    source_name: "ШІ",
    url: "https://github.blog",
    published_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
    time_label: "Вчора",
    category: "ШІ",
    is_important: false,
  },
  {
    id: "fn-6",
    title: "Unity анонсувала нову систему ціноутворення після критики спільноти",
    summary: "Компанія скасувала спірний Runtime Fee та повертається до класичної підписної моделі для ігрових студій.",
    source_name: "Ігри",
    url: "https://gamesindustry.biz",
    published_at: new Date(Date.now() - 26 * 3600_000).toISOString(),
    time_label: "Вчора",
    category: "Ігри",
    is_important: false,
  },
];

export const FALLBACK_ARTICLES: Article[] = [
  {
    id: "art-hero",
    title: "Чому нова архітектура Claude 3.7 Sonnet змінює правила гри в генерації коду",
    slug: "claude-3-7-sonnet-architecture",
    lead: "Аналіз гібридного міркування, бенчмарків SWE-bench та практичного досвіду інтеграції нової моделі в автономні середовища розробки та реальні пайплайни.",
    cover_image_url: null,
    is_hero: true,
    is_photo_reportage: false,
    read_time_min: 6,
    views_count: 4120,
    likes_count: 142,
    comments_count: 18,
    published_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    time_label: "2 год тому",
    category: "Штучний Інтелект",
    author: "Олександр Коваленко",
    author_role: "Head of AI",
    tags: ["Claude", "React", "TypeScript"],
  },
  ...FALLBACK_POPULAR,
  {
    id: "art-ts",
    title: "Глибокий розбір TypeScript 5.8: як нові перевірки типів прискорюють компіляцію на 40%",
    slug: "typescript-5-8-deep-dive",
    lead: "Огляд оптимізацій типізації, прапорця --isolatedDeclarations та нових можливостей звуження типів у складних генериках.",
    cover_image_url: null,
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 8,
    views_count: 3110,
    likes_count: 98,
    comments_count: 12,
    published_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
    time_label: "5 год тому",
    category: "Розробка",
    author: "Олександр Коваленко",
    author_role: "Head of AI",
    tags: ["TypeScript", "React"],
  },
  {
    id: "art-sec",
    title: "Кібератака на постачальників OpenSource: як захистити сучасний ланцюг постачання",
    slug: "cyberattack-opensource-supply-chain",
    lead: "Аналіз нещодавніх інцидентів з шкідливими пакетами у реєстрах npm та PyPI: практичні поради щодо запобігання компрометації продакшн-систем.",
    cover_image_url: null,
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 7,
    views_count: 2890,
    likes_count: 85,
    comments_count: 9,
    published_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
    time_label: "8 год тому",
    category: "Кібербезпека",
    author: "Тарас Мельник",
    author_role: "Security Engineer",
    tags: ["ZeroDay", "Linux"],
  },
  {
    id: "art-rust",
    title: "Rust 1.85 у продакшені: асинхронні замикання та досвід переходу сервісів з Go",
    slug: "rust-1-85-async-closures",
    lead: "Практичний розбір використання async closures, стабілізація корисних трейтів та реальні заміри споживання пам'яті високонавантаженого сервісу.",
    cover_image_url: null,
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 9,
    views_count: 2450,
    likes_count: 73,
    comments_count: 14,
    published_at: new Date(Date.now() - 12 * 3600_000).toISOString(),
    time_label: "12 год тому",
    category: "Розробка",
    author: "Максим Шевченко",
    author_role: "Backend Architect",
    tags: ["Linux", "TypeScript"],
  },
  {
    id: "art-game",
    title: "Еволюція рендерингу в Unreal Engine 5.5: Nanite для скелетних мешів у динамічних сценах",
    slug: "unreal-engine-5-5-nanite-skeletal-mesh",
    lead: "Як технологія віртуалізованої геометрії спрощує оптимізацію анімованих моделей та які компроміси виникають при роботі з деформаціями.",
    cover_image_url: null,
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 8,
    views_count: 1720,
    likes_count: 51,
    comments_count: 6,
    published_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
    time_label: "Вчора",
    category: "GameDev & 3D",
    author: "Денис Бойко",
    author_role: "3D Graphics Programmer",
    tags: ["UnrealEngine", "Blackwell"],
  },
];

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBase}/api/v1${path}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function getCategories(signal?: AbortSignal) {
  try {
    return await getJson<{ items: CatalogItem[] }>("/categories", signal);
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    return { items: FALLBACK_CATEGORIES };
  }
}

export async function getTags(signal?: AbortSignal) {
  try {
    return await getJson<{ items: CatalogItem[] }>("/tags", signal);
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    return { items: FALLBACK_TAGS };
  }
}

export async function getArticles(options: {
  category?: string;
  tag?: string;
  query?: string;
  sort?: "latest" | "popular";
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}): Promise<Page<Article>> {
  const params = new URLSearchParams();
  if (options.category) params.set("category", options.category);
  if (options.tag) params.set("tag", options.tag);
  if (options.sort) params.set("sort", options.sort);
  params.set("limit", String(options.limit ?? 12));
  params.set("offset", String(options.offset ?? 0));
  const path = options.query ? `/articles/search?${params}` : `/articles?${params}`;

  try {
    return await getJson<Page<Article>>(path, options.signal);
  } catch (err: unknown) {
    if (options.signal?.aborted) throw err;

    if (options.sort === "popular" && !options.category && !options.tag && !options.query) {
      const limit = options.limit ?? 3;
      return {
        items: FALLBACK_POPULAR.slice(0, limit),
        total: FALLBACK_POPULAR.length,
        limit,
        offset: options.offset ?? 0,
      };
    }

    let items = [...FALLBACK_ARTICLES];

    if (options.category) {
      const catLower = options.category.toLowerCase();
      items = items.filter((a) => {
        const cat = a.category?.toLowerCase() || "";
        if (catLower === "ai" && (cat.includes("інтелект") || cat === "ші")) return true;
        if (catLower === "development" && cat.includes("розроб")) return true;
        if (catLower === "cybersecurity" && (cat.includes("кібер") || cat.includes("безпек"))) return true;
        if (catLower === "gamedev-3d" && (cat.includes("game") || cat.includes("3d") || cat.includes("ігр"))) return true;
        if (catLower === "hardware-chips" && (cat.includes("заліз") || cat.includes("чіп"))) return true;
        if (catLower === "startups-market" && (cat.includes("стартап") || cat.includes("ринок"))) return true;
        return cat.includes(catLower);
      });
    }

    if (options.tag) {
      const tagLower = options.tag.toLowerCase();
      items = items.filter((a) => a.tags.some((t) => t.toLowerCase() === tagLower));
    }

    if (options.query) {
      const qLower = options.query.toLowerCase();
      items = items.filter((a) =>
        a.title.toLowerCase().includes(qLower) ||
        (a.lead && a.lead.toLowerCase().includes(qLower)) ||
        a.tags.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    if (options.sort === "popular") {
      items.sort((a, b) => b.views_count - a.views_count);
    }

    const offset = options.offset ?? 0;
    const limit = options.limit ?? 12;
    const paged = items.slice(offset, offset + limit);

    return {
      items: paged,
      total: items.length,
      limit,
      offset,
    };
  }
}

export async function getFlashNews(signal?: AbortSignal) {
  try {
    return await getJson<Page<FlashNews>>("/flash-news?limit=8", signal);
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    return {
      items: FALLBACK_FLASH_NEWS,
      total: FALLBACK_FLASH_NEWS.length,
      limit: 8,
      offset: 0,
    };
  }
}
