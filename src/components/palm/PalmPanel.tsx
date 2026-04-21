"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { getUserInfo, buildSystemPrompt, formatReply, incrementUsage, canUsePalm, incrementPalmUsage } from "@/lib/utils";
import { ChatPanel } from "@/components/chat";

export default function PalmPanel() {
  const { addMessage, setIsLoading, setShowLimitModal, setShowUserModal, setPendingAction } = useAppStore();
  const [palmMode, setPalmMode] = useState<string>("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewSrc(result);
      setImageData(result.split(",")[1]); // base64 without prefix
    };
    reader.readAsDataURL(file);
  }

  async function analyzePalm() {
    const u = getUserInfo();
    if (!u) { setPendingAction(analyzePalm); setShowUserModal(true); return; }
    if (!canUsePalm()) { setShowLimitModal(true); return; }
    if (!imageData || !palmMode) return;

    const modeLabel = palmMode === "face" ? "관상" : `${palmMode === "right" ? "오른" : "왼"}손 손금`;
    const prompt = `${u.name}님(${u.zodiac}, ${u.age}세 ${u.gender})의 ${modeLabel}을 분석해 주세요.\n\n사진을 꼼꼼히 살펴보고 아래 형식으로 알려주세요:\n\n🤲 ${modeLabel} 분석 결과\n(3~4문장)\n\n💫 특징적인 점\n(2~3문장)\n\n✨ 운 다아라의 조언\n(1~2문장)\n\n따뜻하고 긍정적으로 해석해 주세요.`;

    setIsLoading(true);
    try {
      const system = buildSystemPrompt();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 3000,
          system,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageData } },
              { type: "text", text: prompt },
            ],
          }],
        }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || "";
      addMessage("palm", { role: "bot", content: formatReply(reply), type: "palm-result" });
      incrementPalmUsage();
      incrementUsage();
    } catch {
      addMessage("palm", { role: "bot", content: "사진 분석 중 오류가 생겼어요.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ChatPanel menuId="palm">
      <div className="form-panel">
        <div className="palm-header">
          <div className="palm-header-title font-serif">AI 손금·관상</div>
          <div className="palm-header-sub">먼저 항목을 선택해 주세요</div>
        </div>
        <div className="palm-mode-select">
          {[
            { id: "right", icon: "✋", label: "오른손" },
            { id: "left", icon: "🤚", label: "왼손" },
            { id: "face", icon: "😊", label: "관상" },
          ].map((m) => (
            <button
              key={m.id}
              className={`palm-mode-btn ${palmMode === m.id ? "active" : ""}`}
              onClick={() => setPalmMode(m.id)}
            >
              <span className="palm-mode-icon">{m.icon}</span>
              <span className="palm-mode-label">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="palm-scanner" onClick={() => fileRef.current?.click()}>
          {previewSrc ? (
            <img src={previewSrc} alt="미리보기" className="palm-preview-img" />
          ) : (
            <div className="palm-scanner-inner">
              <div className="palm-scanner-icon">📸</div>
              <div className="palm-scanner-text">사진 업로드</div>
              <div className="palm-scanner-sub">탭하여 스캔 시작</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        {imageData && palmMode && (
          <button className="submit-btn" style={{ background: "linear-gradient(135deg,#7c3aed,#d8b4fe)", color: "#fff", marginTop: 12 }} onClick={analyzePalm}>
            AI 분석 시작 🔍
          </button>
        )}
        <div className="panel-copyright">&copy; 2025 BSJS. All rights reserved. | 사업자등록번호: 672-05-02394</div>
      </div>
    </ChatPanel>
  );
}
