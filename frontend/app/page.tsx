"use client";

import { useEffect } from "react";
import { FeedHome } from "../components/feed/feed-home";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AuthModal } from "../components/auth/AuthModal";
import { UserProfileView } from "../components/profile/UserProfileView";
import { useAuth } from "../context/AuthContext";
import { BookmarksDrawer } from "../components/community/BookmarksDrawer";

export default function HomePage() {
  return <HomeShell />;
}

function HomeShell() {
  const { activeView } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [activeView]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AuthModal />
      {activeView !== "feed" ? (
        <main className="mx-auto w-full max-w-[1296px] px-4 sm:px-6 lg:px-8 flex-1 py-6 sm:py-8">
          <UserProfileView initialTab={activeView === "bookmarks" ? "bookmarks" : "articles"} />
        </main>
      ) : (
        <div className="flex-1">
          <FeedHome />
        </div>
      )}
      <Footer />
      <BookmarksDrawer />
    </div>
  );
}
