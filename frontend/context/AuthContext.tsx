"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  DEMO_AUTHOR_PROFILE,
  apiLogin,
  apiRegister,
} from "../lib/api";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeView: "feed" | "profile";
  isAuthModalOpen: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  loginAsDemoAuthor: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setActiveView: (view: "feed" | "profile") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<"feed" | "profile">("feed");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Відновлення сесії з localStorage при першому завантаженні
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("bytenews_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Ігноруємо помилки SSR або парсингу
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await apiLogin(email, password);
    setUser(res.user);
    try {
      localStorage.setItem("bytenews_user", JSON.stringify(res.user));
      localStorage.setItem("bytenews_token", res.token);
    } catch {}
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password?: string) => {
    const res = await apiRegister(name, email, password);
    setUser(res.user);
    try {
      localStorage.setItem("bytenews_user", JSON.stringify(res.user));
      localStorage.setItem("bytenews_token", res.token);
    } catch {}
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setActiveView("feed");
    try {
      localStorage.removeItem("bytenews_user");
      localStorage.removeItem("bytenews_token");
    } catch {}
  };

  const loginAsDemoAuthor = () => {
    setUser(DEMO_AUTHOR_PROFILE);
    try {
      localStorage.setItem(
        "bytenews_user",
        JSON.stringify(DEMO_AUTHOR_PROFILE)
      );
      localStorage.setItem("bytenews_token", "demo-jwt-token");
    } catch {}
    setIsAuthModalOpen(false);
  };

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
        logout,
        loginAsDemoAuthor,
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
