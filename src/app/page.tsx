"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { TITLES } from "@/lib/cards";
import { clearOldCache } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";
import { Sidebar } from "@/components/sidebar";
import TarotPanel from "@/components/tarot/TarotPanel";
import TodayPanel from "@/components/today/TodayPanel";
import PalmPanel from "@/components/palm/PalmPanel";
import StarPanel from "@/components/star/StarPanel";
import MatchPanel from "@/components/match/MatchPanel";
import MoneyPanel from "@/components/money/MoneyPanel";
import MonthlyPanel from "@/components/monthly/MonthlyPanel";
import UserInfoModal from "@/components/modals/UserInfoModal";
import LoginModal from "@/components/modals/LoginModal";
import LimitModal from "@/components/modals/LimitModal";
import Drawer from "@/components/drawer/Drawer";

export default function Home() {
  const { activeMenu, sidebarCollapsed, setCurrentUser, toggleSidebar } = useAppStore();
  const scrollPosRef = useRef<Record<string, number>>({});
  const prevMenuRef = useRef(activeMenu);
  const touchStartY = useRef(0);

  useEffect(() => {
    clearOldCache();
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 패널 스크롤 시 사이드바 자동 접기 (모바일)
  const handlePanelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (window.innerWidth <= 768 && e.currentTarget.scrollTop > 30) {
      toggleSidebar(true);
    }
  }, [toggleSidebar]);

  // 터치 스와이프 위로 → 사이드바 접기 (모바일)
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (window.innerWidth > 768) return;
      const deltaY = touchStartY.current - e.touches[0].clientY;
      if (deltaY > 15) toggleSidebar(true);
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [toggleSidebar]);

  // 메뉴 전환 시 스크롤 위치 저장/복원
  useEffect(() => {
    const prev = prevMenuRef.current;
    if (prev !== activeMenu) {
      const prevPanel = document.querySelector<HTMLElement>(`.panel-${prev}`);
      if (prevPanel) scrollPosRef.current[prev] = prevPanel.scrollTop;

      const nextPanel = document.querySelector<HTMLElement>(`.panel-${activeMenu}`);
      if (nextPanel && scrollPosRef.current[activeMenu] !== undefined) {
        setTimeout(() => { nextPanel.scrollTop = scrollPosRef.current[activeMenu]; }, 0);
      }
      prevMenuRef.current = activeMenu;
    }
  }, [activeMenu]);

  async function initAuth() {
    try {
      const sb = getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      }

      sb.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setCurrentUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
        }
      });
    } catch (e) {
      console.error("Auth init error:", e);
    }
  }

  const panels: Record<string, React.ReactNode> = {
    tarot: <TarotPanel />,
    today: <TodayPanel />,
    palm: <PalmPanel />,
    star: <StarPanel />,
    match: <MatchPanel />,
    money: <MoneyPanel />,
    monthly: <MonthlyPanel />,
  };

  return (
    <div className={`app ${sidebarCollapsed ? "sb-collapsed" : ""}`}>
      <Sidebar />
      <main className="main">
        <div className="main-header desktop-only">
          <div className="main-title font-serif">{TITLES[activeMenu] || "운 다아라"}</div>
        </div>
        {Object.entries(panels).map(([id, panel]) => (
          <div
            key={id}
            className={`panel panel-${id} ${activeMenu === id ? "active" : ""}`}
            onScroll={activeMenu === id ? handlePanelScroll : undefined}
          >
            {panel}
          </div>
        ))}
      </main>

      <Drawer />
      <UserInfoModal />
      <LoginModal />
      <LimitModal />
    </div>
  );
}
