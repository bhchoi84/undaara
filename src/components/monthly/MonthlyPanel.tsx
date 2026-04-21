"use client";

import { useAppStore } from "@/lib/store";
import { getUserInfo, buildSystemPrompt, formatReply, incrementUsage, canUseAPI } from "@/lib/utils";
import ZodiacGrid from "@/components/common/ZodiacGrid";
import { ChatPanel } from "@/components/chat";

export default function MonthlyPanel() {
  const { zodiacSel, setZodiacSel, addMessage, setIsLoading, setShowLimitModal, setShowUserModal, setPendingAction } = useAppStore();

  async function runMonthly() {
    const u = getUserInfo();
    if (!u) { setPendingAction(runMonthly); setShowUserModal(true); return; }
    if (!canUseAPI()) { setShowLimitModal(true); return; }

    const z = zodiacSel.monthly || u.zodiac;
    if (!z) return;

    const now = new Date();
    const monthName = now.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });

    const prompt = `${u.name}님(${z}, ${u.age}세 ${u.gender})의 ${monthName} 월간 운세를 알려주세요.\n\n📊 ${monthName} 총운\n(3~4문장)\n\n💕 이달의 애정운\n(2~3문장)\n\n💰 이달의 재물운\n(2~3문장)\n\n💼 이달의 직장/학업운\n(2~3문장)\n\n🧘 이달의 건강운\n(2문장)\n\n✨ 이달의 행운 키워드\n(키워드 3개와 한줄 조언)\n\n만세력 사주와 별자리 특성을 연결해 따뜻하고 구체적으로 해석해 주세요.`;

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
      addMessage("monthly", { role: "bot", content: formatReply(reply), type: "text" });
      incrementUsage();
    } catch {
      addMessage("monthly", { role: "bot", content: "연결이 잠깐 끊겼어요.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ChatPanel menuId="monthly">
      <div className="form-panel">
        <div className="form-card">
          <div className="form-title" style={{ color: "#818cf8" }}>📅 월간 운세</div>
          <div className="form-desc">이달의 전체 흐름을 미리 살펴보세요</div>
          <div className="form-row">
            <div className="form-label">내 별자리</div>
            <ZodiacGrid selected={zodiacSel.monthly} onSelect={(z) => setZodiacSel("monthly", z)} />
          </div>
          <button className="submit-btn" style={{ background: "linear-gradient(135deg,#4338ca,#818cf8)", color: "#fff" }} onClick={runMonthly}>
            AI 월간 운세 보기 📅
          </button>
          <div className="panel-copyright">&copy; 2025 BSJS. All rights reserved. | 사업자등록번호: 672-05-02394</div>
        </div>
      </div>
    </ChatPanel>
  );
}
