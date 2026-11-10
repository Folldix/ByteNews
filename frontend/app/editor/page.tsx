"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleEditor } from "../../components/cms/ArticleEditor";

// /editor/ — нова стаття, /editor/?id=<id> — редагування існуючої.
// useSearchParams у статичному експорті вимагає Suspense-межі.
function EditorRoute() {
  const articleId = useSearchParams().get("id") ?? undefined;
  return <ArticleEditor key={articleId ?? "new"} articleId={articleId} />;
}

export default function EditorPage() {
  return <Suspense fallback={null}><EditorRoute /></Suspense>;
}
