"use client";

const MENUS = [
  { id: "tarot", label: "타로 카드", icon: "M12 3L14.5 9.5 21 12 14.5 14.5 12 21 9.5 14.5 3 12 9.5 9.5 12 3Z" },
  { id: "today", label: "오늘의 운세", icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
  { id: "palm", label: "AI 손금·관상", icon: "M18 11V6a2 2 0 00-4 0v4a2 2 0 00-4 0V4a2 2 0 00-4 0v9.5A6.5 6.5 0 0012.5 20h3.09a3 3 0 002.43-1.24l3.18-4.4A1.9 1.9 0 0020 13.12 2 2 0 0018 11V6z" },
  { id: "star", label: "별자리 운세", icon: "M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26Z" },
  { id: "match", label: "연애 궁합", icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z" },
  { id: "money", label: "재물운", icon: "M2 6h20v12H2zM12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M6 12h.01M18 12h.01" },
  { id: "monthly", label: "월간 운세", icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" },
] as const;

interface Props {
  activeMenu: string;
  onSelect: (menu: string) => void;
}

export default function NavMenu({ activeMenu, onSelect }: Props) {
  return (
    <nav className="nav-section">
      <div className="section-hd">메뉴</div>
      {MENUS.map((m) => (
        <div
          key={m.id}
          className={`nav-item n-${m.id} ${activeMenu === m.id ? "active" : ""}`}
          onClick={() => onSelect(m.id)}
        >
          <span className="nav-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={m.icon} />
            </svg>
          </span>
          {m.label}
        </div>
      ))}
    </nav>
  );
}
