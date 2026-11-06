"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";

export function ReporterCabinetWidget() {
  const { user, openAuthModal, setActiveView } = useAuth();

  const handleAction = () => {
    if (!user) {
      openAuthModal();
    } else {
      setActiveView("profile");
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <section className="backdrop-blur-[10px] bg-white/80 border border-[#e2e8f0] rounded-[16px] p-4 sm:p-[20px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.04)] flex flex-col gap-[12px] items-start relative overflow-hidden w-full h-full">
      {/* Декоративне світіння */}
      <div className="absolute right-[-30px] top-[-30px] size-[140px] pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 208 208" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#glow_f)">
            <circle cx="104" cy="104" r="64" fill="#10B981" fillOpacity="0.15" />
          </g>
          <defs>
            <filter id="glow_f" x="0" y="0" width="208" height="208" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="20" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* reporter_logo (36x36) */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <rect width="36" height="36" rx="16" fill="#10B981" fillOpacity="0.15" />
        <rect x="0.5" y="0.5" width="35" height="35" rx="15.5" stroke="#10B981" strokeOpacity="0.3" />
        <path
          d="M18 13.6813L10 21.8938V26H26M10 26L14 26L22 17.7875M18 13.6813L20.8686 10.7365L20.8704 10.7347C21.2652 10.3293 21.463 10.1263 21.691 10.0502C21.8919 9.98325 22.1082 9.98325 22.3091 10.0502C22.5369 10.1262 22.7345 10.3291 23.1288 10.7338L24.8686 12.5199C25.2646 12.9264 25.4627 13.1297 25.5369 13.3641C25.6022 13.5703 25.6021 13.7924 25.5369 13.9986C25.4628 14.2328 25.265 14.4359 24.8695 14.8418L24.8686 14.8427L22 17.7875M18 13.6813L22 17.7875"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h3 className="font-mono font-bold text-[13px] sm:text-[14px] text-[#0f172a] leading-snug break-words">
        Бажаєте писати для ByteNews?
      </h3>
      <p className="font-sans font-normal text-[12px] leading-[1.5] text-[#475569] break-words">
        Перемкніть профіль у режим репортера, щоб публікувати технічні розслідування, репортажі та аналітику.
      </p>
      <button
        type="button"
        onClick={handleAction}
        className="w-full min-h-[42px] sm:min-h-[44px] py-[12px] sm:py-[14px] px-[10px] rounded-[12px] bg-[#0f172a] hover:bg-[#059669] text-white font-mono font-bold text-[12px] leading-none flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-[0.99] mt-auto"
      >
        Кабінет репортера
      </button>
    </section>
  );
}
