"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { getUserInfo, buildSystemPrompt, formatReply, incrementUsage, canUseAPI, getZodiac } from "@/lib/utils";
import { calcManseryuk } from "@/lib/manseryuk";
import { ChatPanel } from "@/components/chat";
import BirthPicker from "@/components/common/BirthPicker";

export default function MatchPanel() {
  const { addMessage, setIsLoading, setShowLimitModal, setShowUserModal, setPendingAction } = useAppStore();

  const [partnerName, setPartnerName] = useState("");
  const [partnerBirth, setPartnerBirth] = useState({ y: "", m: "", d: "" });
  const [partnerGender, setPartnerGender] = useState("");
  const [partnerSiji, setPartnerSiji] = useState("");
  const [partnerJob, setPartnerJob] = useState("");
  const [partnerCalendar, setPartnerCalendar] = useState("양력");
  const [relation, setRelation] = useState("연인");
  const [customRel, setCustomRel] = useState("");

  const SIJI_OPTIONS = [
    { value: "", label: "모르겠어요" },
    { value: "자시(23:00~01:00)", label: "🐀 자시 (23:00~01:00)" },
    { value: "축시(01:00~03:00)", label: "🐂 축시 (01:00~03:00)" },
    { value: "인시(03:00~05:00)", label: "🐅 인시 (03:00~05:00)" },
    { value: "묘시(05:00~07:00)", label: "🐇 묘시 (05:00~07:00)" },
    { value: "진시(07:00~09:00)", label: "🐉 진시 (07:00~09:00)" },
    { value: "사시(09:00~11:00)", label: "🐍 사시 (09:00~11:00)" },
    { value: "오시(11:00~13:00)", label: "🐴 오시 (11:00~13:00)" },
    { value: "미시(13:00~15:00)", label: "🐑 미시 (13:00~15:00)" },
    { value: "신시(15:00~17:00)", label: "🐵 신시 (15:00~17:00)" },
    { value: "유시(17:00~19:00)", label: "🐔 유시 (17:00~19:00)" },
    { value: "술시(19:00~21:00)", label: "🐶 술시 (19:00~21:00)" },
    { value: "해시(21:00~23:00)", label: "🐷 해시 (21:00~23:00)" },
  ];

  async function runMatch() {
    const u = getUserInfo();
    if (!u) { setPendingAction(runMatch); setShowUserModal(true); return; }
    if (!canUseAPI()) { setShowLimitModal(true); return; }
    if (!partnerName.trim()) return;
    if (!partnerBirth.y || !partnerBirth.m || !partnerBirth.d) return;

    const pBirth = `${partnerBirth.y}-${partnerBirth.m.padStart(2, "0")}-${partnerBirth.d.padStart(2, "0")}`;
    const pZodiac = getZodiac(pBirth);
    const pSaju = calcManseryuk(pBirth, partnerSiji || null);
    const rel = relation === "직접입력" ? customRel : relation;

    const prompt = `${u.name}님(${u.zodiac}, ${u.age}세 ${u.gender}, 사주: 년주${u.saju?.year?.ganji} 월주${u.saju?.month?.ganji} 일주${u.saju?.day?.ganji})과 ${partnerName}님(${pZodiac}, ${partnerGender || "선택안함"}, 사주: 년주${pSaju.year.ganji} 월주${pSaju.month.ganji} 일주${pSaju.day.ganji})의 ${rel} 궁합을 봐주세요.\n\n♡ 종합 궁합 점수 (100점 만점)\n(1문장)\n\n💕 애정 궁합\n(2~3문장)\n\n🏠 생활 궁합\n(2문장)\n\n💼 동반자 궁합\n(2문장)\n\n✨ 운 다아라의 조언\n(1~2문장)\n\n사주 천간지지·오행 상생상극·12지신 궁합을 기반으로 따뜻하게 해석해 주세요.`;

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
      addMessage("match", { role: "bot", content: formatReply(reply), type: "text" });
      incrementUsage();
    } catch {
      addMessage("match", { role: "bot", content: "연결이 잠깐 끊겼어요.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ChatPanel menuId="match">
      <div className="form-panel">
        <div className="form-card">
          <div className="form-title" style={{ color: "var(--rose)" }}>♡ 연애 궁합</div>
          <div className="form-desc">사주·12지신·오행까지 — 둘의 궁합을 정밀 분석해 드려요</div>

          <div className="match-section-label">💜 나의 정보</div>
          <div className="match-info-summary" onClick={() => setShowUserModal(true)}>
            {getUserInfo() ? (
              <span>{getUserInfo()!.name} · {getUserInfo()!.zodiac} · {getUserInfo()!.age}세</span>
            ) : (
              <span className="match-info-placeholder">나의 정보</span>
            )}
          </div>

          <div className="match-section-label" style={{ color: "var(--rose)" }}>💗 상대방 정보</div>
          <div className="form-row">
            <div className="form-label">이름 (닉네임)</div>
            <input className="form-input" placeholder="예: 수현, 민수" maxLength={10} value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-label">생년월일</div>
            <BirthPicker
              value={partnerBirth}
              onChange={setPartnerBirth}
              calendar={partnerCalendar}
            />
            <div className="user-modal-gender" style={{ marginTop: 6 }}>
              <button className={`gender-btn cal-btn ${partnerCalendar === "양력" ? "active" : ""}`} onClick={() => setPartnerCalendar("양력")}>☀️ 양력</button>
              <button className={`gender-btn cal-btn ${partnerCalendar === "음력" ? "active" : ""}`} onClick={() => setPartnerCalendar("음력")}>🌙 음력</button>
            </div>
          </div>
          <div className="form-row">
            <div className="form-label">성별</div>
            <div className="user-modal-gender">
              {["여성", "남성", "선택안함"].map((g) => (
                <button key={g} className={`gender-btn ${partnerGender === g ? "active" : ""}`} onClick={() => setPartnerGender(g)}>{g}</button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-label">태어난 시 (선택)</div>
            <select className="form-input" value={partnerSiji} onChange={(e) => setPartnerSiji(e.target.value)}>
              {SIJI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-label">직업 (선택)</div>
            <input className="form-input" placeholder="예: 회사원, 학생, 자영업" maxLength={20} value={partnerJob} onChange={(e) => setPartnerJob(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-label">관계</div>
            <select className="form-input" value={relation} onChange={(e) => setRelation(e.target.value)}>
              <option value="연인">💕 연인 / 썸</option>
              <option value="부부">💍 부부</option>
              <option value="친구">👫 친구</option>
              <option value="직장동료">💼 직장동료</option>
              <option value="가족">🏠 가족</option>
              <option value="직접입력">✏️ 직접 입력</option>
            </select>
            {relation === "직접입력" && (
              <input className="form-input mt-1.5" placeholder="관계를 입력해 주세요" value={customRel} onChange={(e) => setCustomRel(e.target.value)} />
            )}
          </div>
          <button className="submit-btn rose-btn" onClick={runMatch}>AI 궁합 분석 💕</button>
          <div className="panel-copyright">&copy; 2025 BSJS. All rights reserved. | 사업자등록번호: 672-05-02394</div>
        </div>
      </div>
    </ChatPanel>
  );
}
