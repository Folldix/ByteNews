"use client";

import React from "react";

interface BookmarkButtonProps {
  active: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
}

export function BookmarkButton({
  active,
  onClick,
  label = "Зберегти в закладки",
  className = "",
}: BookmarkButtonProps) {
  if (active) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={true}
        onClick={onClick}
        className={`relative size-[32px] cursor-pointer shrink-0 transition ${className}`}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="31" height="31" rx="11.5" fill="#ECFDF5" stroke="#6EE7B7" />
          <path
            d="M10 11.2002V20.6854C10 22.0464 10 22.7268 10.2041 23.1433C10.5824 23.9151 11.4116 24.3588 12.2637 24.2454C12.7234 24.1842 13.2896 23.8067 14.4221 23.0518L14.4248 23.0499C14.8737 22.7507 15.0981 22.6011 15.333 22.5181C15.7642 22.3656 16.2348 22.3656 16.666 22.5181C16.9013 22.6012 17.1266 22.7515 17.5773 23.0519C18.7098 23.8069 19.2767 24.1841 19.7364 24.2452C20.5885 24.3586 21.4176 23.9151 21.7959 23.1433C22 22.7269 22 22.0462 22 20.6854V11.1969C22 10.079 22 9.5192 21.7822 9.0918C21.5905 8.71547 21.2837 8.40973 20.9074 8.21799C20.4796 8 19.9203 8 18.8002 8H13.2002C12.0801 8 11.5196 8 11.0918 8.21799C10.7155 8.40973 10.4097 8.71547 10.218 9.0918C10 9.51962 10 10.0801 10 11.2002Z"
            fill="#059669"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={false}
      onClick={onClick}
      className={`group/bm relative size-[32px] cursor-pointer shrink-0 transition ${className}`}
    >
      <div className="group-hover/bm:hidden">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="31" height="31" rx="11.5" fill="white" fillOpacity="0.8" stroke="#E2E8F0" />
          <path
            d="M10 20.6854V11.2002C10 10.0801 10 9.51962 10.218 9.0918C10.4097 8.71547 10.7155 8.40973 11.0918 8.21799C11.5196 8 12.0801 8 13.2002 8H18.8002C19.9203 8 20.4796 8 20.9074 8.21799C21.2837 8.40973 21.5905 8.71547 21.7822 9.0918C22 9.5192 22 10.079 22 11.1969V20.6854C22 22.0462 22 22.7269 21.7959 23.1433C21.4176 23.9151 20.5885 24.3586 19.7364 24.2452C19.2767 24.1841 18.7098 23.8069 17.5773 23.0519C17.1266 22.7515 16.9013 22.6012 16.666 22.5181C16.2348 22.3656 15.7642 22.3656 15.333 22.5181C15.0981 22.6011 14.8737 22.7507 14.4248 23.0499L14.4221 23.0518C13.2896 23.8067 12.7234 24.1842 12.2637 24.2454C11.4116 24.3588 10.5824 23.9151 10.2041 23.1433C10 22.7268 10 22.0464 10 20.6854Z"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="hidden group-hover/bm:block">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="31" height="31" rx="11.5" fill="white" stroke="#CBD5E1" />
          <path
            d="M10 20.6854V11.2002C10 10.0801 10 9.51962 10.218 9.0918C10.4097 8.71547 10.7155 8.40973 11.0918 8.21799C11.5196 8 12.0801 8 13.2002 8H18.8002C19.9203 8 20.4796 8 20.9074 8.21799C21.2837 8.40973 21.5905 8.71547 21.7822 9.0918C22 9.5192 22 10.079 22 11.1969V20.6854C22 22.0462 22 22.7269 21.7959 23.1433C21.4176 23.9151 20.5885 24.3586 19.7364 24.2452C19.2767 24.1841 18.7098 23.8069 17.5773 23.0519C17.1266 22.7515 16.9013 22.6012 16.666 22.5181C16.2348 22.3656 15.7642 22.3656 15.333 22.5181C15.0981 22.6011 14.8737 22.7507 14.4248 23.0499L14.4221 23.0518C13.2896 23.8067 12.7234 24.1842 12.2637 24.2454C11.4116 24.3588 10.5824 23.9151 10.2041 23.1433C10 22.7268 10 22.0464 10 20.6854Z"
            stroke="#334155"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
