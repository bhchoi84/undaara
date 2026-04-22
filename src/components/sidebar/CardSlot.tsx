"use client";

import { useAppStore } from "@/lib/store";
import { drawSeededCards, getCardImagePath, isCustomSymbol } from "@/lib/cards";
import { getUserInfo } from "@/lib/utils";
import CardSymbolIcon from "./CardSymbolIcon";

interface CardSlotProps {
  index: number;
  label: string;
}

export default function CardSlot({ index, label }: CardSlotProps) {
  const { drawnCards, flippedCards, flipCard, setDrawnCards } = useAppStore();

  const isFlipped = flippedCards[index];
  const card = drawnCards?.[index];

  const handleClick = () => {
    if (isFlipped) {
      // 이미 뒤집힌 카드 → 해당 결과로 스크롤
      const el = document.querySelector(`[data-card-index="${index}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // 아직 전체 뽑기 안 한 경우 → 별자리+날짜 기반 셔플
    if (!drawnCards) {
      const u = getUserInfo();
      const cards = drawSeededCards(3, u?.zodiac);
      setDrawnCards(cards);
    }

    flipCard(index);

    // 개별 카드 해석 이벤트
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("cardFlipped", { detail: { index } })
      );
    }, 100);
  };

  const imagePath = card ? getCardImagePath(card) : null;

  return (
    <div
      className={`mini-card ${isFlipped ? "revealed" : "unflipped"} ${isFlipped && card?.reversed ? "card-reversed" : ""}`}
      onClick={handleClick}
    >
      <div className="card-sym">
        {isFlipped && card ? (
          imagePath ? (
            <img
              src={imagePath}
              alt={card.name}
              className={`card-image ${card.reversed ? "reversed-img" : ""}`}
              onError={(e) => {
                // 이미지 없으면 이모지 폴백
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null
        ) : null}
        {isFlipped && card ? (
          <span className={imagePath ? "hidden" : ""}>
            {isCustomSymbol(card.sym) ? (
              <CardSymbolIcon type={card.sym} />
            ) : (
              card.sym
            )}
          </span>
        ) : (
          "✦"
        )}
      </div>
      <div className="card-pos">
        {label}
        {isFlipped && card?.reversed && <span className="reversed-badge">↓</span>}
      </div>
    </div>
  );
}
