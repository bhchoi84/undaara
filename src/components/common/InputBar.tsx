"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { escapeHtml, canUseAPI } from "@/lib/utils";

/**
 * 메인 화면 하단 네비 위에 떠있는 글로벌 입력창.
 * 현재 활성화된 메뉴의 채팅에 메시지를 보낸다.
 */
export default function InputBar() {
  const {
    activeMenu,
    addMessage,
    isLoading,
    setIsLoading,
    setShowLimitModal,
  } = useAppStore();
  const [val, setVal] = useState("");

  async function handleSend() {
    const text = val.trim();
    if (!text || isLoading) return;
    if (!canUseAPI()) {
      setShowLimitModal(true);
      return;
    }

    addMessage(activeMenu, {
      role: "user",
      content: escapeHtml(text),
      type: "text",
    });
    setVal("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 3000,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const reply =
        data?.content?.[0]?.text || "잠깐 다시 시도해 주실 수 있어요? 😊";
      addMessage(activeMenu, { role: "bot", content: reply, type: "text" });
    } catch {
      addMessage(activeMenu, {
        role: "bot",
        content: "연결이 잠깐 끊겼어요. 다시 시도해 볼까요?",
        type: "text",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="input-bar-v2" aria-label="질문 입력">
      <input
        className="ib-input"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="오늘의 행운이 궁금하다면 편하게 물어보세요…"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <button
        className={`ib-send ${val.trim() ? "active" : ""}`}
        onClick={handleSend}
        disabled={isLoading || !val.trim()}
        aria-label="보내기"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12 L21 12 M14 5 L21 12 L14 19" />
        </svg>
      </button>
    </div>
  );
}
