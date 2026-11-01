import { expect, test } from "@playwright/test";

const articleId = "11111111-1111-4111-8111-111111111111";
const optionA = "22222222-2222-4222-8222-222222222222";
const optionB = "33333333-3333-4333-8333-333333333333";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/articles/reader-e2e", (route) => route.fulfill({ json: {
    id: articleId, title: "Перевірка сторінки читання", slug: "reader-e2e",
    lead: "Короткий лід для тестової статті.", cover_image_url: null,
    is_hero: false, is_photo_reportage: false, read_time_min: 4,
    views_count: 21, likes_count: 0, comments_count: 0,
    published_at: "2026-10-30T12:00:00Z", category: "Розробка",
    author: "Редакція", author_role: "Редактор", tags: ["React"],
    blocks: [{ id: "b1", block_type: "paragraph", order_index: 0, content_payload: { text: "Текст матеріалу для перевірки керування розміром шрифту та режиму читання. " .repeat(80) } }],
    reaction_counts: { useful: 0, fire: 0, insight: 0, controversial: 0 },
    my_reaction: null, is_bookmarked: false,
  } }));
  await page.route(`**/api/v1/articles/${articleId}/comments`, (route) => route.fulfill({ json: { items: [], total: 0 } }));
  await page.route("**/api/v1/polls/active", (route) => route.fulfill({ json: {
    id: "44444444-4444-4444-8444-444444444444", question: "Який стек обираєте?",
    closes_at: null, total_votes: 0, selected_option_id: null,
    options: [
      { id: optionA, option_text: "React", votes_count: 0, percentage: 0 },
      { id: optionB, option_text: "Vue", votes_count: 0, percentage: 0 },
    ],
  } }));
  await page.route("**/api/v1/bookmarks", (route) => route.fulfill({ json: { items: [], total: 0 } }));
});

test("reader toolbar adjusts type and toggles zen mode", async ({ page }) => {
  await page.goto("/articles/reader-e2e");
  await expect(page.getByRole("heading", { name: "Перевірка сторінки читання" })).toBeVisible();
  await page.getByRole("button", { name: "Більший шрифт" }).click();
  await expect(page.locator("article").locator(".text-xl").first()).toBeVisible();
  await page.getByRole("button", { name: "Фокусне читання" }).click();
  await expect(page.getByRole("button", { name: "Вийти з фокусу" })).toBeVisible();
});

test("reader supports optimistic bookmark and reactions", async ({ page }) => {
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ json: {
    user: { id: "55555555-5555-4555-8555-555555555555", email: "reader@example.test", full_name: "QA Reader", handle: "qa-reader", role: "reader", role_title: null, bio: null, avatar_initials: "QR", articles_count: 0, total_views: 0, bookmarks_count: 0, articles: [] },
    access_token: "e2e-token", refresh_token: "e2e-refresh", token_type: "bearer",
  } }));
  await page.route(`**/api/v1/articles/${articleId}/bookmark`, (route) => route.fulfill({ json: { bookmarked: true } }));
  await page.route(`**/api/v1/articles/${articleId}/react`, (route) => route.fulfill({ json: {
    counts: { useful: 1, fire: 0, insight: 0, controversial: 0 }, selected: "useful",
  } }));
  await page.goto("/articles/reader-e2e");
  const bookmark = page.getByRole("button", { name: "Додати в закладки" });
  await bookmark.click();
  await expect(page.getByRole("button", { name: "Прибрати із закладок" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Корисно/ }).click();
  await page.getByPlaceholder("alex@bytenews.ua").fill("reader@example.test");
  await page.getByPlaceholder("••••••••••••").fill("reader-password");
  await page.getByRole("button", { name: "Увійти в акаунт" }).click();
  await page.getByRole("button", { name: /Корисно/ }).click();
  await expect(page.getByRole("button", { name: /Корисно \(1\)/ })).toHaveAttribute("aria-pressed", "true");
});

test("poll selection submits and renders returned percentages", async ({ page }) => {
  await page.route("**/api/v1/auth/login", (route) => route.fulfill({ json: {
    user: { id: "55555555-5555-4555-8555-555555555555", email: "reader@example.test", full_name: "QA Reader", handle: "qa-reader", role: "reader", role_title: null, bio: null, avatar_initials: "QR", articles_count: 0, total_views: 0, bookmarks_count: 0, articles: [] },
    access_token: "e2e-token", refresh_token: "e2e-refresh", token_type: "bearer",
  } }));
  await page.route("**/api/v1/polls/*/vote", (route) => route.fulfill({ json: {
    id: "44444444-4444-4444-8444-444444444444", question: "Який стек обираєте?",
    closes_at: null, total_votes: 1, selected_option_id: optionA,
    options: [
      { id: optionA, option_text: "React", votes_count: 1, percentage: 100 },
      { id: optionB, option_text: "Vue", votes_count: 0, percentage: 0 },
    ],
  } }));
  await page.goto("/articles/reader-e2e");
  await page.getByText("React", { exact: true }).last().click();
  await page.getByRole("button", { name: "Проголосувати" }).click();
  await page.getByPlaceholder("alex@bytenews.ua").fill("reader@example.test");
  await page.getByPlaceholder("••••••••••••").fill("reader-password");
  await page.getByRole("button", { name: "Увійти в акаунт" }).click();
  await page.getByRole("button", { name: "Проголосувати" }).click();
  await expect(page.getByText("100%")).toBeVisible();
});
