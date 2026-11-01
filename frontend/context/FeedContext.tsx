"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type FeedFilters = {
  category: string;
  tag: string;
  query: string;
  setCategory: (value: string) => void;
  setTag: (value: string) => void;
  setQuery: (value: string) => void;
};

const FeedContext = createContext<FeedFilters | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get("q")?.trim();
    if (initialQuery) setQuery(initialQuery);
  }, []);
  const value = useMemo(
    () => ({ category, tag, query, setCategory, setTag, setQuery }),
    [category, tag, query],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeedFilters() {
  const context = useContext(FeedContext);
  if (!context) throw new Error("useFeedFilters must be used inside FeedProvider");
  return context;
}
