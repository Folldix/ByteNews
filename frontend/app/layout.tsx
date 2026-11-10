import type { Metadata } from "next";
// Шрифти підключені локально (npm-пакети @fontsource-variable), а не через
// next/font/google: збірка не залежить від доступу до Google Fonts (CI, офлайн Tauri).
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/inter";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { BookmarksProvider } from "../context/BookmarksContext";
import { FeedProvider } from "../context/FeedContext";
import { Background } from "../components/Background";
import { GridOverlay } from "../components/layout/GridOverlay";

export const metadata: Metadata = {
  title: "ByteNews — IT & Tech Digest",
  description: "Спеціалізований вебпортал технічних новин та інженерної аналітики",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="font-sans bg-[#f8fafc] text-[#0f172a] antialiased min-h-screen w-full overflow-x-hidden flex flex-col relative selection:bg-[#059669]/10 selection:text-[#059669]">
        <Background />
        <AuthProvider>
          <FeedProvider>
            <BookmarksProvider>
              {children}
              <GridOverlay />
            </BookmarksProvider>
          </FeedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
