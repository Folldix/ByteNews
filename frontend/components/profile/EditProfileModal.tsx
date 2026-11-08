"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Check, Image as ImageIcon, MapPin, User } from "lucide-react";
import { Icon } from "../Icon";
import { useAuth } from "../../context/AuthContext";

const PRESET_AVATARS = [
  "/avatars/Avatar_1.png",
  "/avatars/Avatar_2.png",
  "/avatars/Avatar_3.png",
  "/avatars/Avatar_4.png",
  "/avatars/Avatar_5.png",
  "/avatars/Avatar_6.png",
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [handle, setHandle] = useState((user?.handle || "").replace(/^@/, ""));
  const [roleTitle, setRoleTitle] = useState(user?.role_title || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || PRESET_AVATARS[0]);
  const [customAvatarInput, setCustomAvatarInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.full_name || "");
      setHandle((user.handle || "").replace(/^@/, ""));
      setRoleTitle(user.role_title || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setAvatarUrl(user.avatar_url || PRESET_AVATARS[0]);
      setError("");
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Вкажіть ваше ім'я.");
      return;
    }
    if (!handle.trim()) {
      setError("Вкажіть публічний нікнейм.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const cleanHandle = handle.trim().replace(/^@/, "");
      const finalAvatar = (showCustomInput && customAvatarInput.trim()) ? customAvatarInput.trim() : avatarUrl;
      const initials = fullName
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || "")
        .join("") || "BN";

      await updateProfile({
        full_name: fullName.trim(),
        handle: cleanHandle,
        role_title: roleTitle.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || undefined,
        avatar_url: finalAvatar,
        avatar_initials: initials,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося зберегти зміни.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0f172a]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="w-full max-w-[560px] bg-white border border-[#e2e8f0] rounded-[20px] sm:rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] my-auto"
      >
        {/* Шапка модального вікна */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-[#f1f5f9] bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="edit-profile-title"
                className="font-mono font-bold text-[16px] text-[#0f172a] leading-tight"
              >
                Редагування профілю
              </h2>
              <p className="text-[12px] text-slate-500 font-sans">
                Оновіть публічні дані вашого акаунта
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="w-[32px] h-[32px] rounded-[10px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <Icon name="close" className="w-[12px] h-[12px]" />
          </button>
        </div>

        {/* Тіло форми */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Вибір аватара */}
          <div className="space-y-2.5">
            <label className="block text-xs font-mono font-bold text-slate-700">
              Аватар профілю
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500 shadow-sm shrink-0">
                <img
                  src={showCustomInput && customAvatarInput.trim() ? customAvatarInput.trim() : avatarUrl}
                  alt="Обраний аватар"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="text-[11px] font-mono text-slate-500 mb-2">
                  Оберіть один із фірмових аватарів або вкажіть URL:
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {PRESET_AVATARS.map((preset, idx) => {
                    const isSelected = !showCustomInput && avatarUrl === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setShowCustomInput(false);
                          setAvatarUrl(preset);
                        }}
                        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-105"
                            : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                        }`}
                        title={`Аватар ${idx + 1}`}
                      >
                        <img
                          src={preset}
                          alt={`Аватар ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <span className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl border text-[10px] sm:text-[11px] font-mono font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      showCustomInput
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Власний URL</span>
                  </button>
                </div>
              </div>
            </div>

            {showCustomInput && (
              <div className="pt-2">
                <input
                  type="url"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Ім'я та нікнейм */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                Повне ім&apos;я *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Олександр Коваленко"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 transition font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                Публічний нікнейм *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-sm select-none">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="oleksandr_kovalenko"
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Посада / Підпис */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
              Посада або підпис
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Наприклад: Провідний IT-репортер & Head of AI"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 transition font-sans"
            />
          </div>

          {/* Локація */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
              Місто / Локація
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 select-none" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Київ, Україна"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 transition font-sans"
              />
            </div>
          </div>

          {/* Біографія */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono font-bold text-slate-700">
                Про себе (Bio)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {bio.length}/300
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Коротко розкажіть про свої інтереси, стек технологій або теми досліджень..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 transition font-sans resize-none leading-relaxed"
            />
          </div>

          {/* Кнопки дій */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-mono font-semibold transition cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#059669] text-white text-xs font-mono font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? "Зберігаємо..." : "Зберегти зміни"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
