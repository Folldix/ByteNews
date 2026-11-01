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
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<TokenPair>;
}

/** Реєстрація нового читача */
export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<TokenPair> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: name, email, password }),
  });
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<TokenPair>;
}

/** Отримання профілю поточного користувача */
export async function apiFetchMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<UserProfile>;
}

export async function apiRefresh(refreshToken: string): Promise<TokenPair> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
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
  const res = await fetch(`${API_BASE_URL}/users/upgrade-role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw await readApiError(res);
  return res.json() as Promise<UserProfile>;
}
