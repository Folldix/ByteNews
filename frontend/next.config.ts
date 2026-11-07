import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Статичний експорт: `next build` створює папку out/, яку Tauri пакує в застосунок.
  output: "export",
  // /article/ -> out/article/index.html (надійніше для вбудованого вікна Tauri).
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
