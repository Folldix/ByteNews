// Адреси сторінок із параметрами в query-рядку, а не в шляху.
// Статичний експорт Next.js (потрібен для Tauri) не вміє віддавати
// шляхи на кшталт /articles/<slug>, бо slug невідомі під час збірки.
// Кінцевий "/" потрібен через trailingSlash: true у next.config.ts.

export function articleHref(slug: string): string {
  return `/article/?slug=${encodeURIComponent(slug)}`;
}

export function editorHref(articleId?: string): string {
  return articleId ? `/editor/?id=${encodeURIComponent(articleId)}` : "/editor/";
}
