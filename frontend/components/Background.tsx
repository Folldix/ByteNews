import React from "react";

export function Background() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Базовий холст */}
      <div className="absolute inset-0 bg-[#f8fafc]" />

      {/* 2. Атмосферне сяйво (Ambient Glow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1920px] h-[1800px] overflow-hidden opacity-80 pointer-events-none">
        {/* Верхня ліва сфера (Emerald #10B981) */}
        <div
          className="absolute top-[40px] left-[20px] w-[500px] h-[500px] rounded-full bg-[#10b981] opacity-[0.14] blur-[90px] transform-gpu"
        />

        {/* Верхня права сфера (Sky Blue #0EA5E9) */}
        <div
          className="absolute top-[80px] -right-[120px] w-[856px] h-[856px] rounded-full bg-[#0ea5e9] opacity-[0.15] blur-[110px] transform-gpu"
        />

        {/* Нижня ліва сфера (Teal #14B8A6) */}
        <div
          className="absolute top-[850px] left-[80px] w-[762px] h-[762px] rounded-full bg-[#14b8a6] opacity-[0.10] blur-[100px] transform-gpu"
        />
      </div>

      {/* 3. Фірмова інженерна сітка ByteNews (крок 32px, колір #0F172A, opacity 0.04) */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0F172A 1px, transparent 1px),
            linear-gradient(to bottom, #0F172A 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          backgroundPosition: "center top",
        }}
      />
    </div>
  );
}
