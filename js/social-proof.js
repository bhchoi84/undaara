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

// 이벤트 기록
async function logSocialEvent(type) {
  try {
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

// 메인 카운터 업데이트
function updateSocialProofUI() {
  if (!spData) return;
  const counter = document.getElementById('sp-counter');
  if (counter) {
    const count = spData.todayCount || 0;
    counter.innerHTML = `<span class="sp-dot"></span>오늘 <b>${count.toLocaleString()}명</b>이 상담을 받았어요`;
    counter.style.display = count > 0 ? 'flex' : 'none';
  }
}

// 최근 활동 토스트
function showRecentToasts() {
  if (!spData || !spData.recent || spData.recent.length === 0) return;
  // 이미 보여준 건 스킵
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
  void toast.offsetWidth; // reflow
  toast.classList.add('sp-show');
  setTimeout(() => toast.classList.remove('sp-show'), 4000);
}

function getTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return `${Math.floor(diff / 3600)}시간 전`;
}

// 초기화 — 페이지 로드 시 실행
function initSocialProof() {
  // 카운터 DOM 삽입 (메인 화면 상단)
  const header = document.querySelector('.main-header');
  if (header && !document.getElementById('sp-counter')) {
    const counter = document.createElement('div');
    counter.id = 'sp-counter';
    counter.className = 'sp-counter';
    counter.style.display = 'none';
    header.parentNode.insertBefore(counter, header.nextSibling);
  }

  // 첫 로드
  fetchSocialProof();
  // 45초마다 갱신
  setInterval(fetchSocialProof, 45000);
}

document.addEventListener('DOMContentLoaded', initSocialProof);
