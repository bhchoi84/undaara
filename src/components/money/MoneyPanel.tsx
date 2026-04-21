"use client";

import { useAppStore } from "@/lib/store";
import { getUserInfo, buildSystemPrompt, formatReply, incrementUsage, canUseAPI } from "@/lib/utils";
import { ChatPanel } from "@/components/chat";

const DDI_LIST = [
  { emoji: "🐀", name: "쥐띠" }, { emoji: "🐂", name: "소띠" },
  { emoji: "🐅", name: "호랑이띠" }, { emoji: "🐇", name: "토끼띠" },
  { emoji: "🐉", name: "용띠" }, { emoji: "🐍", name: "뱀띠" },
  { emoji: "🐴", name: "말띠" }, { emoji: "🐑", name: "양띠" },
  { emoji: "🐵", name: "원숭이띠" }, { emoji: "🐔", name: "닭띠" },
  { emoji: "🐶", name: "개띠" }, { emoji: "🐷", name: "돼지띠" },
] as const;

export default function MoneyPanel() {
  const { zodiacSel, setZodiacSel, addMessage, setIsLoading, setShowLimitModal, setShowUserModal, setPendingAction } = useAppStore();

  async function runMoney() {
    const u = getUserInfo();
    if (!u) { setPendingAction(runMoney); setShowUserModal(true); return; }
    if (!canUseAPI()) { setShowLimitModal(true); return; }

    const ddi = zodiacSel.mo || "";
    const prompt = `${u.name}님(${u.zodiac}, ${u.age}세 ${u.gender}${ddi ? `, ${ddi}` : ""})의 사주 재물운을 봐주세요.\n\n◈ 오늘의 재물 기운\n(2~3문장)\n\n💰 투자·지출 조언\n(2문장)\n\n🍀 재물 행운 팁\n(1문장)\n\n사주 천간지지·오행과 12지신을 기반으로 따뜻하게 해석해 주세요.`;

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
      addMessage("money", { role: "bot", content: formatReply(reply), type: "text" });
      incrementUsage();
    } catch {
      addMessage("money", { role: "bot", content: "연결이 잠깐 끊겼어요.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ChatPanel menuId="money">
      <div className="form-panel">
        <div className="form-card">
          <div className="form-title" style={{ color: "var(--teal)" }}>◈ 사주 재물운</div>
          <div className="form-desc">사주 천간지지·오행·12지신으로 보는 오늘의 재물 흐름</div>
          <div className="money-my-info" onClick={() => setShowUserModal(true)}>
            {getUserInfo() ? (
              <span>{getUserInfo()!.name} · {getUserInfo()!.zodiac} · {getUserInfo()!.age}세</span>
            ) : (
              <span className="match-info-placeholder">내 정보를 입력하면 사주 기반 분석이 가능해요 →</span>
            )}
          </div>
          <div className="form-row">
            <div className="form-label">내 띠 (12지신)</div>
            <div className="zodiac-grid">
              {DDI_LIST.map((d) => (
                <button
                  key={d.name}
                  className={`zodiac-btn ${zodiacSel.mo === d.name ? "sel-mo" : ""}`}
                  onClick={() => setZodiacSel("mo", d.name)}
                >
                  {d.emoji} {d.name.replace("띠", "")}
                </button>
              ))}
            </div>
          </div>
          <button className="submit-btn teal-btn" onClick={runMoney}>AI 재물운 보기 💰</button>
          <div className="panel-copyright">&copy; 2025 BSJS. All rights reserved. | 사업자등록번호: 672-05-02394</div>
        </div>
      </div>
    </ChatPanel>
  );
}
