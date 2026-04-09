/* ══════════════════════════════════════════
   auth.js — Supabase Auth (카카오/구글 소셜 로그인)
   ══════════════════════════════════════════ */

/* ── Supabase 설정 (대시보드 → Settings → API에서 복사) ── */
// ⚠️ 아래 두 값을 실제 Supabase 프로젝트 값으로 교체해주세요.
// anon key는 공개되어도 안전한 키입니다 (RLS로 보호).
const SUPABASE_URL = 'https://baecbdazvbjscmpaerbz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZWNiZGF6dmJqc2NtcGFlcmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDEyODQsImV4cCI6MjA5MDgxNzI4NH0.fZmri9OKy50OFJGUIJeMsC3s_p-qD0oCBSd2dP8_R94';

/* ── Supabase 클라이언트 ── */
let sbClient = null;
function getSupabase() {
  if (sbClient) return sbClient;
  if (typeof window.supabase === 'undefined') {
    console.warn('Supabase JS SDK not loaded');
    return null;
  }
  if (SUPABASE_URL.includes('YOUR_PROJECT') || SUPABASE_ANON_KEY === 'YOUR_ANON_KEY') {
    console.warn('Supabase 설정이 아직 비어있어요. js/auth.js의 SUPABASE_URL/KEY를 채워주세요.');
    return null;
  }
  sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  return sbClient;
}

/* ── 현재 사용자 정보 ── */
let currentUser = null;
function getCurrentUser() { return currentUser; }
function isLoggedIn() { return !!currentUser; }
function getCurrentUserId() { return currentUser?.id || null; }

/* ── 로그인 모달 표시 ── */
function showLoginModal() {
  const modal = document.getElementById('login-modal-overlay');
  if (modal) modal.style.display = 'flex';
}
function hideLoginModal() {
  const modal = document.getElementById('login-modal-overlay');
  if (modal) modal.style.display = 'none';
}

/* ── 카카오 로그인 ── */
async function loginWithKakao() {
  const sb = getSupabase();
  if (!sb) { alert('로그인 설정이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.'); return; }
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        scopes: 'account_email profile_nickname birthday gender',
      },
    });
    if (error) throw error;
  } catch (e) {
    console.error('Kakao login error:', e);
    alert('카카오 로그인 중 오류가 생겼어요: ' + e.message);
  }
}

/* ── 구글 로그인 ── */
async function loginWithGoogle() {
  const sb = getSupabase();
  if (!sb) { alert('로그인 설정이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.'); return; }
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    });
    if (error) throw error;
  } catch (e) {
    console.error('Google login error:', e);
    alert('구글 로그인 중 오류가 생겼어요: ' + e.message);
  }
}

/* ── 로그아웃 ── */
async function logout() {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.auth.signOut();
    currentUser = null;
    updateLoginUI();
    if (typeof updateUserBadge === 'function') updateUserBadge();
    if (typeof addMsg === 'function') addMsg('bot', '로그아웃되었어요. 다음에 또 만나요 😊');
  } catch (e) {
    console.error('Logout error:', e);
  }
}

/* ── OAuth 메타데이터에서 사용자 정보 자동 추출 ── */
function extractProfileFromUser(user) {
  const meta = user.user_metadata || {};
  const provider = user.app_metadata?.provider || '';
  const profile = {
    id: user.id,
    email: user.email || meta.email || '',
    name: meta.full_name || meta.name || meta.nickname || meta.user_name || '',
    avatar: meta.avatar_url || meta.picture || '',
    provider,
  };
  // 카카오 추가 동의 항목
  if (provider === 'kakao') {
    // 카카오 birthday 형식: "MMDD" (예: 0315)
    if (meta.birthday) profile.kakao_birthday = meta.birthday;
    if (meta.gender) profile.kakao_gender = meta.gender; // 'male' / 'female'
  }
  return profile;
}

/* ── 카카오 정보로 사용자 정보 자동 입력 (이미 등록된 경우만 보강) ── */
function autofillUserInfoFromProfile(profile) {
  const existing = getUserInfo();
  if (existing && existing.name) return; // 이미 있으면 건드리지 않음

  // 카카오 생일 → 사용자 정보 모달에 자동 입력
  if (profile.name) {
    const nameInput = document.getElementById('um-name');
    if (nameInput && !nameInput.value) nameInput.value = profile.name;
  }
  if (profile.kakao_gender) {
    const g = profile.kakao_gender === 'male' ? '남성' : '여성';
    setTimeout(() => {
      try { selectGender(g, document.querySelector(`.gender-btn[data-gender="${g}"]`)); } catch {}
    }, 100);
  }
}

/* ── 로그인 UI 업데이트 ── */
function updateLoginUI() {
  const btn = document.getElementById('login-btn');
  const profileBox = document.getElementById('login-profile');
  if (!btn || !profileBox) return;

  if (currentUser) {
    btn.style.display = 'none';
    profileBox.style.display = 'flex';
    const profile = extractProfileFromUser(currentUser);
    const safeName = (typeof escapeHtml === 'function') ? escapeHtml(profile.name || profile.email || '회원') : (profile.name || '회원');
    const avatarHtml = profile.avatar
      ? `<img src="${profile.avatar}" class="login-avatar" alt="">`
      : `<div class="login-avatar login-avatar-placeholder">${safeName.charAt(0)}</div>`;
    profileBox.innerHTML = `
      ${avatarHtml}
      <div class="login-info">
        <div class="login-name">${safeName}</div>
        <div class="login-provider">${profile.provider === 'kakao' ? '카카오' : '구글'} 로그인</div>
      </div>
      <button class="logout-btn" onclick="logout()">로그아웃</button>
    `;
  } else {
    btn.style.display = 'flex';
    profileBox.style.display = 'none';
  }
}

/* ── 로그인 후 프리미엄 동기화 (user_id 기반) ── */
async function syncPremiumByUserId() {
  if (!currentUser) return;
  try {
    const res = await fetch('/api/premium-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id }),
    });
    const data = await res.json();
    if (data && data.premium) {
      const expiresDate = new Date(data.expires_at);
      if (typeof safeLSSet === 'function') {
        safeLSSet('undaara_premium', JSON.stringify({
          expiry: expiresDate.toISOString().slice(0, 10),
          plan: data.plan,
          user_id: currentUser.id,
          syncedAt: new Date().toISOString(),
        }));
      }
      if (typeof updateUserBadge === 'function') updateUserBadge();
    }
  } catch (e) {
    console.warn('Premium sync error:', e);
  }
}

/* ── 초기화: 페이지 로드 시 세션 복원 + 변경 감지 ── */
async function initAuth() {
  const sb = getSupabase();
  if (!sb) { updateLoginUI(); return; }

  try {
    // 현재 세션 확인 (URL hash에서 토큰 자동 처리됨)
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) {
      currentUser = session.user;
      const profile = extractProfileFromUser(session.user);
      autofillUserInfoFromProfile(profile);
      await syncPremiumByUserId();
    }
    updateLoginUI();

    // 로그인/로그아웃 이벤트 감지
    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const wasLoggedOut = !currentUser;
        currentUser = session.user;
        updateLoginUI();
        hideLoginModal();
        if (wasLoggedOut) {
          const profile = extractProfileFromUser(session.user);
          autofillUserInfoFromProfile(profile);
          syncPremiumByUserId();
          if (typeof addMsg === 'function') {
            const name = profile.name || '회원';
            const safeName = (typeof escapeHtml === 'function') ? escapeHtml(name) : name;
            addMsg('bot', `<b>${safeName}</b>님, 환영해요 ✨ 이제 다른 기기에서도 같은 기록으로 이용할 수 있어요 😊`);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        updateLoginUI();
      }
    });
  } catch (e) {
    console.error('Auth init error:', e);
    updateLoginUI();
  }
}
