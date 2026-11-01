"use client";

import { FeedHome } from "../components/feed/feed-home";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AuthModal } from "../components/auth/AuthModal";
import { UserProfileView } from "../components/profile/UserProfileView";
import { useAuth } from "../context/AuthContext";
import { FeedProvider } from "../context/FeedContext";
import { Bookmark, LayoutGrid, UserRound } from "lucide-react";

export default function HomePage() {
  return (
    <FeedProvider>
      <HomeShell />
    </FeedProvider>
  );
}

function HomeShell() {
  const { activeView, setActiveView } = useAuth();

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header />
      <AuthModal />
      {activeView !== "feed" ? (
        <main className="mx-auto w-full max-w-[1296px] flex-1 px-4 py-8">
          <UserProfileView initialTab={activeView === "bookmarks" ? "bookmarks" : "articles"} />
        </main>
      ) : (
        <div className="flex-1">
          <FeedHome />
        </div>
      )}
      <Footer />
      <nav aria-label="Мобільна навігація" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_30px_-24px_rgba(15,23,42,.35)] backdrop-blur md:hidden">
        {[
          { id: "feed" as const, label: "Стрічка", Icon: LayoutGrid },
          { id: "bookmarks" as const, label: "Закладки", Icon: Bookmark },
          { id: "profile" as const, label: "Профіль", Icon: UserRound },
        ].map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-current={activeView === id ? "page" : undefined} onClick={() => setActiveView(id)} className={`flex min-h-11 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${activeView === id ? "text-emerald-700" : "text-slate-500"}`}>
            <Icon aria-hidden="true" className="size-[18px]" />{label}
          </button>
        ))}
      </nav>
    </div>
  );
}
