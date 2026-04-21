"use client";

import { useAppStore } from "@/lib/store";
import { CARD_POS } from "@/lib/cards";
import { getSocialCount } from "@/lib/utils";
import CardSlot from "./CardSlot";
import NavMenu from "./NavMenu";

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activeMenu, setActiveMenu } =
    useAppStore();

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}
      onClick={(e) => {
        if (
          window.innerWidth <= 768 &&
          sidebarCollapsed &&
          !(e.target as HTMLElement).closest(".mini-card")
        ) {
          e.preventDefault();
          e.stopPropagation();
          toggleSidebar(false);
        }
      }}
    >
      {/* 로고 */}
      <div className="sidebar-logo">
        <div className="flex items-center gap-2.5">
          <div className="logo-mark">✨</div>
          <div>
            <div className="logo-name font-serif">운 다아라</div>
            <div className="logo-sub">당신의 행운 안내자</div>
          </div>
        </div>
      </div>

      {/* 오늘의 3카드 */}
      <div className="cards-section">
        <div className="section-hd">오늘의 3카드</div>
        <div className="card-row">
          {[0, 1, 2].map((i) => (
            <CardSlot key={i} index={i} label={CARD_POS[i]} />
          ))}
        </div>
        <CardHint />
        <DrawButton />
      </div>

      {/* 메뉴 */}
      <NavMenu activeMenu={activeMenu} onSelect={setActiveMenu} />

      {/* 실시간 카운터 */}
      <div className="ad-slot">
        <div className="ad-tag">실시간</div>
        <div className="ad-body">
          오늘 {getSocialCount("consulting")}명이 상담 중
        </div>
        <div className="ad-cta">커피 한 잔보다 싼 AI 운세 →</div>
      </div>

      {/* 로그인 섹션 */}
      <LoginSection />
    </aside>
  );
}

function CardHint() {
  const { flippedCards } = useAppStore();
  const allFlipped = flippedCards.every((f) => f);
  const remaining = 3 - flippedCards.filter((f) => f).length;

  if (allFlipped) return <div className="card-hint">카드가 모두 열렸어요 ✨</div>;
  if (remaining < 3) return <div className="card-hint">{remaining}장 남았어요</div>;
  return <div className="card-hint">카드를 클릭해 한 장씩 열거나</div>;
}

function DrawButton() {
  const { drawnCards, flippedCards } = useAppStore();
  const allFlipped = flippedCards.every((f) => f);

  if (allFlipped) {
    return (
      <button className="draw-btn mt-1" disabled>
        뽑기 완료
      </button>
    );
  }

  return (
    <button
      className="draw-btn mt-1"
      onClick={() => {
        // drawCards 로직은 TarotPanel에서 처리
        const event = new CustomEvent("drawAllCards");
        window.dispatchEvent(event);
      }}
    >
      한번에 뽑기
    </button>
  );
}

function LoginSection() {
  const { currentUser, setShowLoginModal } = useAppStore();

  if (currentUser) {
    const meta = currentUser.user_metadata || {};
    const name = meta.full_name || meta.name || meta.nickname || "회원";
    const avatar = meta.avatar_url || meta.picture;
    const provider = currentUser.app_metadata?.provider || "";

    return (
      <div className="login-section">
        <div className="login-profile">
          {avatar ? (
            <img src={avatar} className="login-avatar" alt="" />
          ) : (
            <div className="login-avatar login-avatar-placeholder">
              {name.charAt(0)}
            </div>
          )}
          <div className="login-info">
            <div className="login-name">{name}</div>
            <div className="login-provider">
              {provider === "kakao" ? "카카오" : "구글"} 로그인
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-section">
      <button className="login-btn" onClick={() => setShowLoginModal(true)}>
        로그인 / 회원가입
      </button>
    </div>
  );
}
