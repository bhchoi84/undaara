/* ══════════════════════════════════════════
   api.js — API 호출, AI 응답 처리, 후속 상담
   ══════════════════════════════════════════ */

/* ── API 호출 (타임아웃 포함) ── */
function fetchWithTimeout(url, opts, ms = 30000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}
async function callAPI(body) {
  const res = await fetchWithTimeout('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, 35000);
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || 'API Error: ' + res.status); }
  return res.json();
}
async function callGeminiAPI(body) {
  const res = await fetchWithTimeout('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, 35000);
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || 'Gemini API Error: ' + res.status); }
  return res.json();
}

/* ── 에러 복구 UI ── */
function showRetryUI(typingEl, retryFn) {
  typingEl.classList.remove('typing');
  typingEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'error-recovery';
  const msg = document.createElement('p');
  msg.textContent = '연결이 잠깐 끊겼어요. 다시 시도해 볼까요?';
  const retryBtn = document.createElement('button');
  retryBtn.className = 'retry-btn';
  retryBtn.textContent = '다시 시도하기';
  retryBtn.addEventListener('click', () => {
    const msgEl = typingEl.closest('.msg');
    if (msgEl) msgEl.remove();
    retryFn();
  });
  wrap.appendChild(msg);
  wrap.appendChild(retryBtn);
  typingEl.appendChild(wrap);
}

/* ── 시스템 프롬프트 생성 ── */
function buildSystemPrompt() {
  return `당신은 따뜻하고 섬세한 AI 행운 안내자 '운 다아라'입니다. 사용자에게 좋은 기운과 희망을 전하는 것이 당신의 사명입니다.${getUserContext()}
사용자 감정에 먼저 공감해 주세요. 성별·나이에 관계없이 "~님"으로 호칭하며, 정중하고 따뜻한 존댓말을 씁니다. "오빠/언니/누나/형" 같은 호칭은 절대 쓰지 않습니다.
사용자의 이름, 별자리, 나이, 성별, 직업을 자연스럽게 반영해 개인화된 답변을 해주세요.
만세력 기반 사주팔자(년주·월주·일주·시주)가 있으면 천간지지·오행·십이운성의 기운을 해석에 정확히 녹여주세요. 부족한 오행이 있으면 보완 조언도 해주세요.
오늘의 만세력(일간지)과 사용자 사주의 상호작용(상생·상극)을 자연스럽게 반영하세요.
오늘 날짜·요일·현재 시진과 사용자 위치의 계절감·기운을 자연스럽게 반영하세요.
직업이 있으면 직업 특성에 맞는 구체적 조언(직장운, 사업운, 학업운 등)을 포함하세요.
"~것 같아요", "~할 수 있어요" 처럼 단정 짓지 않고 부드럽게 표현합니다.
이모지를 1~2개 자연스럽게 씁니다. 3~6문장 내외로 간결하고 따뜻하게 마무리합니다.
답변은 항상 같은 사용자에 대한 일관된 흐름을 유지해 주세요.`;
}

/* ── 메인 AI 호출 ── */
async function askClaude(overrideMsg, isAuto, userLabel, cacheKey = null, showFollowUp = false) {
  if (!canUseAPI()) {
    document.getElementById('limit-modal-overlay').style.display = 'flex';
    return;
  }
  if (cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) {
      if (userLabel) addMsg('user', userLabel);
      const cachedEl = addMsg('bot', cached);
      if (showFollowUp) addFollowUp();
      setTimeout(() => cachedEl.closest('.msg').scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      return;
    }
  }
  const btn = document.getElementById('send-btn'), input = document.getElementById('chat-input');
  btn.disabled = true; input.disabled = true;
  if (userLabel) addMsg('user', userLabel);
  const typingEl = addMsg('bot', '생각하고 있어요···', 'text', null, false); typingEl.classList.add('typing');
  const system = buildSystemPrompt();
  const messages = overrideMsg ? [{ role: 'user', content: overrideMsg }] : [...history];

  const retryFn = () => askClaude(overrideMsg, isAuto, userLabel, cacheKey, showFollowUp);

  try {
    const data = await callGeminiAPI({ max_tokens: 3000, system, messages });
    const reply = data?.content?.[0]?.text || '잠깐 다시 시도해 주실 수 있어요? 😊';
    typingEl.classList.remove('typing'); typingEl.innerHTML = formatReply(reply);
    if (!isAuto) { history.push({ role: 'assistant', content: reply }); if (history.length > 12) history = history.slice(-12); }
    incrementUsage();
    if (cacheKey) setCached(cacheKey, formatReply(reply));
    updateUserBadge();
    if (showFollowUp) addFollowUp();
  } catch (e) {
    // Gemini 실패 → Claude Haiku 폴백
    try {
      const data = await callAPI({ model: 'claude-haiku-4-5-20251001', max_tokens: 3000, system, messages });
      const reply = data?.content?.[0]?.text || '';
      typingEl.classList.remove('typing'); typingEl.innerHTML = formatReply(reply);
      if (!isAuto) { history.push({ role: 'assistant', content: reply }); if (history.length > 12) history = history.slice(-12); }
      incrementUsage();
      if (cacheKey) setCached(cacheKey, formatReply(reply));
      updateUserBadge();
      if (showFollowUp) addFollowUp();
    } catch {
      showRetryUI(typingEl, retryFn);
    }
  }
  btn.disabled = false; input.disabled = false; input.focus();
  setTimeout(() => typingEl.closest('.msg')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

/* ── 타로 3카드 해석 ── */
async function askClaudeTarot3(prompt, cards) {
  if (!canUseAPI()) {
    document.getElementById('limit-modal-overlay').style.display = 'flex';
    return;
  }
  const btn = document.getElementById('send-btn'), input = document.getElementById('chat-input');
  btn.disabled = true; input.disabled = true;
  const typingEl = addMsg('bot', '카드를 해석하고 있어요···', 'text', null, false); typingEl.classList.add('typing');
  let firstCardEl = null;
  const system = buildSystemPrompt().replace(
    '3~6문장 내외로 간결하고 따뜻하게 마무리합니다.',
    '이모지를 1~2개 자연스럽게 씁니다.'
  );

  const retryFn = () => askClaudeTarot3(prompt, cards);

  function handleTarotReply(reply) {
    typingEl.remove();
    const sections = reply.split(/(?=🔮|🌙|⚠️?|✨)/);
    const cardEmojis = ['🔮', '🌙', '⚠'];
    let cardIdx = 0;
    for (const sec of sections) {
      const trimmed = sec.trim();
      if (!trimmed) continue;
      if (cardIdx < 3 && cardEmojis.some(e => trimmed.startsWith(e))) {
        const el = addMsg('bot', formatReply(trimmed), 'text', cardIdx);
        if (cardIdx === 0) firstCardEl = el;
        cardIdx++;
      } else {
        addMsg('bot', formatReply(trimmed));
      }
    }
    incrementUsage();
    updateUserBadge();
    if (typeof logSocialEvent === 'function') logSocialEvent('tarot');
    addTarot3ShareCard(cards, reply);
    addFollowUp();
  }

  try {
    const data = await callGeminiAPI({ max_tokens: 3000, system, messages: [{ role: 'user', content: prompt }] });
    handleTarotReply(data?.content?.[0]?.text || '');
  } catch (e) {
    try {
      const data = await callAPI({ model: 'claude-haiku-4-5-20251001', max_tokens: 3000, system, messages: [{ role: 'user', content: prompt }] });
      handleTarotReply(data?.content?.[0]?.text || '');
    } catch {
      showRetryUI(typingEl, retryFn);
    }
  }
  btn.disabled = false; input.disabled = false; input.focus();
  if (firstCardEl) setTimeout(() => firstCardEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

/* ── 타로 3카드 공유 카드 ── */
function addTarot3ShareCard(cards, fullReply) {
  const sections = fullReply.split(/(?=🔮|🌙|⚠️?|✨)/);
  const cardEmojis = ['🔮', '🌙', '⚠'];
  const summaries = [];
  let closingMsg = '';
  for (const sec of sections) {
    const t = sec.trim(); if (!t) continue;
    if (cardEmojis.some(e => t.startsWith(e))) {
      const lines = t.split('\n').filter(l => l.trim());
      const body = lines.slice(1).join(' ').trim();
      const firstSentence = body.split(/[.!?。]\s*/)[0];
      summaries.push(firstSentence ? firstSentence + '.' : '');
    } else if (t.startsWith('✨')) {
      const lines = t.split('\n').filter(l => l.trim());
      closingMsg = lines.slice(1).join(' ').trim() || lines[0].replace('✨', '').replace('운 다아라의 한마디', '').trim();
    }
  }

  const posEmojis = ['🔮', '🌙', '⚠️'];
  const posLabels = ['오늘', '미래', '주의'];
  const u = getUserInfo();
  const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  let cardsHtml = cards.map((c, i) =>
    `<div class="t3sc-card">` +
      `<div class="t3sc-card-sym">${c.sym}</div>` +
      `<div class="t3sc-card-info">` +
        `<div class="t3sc-card-pos">${posEmojis[i]} ${posLabels[i]}</div>` +
        `<div class="t3sc-card-name">${escapeHtml(c.name)}</div>` +
        `<div class="t3sc-card-en">${escapeHtml(c.en)}</div>` +
        `<div class="t3sc-card-keywords">${escapeHtml(c.keywords)}</div>` +
      `</div>` +
      `<div class="t3sc-card-summary">${escapeHtml(summaries[i] || '')}</div>` +
    `</div>`
  ).join('');

  const safeName = u ? escapeHtml(u.name) : '';
  const shareCardHtml =
    `<div class="t3-share-card">` +
      `<div class="t3sc-header">` +
        `<div class="t3sc-brand">✦ 운 다아라</div>` +
        `<div class="t3sc-date">${dateStr}</div>` +
      `</div>` +
      `<div class="t3sc-title">오늘의 3카드 타로</div>` +
      (u ? `<div class="t3sc-user">${safeName}님의 카드</div>` : '') +
      `<div class="t3sc-cards">${cardsHtml}</div>` +
      (closingMsg ? `<div class="t3sc-closing">✨ ${escapeHtml(closingMsg)}</div>` : '') +
      `<div class="t3sc-footer">` +
        `<div class="t3sc-url">undaara.com</div>` +
        `<div class="t3sc-tagline">AI 타로 · 운세 · 손금</div>` +
      `</div>` +
      `<div class="t3sc-actions">` +
        `<button class="t3sc-share-btn t3sc-img-btn" onclick="shareTarot3AsImage(this.closest('.t3-share-card'))"><svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>이미지로 공유</button>` +
        `<button class="t3sc-share-btn t3sc-text-btn" onclick="shareTarot3AsText()"><svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>텍스트 복사</button>` +
      `</div>` +
    `</div>`;

  addMsg('bot', shareCardHtml, 'card-reveal');
}

async function shareTarot3AsImage(cardEl) {
  const btn = cardEl.querySelector('.t3sc-img-btn');
  if (btn) { btn.disabled = true; btn.textContent = '이미지 생성 중···'; }

  const clone = cardEl.cloneNode(true);
  clone.querySelector('.t3sc-actions')?.remove();
  clone.classList.add('t3sc-capture');
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      backgroundColor: '#0c1321',
      scale: 2,
      useCORS: true,
      logging: false,
      width: clone.offsetWidth,
      height: clone.offsetHeight,
    });
    clone.remove();

    canvas.toBlob(async (blob) => {
      if (!blob) { showShareToast('이미지 생성에 실패했어요'); return; }
      const file = new File([blob], 'undaara-tarot3.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: '운 다아라 타로 3카드',
            text: '✨ AI가 뽑아준 오늘의 타로 카드\n',
            files: [file],
          });
        } catch (e) {
          if (e.name !== 'AbortError') downloadBlob(blob, 'undaara-tarot3.png');
        }
      } else {
        downloadBlob(blob, 'undaara-tarot3.png');
        showShareToast('이미지가 저장됐어요! 인스타·카톡에 공유해 보세요');
      }
      if (btn) { btn.disabled = false; btn.textContent = '📸 이미지로 공유'; }
    }, 'image/png');
  } catch (e) {
    clone.remove();
    console.error('Tarot3 share error:', e);
    showShareToast('이미지 생성 중 오류가 생겼어요');
    if (btn) { btn.disabled = false; btn.textContent = '📸 이미지로 공유'; }
  }
}

function shareTarot3AsText() {
  if (!drawnCards) return;
  const u = getUserInfo();
  const name = u ? u.name + '님의 ' : '';
  const posLabels = ['🔮 오늘', '🌙 미래', '⚠️ 주의'];
  let text = `${name}오늘의 3카드 타로\n\n`;
  drawnCards.forEach((c, i) => {
    text += `${posLabels[i]} — ${c.name} (${c.en})\n${c.keywords}\n\n`;
  });
  text += `✨ 운 다아라 — AI 타로·운세·손금\n${location.origin}`;

  if (navigator.share) {
    navigator.share({ title: '운 다아라 타로 결과', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showShareToast('결과가 복사됐어요! 붙여넣기로 공유하세요');
    }).catch(() => showShareToast('복사에 실패했어요'));
  }
}

/* ── 후속 상담 ── */
function getFollowUpMessage() {
  const u = getUserInfo();
  const name = u ? u.name : '고객';
  const msgs = [
    `위 내용은 ${name}님의 전체적인 흐름을 살펴본 거예요.\n하지만 하루하루의 운세는 지금 처한 상황에 따라 조금씩 달라지기도 한답니다.\n혹시 요즘 마음에 걸리는 일이 있으시다면, 편하게 말씀해 주세요.\n진심을 다해 살펴봐 드릴게요 🙏`,
    `지금까지 본 건 큰 흐름이에요.\n${name}님의 오늘은 또 다른 이야기를 품고 있을 수 있답니다.\n더 깊이 알고 싶은 부분이 있으시면 알려주세요.\n정성껏 봐드리겠습니다 ✨`,
    `운세는 날마다 조금씩 달라져요.\n오늘 ${name}님에게 특별히 와닿는 부분이 있거나 궁금한 점이 있으시다면 편하게 여쭤보세요.\n운 다아라가 곁에서 함께 살펴봐 드릴게요 🌙`,
    `${name}님만의 이야기는 여기서 끝이 아니에요.\n요즘 고민되는 일이나 앞으로 궁금한 점이 있다면 말씀해 주세요.\n별과 카드가 전하는 메시지를 더 세심하게 풀어드릴게요 💫`,
    `전체 흐름은 이렇지만, 지금 이 순간 ${name}님의 마음이 향하는 곳에 따라 운세의 결도 달라진답니다.\n더 알고 싶은 부분이 있으시면 부담 없이 물어봐 주세요 🍀`,
    `${name}님, 오늘의 기운은 어제와는 또 다르답니다.\n지금 가장 신경 쓰이는 일이 있으시면 말씀해 주세요.\n그 마음에 맞춰 더 자세히 풀어드릴게요 🌸`,
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function addFollowUp() {
  const msg = getFollowUpMessage();
  const followupHtml = `<div class="followup-prompt">
    <div class="followup-text">${msg.replace(/\n/g, '<br>')}</div>
    <div class="followup-input-wrap">
      <input type="text" class="followup-input" placeholder="궁금한 점을 편하게 말씀해 주세요..." onkeydown="if(event.key==='Enter')sendFollowUp(this)">
      <button class="followup-send" onclick="sendFollowUp(this.previousElementSibling)">보내기</button>
    </div>
  </div>`;
  const box = document.getElementById(currentMsgBoxId);
  const lastBot = box?.querySelector('.msg.bot:last-child');
  const bubble = lastBot?.querySelector('.msg-bubble') || lastBot?.querySelector('.palm-result-msg') || lastBot?.querySelector('.card-reveal-msg');
  if (bubble) {
    bubble.insertAdjacentHTML('beforeend', followupHtml);
  } else {
    addMsg('bot', followupHtml);
  }
}

function sendFollowUp(inputEl) {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  inputEl.disabled = true;
  inputEl.nextElementSibling.disabled = true;
  const u = getUserInfo();
  const ctx = u ? `${u.name}님(${u.zodiac}, ${u.age}세 ${u.gender})이 ` : '';
  askClaude(`${ctx}방금 운세 결과를 보고 추가로 궁금한 점이 있어요: "${text}"\n\n이전 운세 흐름을 이어서, 지금 상황에 맞게 따뜻하고 구체적으로 3~4문장으로 답해 주세요. 마지막에 운 다아라의 따뜻한 한마디를 덧붙여 주세요.`, true, text);
}

/* ── 메시지 전송 ── */
async function sendMessage() {
  if (!ensureUserInfo(() => sendMessage())) return;
  currentMsgBoxId = 'messages';
  const input = document.getElementById('chat-input');
  const text = input.value.trim(); if (!text) return;
  addMsg('user', escapeHtml(text)); input.value = '';
  history.push({ role: 'user', content: text });
  await askClaude(null, false, null);
}
