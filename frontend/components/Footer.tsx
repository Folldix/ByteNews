import React from "react";
import { Icon } from "./Icon";

// Векторні піктограми для підвалу сайту
function ShieldIcon({ color, bg }: { color: string; bg: string }) {
  return (
    <svg viewBox="0 0 16 18" fill="none" className="w-[16px] h-[18px] shrink-0">
      <path
        d="M8 1L1.5 3.5V8C1.5 12.5 4.5 15.8 8 17C11.5 15.8 14.5 12.5 14.5 8V3.5L8 1Z"
        fill={bg}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 9L7.2 10.7L10.5 7.3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DigestMailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 14" fill="none" className={className}>
      <rect
        x="1"
        y="1"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M1.5 2.5L9 8L16.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M12.5 1.5L1 6L5.5 7.5M12.5 1.5L8.5 12.5L5.5 7.5M12.5 1.5L5.5 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RssIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M2.5 6C4.8 6 6.7 7.9 6.7 10.2M2.5 2.5C7.2 2.5 11 6.3 11 11M3 11a0.5 0.5 0 1 1-1 0 0.5 0.5 0 0 1 1 0z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 12" fill="none" className={className}>
      <rect
        x="1"
        y="1"
        width="12"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M1.5 2L7 6.5L12.5 2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className}>
      <circle cx="6" cy="6" r="4.8" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="6" cy="6" rx="2.2" ry="4.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 6H10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-white/90 backdrop-blur-[15px] border-t border-[#e2e8f0] mt-auto">
      <div className="max-w-[1296px] mx-auto px-4 lg:px-0">
        {/* Верхній блок: 4 інформаційні колонки */}
        <div className="pt-[20px] pb-[24px] grid grid-cols-1 md:grid-cols-4 gap-[30px]">
          
          {/* Колонка 1: Логотип бренду та опис */}
          <div>
            <a href="/" className="inline-flex items-center gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[#0f172a] flex items-center justify-center shrink-0">
                <Icon name="logo" className="w-[16px] h-[10px] text-white" />
              </div>
              <span className="font-sans font-bold text-[20px] leading-tight text-[#0f172a]">
                Byte<span className="text-[#10b981]">News</span>
              </span>
            </a>
            <p className="text-[12px] leading-[18px] text-[#475569] max-w-[251px] mt-[10px]">
              Незалежне українське медіа про інженерію, штучний інтелект, кіберзахист та архітектуру систем. Пишемо для розробників, архітекторів та техлідів.
            </p>
          </div>

          {/* Колонка 2: РУБРИКИ */}
          <div>
            <h4 className="font-sans font-bold text-[12px] text-[#0f172a] tracking-wider mb-[8px]">
              РУБРИКИ
            </h4>
            <ul className="space-y-[8px]">
              {[
                "Штучний Інтелект",
                "Розробка",
                "Кібербезпека",
                "GameDev & 3D",
                "Залізо & Чіпи",
                "Стартапи & Ринок",
              ].map((category) => (
                <li key={category}>
                  <a
                    href={`#${encodeURIComponent(category)}`}
                    className="inline-block text-[12px] leading-[18px] text-[#475569] hover:text-[#059669] transition-colors"
                  >
                    › {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 3: Стандарти редакції */}
          <div>
            <h4 className="font-sans font-bold text-[12px] text-[#0f172a] tracking-wider mb-[12px]">
              Стандарти редакції
            </h4>
            <ul className="space-y-[12px] mb-[12px]">
              <li className="flex items-center gap-[14px]">
                <ShieldIcon color="#10B981" bg="#ECFDF5" />
                <span className="text-[12px] leading-[18px] text-[#475569]">
                  Фактчекінг першоджерел та CVE
                </span>
              </li>
              <li className="flex items-center gap-[14px]">
                <ShieldIcon color="#3B82F6" bg="#EFF6FF" />
                <span className="text-[12px] leading-[18px] text-[#475569]">
                  Технічний аудит кодових прикладів
                </span>
              </li>
              <li className="flex items-center gap-[14px]">
                <ShieldIcon color="#EF4444" bg="#FEF2F2" />
                <span className="text-[12px] leading-[18px] text-[#475569]">
                  Етичні норми та відсутність клікбейту
                </span>
              </li>
            </ul>

            {/* Кнопка Отримувати щоденний дайджест */}
            <a
              href="#digest"
              className="group w-[246px] h-[31px] px-[13px] bg-white hover:bg-[#ecfdf5] border border-[#e2e8f0] hover:border-[#a7f3d0] rounded-[12px] flex items-center justify-center gap-[6px] transition-colors cursor-pointer"
            >
              <DigestMailIcon className="w-[18px] h-[14px] shrink-0 text-[#059669]" />
              <span className="text-[11px] font-bold text-[#1e293b] group-hover:text-[#065f46] transition-colors">
                Отримувати щоденний дайджест
              </span>
            </a>
          </div>

          {/* Колонка 4: Канали зв'язку */}
          <div>
            <h4 className="font-sans font-bold text-[12px] text-[#0f172a] tracking-wider mb-[12px]">
              Канали зв&apos;язку
            </h4>
            <ul className="space-y-[12px]">
              <li>
                <a
                  href="https://t.me/bytenews_live"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-[8px] text-[12px] leading-[18px] text-[#475569] hover:text-[#059669] transition-colors"
                >
                  <TelegramIcon className="w-[14px] h-[14px] shrink-0 text-[#059669]" />
                  <span>@bytenews_live (Telegram)</span>
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="inline-flex items-center gap-[8px] text-[12px] leading-[18px] text-[#475569] hover:text-[#d97706] transition-colors"
                >
                  <RssIcon className="w-[14px] h-[14px] shrink-0 text-[#d97706]" />
                  <span>bytenews.dev/rss.xml</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:editor@bytenews.dev"
                  className="inline-flex items-center gap-[8px] text-[12px] leading-[18px] text-[#475569] hover:text-[#0284c7] transition-colors"
                >
                  <MailIcon className="w-[14px] h-[12px] shrink-0 text-[#0284c7]" />
                  <span>editor@bytenews.dev</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Нижня частина: Копірайт та посилання */}
        <div className="h-[43px] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between text-[11px]">
          <div className="font-mono text-[#64748b] leading-none">
            © 2026 ByteNews Media. Усі права захищено.
          </div>
          
          <div className="flex items-center gap-[12px] text-[#64748b] leading-none">
            <a href="#editorial" className="hover:text-[#0f172a] transition-colors">
              Редакційна політика
            </a>
            <span className="w-[4px] h-[4px] rounded-full bg-[#94a3b8] shrink-0" />
            <a href="#privacy" className="hover:text-[#0f172a] transition-colors">
              Конфіденційність
            </a>
            <span className="w-[4px] h-[4px] rounded-full bg-[#94a3b8] shrink-0" />
            <a
              href="#region"
              className="inline-flex items-center gap-[4px] text-[#047857] font-semibold hover:opacity-85 transition-opacity"
            >
              <GlobeIcon className="w-[12px] h-[12px] shrink-0 text-[#047857]" />
              <span>Україна</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
