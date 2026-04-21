"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { getUserInfo, buildSystemPrompt, formatReply, incrementUsage, canUseAPI, escapeHtml } from "@/lib/utils";
import ZodiacGrid from "@/components/common/ZodiacGrid";
import { ChatPanel } from "@/components/chat";

export default function TodayPanel() {
  const { zodiacSel, setZodiacSel, addMessage, setIsLoading, setShowLimitModal, setShowUserModal, setPendingAction } = useAppStore();
  const [concern, setConcern] = useState("");

  async function runToday() {
    const u = getUserInfo();
    if (!u) { setPendingAction(runToday); setShowUserModal(true); return; }
    if (!canUseAPI()) { setShowLimitModal(true); return; }

    const z = zodiacSel.today || u.zodiac;
    if (!z) return;

    const extra = concern ? ` 특히 신경 쓰이는 것: ${concern}` : "";
    const prompt = `${u.name}님(${z}, ${u.age}세 ${u.gender})의 오늘 하루 운세를 알려주세요.${extra}\n\n아래 형식으로 알려주세요:\n🌅 총운\n(2~3문장)\n\n💕 애정운\n(2문장)\n\n💰 금전운\n(2문장)\n\n🩺 건강운\n(2문장)\n\n🍀 행운의 팁\n(1문장)\n\n만세력 사주와 별자리 특성을 연결해 따뜻하고 구체적으로 해석해 주세요.`;

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
      addMessage("today", { role: "bot", content: formatReply(reply), type: "text" });
      incrementUsage();
    } catch {
      addMessage("today", { role: "bot", content: "연결이 잠깐 끊겼어요. 다시 시도해 볼까요?", type: "text" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ChatPanel menuId="today">
      <div className="form-panel">
        <div className="form-card">
          <div className="form-title" style={{ color: "#6EE7B7" }}>🌅 오늘의 운세</div>
          <div className="form-desc">총운·애정·금전·건강까지 — 오늘 하루를 미리 알고 시작하세요</div>
          <div className="form-row">
            <div className="form-label">내 별자리</div>
            <ZodiacGrid selected={zodiacSel.today} onSelect={(z) => setZodiacSel("today", z)} />
          </div>
          <div className="form-row">
            <div className="form-label">오늘 특별히 신경 쓰이는 것 (선택)</div>
            <input
              className="form-input"
              placeholder="예: 연애, 직장, 건강, 시험..."
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
            />
          </div>
          <button className="submit-btn" style={{ background: "linear-gradient(135deg,#065F46,#6EE7B7)", color: "#022c22" }} onClick={runToday}>
            AI 운세 받기 🌅
          </button>
          <div className="panel-copyright">&copy; 2025 BSJS. All rights reserved. | 사업자등록번호: 672-05-02394</div>
        </div>
      </div>
    </ChatPanel>
  );
}
