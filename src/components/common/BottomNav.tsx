"use client";

import { useAppStore } from "@/lib/store";

/**
 * 메인 화면 하단 네비게이션 (프로토타입 디자인).
 * 7개 메뉴: 오늘 / 타로 / 손금 / 별자리 / 궁합 / 재물 / 미래.
 * 각 메뉴는 고유 강조색(accent)을 가진다.
 */

interface MenuItem {
  id: string;
  label: string;
  accent: string;
  Icon: React.FC<{ size?: number }>;
}

// ── 아이콘 (프로토타입에서 가져옴) ──
const IconToday: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden>
    <defs>
      <linearGradient id="cardA" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="cardB" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#e1c471" />
      </linearGradient>
    </defs>
    <rect x="3.5" y="5.5" width="9" height="14" rx="1.6" transform="rotate(-12 8 12.5)" fill="url(#cardA)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
    <rect x="8.5" y="4" width="9" height="15" rx="1.6" fill="url(#cardB)" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" />
    <path d="M13 8.5 L13.7 10.4 L15.6 10.7 L14.2 12 L14.6 14 L13 13 L11.4 14 L11.8 12 L10.4 10.7 L12.3 10.4 Z" fill="#7c4f0f" opacity="0.7" />
    <rect x="14" y="6" width="9" height="13.5" rx="1.6" transform="rotate(11 18.5 12.5)" fill="rgba(99,102,241,0.5)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
  </svg>
);

const IconTarot: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden>
    <rect x="6" y="3.5" width="14" height="19" rx="2" fill="rgba(167,139,250,0.18)" stroke="currentColor" strokeWidth="1.4" />
    <path d="M13 7 L14.5 11 L18.5 11.5 L15.5 14.2 L16.4 18.2 L13 16 L9.6 18.2 L10.5 14.2 L7.5 11.5 L11.5 11 Z" fill="currentColor" opacity="0.9" />
    <circle cx="13" cy="20.2" r="0.6" fill="currentColor" />
  </svg>
);

const IconPalm: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 22 C7 21 5.5 18.5 5.5 16 L5.5 11 C5.5 10.2 6.2 9.5 7 9.5 C7.8 9.5 8.5 10.2 8.5 11 L8.5 13" />
    <path d="M8.5 13 L8.5 5.5 C8.5 4.7 9.2 4 10 4 C10.8 4 11.5 4.7 11.5 5.5 L11.5 12.5" />
    <path d="M11.5 12.5 L11.5 4 C11.5 3.2 12.2 2.5 13 2.5 C13.8 2.5 14.5 3.2 14.5 4 L14.5 12.5" />
    <path d="M14.5 12.5 L14.5 4.8 C14.5 4 15.2 3.3 16 3.3 C16.8 3.3 17.5 4 17.5 4.8 L17.5 13" />
    <path d="M17.5 13 L17.5 9 C17.5 8.2 18.2 7.5 19 7.5 C19.8 7.5 20.5 8.2 20.5 9 L20.5 16 C20.5 19 18.5 22 15 22 L11 22" />
    <path d="M9 16.5 Q12 14.5 16.5 16.5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <path d="M9.5 18.5 Q13 17.5 17 19" stroke="currentColor" strokeWidth="1" opacity="0.45" />
  </svg>
);

const IconStar: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden>
    <circle cx="13" cy="13" r="9.5" stroke="currentColor" strokeWidth="1.5" fill="rgba(251,191,36,0.10)" />
    <path d="M13 5 L14.6 10.4 L20.2 10.6 L15.7 14 L17.4 19.4 L13 16.4 L8.6 19.4 L10.3 14 L5.8 10.6 L11.4 10.4 Z" fill="currentColor" opacity="0.85" />
  </svg>
);

const IconMatch: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden>
    <path d="M9.5 21 C9.5 21 3 17 3 11.5 C3 8.7 5.2 6.5 8 6.5 C9.7 6.5 11 7.5 11.5 8.8 C12 7.5 13.3 6.5 15 6.5 C17.8 6.5 20 8.7 20 11.5 C20 14 18.5 16.4 16.5 18.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="rgba(244,114,182,0.18)" />
    <path d="M19.5 21.5 L19.5 18.5 M18 20 L21 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="22" cy="14" r="0.8" fill="currentColor" opacity="0.7" />
    <circle cx="6" cy="20" r="0.6" fill="currentColor" opacity="0.5" />
  </svg>
);

const IconMoney: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden>
    <path d="M9 5 L11 7 L15 7 L17 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M11 7 C7 9.5 4.5 13.5 4.5 17 C4.5 20.5 7.5 22.5 13 22.5 C18.5 22.5 21.5 20.5 21.5 17 C21.5 13.5 19 9.5 15 7 L11 7 Z" fill="rgba(251,191,36,0.18)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 13 L13 18 L16 13 M9.5 15.5 L16.5 15.5 M9.5 16.5 L16.5 16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMonthly: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="5.5" width="18" height="16" rx="2" fill="rgba(129,140,248,0.10)" />
    <line x1="4" y1="10" x2="22" y2="10" />
    <line x1="9" y1="3.5" x2="9" y2="7" />
    <line x1="17" y1="3.5" x2="17" y2="7" />
    <circle cx="13" cy="15.5" r="1.2" fill="currentColor" />
  </svg>
);

const MENUS: MenuItem[] = [
  { id: "today",   label: "오늘",   accent: "#e1c471", Icon: IconToday },
  { id: "tarot",   label: "타로",   accent: "#d3bbff", Icon: IconTarot },
  { id: "palm",    label: "손금",   accent: "#F472B6", Icon: IconPalm },
  { id: "star",    label: "별자리", accent: "#FBBF24", Icon: IconStar },
  { id: "match",   label: "궁합",   accent: "#F472B6", Icon: IconMatch },
  { id: "money",   label: "재물",   accent: "#34D399", Icon: IconMoney },
  { id: "monthly", label: "미래",   accent: "#818CF8", Icon: IconMonthly },
];

export default function BottomNav() {
  const { activeMenu, setActiveMenu, toggleSidebar } = useAppStore();

  function selectMenu(id: string) {
    try {
      setActiveMenu(id);
      toggleSidebar(true); // 모바일 사이드바가 떠있다면 닫기
    } catch (e) {
      console.error("nav select error:", e);
    }
  }

  return (
    <nav className="bottom-nav-v2" aria-label="메인 메뉴">
      {MENUS.map((m) => {
        const isActive = m.id === activeMenu;
        const { Icon } = m;
        return (
          <button
            key={m.id}
            onClick={() => selectMenu(m.id)}
            className={`bn-item ${isActive ? "active" : ""}`}
            style={{ "--accent": m.accent } as React.CSSProperties}
            aria-label={m.label}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && <span className="bn-dot" aria-hidden />}
            <span className="bn-icon"><Icon size={26} /></span>
            <span className="bn-label">{m.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
