"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { TITLES } from "@/lib/cards";
import { clearOldCache } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";
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
import StatusBar from "@/components/common/StatusBar";
import BottomNav from "@/components/common/BottomNav";
import InputBar from "@/components/common/InputBar";

export default function Home() {
  const {
    activeMenu,
    setCurrentUser,
    currentUser,
    setShowUserModal,
  } = useAppStore();
  const scrollPosRef = useRef<Record<string, number>>({});
  const prevMenuRef = useRef(activeMenu);

  useEffect(() => {
    clearOldCache();
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 메뉴 전환 시 스크롤 위치 저장/복원
  useEffect(() => {
    const prev = prevMenuRef.current;
    if (prev !== activeMenu) {
      const prevPanel = document.querySelector<HTMLElement>(`.panel-${prev}`);
      if (prevPanel) scrollPosRef.current[prev] = prevPanel.scrollTop;

      const nextPanel = document.querySelector<HTMLElement>(`.panel-${activeMenu}`);
      if (nextPanel) {
        const saved = scrollPosRef.current[activeMenu];
        setTimeout(() => {
          nextPanel.scrollTop = saved ?? 0;
        }, 0);
      }
      prevMenuRef.current = activeMenu;
    }
  }, [activeMenu]);

  // 패널 스크롤 시 헤더 그림자 효과 (선택)
  const handlePanelScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget.closest(".phone-frame");
      if (!el) return;
      if (e.currentTarget.scrollTop > 8) el.classList.add("scrolled");
      else el.classList.remove("scrolled");
    },
    []
  );

  async function initAuth() {
    try {
      const sb = getSupabase();
      const {
        data: { session },
      } = await sb.auth.getSession();
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
    <div className="app-shell">
      <div className="phone-frame">
        <StatusBar />

        {/* 상단 타이틀 + 로고 */}
        <header className="phone-header">
          <div className="ph-logo">
            <div className="ph-logo-mark" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" />
              </svg>
            </div>
            <div className="ph-logo-text">
              <div className="ph-logo-name font-serif">
                {TITLES[activeMenu] || "운 다아라"}
              </div>
              <div className="ph-logo-sub">당신의 행운 안내자</div>
            </div>
          </div>
          {currentUser && (
            <button
              className="ph-user-badge"
              onClick={() => setShowUserModal(true)}
              aria-label="내 정보 열기"
            >
              <span>
                {currentUser.user_metadata?.full_name ||
                  currentUser.user_metadata?.name ||
                  currentUser.user_metadata?.nickname ||
                  "회원"}
              </span>
              <span className="ph-user-dot">님</span>
            </button>
          )}
        </header>

        {/* 스크롤 영역 (각 패널이 active 일 때만 표시) */}
        <div className="phone-scroll">
          {Object.entries(panels).map(([id, panel]) => (
            <div
              key={id}
              className={`panel panel-${id} ${activeMenu === id ? "active" : ""}`}
              onScroll={activeMenu === id ? handlePanelScroll : undefined}
            >
              {panel}
            </div>
          ))}
        </div>

        {/* 입력창 + 하단 네비 */}
        <InputBar />
        <BottomNav />
      </div>

      <UserInfoModal />
      <LoginModal />
      <LimitModal />
    </div>
  );
}
