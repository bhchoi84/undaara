/* ══════════════════════════════════════════
   app.js — 초기화 & 이벤트 바인딩

   의존성: state.js → ui.js → api.js → app.js
   ══════════════════════════════════════════ */

/* ── 사이드바 클릭 이벤트 (모바일) ── */
document.addEventListener('click', function(e) {
  if (window.innerWidth > 768) return;
  const sb = document.querySelector('.sidebar');
  if (!sb) return;
  if (sb.classList.contains('collapsed') && e.target.closest('.sidebar') && !e.target.closest('.mini-card')) {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar(false);
  }
});

/* ── 스크롤·터치 이벤트 ── */
document.addEventListener('DOMContentLoaded', function() {
  function onScrollDown() { toggleSidebar(true); }
  const msgs = document.getElementById('messages');
  if (msgs) msgs.addEventListener('scroll', function() { if (this.scrollTop > 30) onScrollDown(); });
  document.querySelectorAll('.panel').forEach(p => {
    p.addEventListener('scroll', function() { if (this.scrollTop > 30) onScrollDown(); });
  });
  let touchStartY = 0;
  document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchmove', function(e) {
    if (window.innerWidth > 768) return;
    const deltaY = touchStartY - e.touches[0].clientY;
    if (deltaY > 15) toggleSidebar(true);
  }, { passive: true });
});

/* ── 초기화 ── */
document.addEventListener('DOMContentLoaded', async () => {
  showOnboarding();
  clearOldCache();
  initBirthSelects('um-birth-y', 'um-birth-m', 'um-birth-d');
  initBirthSelects('match-p-birth-y', 'match-p-birth-m', 'match-p-birth-d');

  // 토스 결제 리다이렉트 처리
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    window.history.replaceState({}, '', window.location.pathname);
    const u = getUserInfo();
    if (!u) { showUserInfoModal(); }
    else { updateUserBadge(); addMsg('bot', `안녕하세요, <b>${escapeHtml(u.name)}</b>님 😊 결제 확인 중이에요···`, 'text', null, false); }
    await handlePaymentSuccess(params.get('paymentKey'), params.get('orderId'), params.get('amount'));
    return;
  }
  if (params.get('payment') === 'fail') {
    window.history.replaceState({}, '', window.location.pathname);
    handlePaymentFail(params.get('code'), params.get('message'));
  }

  const u = getUserInfo();

  if (u) {
    updateUserBadge();
    autoFillZodiac(u.zodiac);
    const safeName = escapeHtml(u.name);
    addMsg('bot', `<b>${safeName}</b>님, 오늘의 운세가 준비됐어요 😊<br>어제와는 다른 흐름이 보여요. 카드를 뽑아 확인해 보세요 ✨<br><span style="font-size:11px;color:var(--text-muted)">지금 가장 많이 받는 상담: ${getPopularMenu()} 🔥</span>`, 'text', null, false);
  } else {
    addMsg('bot', `오늘 하루가 궁금하지 않으세요? 😊<br><b>운 다아라</b>가 AI로 당신만의 운세를 바로 봐드려요.<br><br>카드를 뽑거나 메뉴를 선택하면 <b class="hl-gold">무료로 바로 시작</b>할 수 있어요 ✨<br><span style="font-size:11px;color:var(--text-muted)">지금 가장 많이 받는 상담: ${getPopularMenu()} 🔥</span>`, 'text', null, false);
  }

  // 소셜 프루프 동적 업데이트
  const adBody = document.getElementById('ad-body');
  if (adBody) adBody.textContent = `오늘 ${getSocialCount('consulting')}명이 상담 중`;
  const limitSub = document.getElementById('limit-modal-sub');
  if (limitSub) limitSub.innerHTML = `오늘의 무료 상담을 모두 사용했어요.<br><b>지금 ${getSocialCount('premium')}명이 프리미엄으로 상담 중이에요.</b>`;

  // 결제 모달 전화번호 자동 입력
  const savedPhone = localStorage.getItem('undaara_phone');
  if (savedPhone) {
    const phoneInput = document.getElementById('limit-phone');
    if (phoneInput) phoneInput.value = savedPhone;
  }

  // 서버 프리미엄 상태 동기화 (백그라운드)
  if (typeof syncPremiumStatus === 'function') syncPremiumStatus();

  // Supabase Auth 초기화 (로그인 세션 복원, OAuth 콜백 처리)
  if (typeof initAuth === 'function') initAuth();
});
