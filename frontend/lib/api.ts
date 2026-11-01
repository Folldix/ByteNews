export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface UserArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category_name: string;
  read_time_min: number;
  views_count: number;
  comments_count: number;
  published_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  handle: string;
  role: "guest" | "reader" | "reporter";
  role_title: string;
  bio: string;
  avatar_initials: string;
  avatar_url?: string;
  location?: string;
  joined_date?: string;
  articles_count: number;
  total_views: number;
  bookmarks_count: number;
  articles: UserArticle[];
}

/** Еталонний профіль автора */
export const DEMO_AUTHOR_PROFILE: UserProfile = {
  id: "demo-alex-id",
  email: "alex@bytenews.dev",
  full_name: "Олександр Коваленко",
  handle: "oleksandr_kovalenko",
  role: "reporter",
  role_title: "Провідний IT-репортер & Head of AI",
  bio: "Пишу про фундаментальні прориви в LLM, агентні системи та еволюцію бекенд-архітектури. Автор понад 40 технічних розслідувань.",
  avatar_initials: "ОК",
  avatar_url: "/avatars/Avatar_1.png",
  location: "Київ, Україна",
  joined_date: "Березень 2023",
  articles_count: 2,
  total_views: 7230,
  bookmarks_count: 2,
  articles: [
    {
      id: "art-1",
      title:
        "Чому нова архітектура Claude 3.7 Sonnet змінює правила гри в генерації коду",
      slug: "claude-3-7-sonnet-architecture",
      summary:
        "Аналіз гібридного міркування, бенчмарків SWE-bench та практичного досвіду інтеграції в реальні пайплайни розробки.",
      category_name: "Штучний Інтелект",
      read_time_min: 6,
      views_count: 4120,
      comments_count: 18,
      published_at: "14 жовтня 2026",
    },
    {
      id: "art-2",
      title:
        "Глибокий розбір TypeScript 5.8: як нові перевірки типів прискорюють компіляцію на 40%",
      slug: "typescript-5-8-deep-dive",
      summary:
        "Огляд оптимізацій типізації, прапорця --isolatedDeclarations та нових можливостей звуження типів у складних генериках.",
      category_name: "Розробка",
      read_time_min: 8,
      views_count: 3110,
      comments_count: 12,
      published_at: "10 жовтня 2026",
    },
  ],
};

/** Авторизація користувача */
export async function apiLogin(
  email: string,
  _password?: string
): Promise<{ user: UserProfile; token: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: _password }),
    });
    if (res.ok) {
      const data = await res.json();
      return { user: data.user, token: data.access_token };
    }
  } catch {
    // Якщо бекенд не запущений — переходимо в демо-режим для захисту
  }
  return { user: { ...DEMO_AUTHOR_PROFILE, email }, token: "demo-jwt-token" };
}

/** Реєстрація нового читача */
export async function apiRegister(
  name: string,
  email: string,
  _password?: string
): Promise<{ user: UserProfile; token: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name, email, password: _password }),
    });
    if (res.ok) {
      const data = await res.json();
      return { user: data.user, token: data.access_token };
    }
  } catch {
    // Демо-fallback
  }
  return {
    user: {
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
      articles: [],
    },
    token: "demo-jwt-token",
  };
}

/** Отримання профілю поточного користувача */
export async function apiFetchMe(token: string): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Демо-fallback
  }
  return DEMO_AUTHOR_PROFILE;
}
