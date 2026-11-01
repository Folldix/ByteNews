"use client";

import { FeedHome } from "../components/feed/feed-home";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AuthModal } from "../components/auth/AuthModal";
import { UserProfileView } from "../components/profile/UserProfileView";
import { useAuth } from "../context/AuthContext";
import { FeedProvider } from "../context/FeedContext";

export default function HomePage() {
  return (
    <FeedProvider>
      <HomeShell />
    </FeedProvider>
  );
}

function HomeShell() {
  const { activeView } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AuthModal />
      {activeView === "profile" ? (
        <main className="mx-auto w-full max-w-[1296px] flex-1 px-4 py-8">
          <UserProfileView />
        </main>
      ) : (
        <div className="flex-1">
          <FeedHome />
        </div>
      )}
      <Footer />
    </div>
  );
}
