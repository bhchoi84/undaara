"use client";

import { useAppStore } from "@/lib/store";
import { getSocialCount } from "@/lib/utils";

export default function LimitModal() {
  const { showLimitModal, setShowLimitModal } = useAppStore();

  if (!showLimitModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
      <div className="modal-content limit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title font-serif">오늘의 무료 상담 완료</div>
        <div className="modal-sub">
          오늘의 무료 상담을 모두 사용했어요.<br />
          <b>지금 {getSocialCount("premium")}명이 프리미엄으로 상담 중이에요.</b>
        </div>

        <div className="limit-options">
          <div className="limit-option">
            <div className="limit-option-title">프리미엄 업그레이드</div>
            <div className="limit-option-desc">하루 30회 상담 + 손금/관상 무제한</div>
            <button className="submit-btn gold-btn">프리미엄 시작하기 ✨</button>
          </div>
          <div className="limit-option">
            <div className="limit-option-title">공유 보너스</div>
            <div className="limit-option-desc">결과를 공유하면 보너스 1회 (하루 3번)</div>
          </div>
        </div>

        <button className="modal-close" onClick={() => setShowLimitModal(false)}>닫기</button>
      </div>
    </div>
  );
}
