"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { CARDS, CARD_POS, drawSeededCards, getDirectionLabel } from "@/lib/cards";
import { getUserInfo, escapeHtml, getPopularMenu, buildSystemPrompt, formatReply, incrementUsage, canUseAPI } from "@/lib/utils";
import { ChatPanel } from "@/components/chat";

export default function TarotPanel() {
  const {
    drawnCards, flippedCards, setDrawnCards, flipCard, resetCards,
    addMessage, updateMessage, setIsLoading, setShowLimitModal, setShowUserModal, setPendingAction,
  } = useAppStore();

  // 초기 메시지
  useEffect(() => {
    const u = getUserInfo();
    if (u) {
      const safeName = escapeHtml(u.name);
      addMessage("tarot", {
        role: "bot",
        content: `<b>${safeName}</b>님, 오늘의 운세가 준비됐어요 😊<br>어제와는 다른 흐름이 보여요. 카드를 뽑아 확인해 보세요 ✨<br><span style="font-size:11px;color:var(--text-muted)">지금 가장 많이 받는 상담: ${getPopularMenu()} 🔥</span>`,
        type: "text",
      });
    } else {
      addMessage("tarot", {
        role: "bot",
        content: `오늘 하루가 궁금하지 않으세요? 😊<br><b>운 다아라</b>가 AI로 당신만의 운세를 바로 봐드려요.<br><br>카드를 뽑거나 메뉴를 선택하면 <b class="hl-gold">무료로 바로 시작</b>할 수 있어요 ✨<br><span style="font-size:11px;color:var(--text-muted)">지금 가장 많이 받는 상담: ${getPopularMenu()} 🔥</span>`,
        type: "text",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 한번에 뽑기 이벤트 리스너
  useEffect(() => {
    const handler = () => drawAllCards();
    window.addEventListener("drawAllCards", handler);
    return () => window.removeEventListener("drawAllCards", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 개별 카드 뒤집기 이벤트
  useEffect(() => {
    const handler = (e: Event) => {
      const { index } = (e as CustomEvent).detail;
      handleCardFlipped(index);
    };
    window.addEventListener("cardFlipped", handler);
    return () => window.removeEventListener("cardFlipped", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawnCards, flippedCards]);

  function ensureUser(callback: () => void): boolean {
    const u = getUserInfo();
    if (u) return true;
    setPendingAction(callback);
    setShowUserModal(true);
    return false;
  }

  async function handleCardFlipped(index: number) {
    if (!drawnCards) return;
    const c = drawnCards[index];
    const allFlipped = useAppStore.getState().flippedCards.every((f) => f);

    if (allFlipped) {
      await interpretAll3Cards();
    } else {
      // 개별 카드 해석
      addMessage("tarot", {
        role: "bot",
        content: `<div class="card-reading-block"><div class="crb-pos">${CARD_POS[index]}</div><div class="crb-card"><div class="crb-sym">${c.sym}</div><div><div class="crb-name">${c.name} <span class="crb-direction ${c.reversed ? 'reversed' : 'upright'}">${getDirectionLabel(c)}</span></div><div class="crb-en">${c.en}</div></div></div><span class="crb-keywords">${c.keywords}</span></div>`,
        type: "card-reveal",
        cardIndex: index,
      });
      await askSingleCard(c, index);
    }
  }

  async function drawAllCards() {
    if (!ensureUser(drawAllCards)) return;
    if (!canUseAPI()) { setShowLimitModal(true); return; }

    const u = getUserInfo();
    const cards = drawSeededCards(3, u?.zodiac);
    setDrawnCards(cards);

    // 모든 카드 뒤집기
    setTimeout(() => {
      flipCard(0);
      flipCard(1);
      flipCard(2);

      // 3장 요약
      const summaryHtml = cards.map((c, i) =>
        `<div class="crb-summary-item" data-idx="${i}">` +
          `<div class="crb-pos">${CARD_POS[i]}</div>` +
          `<div class="crb-card"><div class="crb-sym">${c.sym}</div><div><div class="crb-name">${c.name} <span class="crb-direction ${c.reversed ? 'reversed' : 'upright'}">${getDirectionLabel(c)}</span></div><div class="crb-en">${c.en}</div></div></div>` +
          `<span class="crb-keywords">${c.keywords}</span>` +
        `</div>`
      ).join("");
      addMessage("tarot", {
        role: "bot",
        content: `<div class="crb-summary">${summaryHtml}</div>`,
        type: "card-reveal",
      });

      interpretAll3Cards(cards);
    }, 700);
  }

  async function interpretAll3Cards(cards?: typeof drawnCards) {
    const c = cards || drawnCards;
    if (!c) return;
    if (!canUseAPI()) { setShowLimitModal(true); return; }

    const u = getUserInfo();
    const ctx = u ? `${u.name}님(${u.zodiac}, ${u.age}세 ${u.gender})의 ` : "";
    const cardDescs = c.map((card, i) => {
      const dir = card.reversed ? '역방향' : '정방향';
      return `${CARD_POS[i]}의 카드 ${card.name}(${dir}, 키워드: ${card.keywords})`;
    }).join(', ');
    const prompt = `${ctx}타로 3카드: ${cardDescs}. 아래 형식으로 각 카드별 해석을 줄바꿈으로 구분해서 알려주세요:\n\n🔮 오늘의 카드 — [카드명] ([정방향/역방향]) (키워드)\n(3~4문장 해석. 정방향이면 긍정적 의미 중심, 역방향이면 주의할 점과 극복 방법 중심으로)\n\n🌙 미래의 카드 — [카드명] ([정방향/역방향]) (키워드)\n(3~4문장 해석)\n\n⚠️ 주의할 일 — [카드명] ([정방향/역방향]) (키워드)\n(3~4문장 해석)\n\n✨ 운 다아라의 한마디\n(따뜻한 마무리 1문장)\n\n별자리 특성과 연결해 따뜻하고 구체적으로 해석해 주세요.`;

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

      // 섹션별 분리
      const sections = reply.split(/(?=🔮|🌙|⚠️?|✨)/);
      const cardEmojis = ["🔮", "🌙", "⚠"];
      let cardIdx = 0;
      for (const sec of sections) {
        const trimmed = sec.trim();
        if (!trimmed) continue;
        if (cardIdx < 3 && cardEmojis.some((e) => trimmed.startsWith(e))) {
          addMessage("tarot", {
            role: "bot",
            content: formatReply(trimmed),
            type: "text",
            cardIndex: cardIdx,
          });
          cardIdx++;
        } else if (trimmed) {
          addMessage("tarot", { role: "bot", content: formatReply(trimmed), type: "text" });
        }
      }
      incrementUsage();
    } catch {
      addMessage("tarot", { role: "bot", content: "연결이 잠깐 끊겼어요. 다시 시도해 볼까요?", type: "text" });
    } finally {
      setIsLoading(false);
    }
  }

  async function askSingleCard(card: typeof CARDS[0], index: number) {
    if (!canUseAPI()) { setShowLimitModal(true); return; }

    const u = getUserInfo();
    const ctx = u ? `${u.name}님(${u.zodiac}, ${u.age}세 ${u.gender})에게 ` : "";
    const dir = card.reversed ? '역방향' : '정방향';
    const prompt = `${ctx}"${card.name}" 카드(${card.en}, ${dir}, 키워드: ${card.keywords})가 "${CARD_POS[index]}" 자리에 나왔어요. ${card.reversed ? '역방향이므로 주의할 점과 극복 방법 위주로' : '정방향이므로 긍정적 메시지 위주로'} 이 카드가 지금 이 자리에서 전하는 메시지를 별자리 특성과 연결해 따뜻하고 공감 어린 말투로 2~3문장으로 이야기해 주세요.`;

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
      addMessage("tarot", { role: "bot", content: formatReply(reply), type: "text" });
      incrementUsage();
    } catch {
      addMessage("tarot", { role: "bot", content: "연결이 잠깐 끊겼어요. 다시 시도해 볼까요?", type: "text" });
    } finally {
      setIsLoading(false);
    }
  }

  return <ChatPanel menuId="tarot" showInput />;
}
