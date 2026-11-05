const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;

export interface UserArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  cover_image_url: string | null;
  category_name: string;
  read_time_min: number;
  views_count: number;
  comments_count: number;
  published_at: string | null;
  status?: "draft" | "published";
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string;
  handle: string;
  role: "guest" | "reader" | "reporter" | "admin";
  role_title: string | null;
  reporter_topics?: string[];
  bio: string | null;
  avatar_initials: string;
  avatar_url?: string;
  location?: string;
  joined_date?: string;
  articles_count: number;
  total_views: number;
  bookmarks_count: number;
  articles: UserArticle[];
}

export type TokenPair = { user: UserProfile; access_token: string; refresh_token: string; token_type: "bearer" };

/** Еталонний профіль автора */
export const DEMO_AUTHOR_PROFILE: UserProfile = {
  id: "demo-author-id",
  email: "alex@bytenews.ua",
  full_name: "Олександр Коваленко",
  handle: "oleksandr_kovalenko",
  role: "reporter",
  role_title: "Провідний IT-репортер & Head of AI",
  bio: "Пишу про фундаментальні прориви в LLM, агентні системи та еволюцію бекенд-архітектури. Автор понад 40 технічних розслідувань.",
  avatar_initials: "ОК",
  avatar_url: "/avatars/Avatar_1.png",
  location: "Київ, Україна",
  joined_date: "березня 2023",
  articles_count: 2,
  total_views: 7230,
  bookmarks_count: 2,
  articles: [
    {
      id: "art-1",
      title: "Чому нова архітектура Claude 3.7 Sonnet змінює правила гри в генерації коду",
      slug: "claude-3-7-sonnet-architecture",
      summary: "Аналіз гібридного міркування, бенчмарків SWE-bench та практичного досвіду інтеграції в реальні пайплайни розробки.",
      category_name: "Штучний Інтелект",
      cover_image_url: null,
      read_time_min: 6,
      views_count: 4120,
      comments_count: 18,
      published_at: "14 жовтня 2026",
      status: "published",
    },
    {
      id: "art-2",
      title: "Глибокий розбір TypeScript 5.8: як нові перевірки типів прискорюють компіляцію на 40%",
      slug: "typescript-5-8-deep-dive",
      summary: "Огляд оптимізацій типізації, прапорця --isolatedDeclarations та нових можливостей звуження типів у складних генериках.",
      category_name: "Розробка",
      cover_image_url: null,
      read_time_min: 8,
      views_count: 3110,
      comments_count: 12,
      published_at: "10 жовтня 2026",
      status: "published",
    },
  ],
};

async function readApiError(response: Response): Promise<Error> {
  try {
    const data = await response.json();
    const detail = typeof data.detail === "string" ? data.detail : "Перевірте введені дані.";
    return new Error(detail);
  } catch {
    return new Error(`Помилка сервера (${response.status})`);
  }
}

/** Авторизація користувача */
export async function apiLogin(
  email: string,
  password: string,
): Promise<TokenPair> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    // Якщо бекенд не запущений (мережева помилка) — повертаємо демо-профіль
    return {
      user: { ...DEMO_AUTHOR_PROFILE, email: email || DEMO_AUTHOR_PROFILE.email },
      access_token: "demo-access-token",
      refresh_token: "demo-refresh-token",
      token_type: "bearer",
    };
  }
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<TokenPair>;
}

/** Реєстрація нового читача */
export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<TokenPair> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name, email, password }),
    });
  } catch {
    // Демо-fallback для читача при недоступному бекенді
    const demoReader: UserProfile = {
      ...DEMO_AUTHOR_PROFILE,
      id: "demo-reader-id",
      full_name: name,
      email,
      role: "reader",
      role_title: "Читач спільноти",
      avatar_initials: name.slice(0, 2).toUpperCase(),
      avatar_url: "/avatars/Avatar_6.png",
      articles_count: 0,
      total_views: 0,
      bookmarks_count: 0,
      articles: [],
    };
    return {
      user: demoReader,
      access_token: "demo-access-token",
      refresh_token: "demo-refresh-token",
      token_type: "bearer",
    };
  }
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<TokenPair>;
}

/** Отримання профілю поточного користувача */
export async function apiFetchMe(token: string): Promise<UserProfile> {
  if (token === "demo-access-token") {
    return DEMO_AUTHOR_PROFILE;
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return DEMO_AUTHOR_PROFILE;
  }
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<UserProfile>;
}

export async function apiRefresh(refreshToken: string): Promise<TokenPair> {
  if (refreshToken === "demo-refresh-token") {
    return {
      user: DEMO_AUTHOR_PROFILE,
      access_token: "demo-access-token",
      refresh_token: "demo-refresh-token",
      token_type: "bearer",
    };
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    return {
      user: DEMO_AUTHOR_PROFILE,
      access_token: "demo-access-token",
      refresh_token: "demo-refresh-token",
      token_type: "bearer",
    };
  }
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<TokenPair>;
}

export async function apiLogout(refreshToken: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).catch(() => undefined);
}

export async function apiUpgradeRole(
  token: string,
  profile: { handle: string; role_title: string; topics: string[] },
): Promise<UserProfile> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/users/upgrade-role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(profile),
    });
  } catch {
    return {
      ...DEMO_AUTHOR_PROFILE,
      handle: profile.handle || DEMO_AUTHOR_PROFILE.handle,
      role_title: profile.role_title || DEMO_AUTHOR_PROFILE.role_title,
      reporter_topics: profile.topics,
      role: "reporter",
    };
  }
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<UserProfile>;
}
