"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  apiLogin,
  apiRegister,
  apiRefresh,
  apiLogout,
  apiUpgradeRole,
  apiUpdateProfile,
  apiFetchMe,
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
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchRole: (role: "reader" | "reporter") => void;
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

  const handleSetActiveView = useCallback((view: View) => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const storePair = useCallback((pair: Awaited<ReturnType<typeof apiLogin>>, rememberMe: boolean) => {
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
  }, []);

  const logout = useCallback(() => {
    const refreshToken = readStoredToken("bytenews_refresh_token");
    if (refreshToken && refreshToken !== "demo-refresh-token") {
      void apiLogout(refreshToken);
    }
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
  }, []);

  // Відновлення сесії користувача при завантаженні/оновленні сторінки
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("bytenews_user") || sessionStorage.getItem("bytenews_user");
      const token = localStorage.getItem("bytenews_access_token") || sessionStorage.getItem("bytenews_access_token");
      const refreshToken = localStorage.getItem("bytenews_refresh_token") || sessionStorage.getItem("bytenews_refresh_token");
      const isPersistent = !!localStorage.getItem("bytenews_user");

      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          setUser(parsed);
        } catch {
          setUser(null);
        }

        // Якщо маємо дійсний JWT токен бекенду — звіряємо актуальність даних у фоні
        if (token && token !== "demo-access-token") {
          apiFetchMe(token)
            .then((freshUser) => {
              if (freshUser) {
                setUser(freshUser);
                const storage = isPersistent ? localStorage : sessionStorage;
                storage.setItem("bytenews_user", JSON.stringify(freshUser));
              }
            })
            .catch(async () => {
              // Якщо короткоживучий access-токен (15 хв) закінчився — оновлюємо сесію
              if (refreshToken && refreshToken !== "demo-refresh-token") {
                try {
                  const pair = await apiRefresh(refreshToken);
                  storePair(pair, isPersistent);
                } catch {
                  // Refresh-токен відкликано або недійсний
                  logout();
                }
              }
            });
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, [logout, storePair]);

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

  const upgradeToReporter = async (profile: { handle: string; role_title: string; topics: string[] }) => {
    const token = readStoredToken("bytenews_access_token");
    if (!token) throw new Error("Сесія завершилася. Увійдіть знову.");
    let updated = await apiUpgradeRole(token, profile);
    if (user) {
      updated = {
        ...updated,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        avatar_initials: user.avatar_initials,
        bio: user.bio,
        location: user.location,
        email: user.email,
        handle: profile.handle || user.handle,
        role_title: profile.role_title || "IT-репортер спільноти",
        reporter_topics: profile.topics,
      };
    }
    setUser(updated);
    try {
      if (localStorage.getItem("bytenews_refresh_token")) {
        localStorage.setItem("bytenews_user", JSON.stringify(updated));
      } else if (sessionStorage.getItem("bytenews_refresh_token")) {
        sessionStorage.setItem("bytenews_user", JSON.stringify(updated));
      }
    } catch { /* Ignore storage error */ }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...data };
      try {
        if (localStorage.getItem("bytenews_refresh_token")) {
          localStorage.setItem("bytenews_user", JSON.stringify(updated));
        } else if (sessionStorage.getItem("bytenews_refresh_token")) {
          sessionStorage.setItem("bytenews_user", JSON.stringify(updated));
        }
      } catch { /* Ignore storage error */ }
      return updated;
    });

    const token = readStoredToken("bytenews_access_token");
    if (token && token !== "demo-access-token") {
      try {
        await apiUpdateProfile(token, data);
      } catch {
        // Fallback for demo or offline mode
      }
    }
  };

  const switchRole = (newRole: "reader" | "reporter") => {
    setUser((current) => {
      if (!current) return current;
      const updated: UserProfile = {
        ...current,
        role: newRole,
        role_title:
          newRole === "reporter"
            ? current.role_title && current.role_title !== "Читач спільноти"
              ? current.role_title
              : "Провідний IT-репортер & Head of AI"
            : "Розробник & Читач ByteNews",
      };
      try {
        if (localStorage.getItem("bytenews_refresh_token")) {
          localStorage.setItem("bytenews_user", JSON.stringify(updated));
        } else if (sessionStorage.getItem("bytenews_refresh_token")) {
          sessionStorage.setItem("bytenews_user", JSON.stringify(updated));
        }
      } catch { /* Ignore storage error */ }
      return updated;
    });
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
        updateProfile,
        switchRole,
        setBookmarksCount,
        logout,
        openAuthModal,
        closeAuthModal,
        setActiveView: handleSetActiveView,
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
