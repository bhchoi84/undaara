"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/store";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`msg ${isUser ? "user" : "bot"}`}
      data-card-index={message.cardIndex ?? undefined}
    >
      {!isUser && <div className="msg-avatar bot">✦</div>}
      <div className="msg-content">
        <span className="msg-label">{isUser ? "나의 질문" : "운 다아라"}</span>
        <div
          className={
            message.type === "card-reveal"
              ? "card-reveal-msg"
              : message.type === "palm-result"
              ? "palm-result-msg"
              : "msg-bubble"
          }
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      </div>
      {isUser && <div className="msg-avatar user">나</div>}
    </div>
  );
}
