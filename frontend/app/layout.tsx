import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { BookmarksProvider } from "../context/BookmarksContext";
import { FeedProvider } from "../context/FeedContext";
import { Background } from "../components/Background";
import { GridOverlay } from "../components/layout/GridOverlay";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ByteNews — IT & Tech Digest",
  description: "Спеціалізований вебпортал технічних новин та інженерної аналітики",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} ${inter.variable}`}
    >
      <body className="font-sans bg-[#f8fafc] text-[#0f172a] antialiased min-h-screen min-w-[1328px] flex flex-col relative selection:bg-[#059669]/10 selection:text-[#059669]">
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
