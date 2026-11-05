import React from "react";

export function Background() {
  return (
    <div
      className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Базовий холст */}
      <div className="absolute inset-0 bg-[#f8fafc]" />

      {/* 2. Атмосферне сяйво (Ambient Glow) відносно центру сторінки 1296px */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1296px] h-full pointer-events-none">
        {/* Верхня ліва сфера (Emerald #10B981) */}
        <div
          className="absolute top-[-10px] left-[-435px] w-[500px] h-[500px] rounded-full bg-[#10b981] opacity-[0.14] blur-[90px] transform-gpu"
        />

        {/* Верхня права сфера (Sky Blue #0EA5E9) */}
        <div
          className="absolute top-[60px] left-[1211px] w-[856px] h-[856px] rounded-full bg-[#0ea5e9] opacity-[0.15] blur-[110px] transform-gpu"
        />

        {/* Нижня ліва сфера (Teal #14B8A6) */}
        <div
          className="absolute top-[797px] left-[-273px] w-[762px] h-[762px] rounded-full bg-[#14b8a6] opacity-[0.10] blur-[100px] transform-gpu"
        />
      </div>

      {/* 3. Фірмова інженерна сітка 32x32px через векторний SVG pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
        <defs>
          <pattern
            id="bytenews-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
            x="50%"
            y="0"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="#0F172A"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bytenews-grid)" />
      </svg>
    </div>
  );
}
