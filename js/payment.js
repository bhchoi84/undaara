/* ── 토스페이먼츠 결제 ── */
// 테스트 키: test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
// 운영 키로 교체 시 live_ck_... 로 변경
const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

let selectedPriceDays = 1; // 기본: 1일 1,900원

function selectPriceOpt(days) {
  selectedPriceDays = days;
  document.getElementById('price-opt-1').classList.toggle('price-selected', days === 1);
  document.getElementById('price-opt-30').classList.toggle('price-selected', days === 30);
  const btn = document.getElementById('limit-pay-btn');
  btn.textContent = days === 1 ? '1,900원으로 오늘 바로 시작' : '9,900원으로 30일 시작';
}

async function startPayment() {
  const btn = document.getElementById('limit-pay-btn');
  const phoneInput = document.getElementById('limit-phone');
  const phone = (phoneInput?.value || '').replace(/[^0-9]/g, '');

  const amount = selectedPriceDays === 1 ? 1900 : 9900;
  const label = selectedPriceDays === 1 ? '다아라 프리미엄 1일' : '다아라 프리미엄 30일';
  btn.disabled = true; btn.textContent = '결제창 열기···';

  // 전화번호를 localStorage에 임시 저장 (결제 리다이렉트 후 사용)
  if (phone) safeLSSet('undaara_pay_phone', phone);

  try {
    const toss = TossPayments(TOSS_CLIENT_KEY);
    const u = getUserInfo();
    const orderId = 'undaara_' + getToday().replace(/-/g,'') + '_' + Math.random().toString(36).slice(2,8);
    const baseUrl = window.location.origin + window.location.pathname;
    await toss.requestPayment('카드', {
      amount,
      orderId,
      orderName: label,
      customerName: u?.name || '사용자',
      successUrl: baseUrl + '?payment=success',
      failUrl: baseUrl + '?payment=fail',
    });
  } catch (e) {
    btn.disabled = false; btn.textContent = selectedPriceDays === 1 ? '1,900원으로 오늘 바로 시작' : '9,900원으로 30일 시작';
    if (e.code !== 'USER_CANCEL') {
      addMsg('bot', '결제 중 오류가 생겼어요. 잠깐 후 다시 시도해 주세요 😊');
      document.getElementById('limit-modal-overlay').style.display = 'none';
    }
  }
}

async function handlePaymentSuccess(paymentKey, orderId, amount) {
  try {
    const u = getUserInfo();
    const phone = localStorage.getItem('undaara_pay_phone') || '';

    const res = await fetch('/api/payment-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
        phone,
        userName: u?.name || '',
        birthdate: u?.birthdate || '',
      }),
    });
    const data = await res.json();
    if (data.success) {
      const days = Number(amount) === 1900 ? 1 : 30;
      const expiry = new Date(); expiry.setDate(expiry.getDate() + days);
      safeLSSet('undaara_premium', JSON.stringify({
        expiry: expiry.toISOString().slice(0,10),
        paymentKey,
        approvedAt: data.approvedAt,
        phone,
      }));
      // 전화번호 임시 저장 정리
      localStorage.removeItem('undaara_pay_phone');
      // 전화번호를 영구 저장 (복원용)
      if (phone) safeLSSet('undaara_phone', phone);

      updateUserBadge();
      const msg = days === 1
        ? '프리미엄이 활성화됐어요 ✨ 오늘 하루 30회 AI 상담을 마음껏 이용해 보세요 😊'
        : '프리미엄으로 업그레이드됐어요 ✨ 오늘부터 30일간 하루 30회 상담이 가능해요 😊';
      addMsg('bot', msg);
    } else {
      addMsg('bot', `결제 확인 중 문제가 생겼어요: ${data.error || '잠깐 후 다시 시도해 주세요 😊'}`);
    }
  } catch (e) {
    addMsg('bot', '결제 확인 중 오류가 생겼어요. 고객센터에 문의해 주세요 😊');
  }
}

function handlePaymentFail(code, message) {
  if (code !== 'PAY_PROCESS_CANCELED') {
    addMsg('bot', `결제가 완료되지 않았어요 (${message || code}). 다시 시도해 주실 수 있어요? 😊`);
  }
}

/* ── 프리미엄 복원 (전화번호 기반) ── */
async function restorePremium() {
  const phoneInput = document.getElementById('limit-phone');
  const phone = (phoneInput?.value || '').replace(/[^0-9]/g, '');
  if (!phone || phone.length < 10) {
    showShareToast('전화번호를 입력해 주세요');
    phoneInput?.focus();
    return;
  }

  const btn = document.getElementById('limit-restore-btn');
  btn.disabled = true; btn.textContent = '확인 중···';

  try {
    const res = await fetch('/api/premium-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();

    if (data.premium) {
      const expiresDate = new Date(data.expires_at);
      safeLSSet('undaara_premium', JSON.stringify({
        expiry: expiresDate.toISOString().slice(0,10),
        plan: data.plan,
        restoredAt: new Date().toISOString(),
        phone,
      }));
      safeLSSet('undaara_phone', phone);
      updateUserBadge();
      document.getElementById('limit-modal-overlay').style.display = 'none';

      const daysLeft = Math.ceil((expiresDate - new Date()) / 86400000);
      addMsg('bot', `프리미엄이 복원됐어요 ✨ ${daysLeft}일 남았어요. 마음껏 상담 받아 보세요 😊`);
    } else {
      showShareToast('해당 번호로 활성 프리미엄이 없어요');
    }
  } catch (e) {
    showShareToast('확인 중 오류가 생겼어요');
  }
  btn.disabled = false; btn.textContent = '이전 결제 복원하기';
}

/* ── 앱 로드 시 서버 프리미엄 동기화 ── */
async function syncPremiumStatus() {
  const phone = localStorage.getItem('undaara_phone');
  if (!phone) return;

  try {
    const res = await fetch('/api/premium-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
    const data = await res.json();

    if (data.premium) {
      const expiresDate = new Date(data.expires_at);
      const current = JSON.parse(localStorage.getItem('undaara_premium') || 'null');
      // 서버 만료일이 더 최신이면 업데이트
      const serverExpiry = expiresDate.toISOString().slice(0,10);
      if (!current || current.expiry < serverExpiry) {
        safeLSSet('undaara_premium', JSON.stringify({
          expiry: serverExpiry,
          plan: data.plan,
          phone,
          syncedAt: new Date().toISOString(),
        }));
      }
    } else {
      // 서버에 없으면 로컬도 제거 (만료됨)
      const current = JSON.parse(localStorage.getItem('undaara_premium') || 'null');
      if (current && current.phone === phone) {
        localStorage.removeItem('undaara_premium');
      }
    }
    updateUserBadge();
  } catch (e) {
    // 네트워크 오류 시 로컬 상태 유지
  }
}
