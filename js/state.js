/* ══════════════════════════════════════════
   state.js — 상태 관리, 사용량, 캐싱, 사용자 정보
   ══════════════════════════════════════════ */

/* ── 상수 ── */
const FREE_LIMIT = 5;
const PREMIUM_LIMIT = 30;
const FREE_PALM_LIMIT = 1;

/* ── 상태 변수 ── */
let selectedGender = null;
let selectedCalendar = '양력';
let pendingAction = null;
let drawnCards = null, history = [], moneyCard = null, palmImageData = null, palmPreviewSrc = null;
let flippedCards = [false, false, false];
const sel = { a: null, m1: null, m2: null, mo: null, today: null, monthly: null };
let currentMsgBoxId = 'messages';

/* ── 위치 정보 (카카오 로컬 API, IP 폴백) ── */
let userLocation = null;
(function fetchLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords;
        const res = await fetch(`/api/location?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const d = await res.json();
          if (d.city) {
            userLocation = { city: d.city, region: d.region, country: d.country };
          } else { fallbackIP(); }
        } else { fallbackIP(); }
      } catch { fallbackIP(); }
    }, () => fallbackIP(), { timeout: 5000 });
  } else { fallbackIP(); }
  async function fallbackIP() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) { const d = await res.json(); userLocation = { city: d.city, region: d.region, country: d.country_name }; }
    } catch {}
  }
})();

/* ── 날짜 & 사용량 ── */
function getToday() { return new Date().toISOString().slice(0,10); }

function getUsageToday() {
  try {
    const s = JSON.parse(localStorage.getItem('undaara_usage') || 'null');
    if (!s || s.date !== getToday()) return 0;
    return s.count || 0;
  } catch { return 0; }
}
function safeLSSet(key, val) {
  try { localStorage.setItem(key, val); }
  catch (e) {
    if (e.name === 'QuotaExceededError') { clearOldCache(); try { localStorage.setItem(key, val); } catch {} }
  }
}
function clearOldCache() {
  const today = getToday();
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith('undaara_rc_')) {
      try { const v = JSON.parse(localStorage.getItem(k)); if (!v || v.date !== today) localStorage.removeItem(k); } catch { localStorage.removeItem(k); }
    }
  }
}
function incrementUsage() {
  const count = getUsageToday() + 1;
  safeLSSet('undaara_usage', JSON.stringify({ date: getToday(), count }));
  updateUsageIndicator();
}
function isPremium() {
  try {
    const s = JSON.parse(localStorage.getItem('undaara_premium') || 'null');
    return s && s.expiry >= getToday();
  } catch { return false; }
}
function getDailyLimit() { return isPremium() ? PREMIUM_LIMIT : FREE_LIMIT; }
function canUseAPI() { return getUsageToday() < (getDailyLimit() + getShareBonus()); }

/* ── 손금/관상 사용량 (별도 추적) ── */
function getPalmUsageToday() {
  try {
    const s = JSON.parse(localStorage.getItem('undaara_palm_usage') || 'null');
    if (!s || s.date !== getToday()) return 0;
    return s.count || 0;
  } catch { return 0; }
}
function incrementPalmUsage() {
  const count = getPalmUsageToday() + 1;
  safeLSSet('undaara_palm_usage', JSON.stringify({ date: getToday(), count }));
}
function canUsePalm() { return isPremium() || getPalmUsageToday() < FREE_PALM_LIMIT; }

/* ── 공유 보너스 ── */
function getShareBonus() {
  try {
    const s = JSON.parse(localStorage.getItem('undaara_share_bonus') || 'null');
    if (!s || s.date !== getToday()) return 0;
    return s.count || 0;
  } catch { return 0; }
}
function addShareBonus() {
  const current = getShareBonus();
  if (current >= 3) return false;
  safeLSSet('undaara_share_bonus', JSON.stringify({ date: getToday(), count: current + 1 }));
  return true;
}

/* ── 캐싱 ── */
function getCached(key) {
  try {
    const s = JSON.parse(localStorage.getItem('undaara_rc_' + key) || 'null');
    if (!s || s.date !== getToday()) return null;
    return s.val;
  } catch { return null; }
}
function setCached(key, val) {
  safeLSSet('undaara_rc_' + key, JSON.stringify({ date: getToday(), val }));
}

/* ── 사용자 정보 ── */
function getZodiac(birthdate) {
  const d = new Date(birthdate); const m = d.getMonth() + 1; const day = d.getDate();
  if ((m===3&&day>=21)||(m===4&&day<=19)) return '양자리';
  if ((m===4&&day>=20)||(m===5&&day<=20)) return '황소자리';
  if ((m===5&&day>=21)||(m===6&&day<=20)) return '쌍둥이자리';
  if ((m===6&&day>=21)||(m===7&&day<=22)) return '게자리';
  if ((m===7&&day>=23)||(m===8&&day<=22)) return '사자자리';
  if ((m===8&&day>=23)||(m===9&&day<=22)) return '처녀자리';
  if ((m===9&&day>=23)||(m===10&&day<=22)) return '천칭자리';
  if ((m===10&&day>=23)||(m===11&&day<=21)) return '전갈자리';
  if ((m===11&&day>=22)||(m===12&&day<=21)) return '사수자리';
  if ((m===12&&day>=22)||(m===1&&day<=19)) return '염소자리';
  if ((m===1&&day>=20)||(m===2&&day<=18)) return '물병자리';
  return '물고기자리';
}
function getUserInfo() {
  try {
    const stored = JSON.parse(localStorage.getItem('undaara_user') || 'null');
    if (!stored) return null;
    const today = new Date().toISOString().slice(0,10);
    if (stored.date !== today) { localStorage.removeItem('undaara_user'); return null; }
    return stored;
  } catch { return null; }
}
function saveUserInfo(name, birthdate, gender, siji, job, calendar) {
  const today = new Date().toISOString().slice(0,10);
  const zodiac = getZodiac(birthdate);
  const age = today.slice(0,4) - birthdate.slice(0,4);
  const saju = calcManseryuk(birthdate, siji || null, calendar || '양력');
  safeLSSet('undaara_user', JSON.stringify({ name, birthdate, gender, zodiac, age, siji: siji || '', job: job || '', saju, calendar: calendar || '양력', date: today }));
}
function getSaju(birthdate, siji) {
  return calcManseryuk(birthdate, siji || null);
}
function getUserContext() {
  const u = getUserInfo();
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const locStr = userLocation ? ` / 위치: ${userLocation.city}, ${userLocation.region}, ${userLocation.country}` : '';
  const hour = now.getHours();
  const currentSiji = ['자시','축시','인시','묘시','진시','사시','오시','미시','신시','유시','술시','해시'][Math.floor(((hour + 1) % 24) / 2)];
  if (!u) return `\n[현재] ${dateStr} ${timeStr} (${currentSiji})${locStr}`;
  let ctx = `\n[사용자] 이름: ${u.name} / 생년월일: ${u.birthdate}(${u.calendar || '양력'}, ${u.age}세) / 성별: ${u.gender} / 별자리: ${u.zodiac}`;
  if (u.saju) {
    const s = u.saju;
    ctx += ` / 만세력 사주팔자: 년주 ${s.year?.ganji || s.year || ''} 월주 ${s.month?.ganji || ''} 일주 ${s.day?.ganji || s.day || ''}`;
    if (s.hour) ctx += ` 시주 ${s.hour.ganji}(${s.hour.name})`;
    ctx += ` / 일간: ${s.day?.gan || ''}(${s.dayYinYang || ''})`;
    if (s.ohaengCount) ctx += ` / 오행분포: 목${s.ohaengCount.목} 화${s.ohaengCount.화} 토${s.ohaengCount.토} 금${s.ohaengCount.금} 수${s.ohaengCount.수}`;
    if (s.lackOhaeng && s.lackOhaeng.length > 0) ctx += ` / 부족오행: ${s.lackOhaeng.join(',')}`;
    if (s.unseong) ctx += ` / 십이운성: ${s.unseong}`;
  }
  if (u.siji) ctx += ` / 태어난 시: ${u.siji}`;
  if (u.job) ctx += ` / 직업: ${u.job}`;
  const todayMs = getTodayManseryuk();
  ctx += `\n[현재] ${dateStr} ${timeStr} (${currentSiji})${locStr}`;
  ctx += ` / 오늘 만세력: 년주 ${todayMs.year.ganji} 월주 ${todayMs.month.ganji} 일주 ${todayMs.day.ganji}`;
  return ctx;
}

/* ── 소셜 프루프 ── */
function getSocialCount(type) {
  const hour = new Date().getHours();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  const seed = dayOfYear * 100 + hour;
  const pseudo = ((seed * 9301 + 49297) % 233280) / 233280;
  const ranges = {
    consulting: [80, 280],
    premium: [50, 150],
  };
  const [min, max] = ranges[type] || [50, 200];
  const timeWeight = hour < 8 ? 0.4 : hour < 12 ? 0.7 : hour < 18 ? 0.85 : 1.0;
  return Math.floor(min + (max - min) * pseudo * timeWeight);
}

function getPopularMenu() {
  const day = new Date().getDay();
  if (day === 0) return '별자리 운세';
  if (day >= 5) return '연애 궁합';
  return '오늘의 운세';
}

/* ── HTML 이스케이프 (XSS 방어) ── */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
