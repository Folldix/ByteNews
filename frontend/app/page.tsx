"use client";

import { useAuth } from "../context/AuthContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AuthModal } from "../components/auth/AuthModal";
import { UserProfileView } from "../components/profile/UserProfileView";

export default function HomePage() {
  const { activeView } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Шапка сайту */}
      <Header />

      {/* Модальне вікно авторизації */}
      <AuthModal />

      {/* Основний контейнер сторінки */}
      <main className="flex-1 max-w-[1296px] w-full mx-auto px-4 py-8">
        {activeView === "profile" && <UserProfileView />}
      </main>

      {/* Підвал сайту */}
      <Footer />
    </div>
  );
}
