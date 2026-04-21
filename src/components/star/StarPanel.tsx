"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { getUserInfo, buildSystemPrompt, formatReply, incrementUsage, canUseAPI } from "@/lib/utils";
import ZodiacGrid from "@/components/common/ZodiacGrid";
import { ChatPanel } from "@/components/chat";

export default function StarPanel() {
  const { zodiacSel, setZodiacSel, addMessage, setIsLoading, setShowLimitModal, setShowUserModal, setPendingAction } = useAppStore();
  const [concern, setConcern] = useState("");

  async function runStar() {
    const u = getUserInfo();
    if (!u) { setPendingAction(runStar); setShowUserModal(true); return; }
    if (!canUseAPI()) { setShowLimitModal(true); return; }

    const z = zodiacSel.a || u.zodiac;
    if (!z) return;

    const extra = concern ? ` 궁금한 점: ${concern}` : "";
    const prompt = `${u.name}님(${z}, ${u.age}세 ${u.gender})의 별자리 운세를 알려주세요.${extra}\n\n⭐ ${z} 운세\n(3~4문장)\n\n💫 오늘의 키워드\n(1문장)\n\n만세력 사주와 별자리 특성을 연결해 따뜻하고 구체적으로 해석해 주세요.`;

    setIsLoading(true);
    try {
      const system = buildSystemPrompt();
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_tokens: 3000, system, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || "";
      addMessage("star", { role: "bot", content: formatReply(reply), type: "text" });
      incrementUsage();
    } catch {
      addMessage("star", { role: "bot", content: "연결이 잠깐 끊겼어요.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ChatPanel menuId="star">
      <div className="form-panel">
        <div className="form-card">
          <div className="form-title" style={{ color: "var(--gold)" }}>⭐ 별자리 운세</div>
          <div className="form-desc">지금 당신의 별자리에 어떤 기운이 흐르고 있을까요?</div>
          <div className="form-row">
            <div className="form-label">내 별자리 선택</div>
            <ZodiacGrid selected={zodiacSel.a} onSelect={(z) => setZodiacSel("a", z)} showFull />
          </div>
          <div className="form-row">
            <div className="form-label">궁금한 점 (선택)</div>
            <input className="form-input" placeholder="예: 연애, 금전, 관계, 미래, 취업..." value={concern} onChange={(e) => setConcern(e.target.value)} />
          </div>
          <button className="submit-btn gold-btn" onClick={runStar}>AI 별자리 운세 보기 ✨</button>
          <div className="panel-copyright">&copy; 2025 BSJS. All rights reserved. | 사업자등록번호: 672-05-02394</div>
        </div>
      </div>
    </ChatPanel>
  );
}
