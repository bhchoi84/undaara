"use client";

import { useAppStore } from "@/lib/store";
import { CARDS } from "@/lib/cards";
import { isCustomSymbol } from "@/lib/cards";
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

    // 아직 전체 뽑기 안 한 경우 → 랜덤 배정
    if (!drawnCards) {
      const pool = [...CARDS].sort(() => Math.random() - 0.5);
      setDrawnCards([pool[0], pool[1], pool[2]]);
    }

    flipCard(index);

    // 개별 카드 해석 이벤트
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("cardFlipped", { detail: { index } })
      );
    }, 100);
  };

  return (
    <div
      className={`mini-card ${isFlipped ? "revealed" : "unflipped"}`}
      onClick={handleClick}
    >
      <div className="card-sym">
        {isFlipped && card ? (
          isCustomSymbol(card.sym) ? (
            <CardSymbolIcon type={card.sym} />
          ) : (
            card.sym
          )
        ) : (
          "✦"
        )}
      </div>
      <div className="card-pos">{label}</div>
    </div>
  );
}
