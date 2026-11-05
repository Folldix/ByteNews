"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  apiLogin,
  apiRegister,
  apiRefresh,
  apiLogout,
  apiUpgradeRole,
} from "../lib/api";

type View = "feed" | "profile" | "bookmarks";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeView: View;
  isAuthModalOpen: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  upgradeToReporter: (profile: { handle: string; role_title: string; topics: string[] }) => Promise<void>;
  setBookmarksCount: (count: number) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setActiveView: (view: View) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredToken(key: string) {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<View>("feed");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Відновлення сесії з localStorage/sessionStorage перед запитом до бекенду
  useEffect(() => {
    let localRefresh: string | null = null;
    let sessionRefresh: string | null = null;
    let savedUserStr: string | null = null;
    try {
      localRefresh = localStorage.getItem("bytenews_refresh_token");
      sessionRefresh = sessionStorage.getItem("bytenews_refresh_token");
      savedUserStr = localStorage.getItem("bytenews_user") || sessionStorage.getItem("bytenews_user");
    } catch {
      return;
    }

    if (savedUserStr) {
      try {
        setUser(JSON.parse(savedUserStr));
      } catch { /* Ignore JSON parse error */ }
    }

    const refreshToken = localRefresh || sessionRefresh;
    if (!refreshToken) return;
    let active = true;

    apiRefresh(refreshToken)
      .then((pair) => {
        if (!active) return;
        setUser(pair.user);
        const storage = localRefresh ? localStorage : sessionStorage;
        storage.setItem("bytenews_access_token", pair.access_token);
        storage.setItem("bytenews_refresh_token", pair.refresh_token);
        storage.setItem("bytenews_user", JSON.stringify(pair.user));
      })
      .catch(() => {
        // Якщо токен не демо і бекенд відповів реальною помилкою авторизації
        if (refreshToken === "demo-refresh-token") return;
        try {
          localStorage.removeItem("bytenews_access_token");
          localStorage.removeItem("bytenews_refresh_token");
          localStorage.removeItem("bytenews_user");
          sessionStorage.removeItem("bytenews_access_token");
          sessionStorage.removeItem("bytenews_refresh_token");
          sessionStorage.removeItem("bytenews_user");
        } catch { /* Storage can be disabled by the browser. */ }
      });
    return () => { active = false; };
  }, []);

  const storePair = (pair: Awaited<ReturnType<typeof apiLogin>>, rememberMe: boolean) => {
    setUser(pair.user);
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem("bytenews_access_token");
      otherStorage.removeItem("bytenews_refresh_token");
      otherStorage.removeItem("bytenews_user");
      storage.setItem("bytenews_access_token", pair.access_token);
      storage.setItem("bytenews_refresh_token", pair.refresh_token);
      storage.setItem("bytenews_user", JSON.stringify(pair.user));
    } catch { /* Keep the current session in memory when browser storage is unavailable. */ }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const pair = await apiLogin(email, password);
    storePair(pair, rememberMe);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const pair = await apiRegister(name, email, password);
    storePair(pair, true);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    const refreshToken = readStoredToken("bytenews_refresh_token");
    if (refreshToken) void apiLogout(refreshToken);
    setUser(null);
    setActiveView("feed");
    try {
      localStorage.removeItem("bytenews_access_token");
      localStorage.removeItem("bytenews_refresh_token");
      localStorage.removeItem("bytenews_user");
      sessionStorage.removeItem("bytenews_access_token");
      sessionStorage.removeItem("bytenews_refresh_token");
      sessionStorage.removeItem("bytenews_user");
    } catch { /* Nothing else to clear when storage is unavailable. */ }
  };

  const upgradeToReporter = async (profile: { handle: string; role_title: string; topics: string[] }) => {
    const token = readStoredToken("bytenews_access_token");
    if (!token) throw new Error("Сесія завершилася. Увійдіть знову.");
    const updated = await apiUpgradeRole(token, profile);
    setUser(updated);
    try {
      if (localStorage.getItem("bytenews_refresh_token")) {
        localStorage.setItem("bytenews_user", JSON.stringify(updated));
      } else if (sessionStorage.getItem("bytenews_refresh_token")) {
        sessionStorage.setItem("bytenews_user", JSON.stringify(updated));
      }
    } catch { /* Ignore storage error */ }
  };

  const setBookmarksCount = useCallback((count: number) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, bookmarks_count: count };
      try {
        if (localStorage.getItem("bytenews_refresh_token")) {
          localStorage.setItem("bytenews_user", JSON.stringify(updated));
        } else if (sessionStorage.getItem("bytenews_refresh_token")) {
          sessionStorage.setItem("bytenews_user", JSON.stringify(updated));
        }
      } catch { /* Ignore storage error */ }
      return updated;
    });
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        activeView,
        isAuthModalOpen,
        login,
        register,
        upgradeToReporter,
        setBookmarksCount,
        logout,
        openAuthModal,
        closeAuthModal,
        setActiveView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
