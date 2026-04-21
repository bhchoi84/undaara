"use client";

import { useRef, useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { escapeHtml, canUseAPI, getUserInfo } from "@/lib/utils";
import ChatMessage from "./ChatMessage";

interface Props {
  menuId: string;
  showInput?: boolean;
  children?: React.ReactNode;
}

export default function ChatPanel({ menuId, showInput = false, children }: Props) {
  const { messages, addMessage, isLoading, setIsLoading, setShowLimitModal } = useAppStore();
  const messagesRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const menuMessages = messages[menuId] || [];

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [menuMessages.length]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    if (!canUseAPI()) {
      setShowLimitModal(true);
      return;
    }

    addMessage(menuId, {
      role: "user",
      content: escapeHtml(text),
      type: "text",
    });
    setInputValue("");
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
      const reply = data?.content?.[0]?.text || "잠깐 다시 시도해 주실 수 있어요? 😊";
      addMessage(menuId, { role: "bot", content: reply, type: "text" });
    } catch {
      addMessage(menuId, {
        role: "bot",
        content: "연결이 잠깐 끊겼어요. 다시 시도해 볼까요?",
        type: "text",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="panel-inner">
      {children}
      <div className="messages" ref={messagesRef}>
        {menuMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="msg bot">
            <div className="msg-avatar bot">✦</div>
            <div className="msg-content">
              <span className="msg-label">운 다아라</span>
              <div className="msg-bubble typing">생각하고 있어요···</div>
            </div>
          </div>
        )}
      </div>
      {showInput && (
        <div className="input-area">
          <input
            className="chat-input"
            placeholder="오늘의 행운이 궁금하다면 편하게 물어보세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
          />
          <button className="send-btn" onClick={handleSend} disabled={isLoading}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7L13 7M8 2L13 7L8 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
