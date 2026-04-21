"use client";

import { useAppStore } from "@/lib/store";

const MENUS = [
  { id: "tarot", icon: "🔮", label: "타로" },
  { id: "today", icon: "🌅", label: "오늘" },
  { id: "palm", icon: "✋", label: "손금" },
  { id: "star", icon: "⭐", label: "별자리" },
  { id: "match", icon: "💕", label: "궁합" },
  { id: "money", icon: "💰", label: "재물" },
  { id: "monthly", icon: "📅", label: "월간" },
] as const;

export default function Drawer() {
  const { activeMenu, setActiveMenu, toggleSidebar } = useAppStore();

  return (
    <nav className="mobile-drawer">
      {MENUS.map((m) => (
        <button
          key={m.id}
          className={`drawer-item ${activeMenu === m.id ? "active" : ""}`}
          onClick={() => {
            setActiveMenu(m.id);
            toggleSidebar(true);
          }}
        >
          <span className="drawer-icon">{m.icon}</span>
          <span className="drawer-label">{m.label}</span>
        </button>
      ))}
    </nav>
  );
}
