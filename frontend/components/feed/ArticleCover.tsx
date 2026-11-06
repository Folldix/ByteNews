"use client";

import React, { useState } from "react";
import type { Article } from "./types";

interface ArticleCoverProps {
  article: Article;
  large?: boolean;
}

export function ArticleCover({ article, large = false }: ArticleCoverProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const showFallback = !article.cover_image_url || error;

  if (large) {
    return (
      <div className="relative isolate overflow-hidden bg-slate-100 w-full h-[190px] sm:h-[230px] md:h-[256px] rounded-[16px] border border-[#e2e8f0]">
        {showFallback ? (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(45,212,191,.48),transparent_24%),radial-gradient(ellipse_at_30%_75%,rgba(59,130,246,.32),transparent_40%),linear-gradient(135deg,#0f172a,#13243b_52%,#0f766e)]" />
        ) : (
          <>
            {/* Пульсуючий плавний скелетон під час завантаження */}
            <div
              className={`absolute inset-0 bg-slate-200/80 animate-pulse transition-opacity duration-300 ${
                loaded ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover_image_url || undefined}
              alt={article.title}
              loading="eager"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={`absolute inset-0 size-full object-cover transition-all duration-300 group-hover:scale-[1.02] ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden bg-slate-100 size-full">
      {showFallback ? (
        <div className="size-full bg-[radial-gradient(ellipse_at_72%_35%,rgba(45,212,191,.48),transparent_24%),radial-gradient(ellipse_at_30%_75%,rgba(59,130,246,.32),transparent_40%),linear-gradient(135deg,#0f172a,#13243b_52%,#0f766e)]" />
      ) : (
        <>
          {/* Пульсуючий плавний скелетон під час завантаження */}
          <div
            className={`absolute inset-0 bg-slate-200/80 animate-pulse transition-opacity duration-300 ${
              loaded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image_url || undefined}
            alt={article.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`absolute inset-0 size-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}
    </div>
  );
}
