"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  getUserInfo,
  buildSystemPrompt,
  formatReply,
  incrementUsage,
  canUseAPI,
} from "@/lib/utils";
import {
  drawSeededCards,
  getCardImagePath,
  getDirectionLabel,
  isCustomSymbol,
} from "@/lib/cards";
import type { TarotCard } from "@/lib/cards";
import ZodiacGrid from "@/components/common/ZodiacGrid";
import CardSymbolIcon from "@/components/sidebar/CardSymbolIcon";
import { ChatPanel } from "@/components/chat";

const POSITIONS = ["오늘", "미래", "주의할 일"];

/**
 * 오늘 패널 — 프로토타입 디자인.
 * 1) 상단: 오늘의 3카드 (큰 카드 3장)
 * 2) 카드가 모두 열렸을 때 "카드별 해석" 섹션
 * 3) 하단: AI 운세 폼 + 채팅
 */
export default function TodayPanel() {
  const {
    drawnCards,
    flippedCards,
    setDrawnCards,
    flipCard,
    zodiacSel,
    setZodiacSel,
    addMessage,
    setIsLoading,
    setShowLimitModal,
    setShowUserModal,
    setPendingAction,
  } = useAppStore();

  const [activeIdx, setActiveIdx] = useState<number>(1);
  const [collapsed, setCollapsed] = useState(false);
  const [concern, setConcern] = useState("");

  const allFlipped = flippedCards.every((f) => f);
  const flippedCount = flippedCards.filter((f) => f).length;

  // "한번에 뽑기" 이벤트 (사이드바 등 외부 트리거 호환)
  useEffect(() => {
    function onDrawAll() {
      drawAll();
    }
    window.addEventListener("drawAllCards", onDrawAll);
    return () => window.removeEventListener("drawAllCards", onDrawAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawAll() {
    try {
      const u = getUserInfo();
      const cards = drawSeededCards(3, u?.zodiac);
      setDrawnCards(cards);
      // 모든 카드 플립
      setTimeout(() => {
        [0, 1, 2].forEach((i) => flipCard(i));
      }, 50);
    } catch (e) {
      console.error("draw error:", e);
    }
  }

  function flipOne(i: number) {
    try {
      if (!drawnCards) {
        const u = getUserInfo();
        const cards = drawSeededCards(3, u?.zodiac);
        setDrawnCards(cards);
      }
      flipCard(i);
      setActiveIdx(i);
    } catch (e) {
      console.error("flip error:", e);
    }
  }

  async function runToday() {
    try {
      const u = getUserInfo();
      if (!u) {
        setPendingAction(runToday);
        setShowUserModal(true);
        return;
      }
      if (!canUseAPI()) {
        setShowLimitModal(true);
        return;
      }
      const z = zodiacSel.today || u.zodiac;
      if (!z) return;

      const extra = concern ? ` 특히 신경 쓰이는 것: ${concern}` : "";
      const prompt = `${u.name}님(${z}, ${u.age}세 ${u.gender})의 오늘 하루 운세를 알려주세요.${extra}\n\n아래 형식으로 알려주세요:\n🌅 총운\n(2~3문장)\n\n💕 애정운\n(2문장)\n\n💰 금전운\n(2문장)\n\n🩺 건강운\n(2문장)\n\n🍀 행운의 팁\n(1문장)\n\n만세력 사주와 별자리 특성을 연결해 따뜻하고 구체적으로 해석해 주세요.`;

      setIsLoading(true);
      const system = buildSystemPrompt();
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 3000,
          system,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || "";
      addMessage("today", {
        role: "bot",
        content: formatReply(reply),
        type: "text",
      });
      incrementUsage();
    } catch {
      addMessage("today", {
        role: "bot",
        content: "연결이 잠깐 끊겼어요. 다시 시도해 볼까요?",
        type: "text",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ChatPanel menuId="today">
      <div className="td-screen">
        {/* ── 오늘의 3카드 ── */}
        <div className="td-section-hd">
          <span className="td-star" aria-hidden>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 L14.4 8.4 L21 9.3 L16 13.7 L17.4 20 L12 16.6 L6.6 20 L8 13.7 L3 9.3 L9.6 8.4 Z" />
            </svg>
          </span>
          오늘의 3카드
        </div>

        <div className="td-top-row">
          {[0, 1, 2].map((i) => (
            <TopCardSlot
              key={i}
              index={i}
              label={POSITIONS[i]}
              card={drawnCards?.[i]}
              flipped={flippedCards[i]}
              active={activeIdx === i}
              onClick={() => (flippedCards[i] ? setActiveIdx(i) : flipOne(i))}
            />
          ))}
        </div>

        <div className="td-hint">
          {allFlipped
            ? "카드가 모두 열렸어요 ✨"
            : flippedCount > 0
              ? `${3 - flippedCount}장 남았어요`
              : "카드를 클릭해 한 장씩 열거나"}
        </div>

        <button
          className="td-draw-btn"
          onClick={drawAll}
          disabled={allFlipped}
          aria-label="한번에 뽑기"
        >
          {allFlipped ? "뽑기 완료" : "한번에 뽑기"}
        </button>

        {/* ── 카드별 해석 ── */}
        {allFlipped && drawnCards && (
          <>
            <div className="td-divider-row">
              <div className="td-divider-label">오늘의 해석</div>
              <div className="td-divider-line" />
              <button
                className="td-collapse-btn"
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? "펼치기" : "접기"}
              </button>
            </div>

            {!collapsed && (
              <div className="td-bottom-list">
                {drawnCards.map((c, i) => (
                  <BottomCardRow
                    key={i}
                    index={i}
                    label={POSITIONS[i]}
                    card={c}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── AI 운세 폼 ── */}
        <div className="td-form-card">
          <div className="td-form-title font-serif">🌅 오늘의 운세</div>
          <div className="td-form-desc">
            총운·애정·금전·건강까지 — 오늘 하루를 미리 알고 시작하세요
          </div>
          <div className="td-form-row">
            <div className="td-form-label">내 별자리</div>
            <ZodiacGrid
              selected={zodiacSel.today}
              onSelect={(z) => setZodiacSel("today", z)}
            />
          </div>
          <div className="td-form-row">
            <div className="td-form-label">오늘 특별히 신경 쓰이는 것 (선택)</div>
            <input
              className="td-form-input"
              placeholder="예: 연애, 직장, 건강, 시험..."
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
            />
          </div>
          <button className="td-form-submit" onClick={runToday}>
            AI 운세 받기 🌅
          </button>
        </div>
      </div>
    </ChatPanel>
  );
}

/* ── 상단 큰 카드 슬롯 ── */
interface TopCardSlotProps {
  index: number;
  label: string;
  card?: TarotCard;
  flipped: boolean;
  active: boolean;
  onClick: () => void;
}

function TopCardSlot({ label, card, flipped, active, onClick }: TopCardSlotProps) {
  const imagePath = card ? getCardImagePath(card) : null;
  return (
    <button
      className={`td-top-slot ${active ? "active" : ""} ${flipped ? "revealed" : "unflipped"}`}
      onClick={onClick}
      aria-label={label}
    >
      <div className="td-slot-label">{label}</div>
      <div className="td-slot-img">
        {flipped && card ? (
          imagePath ? (
            <img
              src={imagePath}
              alt={card.name}
              style={{
                transform: card.reversed ? "rotate(180deg)" : "none",
              }}
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                const fallback = t.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null
        ) : null}
        {flipped && card ? (
          <span
            className="td-slot-fallback"
            style={{ display: imagePath ? "none" : "flex" }}
          >
            {isCustomSymbol(card.sym) ? (
              <CardSymbolIcon type={card.sym} />
            ) : (
              card.sym
            )}
          </span>
        ) : (
          <span className="td-slot-back">✦</span>
        )}
      </div>
      <div className="td-slot-tag">
        {flipped && card ? (
          <>
            <span className="td-slot-arrow" aria-hidden>
              {card.reversed ? "↓" : "↑"}
            </span>
            <span>{card.reversed ? "역방향" : "정방향"}</span>
          </>
        ) : (
          <span className="td-slot-tag-empty">미공개</span>
        )}
      </div>
    </button>
  );
}

/* ── 하단 카드 해석 행 ── */
function BottomCardRow({
  card,
  label,
}: {
  index: number;
  card: TarotCard;
  label: string;
}) {
  const imagePath = getCardImagePath(card);
  const accent = card.reversed ? "#e1c471" : "#34D399";
  const tagBg = card.reversed
    ? "rgba(225,196,113,0.16)"
    : "rgba(52,211,153,0.16)";
  const keywords = (card.keywords || "").split(/[,·、]\s*/).filter(Boolean);

  return (
    <div className="td-bottom-row" style={{ borderLeftColor: accent }}>
      <div className="td-bottom-thumb">
        {imagePath ? (
          <img
            src={imagePath}
            alt={card.name}
            style={{ transform: card.reversed ? "rotate(180deg)" : "none" }}
          />
        ) : isCustomSymbol(card.sym) ? (
          <CardSymbolIcon type={card.sym} />
        ) : (
          <span className="td-bottom-emoji">{card.sym}</span>
        )}
      </div>
      <div className="td-bottom-body">
        <div className="td-bottom-pos">{label}</div>
        <div className="td-bottom-name-row">
          <span className="td-bottom-name font-serif">{card.name}</span>
          <span
            className="td-bottom-tag"
            style={{ background: tagBg, color: accent }}
          >
            {getDirectionLabel(card)}
          </span>
        </div>
        <div className="td-bottom-en">{card.en}</div>
        <div className="td-bottom-kw">
          {keywords.map((k, i) => (
            <span key={i} className="td-kw-chip">
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
