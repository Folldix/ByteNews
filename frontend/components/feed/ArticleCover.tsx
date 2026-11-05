import React from "react";
import type { Article } from "./types";

interface ArticleCoverProps {
  article: Article;
  large?: boolean;
}

export function ArticleCover({ article, large = false }: ArticleCoverProps) {
  if (large) {
    return (
      <div className="relative isolate overflow-hidden bg-slate-100 w-full h-[256px] rounded-[16px] border border-[#e2e8f0]">
        {article.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover_image_url}
            alt={article.title}
            loading="eager"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(45,212,191,.48),transparent_24%),radial-gradient(ellipse_at_30%_75%,rgba(59,130,246,.32),transparent_40%),linear-gradient(135deg,#0f172a,#13243b_52%,#0f766e)]" />
        )}
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden bg-slate-100 size-full">
      {article.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image_url}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="size-full bg-[radial-gradient(ellipse_at_72%_35%,rgba(45,212,191,.48),transparent_24%),radial-gradient(ellipse_at_30%_75%,rgba(59,130,246,.32),transparent_40%),linear-gradient(135deg,#0f172a,#13243b_52%,#0f766e)]" />
      )}
    </div>
  );
}
