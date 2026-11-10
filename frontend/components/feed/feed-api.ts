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
    title: "React 19 вийшов у стабільний реліз: server actions, useActionState та кінець епохи forwardRef",
    slug: "react-19-stable-release-server-components-compiler",
    lead: "Команда Meta опублікувала фінальну версію React 19. Головні зміни торкнулися спрощення роботи з асинхронними формами, оптимістичних оновлень...",
    cover_image_url: "/images/card-m-5.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 5,
    views_count: 3150,
    likes_count: 245,
    comments_count: 34,
    published_at: new Date(Date.now() - 3600_000).toISOString(),
    time_label: "1 год тому",
    category: "Розробка",
    author: "Марина Бондар",
    author_role: "Frontend Architect",
    author_avatar: "/images/avatar-4.png",
    tags: ["React", "Frontend", "JavaScript"],
  },
  {
    id: "pop-2",
    title: "Критична вразливість у ядрі Linux (CVSS 9.8): аналіз механізму експлуатації RCU",
    slug: "critical-vulnerability-linux-kernel-rcu-exploit",
    lead: "Дослідники з кібербезпеки оприлюднили детальне дослідження Use-After-Free вразливості, яка дозволяє непривілейованому локальному користувачу отримати права root у ядрі.",
    cover_image_url: "/images/card-m-2.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 4,
    views_count: 5420,
    likes_count: 419,
    comments_count: 62,
    published_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    time_label: "3 год тому",
    category: "Кібербезпека",
    author: "Ігор Демченко",
    author_role: "Security Researcher",
    author_avatar: "/images/avatar-2.png",
    tags: ["Security", "Linux", "ZeroDay"],
  },
  {
    id: "pop-3",
    title: "Мікросервіси vs Модульний Моноліт: чому індустрія переосмислює архітектурну моду 2018-го",
    slug: "why-we-abandoned-microservices-for-modular-monolith",
    lead: "Розбір тренду: команди інженерів від Amazon Prime Video до Shopify відкрито діляться досвідом зменшення хмарних витрат у рази після консолідації мікросервісів...",
    cover_image_url: "/images/card-m-8.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 7,
    views_count: 6810,
    likes_count: 540,
    comments_count: 88,
    published_at: new Date(Date.now() - 22 * 3600_000).toISOString(),
    time_label: "Вчора, 18:20",
    category: "Розробка",
    author: "Марина Бондар",
    author_role: "Backend Architect",
    author_avatar: "/images/avatar-4.png",
    tags: ["Architecture", "Monolith", "Microservices"],
  },
];

export const FALLBACK_FLASH_NEWS: FlashNews[] = [
  {
    id: "fn-1",
    title: "NVIDIA досягла ринкової капіталізації $3.8T на фоні рекордного попиту на чипи B200",
    summary: "Акції компанії зросли ще на 4.2% після оголошення квартального звіту та повного завантаження ліній виробництва архітектури Blackwell.",
    source_name: "Залізо",
    url: "https://bloomberg.com",
    published_at: new Date().toISOString(),
    time_label: "12:45",
    category: "Залізо",
    is_important: false,
  },
  {
    id: "fn-2",
    title: "Реліз FastAPI 0.115: вбудована оптимізована серіалізація Pydantic v2 та підтримка AnyIO 4.5",
    summary: "Нова версія популярного Python-фреймворку знижує накладні витрати на парсинг JSON ще на 18% завдяки покращеній інтеграції з C-розширеннями.",
    source_name: "Розробка",
    url: "https://fastapi.tiangolo.com",
    published_at: new Date().toISOString(),
    time_label: "12:10",
    category: "Розробка",
    is_important: false,
  },
  {
    id: "fn-3",
    title: "Вразливість у популярній npm-бібліотеці дозволяла виконання довільного коду через прототипне забруднення",
    summary: "Понад 2 мільйони завантажень на тиждень опинилися під загрозою. Рекомендується негайно оновитися до версії з виправленням санітизації ключів.",
    source_name: "Безпека",
    url: "https://bleepingcomputer.com",
    published_at: new Date().toISOString(),
    time_label: "11:32",
    category: "Безпека",
    is_important: true,
  },
  {
    id: "fn-4",
    title: "Epic Games знизила комісію в Unreal Marketplace до 10% для творців процедурних плагінів",
    summary: "Ініціатива покликана стимулювати розробників створювати більше інструментів генерації оточення для Unreal Engine 5.6.",
    source_name: "GameDev",
    url: "https://unrealengine.com",
    published_at: new Date().toISOString(),
    time_label: "10:50",
    category: "GameDev",
    is_important: false,
  },
  {
    id: "fn-5",
    title: "Microsoft інвестує $4.3B у будівництво хмарного кластера ШІ у Східній Європі",
    summary: "Новий дата-центр буде орієнтований на низьколатентний інференс моделей OpenAI та суверенну обробку даних європейських підприємств.",
    source_name: "Штучний Інтелект",
    url: "https://news.microsoft.com",
    published_at: new Date().toISOString(),
    time_label: "09:15",
    category: "Штучний Інтелект",
    is_important: false,
  },
  {
    id: "fn-6",
    title: "Rust Foundation оголосила про старт програми грантів для покращення пам’яттєбезпечних драйверів Linux",
    summary: "Фінансування отримають розробники, які переписують критичні мережеві стеки та модулі файлових систем ядра на мову Rust.",
    source_name: "Розробка",
    url: "https://rust-lang.org",
    published_at: new Date().toISOString(),
    time_label: "08:40",
    category: "Розробка",
    is_important: false,
  },
];

export const FALLBACK_ARTICLES: Article[] = [
  {
    id: "art-hero",
    title: "Anthropic представила Claude 3.7 Sonnet: гібридне мислення та новий еталон кодингу",
    slug: "claude-3-7-sonnet-hybrid-thinking-coding",
    lead: "Нова модель поєднує миттєві відповіді для повсякденних задач із керованим ланцюжком роздумів для складного архітектурного рефакторингу та змагального програмування.",
    cover_image_url: "/images/hero-claude.png",
    is_hero: true,
    is_photo_reportage: false,
    read_time_min: 4,
    views_count: 4280,
    likes_count: 142,
    comments_count: 48,
    published_at: new Date(Date.now() - 25 * 60_000).toISOString(),
    time_label: "25 хв тому",
    category: "Штучний Інтелект",
    author: "Олександр Коваленко",
    author_role: "Head of AI Engineering",
    author_avatar: "/images/avatar-kovalenko.png",
    tags: ["AI", "LLM", "Claude", "Кодинг", "Benchmark"],
  },
  // 1) Ряд 1, Ліва
  {
    id: "art-card-1",
    title: "Anthropic представила Claude 3.7 Sonnet: гібридне мислення та новий еталон кодингу",
    slug: "claude-3-7-sonnet-hybrid-thinking-coding-benchmark",
    lead: "Нова модель поєднує миттєві відповіді для повсякденних задач із керованим ланцюжком роздумів для складного архітектурного рефакторингу та змагального програмування.",
    cover_image_url: "/images/card-m-1.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 4,
    views_count: 4280,
    likes_count: 312,
    comments_count: 48,
    published_at: new Date(Date.now() - 30 * 60_000).toISOString(),
    time_label: "30 хв тому",
    category: "Штучний Інтелект",
    author: "Олексій Коваленко",
    author_role: "AI Researcher",
    author_avatar: "/images/avatar-1.png",
    tags: ["AI", "LLM", "Claude"],
  },
  // 2) Ряд 1, Права
  {
    id: "art-card-5",
    title: "React 19 вийшов у стабільний реліз: server actions, useActionState та кінець епохи forwardRef",
    slug: "react-19-stable-release-server-components-compiler",
    lead: "Команда Meta опублікувала фінальну версію React 19. Головні зміни торкнулися спрощення роботи з асинхронними формами, оптимістичних оновлень...",
    cover_image_url: "/images/card-m-5.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 5,
    views_count: 3150,
    likes_count: 245,
    comments_count: 34,
    published_at: new Date(Date.now() - 3600_000).toISOString(),
    time_label: "1 год тому",
    category: "Розробка",
    author: "Марина Бондар",
    author_role: "Frontend Architect",
    author_avatar: "/images/avatar-4.png",
    tags: ["React", "Frontend", "JavaScript"],
  },
  // 3) Ряд 2, Ліва
  {
    id: "art-card-2",
    title: "Критична вразливість у ядрі Linux (CVSS 9.8): аналіз механізму експлуатації RCU",
    slug: "critical-vulnerability-linux-kernel-rcu-exploit",
    lead: "Дослідники з кібербезпеки оприлюднили детальне дослідження Use-After-Free вразливості, яка дозволяє непривілейованому локальному користувачу отримати права root у ядрі.",
    cover_image_url: "/images/card-m-2.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 4,
    views_count: 5420,
    likes_count: 419,
    comments_count: 62,
    published_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    time_label: "3 год тому",
    category: "Кібербезпека",
    author: "Ігор Демченко",
    author_role: "Security Researcher",
    author_avatar: "/images/avatar-2.png",
    tags: ["Security", "Linux", "ZeroDay"],
  },
  // 4) Ряд 2, Права
  {
    id: "art-card-6",
    title: "Unreal Engine 5.6: революційне глобальне освітлення Lumen та мобільний рендер M4",
    slug: "unreal-engine-5-6-revolutionary-lumen-global-illumination",
    lead: "Epic Games показала попередню версію UE 5.6. Рушій навчився прораховувати динамічні відбиття дзеркальних поверхонь у 4K 60FPS без артефактів шумів.",
    cover_image_url: "/images/card-m-6.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 3,
    views_count: 2840,
    likes_count: 198,
    comments_count: 21,
    published_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
    time_label: "4 год тому",
    category: "GameDev & 3D",
    author: "Тарас Гриневич",
    author_role: "Lead 3D Engineer",
    author_avatar: "/images/avatar-5.png",
    tags: ["GameDev", "UnrealEngine", "Lumen"],
  },
  // 5) Ряд 3, Ліва
  {
    id: "art-card-3",
    title: "NVIDIA Blackwell Ultra: 288 ГБ HBM3e пам’яті та масштабування дата-центрів на рідкому охолодженні",
    slug: "nvidia-blackwell-ultra-288gb-hbm3e",
    lead: "Дженсен Хуанг представив оновлену серію серверних прискорювачів Blackwell Ultra, створених спеціально для інференсу моделей розміром від 1 трильйона параметрів.",
    cover_image_url: "/images/card-m-3.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 4,
    views_count: 3900,
    likes_count: 280,
    comments_count: 29,
    published_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
    time_label: "5 год тому",
    category: "Залізо & Чіпи",
    author: "Віталій Савчук",
    author_role: "Hardware Lead",
    author_avatar: "/images/avatar-3.png",
    tags: ["NVIDIA", "Blackwell", "Hardware"],
  },
  // 6) Ряд 3, Права
  {
    id: "art-card-7",
    title: "Український AI-стартап Respeecher залучив новий раунд інвестицій на голосовий синтез для медицини",
    slug: "ukrainian-ai-startup-respeecher-funding-medical-voice",
    lead: "Команда, відома створенням голосів для блокбастерів Lucasfilm, спрямує кошти на технології відновлення голосу людям після операцій на гортані та...",
    cover_image_url: "/images/card-m-7.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 3,
    views_count: 2430,
    likes_count: 310,
    comments_count: 19,
    published_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
    time_label: "6 год тому",
    category: "Стартапи & Ринок",
    author: "Олена Кравченко",
    author_role: "Tech Reporter",
    author_avatar: "/images/avatar-6.png",
    tags: ["Стартапи", "Respeecher", "AI"],
  },
  // 7) Ряд 4, Ліва
  {
    id: "art-card-4",
    title: "TypeScript 5.8: оптимізація перевірки повернень та прискорення компілятора на 35%",
    slug: "typescript-5-8-deep-dive",
    lead: "Команда Microsoft представила оновлення TypeScript. Додано прапорець --isolatedDeclarations та оптимізовано аналіз складних дженеріків у великих монорепозиторіях.",
    cover_image_url: "/images/card-m-4.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 4,
    views_count: 2950,
    likes_count: 184,
    comments_count: 15,
    published_at: new Date(Date.now() - 7 * 3600_000).toISOString(),
    time_label: "7 год тому",
    category: "Розробка",
    author: "Олексій Коваленко",
    author_role: "AI Researcher",
    author_avatar: "/images/avatar-1.png",
    tags: ["TypeScript", "JavaScript", "Microsoft"],
  },
  // 8) Ряд 4, Права
  {
    id: "art-card-8",
    title: "Мікросервіси vs Модульний Моноліт: чому індустрія переосмислює архітектурну моду 2018-го",
    slug: "why-we-abandoned-microservices-for-modular-monolith-analysis",
    lead: "Розбір тренду: команди інженерів від Amazon Prime Video до Shopify відкрито діляться досвідом зменшення хмарних витрат у рази після консолідації мікросервісів...",
    cover_image_url: "/images/card-m-8.png",
    is_hero: false,
    is_photo_reportage: false,
    read_time_min: 7,
    views_count: 6810,
    likes_count: 540,
    comments_count: 88,
    published_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
    time_label: "8 год тому",
    category: "Розробка",
    author: "Марина Бондар",
    author_role: "Backend Architect",
    author_avatar: "/images/avatar-4.png",
    tags: ["Architecture", "Monolith", "Microservices"],
  },
];

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(1500);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
  const response = await fetch(`${apiBase}/api/v1${path}`, { signal: combinedSignal, cache: "no-store" });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function filterFallbackArticles(options: {
  category?: string;
  tag?: string;
  query?: string;
  sort?: "latest" | "popular";
  limit?: number;
  offset?: number;
}): Page<Article> {
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

export async function getCategories(signal?: AbortSignal) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return { items: FALLBACK_CATEGORIES };
  }
  try {
    return await getJson<{ items: CatalogItem[] }>("/categories", signal);
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    return { items: FALLBACK_CATEGORIES };
  }
}

export async function getTags(signal?: AbortSignal) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return { items: FALLBACK_TAGS };
  }
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
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return filterFallbackArticles(options);
  }

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
    return filterFallbackArticles(options);
  }
}

export async function getFlashNews(signal?: AbortSignal) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return {
      items: FALLBACK_FLASH_NEWS,
      total: FALLBACK_FLASH_NEWS.length,
      limit: 8,
      offset: 0,
    };
  }
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
