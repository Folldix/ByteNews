"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "../Icon";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    loginAsDemoAuthor,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Поля входу
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Поля реєстрації
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Відновлення паролю
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;
    await register(regName.trim(), regEmail.trim(), regPassword);
  };

  const handleSocialLogin = () => {
    // Вхід під тестовим акаунтом для перевірки
    loginAsDemoAuthor();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={closeAuthModal}
    >
      {/* Картка модального вікна */}
      <div
        className="w-full max-w-[448px] bg-white rounded-[24px] border border-[#e2e8f0] shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Шапка модального вікна */}
        <div className="px-[24px] py-[20px] bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            {/* Квадрат 40x40 з вектором Ключа */}
            <div className="w-[40px] h-[40px] rounded-[12px] bg-[#0f172a] flex items-center justify-center shrink-0">
              <Icon name="key" className="w-[20px] h-[20px] text-[#34d399]" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-[18px] text-[#0f172a] leading-tight">
                {isForgotPassword
                  ? "Відновлення паролю"
                  : activeTab === "signin"
                  ? "Вхід до акаунту"
                  : "Створення акаунту"}
              </h2>
              {isForgotPassword && (
                <p className="font-sans text-[12px] text-[#64748b] mt-0.5">
                  Введіть вашу електронну пошту для скидання
                </p>
              )}
            </div>
          </div>

          {/* Кнопка закриття (Хрест 32x32px) */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="w-[32px] h-[32px] rounded-[10px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center transition cursor-pointer"
            aria-label="Закрити"
          >
            <Icon name="close" className="w-[12px] h-[12px]" />
          </button>
        </div>

        {/* 2. Перемикач режимів: Вхід / Реєстрація */}
        {!isForgotPassword && (
          <div className="px-[24px] pt-[14px] pb-[4px] bg-white">
            <div className="bg-[#f1f5f9] p-[4px] rounded-[14px] flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`flex-1 py-[8px] text-[13px] font-mono font-bold rounded-[10px] transition cursor-pointer text-center ${
                  activeTab === "signin"
                    ? "bg-white text-[#0f172a] shadow-sm"
                    : "text-[#475569] hover:text-[#0f172a]"
                }`}
              >
                Вхід
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-[8px] text-[13px] font-mono font-bold rounded-[10px] transition cursor-pointer text-center ${
                  activeTab === "register"
                    ? "bg-white text-[#0f172a] shadow-sm"
                    : "text-[#475569] hover:text-[#0f172a]"
                }`}
              >
                Реєстрація
              </button>
            </div>
          </div>
        )}

        {/* 3. Основний вміст */}
        <div className="px-[24px] py-[20px]">
          {isForgotPassword ? (
            /* --- Екран відновлення паролю --- */
            forgotSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="font-sans font-bold text-[16px] text-[#0f172a]">
                  Інструкції надіслано на {forgotEmail}!
                </h3>
                <p className="font-sans text-[13px] text-[#64748b]">
                  Перевірте свою поштову скриньку для зміни паролю.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setIsForgotPassword(false);
                  }}
                  className="font-mono text-[13px] font-bold text-[#059669] hover:underline pt-2 cursor-pointer"
                >
                  Повернутися до входу
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-[14px]">
                <p className="font-sans text-[13px] text-[#475569] leading-relaxed">
                  Вкажіть вашу зареєстровану електронну пошту, і ми надішлемо посилання для відновлення доступу.
                </p>

                <div>
                  <label className="block text-[12px] font-mono font-bold text-[#334155] mb-[6px]">
                    Електронна пошта
                  </label>
                  <div className="h-[42px] px-[14px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] flex items-center gap-[10px] focus-within:border-[#059669] focus-within:bg-white transition">
                    <Icon name="mail" className="w-[18px] h-[14px] text-[#94a3b8] shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-transparent font-mono text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-[10px] pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="flex-1 h-[42px] rounded-[12px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#475569] font-mono text-[13px] font-bold transition cursor-pointer"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-[42px] rounded-[12px] bg-[#0f172a] hover:bg-[#1e293b] text-white font-mono text-[13px] font-bold transition flex items-center justify-center gap-[6px] cursor-pointer"
                  >
                    <span>Надіслати</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            )
          ) : activeTab === "signin" ? (
            /* --- Форма входу --- */
            <form onSubmit={handleSignIn} className="space-y-[12px]">
              {/* Поле Email */}
              <div>
                <label className="block text-[12px] font-mono font-bold text-[#334155] mb-[6px]">
                  Електронна пошта або логін
                </label>
                <div className="h-[42px] px-[14px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] flex items-center gap-[10px] focus-within:border-[#059669] focus-within:bg-white transition">
                  <Icon name="mail" className="w-[18px] h-[14px] text-[#94a3b8] shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="alex@bytenews.ua"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent font-mono text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Поле Пароль */}
              <div>
                <div className="flex items-center justify-between mb-[6px]">
                  <label className="text-[12px] font-mono font-bold text-[#334155]">
                    Пароль
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[11px] font-mono font-semibold text-[#059669] hover:underline cursor-pointer"
                  >
                    Забули пароль?
                  </button>
                </div>
                <div className="h-[42px] px-[14px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] flex items-center gap-[10px] focus-within:border-[#059669] focus-within:bg-white transition">
                  <Icon name="lock" className="w-[18px] h-[20px] text-[#94a3b8] shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent font-mono text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#94a3b8] hover:text-[#475569] cursor-pointer"
                    title={showPassword ? "Сховати пароль" : "Показати пароль"}
                  >
                    <Icon
                      name={showPassword ? "eyeOff" : "eye"}
                      className="w-[20px] h-[14px]"
                    />
                  </button>
                </div>
              </div>

              {/* Чекбокс Запам'ятати мене */}
              <div className="pt-1">
                <label className="flex items-center gap-[8px] text-[12px] font-sans text-[#475569] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-[4px] border-[#cbd5e1] text-[#059669] focus:ring-[#059669] cursor-pointer"
                  />
                  <span>Запам&apos;ятати мене на цьому пристрої</span>
                </label>
              </div>

              {/* Кнопка підтвердження входу */}
              <button
                type="submit"
                className="w-full h-[44px] bg-[#0f172a] hover:bg-[#1e293b] text-white font-mono font-bold text-[13px] rounded-[12px] flex items-center justify-center gap-[8px] transition cursor-pointer shadow-sm active:scale-[0.99] mt-2"
              >
                <Icon name="loginDoor" className="w-[16px] h-[16px] text-white" />
                <span>Увійти в акаунт</span>
              </button>

              {/* Розділювач АБО УВІЙДІТЬ ЧЕРЕЗ */}
              <div className="flex items-center gap-[10px] my-3">
                <div className="h-[1px] bg-[#e2e8f0] flex-1" />
                <span className="font-mono font-bold text-[10px] text-[#94a3b8] tracking-wider uppercase">
                  АБО УВІЙДІТЬ ЧЕРЕЗ
                </span>
                <div className="h-[1px] bg-[#e2e8f0] flex-1" />
              </div>

              {/* Головна кнопка Google (398x40px, білий фон, рамка, оригінальний логотип) */}
              <button
                type="button"
                onClick={handleSocialLogin}
                className="w-full h-[40px] bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-[12px] flex items-center justify-center gap-[10px] text-[13px] font-sans font-semibold text-[#334155] transition cursor-pointer shadow-xs"
              >
                <Icon name="google" className="w-[18px] h-[18px] shrink-0" />
                <span>Продовжити з Google</span>
              </button>

              {/* Рядок 3 провайдерів (GitHub, Apple, Telegram по 126x40px) */}
              <div className="grid grid-cols-3 gap-[8px]">
                <button
                  type="button"
                  onClick={handleSocialLogin}
                  className="h-[40px] bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-[12px] flex items-center justify-center gap-[8px] text-[13px] font-mono font-semibold text-[#0f172a] transition cursor-pointer shadow-xs"
                >
                  <Icon name="github" className="w-[16px] h-[16px] text-[#0f172a]" />
                  <span>GitHub</span>
                </button>

                <button
                  type="button"
                  onClick={handleSocialLogin}
                  className="h-[40px] bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-[12px] flex items-center justify-center gap-[8px] text-[13px] font-mono font-semibold text-[#0f172a] transition cursor-pointer shadow-xs"
                >
                  <Icon name="apple" className="w-[14px] h-[16px] text-[#0f172a]" />
                  <span>Apple</span>
                </button>

                <button
                  type="button"
                  onClick={handleSocialLogin}
                  className="h-[40px] bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-[12px] flex items-center justify-center gap-[8px] text-[13px] font-mono font-semibold text-[#0f172a] transition cursor-pointer shadow-xs"
                >
                  <Icon name="telegram" className="w-[18px] h-[18px]" />
                  <span>Telegram</span>
                </button>
              </div>

              {/* Нижнє перемикання */}
              <div className="pt-2 text-center">
                <span className="text-[12px] font-sans text-[#475569]">
                  Не маєте облікового запису?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="font-mono font-bold text-[#059669] hover:underline cursor-pointer"
                  >
                    Зареєструватися
                  </button>
                </span>
              </div>
            </form>
          ) : (
            /* --- Форма реєстрації --- */
            <form onSubmit={handleRegister} className="space-y-[12px]">
              {/* Ім'я та прізвище */}
              <div>
                <label className="block text-[12px] font-mono font-bold text-[#334155] mb-[6px]">
                  Ім’я та прізвище
                </label>
                <div className="h-[42px] px-[14px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] flex items-center gap-[10px] focus-within:border-[#059669] focus-within:bg-white transition">
                  <Icon name="user" className="w-[18px] h-[20px] text-[#94a3b8] shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="Тарас Шевченко"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-transparent font-sans text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Електронна пошта або логін */}
              <div>
                <label className="block text-[12px] font-mono font-bold text-[#334155] mb-[6px]">
                  Електронна пошта або логін
                </label>
                <div className="h-[42px] px-[14px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] flex items-center gap-[10px] focus-within:border-[#059669] focus-within:bg-white transition">
                  <Icon name="mail" className="w-[18px] h-[14px] text-[#94a3b8] shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="alex@bytenews.ua"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-transparent font-mono text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Пароль */}
              <div>
                <label className="block text-[12px] font-mono font-bold text-[#334155] mb-[6px]">
                  Пароль
                </label>
                <div className="h-[42px] px-[14px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] flex items-center gap-[10px] focus-within:border-[#059669] focus-within:bg-white transition">
                  <Icon name="lock" className="w-[18px] h-[20px] text-[#94a3b8] shrink-0" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    placeholder="Мінімум 8 символів"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-transparent font-mono text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="text-[#94a3b8] hover:text-[#475569] cursor-pointer"
                    title={showRegPassword ? "Сховати пароль" : "Показати пароль"}
                  >
                    <Icon
                      name={showRegPassword ? "eyeOff" : "eye"}
                      className="w-[20px] h-[14px]"
                    />
                  </button>
                </div>
              </div>

              {/* Згода з правилами */}
              <div className="pt-1">
                <label className="flex items-start gap-[8px] text-[11px] font-sans text-[#475569] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 rounded-[4px] border-[#cbd5e1] text-[#059669] focus:ring-[#059669] cursor-pointer"
                  />
                  <span>Я погоджуюся з правилами спільноти ByteNews та обробкою даних</span>
                </label>
              </div>

              {/* Кнопка Зареєструватися */}
              <button
                type="submit"
                disabled={!agreeTerms}
                className="w-full h-[44px] bg-[#0f172a] hover:bg-[#1e293b] text-white font-mono font-bold text-[13px] rounded-[12px] flex items-center justify-center gap-[8px] transition cursor-pointer shadow-sm active:scale-[0.99] mt-2 disabled:opacity-50"
              >
                <span>Зареєструватися</span>
              </button>

              {/* Розділювач */}
              <div className="flex items-center gap-[10px] my-3">
                <div className="h-[1px] bg-[#e2e8f0] flex-1" />
                <span className="font-mono font-bold text-[10px] text-[#94a3b8] tracking-wider uppercase">
                  АБО УВІЙДІТЬ ЧЕРЕЗ
                </span>
                <div className="h-[1px] bg-[#e2e8f0] flex-1" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleSocialLogin}
                className="w-full h-[40px] bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-[12px] flex items-center justify-center gap-[10px] text-[13px] font-sans font-semibold text-[#334155] transition cursor-pointer shadow-xs"
              >
                <Icon name="google" className="w-[18px] h-[18px] shrink-0" />
                <span>Продовжити з Google</span>
              </button>

              {/* 3 провайдери */}
              <div className="grid grid-cols-3 gap-[8px]">
                <button
                  type="button"
                  onClick={handleSocialLogin}
                  className="h-[40px] bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-[12px] flex items-center justify-center gap-[8px] text-[13px] font-mono font-semibold text-[#0f172a] transition cursor-pointer shadow-xs"
                >
                  <Icon name="github" className="w-[16px] h-[16px] text-[#0f172a]" />
                  <span>GitHub</span>
                </button>

                <button
                  type="button"
                  onClick={handleSocialLogin}
                  className="h-[40px] bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-[12px] flex items-center justify-center gap-[8px] text-[13px] font-mono font-semibold text-[#0f172a] transition cursor-pointer shadow-xs"
                >
                  <Icon name="apple" className="w-[14px] h-[16px] text-[#0f172a]" />
                  <span>Apple</span>
                </button>

                <button
                  type="button"
                  onClick={handleSocialLogin}
                  className="h-[40px] bg-white hover:bg-slate-50 border border-[#e2e8f0] rounded-[12px] flex items-center justify-center gap-[8px] text-[13px] font-mono font-semibold text-[#0f172a] transition cursor-pointer shadow-xs"
                >
                  <Icon name="telegram" className="w-[18px] h-[18px]" />
                  <span>Telegram</span>
                </button>
              </div>

              {/* Перемикач унізу */}
              <div className="pt-2 text-center">
                <span className="text-[12px] font-sans text-[#475569]">
                  Вже маєте обліковий запис?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className="font-mono font-bold text-[#059669] hover:underline cursor-pointer"
                  >
                    Увійти
                  </button>
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
