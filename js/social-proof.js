/* ── 소셜 프루프 ── */

const SP_TYPE_LABELS = {
  tarot: '타로 상담', palm: '손금 분석', face: '관상 분석',
  star: '별자리 운세', match: '궁합 분석', money: '재물운', today: '오늘의 운세'
};
const SP_TYPE_EMOJI = {
  tarot: '🔮', palm: '✋', face: '😊',
  star: '⭐', match: '💕', money: '💰', today: '🌅'
};

let spData = null;
let spToastQueue = [];
let spToastShowing = false;
let spMyCount = 0;

// 이벤트 기록
async function logSocialEvent(type) {
  try {
    spMyCount++;
    await fetch('/api/social-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
  } catch (e) { /* silent */ }
}

// 통계 조회
async function fetchSocialProof() {
  try {
    const res = await fetch('/api/social-proof');
    if (!res.ok) return;
    spData = await res.json();
    updateSocialProofUI();
    showRecentToasts();
  } catch (e) { /* silent */ }
}

// 카운터 업데이트
function updateSocialProofUI() {
  if (!spData) return;
  const counter = document.getElementById('sp-counter');
  if (counter) {
    const count = Math.max((spData.todayCount || 0) - spMyCount, 0);
    counter.innerHTML = `<span class="sp-dot"></span><b>${count.toLocaleString()}</b>명 상담 중`;
    counter.style.display = count > 0 ? 'flex' : 'none';
  }
}

// 최근 활동 토스트
function showRecentToasts() {
  if (!spData || !spData.recent || spData.recent.length === 0) return;
  const newEvents = spData.recent.slice(0, 3);
  newEvents.forEach(e => {
    const label = SP_TYPE_LABELS[e.type] || '상담';
    const emoji = SP_TYPE_EMOJI[e.type] || '✨';
    const ago = getTimeAgo(e.created_at);
    spToastQueue.push(`${emoji} 누군가 ${label}을 받았어요 · ${ago}`);
  });
  processToastQueue();
}

function processToastQueue() {
  if (spToastShowing || spToastQueue.length === 0) return;
  spToastShowing = true;
  const msg = spToastQueue.shift();
  showSPToast(msg);
  setTimeout(() => {
    spToastShowing = false;
    processToastQueue();
  }, 5000);
}

function showSPToast(msg) {
  let toast = document.getElementById('sp-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sp-toast';
    toast.className = 'sp-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.classList.remove('sp-show');
  void toast.offsetWidth;
  toast.classList.add('sp-show');
  setTimeout(() => toast.classList.remove('sp-show'), 4000);
}

function getTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return `${Math.floor(diff / 3600)}시간 전`;
}

/* ── 햄버거 메뉴 ── */
function toggleHamburger() {
  const panel = document.getElementById('hb-panel');
  const overlay = document.getElementById('hb-overlay');
  const isOpen = panel.classList.contains('hb-open');
  if (isOpen) {
    panel.classList.remove('hb-open');
    overlay.classList.remove('hb-overlay-show');
  } else {
    updateHamburgerContent();
    panel.classList.add('hb-open');
    overlay.classList.add('hb-overlay-show');
  }
}

function updateHamburgerContent() {
  const u = getUserInfo();
  const prem = isPremium();
  const used = getUsageToday();
  const limit = getDailyLimit();
  const content = document.getElementById('hb-content');

  // 사용자 정보
  let userHtml;
  if (u) {
    userHtml = `
      <div class="hb-user">
        <div class="hb-user-avatar">${u.name.charAt(0)}</div>
        <div class="hb-user-info">
          <div class="hb-user-name">${u.name}</div>
          <div class="hb-user-detail">${u.zodiac} · ${u.age}세 · ${u.gender}</div>
        </div>
        ${prem ? '<span class="hb-pro-badge">★ PRO</span>' : '<span class="hb-free-badge">FREE</span>'}
      </div>`;
  } else {
    userHtml = `
      <div class="hb-user hb-user-empty" onclick="toggleHamburger();showUserInfoModal()">
        <div class="hb-user-avatar">?</div>
        <div class="hb-user-info">
          <div class="hb-user-name">로그인 정보 없음</div>
          <div class="hb-user-detail">탭하여 정보 입력하기</div>
        </div>
      </div>`;
  }

  // 이용 현황
  const progressPct = Math.min((used / limit) * 100, 100);
  const usageHtml = `
    <div class="hb-section">
      <div class="hb-section-title">오늘의 이용 현황</div>
      <div class="hb-usage-bar-wrap">
        <div class="hb-usage-bar"><div class="hb-usage-fill" style="width:${progressPct}%"></div></div>
        <div class="hb-usage-text">${used} / ${limit}회</div>
      </div>
      ${!prem ? '<div class="hb-upgrade" onclick="toggleHamburger();document.getElementById(\'limit-modal-overlay\').style.display=\'flex\'">프리미엄으로 업그레이드 →</div>' : '<div class="hb-premium-info">프리미엄 활성 · 하루 ' + limit + '회</div>'}
    </div>`;

  // 메뉴 액션
  const actionsHtml = `
    <div class="hb-section">
      <div class="hb-section-title">설정</div>
      <div class="hb-action" onclick="toggleHamburger();showUserInfoModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        내 정보 수정
      </div>
      <div class="hb-action" onclick="toggleHamburger();resetPalmPanel&&resetPalmPanel()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
        상담 초기화
      </div>
    </div>`;

  content.innerHTML = userHtml + usageHtml + actionsHtml;
}

// 초기화
function initSocialProof() {
  // 우측 상단 영역: 카운터 + 햄버거
  if (!document.getElementById('sp-top-bar')) {
    const bar = document.createElement('div');
    bar.id = 'sp-top-bar';
    bar.className = 'sp-top-bar';
    bar.innerHTML = `
      <div id="sp-counter" class="sp-counter" style="display:none"></div>
      <button class="hb-btn" onclick="toggleHamburger()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    `;
    document.body.appendChild(bar);

    // 햄버거 패널 + 오버레이
    const overlay = document.createElement('div');
    overlay.id = 'hb-overlay';
    overlay.className = 'hb-overlay';
    overlay.onclick = toggleHamburger;
    document.body.appendChild(overlay);

    const panel = document.createElement('div');
    panel.id = 'hb-panel';
    panel.className = 'hb-panel';
    panel.innerHTML = `
      <div class="hb-header">
        <span class="hb-title">✦ 운 다아라</span>
        <button class="hb-close" onclick="toggleHamburger()">✕</button>
      </div>
      <div id="hb-content" class="hb-content"></div>
    `;
    document.body.appendChild(panel);
  }

  fetchSocialProof();
  setInterval(fetchSocialProof, 45000);
}

document.addEventListener('DOMContentLoaded', initSocialProof);
