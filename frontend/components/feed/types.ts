export type CatalogItem = {
  id: string;
  name: string;
  slug: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  lead: string | null;
  cover_image_url: string | null;
  is_hero: boolean;
  is_photo_reportage: boolean;
  read_time_min: number;
  views_count: number;
  likes_count: number;
  comments_count?: number | null;
  published_at: string | null;
  category: string | null;
  author: string | null;
  author_role: string | null;
  tags: string[];
};

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type FlashNews = {
  id: string;
  title: string;
  summary: string | null;
  source_name: string;
  url: string;
  published_at: string;
};
