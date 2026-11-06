"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, Sparkles, Check, X } from "lucide-react";

type DigestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TOPICS_COL1 = [
  { id: "ai", label: "🤖 ШІ & Нейромережі", defaultSelected: true },
  { id: "security", label: "🔒 Кібербезпека", defaultSelected: true },
  { id: "hardware", label: "⚡ Залізо & Чіпи", defaultSelected: false },
];

const TOPICS_COL2 = [
  { id: "web", label: "💻 Веб & Архітектура", defaultSelected: true },
  { id: "gamedev", label: "🎮 GameDev & 3D", defaultSelected: false },
  { id: "startups", label: "🚀 Стартапи та інвестиції", defaultSelected: false },
];

export function DigestModal({ isOpen, onClose }: DigestModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    [...TOPICS_COL1, ...TOPICS_COL2].forEach((t) => {
      if (t.defaultSelected) initial.add(t.id);
    });
    return initial;
  });
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSuccess(true);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#0f172a]/50 backdrop-blur-[20px] overflow-y-auto"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="digest-modal-title"
        className="w-full max-w-[512px] bg-white border border-[#e2e8f0] rounded-[20px] sm:rounded-[24px] shadow-[0px_20px_40px_-8px_rgba(15,23,42,0.2)] pb-4 sm:pb-6 pt-2 px-2 sm:px-3 flex flex-col gap-2.5 sm:gap-3.5 max-h-[90dvh] my-auto overflow-hidden"
      >
        {/* Спільна шапка модального вікна */}
        <div className="border-b border-[#f1f5f9] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between w-full shrink-0">
          <div className="flex items-center gap-[10px]">
            <div className="size-[36px] rounded-[10px] bg-[#ecfdf5] grid place-items-center text-[#059669] shrink-0">
              <Mail className="size-5 text-[#059669]" />
            </div>
            <div className="flex flex-col gap-[4px]">
              <h2
                id="digest-modal-title"
                className="font-mono font-bold text-[15px] text-[#0f172a] leading-none"
              >
                Ранковий IT-Дайджест
              </h2>
              <p className="font-mono font-normal text-[11px] text-[#64748b] leading-none">
                Лише важливе: 5 головних новин без води
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити вікно дайджесту"
            className="size-[32px] rounded-[10px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] grid place-items-center transition cursor-pointer shrink-0"
          >
            <X className="size-[18px] stroke-[2.2]" />
          </button>
        </div>

        {!isSuccess ? (
          /* Стан 1: Форма вибору рубрик і пошти */
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-3.5 w-full flex-1 overflow-y-auto overscroll-contain">
            {/* Блок вибору рубрик */}
            <div className="px-3 sm:px-6 flex flex-col gap-2 sm:gap-2.5 w-full">
              <p className="font-mono font-bold text-[11px] text-[#334155]">
                Оберіть рубрики для розсилки
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] w-full">
                {/* Колонка 1 */}
                <div className="flex flex-col gap-[8px] w-full">
                  {TOPICS_COL1.map((topic) => {
                    const isSelected = selectedTopics.has(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`w-full rounded-[10px] px-[12px] py-[8px] font-mono text-[11px] text-left transition cursor-pointer border ${
                          isSelected
                            ? "bg-[#ecfdf5] border-[#34d399] font-bold text-[#064e3b]"
                            : "bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1] font-normal text-[#475569]"
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>

                {/* Колонка 2 */}
                <div className="flex flex-col gap-[8px] w-full">
                  {TOPICS_COL2.map((topic) => {
                    const isSelected = selectedTopics.has(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`w-full rounded-[10px] px-[12px] py-[8px] font-mono text-[11px] text-left transition cursor-pointer border ${
                          isSelected
                            ? "bg-[#ecfdf5] border-[#34d399] font-bold text-[#064e3b]"
                            : "bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1] font-normal text-[#475569]"
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Блок електронної пошти та кнопки сабміту */}
            <div className="px-3 sm:px-6 pt-1 flex flex-col gap-3.5 sm:gap-4 w-full">
              <div className="flex flex-col gap-[10px] w-full">
                <label
                  htmlFor="digest-email-input"
                  className="font-mono font-bold text-[11px] text-[#334155]"
                >
                  Електронна пошта
                </label>
                <input
                  id="digest-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full h-[40px] rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#10b981] focus:bg-white focus:outline-none px-[16px] font-sans text-[12px] text-[#0f172a] placeholder:text-[#94a3b8]"
                />
              </div>

              <div className="flex flex-col items-center gap-[8px] w-full">
                <button
                  type="submit"
                  className="w-full h-[42px] rounded-[12px] bg-[#0f172a] hover:bg-[#059669] text-white font-mono font-bold text-[12px] flex items-center justify-center gap-[8px] shadow-[0px_2px_2px_rgba(0,0,0,0.15)] transition cursor-pointer"
                >
                  <Sparkles className="size-[14px] text-[#10b981]" />
                  <span>Підписатися на ранковий дайджест</span>
                </button>
                <p className="font-mono font-normal text-[11px] text-[#94a3b8] text-center">
                  Жодного спаму. Відписка в 1 клік у будь-якому листі.
                </p>
              </div>
            </div>
          </form>
        ) : (
          /* Стан 2: Підтвердження успішної підписки */
          <div className="px-4 py-6 sm:px-6 sm:py-7 flex flex-col items-center justify-center gap-4 sm:gap-5 w-full text-center flex-1 overflow-y-auto">
            <div className="size-[64px] rounded-full bg-[#ecfdf5] grid place-items-center">
              <div className="size-[32px] rounded-full border-2 border-[#059669] text-[#059669] grid place-items-center">
                <Check className="size-4 stroke-[3]" />
              </div>
            </div>

            <h3 className="font-sans font-bold text-[20px] text-[#0f172a]">
              Ви успішно підписалися!
            </h3>

            <p className="font-sans font-normal text-[14px] leading-[1.5] text-[#0f172a] max-w-[380px]">
              Лист із підтвердженням уже прямує до вашої скриньки. Ранковий дайджест надходитиме щодня о 08:00.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="bg-[#0f172a] hover:bg-[#059669] text-white font-mono font-normal text-[15px] px-[30px] py-[8px] rounded-[12px] transition cursor-pointer"
            >
              Зрозуміло
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
