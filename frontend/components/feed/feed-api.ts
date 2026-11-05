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
  { id: "openai", name: "OpenAI", slug: "openai" },
  { id: "rust", name: "Rust", slug: "rust" },
  { id: "gpu", name: "GPU", slug: "gpu" },
];

export const FALLBACK_FLASH_NEWS: FlashNews[] = [
  {
    id: "fn-1",
    title: "OpenAI презентувала оновлення інференсу для швидшого виконання математичних задач",
    summary: "Оновлення фокусується на оптимізації латентності та паралельному виконанні кроків міркування.",
    source_name: "TechCrunch",
    url: "https://techcrunch.com",
    published_at: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    id: "fn-2",
    title: "Anthropic відкрила підтримку користувацьких MCP-серверів у хмарному інтерфейсі",
    summary: "Розробники тепер можуть інтегрувати власні джерела даних безпосередньо у робочі простори Claude.",
    source_name: "The Verge",
    url: "https://theverge.com",
    published_at: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    id: "fn-3",
    title: "Ядро Linux 6.14 оптимізувало роботу з гетерогенними NPU-прискорювачами",
    summary: "Новий диспетчер пам'яті суттєво знижує накладні витрати на копіювання буферів між CPU та NPU.",
    source_name: "Phoronix",
    url: "https://phoronix.com",
    published_at: new Date(Date.now() - 90 * 60_000).toISOString(),
  },
  {
    id: "fn-4",
    title: "NVIDIA представила новий набір інструментів cuQuantum для прискорення симуляцій",
    summary: "Швидкість обчислень зросла на 35% порівняно з попередньою ревізією драйверів.",
    source_name: "AnandTech",
    url: "https://anandtech.com",
    published_at: new Date(Date.now() - 150 * 60_000).toISOString(),
  },
  {
    id: "fn-5",
    title: "GitHub розширив автоматичний захист від витоку секретних ключів та API-токенів",
    summary: "Превентивне сканування тепер спрацьовує ще до завершення операції push у репозиторій.",
    source_name: "BleepingComputer",
    url: "https://bleepingcomputer.com",
    published_at: new Date(Date.now() - 240 * 60_000).toISOString(),
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
    category: "Штучний Інтелект",
    author: "Олександр Коваленко",
    author_role: "Head of AI",
    tags: ["Claude", "OpenAI", "React"],
  },
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
    category: "Розробка",
    author: "Максим Шевченко",
    author_role: "Backend Architect",
    tags: ["Rust", "Linux"],
  },
  {
    id: "art-gpu",
    title: "Архітектура чіпів нового покоління: чому HBM4 вимагає перегляду топології материнських плат",
    slug: "next-gen-gpu-hbm4-architecture",
    lead: "Технічний аналіз змін у літографії та шинах передачі даних при переході на пам'ять високої пропускної здатності стандарту HBM4.",
    cover_image_url: null,
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 10,
    views_count: 1980,
    likes_count: 64,
    comments_count: 7,
    published_at: new Date(Date.now() - 18 * 3600_000).toISOString(),
    category: "Залізо & Чіпи",
    author: "Ігор Василенко",
    author_role: "Hardware Lead",
    tags: ["GPU", "Hardware"],
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
    category: "GameDev & 3D",
    author: "Денис Бойко",
    author_role: "3D Graphics Programmer",
    tags: ["GPU", "GameDev"],
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

    let items = [...FALLBACK_ARTICLES];

    if (options.category) {
      const catLower = options.category.toLowerCase();
      items = items.filter((a) => {
        const cat = a.category?.toLowerCase() || "";
        if (catLower === "ai" && cat.includes("інтелект")) return true;
        if (catLower === "development" && cat.includes("розроб")) return true;
        if (catLower === "cybersecurity" && cat.includes("кібер")) return true;
        if (catLower === "gamedev-3d" && (cat.includes("game") || cat.includes("3d"))) return true;
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
