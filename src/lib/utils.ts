/* ── 유틸리티 함수 ── */

import { calcManseryuk, getTodayManseryuk, type SajuResult } from './manseryuk';

/* ── 상수 ── */
export const FREE_LIMIT = 5;
export const PREMIUM_LIMIT = 30;
export const FREE_PALM_LIMIT = 1;

/* ── 날짜 ── */
export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── localStorage 안전 접근 ── */
export function safeLSGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

export function safeLSSet(key: string, val: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, val); }
  catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      clearOldCache();
      try { localStorage.setItem(key, val); } catch { /* give up */ }
    }
  }
}

export function clearOldCache(): void {
  if (typeof window === 'undefined') return;
  const today = getToday();
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k?.startsWith('undaara_rc_')) {
      try {
        const v = JSON.parse(localStorage.getItem(k) || 'null');
        if (!v || v.date !== today) localStorage.removeItem(k);
      } catch { localStorage.removeItem(k!); }
    }
  }
}

/* ── 사용량 ── */
export function getUsageToday(): number {
  try {
    const s = JSON.parse(safeLSGet('undaara_usage') || 'null');
    if (!s || s.date !== getToday()) return 0;
    return s.count || 0;
  } catch { return 0; }
}

export function incrementUsage(): void {
  const count = getUsageToday() + 1;
  safeLSSet('undaara_usage', JSON.stringify({ date: getToday(), count }));
}

export function isPremium(): boolean {
  try {
    const s = JSON.parse(safeLSGet('undaara_premium') || 'null');
    return s && s.expiry >= getToday();
  } catch { return false; }
}

export function getDailyLimit(): number {
  return isPremium() ? PREMIUM_LIMIT : FREE_LIMIT;
}

export function getShareBonus(): number {
  try {
    const s = JSON.parse(safeLSGet('undaara_share_bonus') || 'null');
    if (!s || s.date !== getToday()) return 0;
    return s.count || 0;
  } catch { return 0; }
}

export function addShareBonus(): boolean {
  const current = getShareBonus();
  if (current >= 3) return false;
  safeLSSet('undaara_share_bonus', JSON.stringify({ date: getToday(), count: current + 1 }));
  return true;
}

export function canUseAPI(): boolean {
  return getUsageToday() < (getDailyLimit() + getShareBonus());
}

/* ── 손금/관상 사용량 ── */
export function getPalmUsageToday(): number {
  try {
    const s = JSON.parse(safeLSGet('undaara_palm_usage') || 'null');
    if (!s || s.date !== getToday()) return 0;
    return s.count || 0;
  } catch { return 0; }
}

export function incrementPalmUsage(): void {
  const count = getPalmUsageToday() + 1;
  safeLSSet('undaara_palm_usage', JSON.stringify({ date: getToday(), count }));
}

export function canUsePalm(): boolean {
  return isPremium() || getPalmUsageToday() < FREE_PALM_LIMIT;
}

/* ── 캐싱 ── */
export function getCached(key: string): string | null {
  try {
    const s = JSON.parse(safeLSGet('undaara_rc_' + key) || 'null');
    if (!s || s.date !== getToday()) return null;
    return s.val;
  } catch { return null; }
}

export function setCached(key: string, val: string): void {
  safeLSSet('undaara_rc_' + key, JSON.stringify({ date: getToday(), val }));
}

/* ── 별자리 ── */
export function getZodiac(birthdate: string): string {
  const d = new Date(birthdate);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return '양자리';
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return '황소자리';
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return '쌍둥이자리';
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return '게자리';
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return '사자자리';
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return '처녀자리';
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return '천칭자리';
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return '전갈자리';
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return '사수자리';
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return '염소자리';
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return '물병자리';
  return '물고기자리';
}

/* ── 사용자 정보 ── */
export interface UserInfo {
  name: string;
  birthdate: string;
  gender: string;
  zodiac: string;
  age: number;
  siji: string;
  job: string;
  saju: SajuResult;
  calendar: string;
  date: string;
}

export function getUserInfo(): UserInfo | null {
  try {
    const stored = JSON.parse(safeLSGet('undaara_user') || 'null');
    if (!stored) return null;
    if (stored.date !== getToday()) {
      localStorage.removeItem('undaara_user');
      return null;
    }
    return stored;
  } catch { return null; }
}

export function saveUserInfo(
  name: string, birthdate: string, gender: string,
  siji: string, job: string, calendar: string
): void {
  const today = getToday();
  const zodiac = getZodiac(birthdate);
  const age = parseInt(today.slice(0, 4)) - parseInt(birthdate.slice(0, 4));
  const saju = calcManseryuk(birthdate, siji || null, calendar || '양력');
  safeLSSet('undaara_user', JSON.stringify({
    name, birthdate, gender, zodiac, age,
    siji: siji || '', job: job || '', saju,
    calendar: calendar || '양력', date: today,
  }));
}

/* ── 사용자 컨텍스트 (AI 프롬프트용) ── */
export function getUserContext(): string {
  const u = getUserInfo();
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const hour = now.getHours();
  const sijiNames = ['자시','축시','인시','묘시','진시','사시','오시','미시','신시','유시','술시','해시'];
  const currentSiji = sijiNames[Math.floor(((hour + 1) % 24) / 2)];

  if (!u) return `\n[현재] ${dateStr} ${timeStr} (${currentSiji})`;

  let ctx = `\n[사용자] 이름: ${u.name} / 생년월일: ${u.birthdate}(${u.calendar || '양력'}, ${u.age}세) / 성별: ${u.gender} / 별자리: ${u.zodiac}`;
  if (u.saju) {
    const s = u.saju;
    ctx += ` / 만세력 사주팔자: 년주 ${s.year?.ganji || ''} 월주 ${s.month?.ganji || ''} 일주 ${s.day?.ganji || ''}`;
    if (s.hour) ctx += ` 시주 ${s.hour.ganji}(${s.hour.name})`;
    ctx += ` / 일간: ${s.day?.gan || ''}(${s.dayYinYang || ''})`;
    if (s.ohaengCount) ctx += ` / 오행분포: 목${s.ohaengCount.목} 화${s.ohaengCount.화} 토${s.ohaengCount.토} 금${s.ohaengCount.금} 수${s.ohaengCount.수}`;
    if (s.lackOhaeng && s.lackOhaeng.length > 0) ctx += ` / 부족오행: ${s.lackOhaeng.join(',')}`;
    if (s.unseong) ctx += ` / 십이운성: ${s.unseong}`;
  }
  if (u.siji) ctx += ` / 태어난 시: ${u.siji}`;
  if (u.job) ctx += ` / 직업: ${u.job}`;
  const todayMs = getTodayManseryuk();
  ctx += `\n[현재] ${dateStr} ${timeStr} (${currentSiji})`;
  ctx += ` / 오늘 만세력: 년주 ${todayMs.year.ganji} 월주 ${todayMs.month.ganji} 일주 ${todayMs.day.ganji}`;
  return ctx;
}

/* ── 소셜 프루프 ── */
export function getSocialCount(type: 'consulting' | 'premium'): number {
  const hour = new Date().getHours();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = dayOfYear * 100 + hour;
  const pseudo = ((seed * 9301 + 49297) % 233280) / 233280;
  const ranges: Record<string, [number, number]> = {
    consulting: [80, 280],
    premium: [50, 150],
  };
  const [min, max] = ranges[type] || [50, 200];
  const timeWeight = hour < 8 ? 0.4 : hour < 12 ? 0.7 : hour < 18 ? 0.85 : 1.0;
  return Math.floor(min + (max - min) * pseudo * timeWeight);
}

export function getPopularMenu(): string {
  const day = new Date().getDay();
  if (day === 0) return '별자리 운세';
  if (day >= 5) return '연애 궁합';
  return '오늘의 운세';
}

/* ── HTML 이스케이프 ── */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, c => map[c] || c);
}

/* ── 답변 스타일링 ── */
export function formatReply(text: string): string {
  text = text.replace(/<[^>]*>/g, '');
  text = text.replace(/^#{1,3}\s*/gm, '');
  text = text.replace(/^[-*_─—]{2,}\s*$/gm, '');
  const headingRe = /^(🔮|🌙|⚠️|✨|⭐|💰|♡|◈|🌅|💕|🏠|💼|🩺|🍀|🔢|🎨|💵|💲|🫰|🤑|💸|🧡|❤️|💛|💚|💙|💜|🩷|🔥|📊|🏥|🧘|♈|♉|♊|♋|♌|♍|♎|♏|♐|♑|♒|♓)(.+)/;
  const lines = text.split('\n');
  let html = '';
  let inSection = false;

  const safeBold = (s: string) => s.replace(/\*\*(.+?)\*\*/g, (_, t) => `<span class="hl-accent">${escapeHtml(t)}</span>`);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (!inSection) html += '<br>';
      continue;
    }
    const m = trimmed.match(headingRe);
    if (m) {
      if (inSection) html += '</div>';
      html += `<div class="reply-section"><div class="reply-heading">${m[1]}${safeBold(m[2])}</div><div class="reply-body">`;
      inSection = true;
    } else {
      html += `<p>${safeBold(trimmed)}</p>`;
    }
  }
  if (inSection) html += '</div></div>';
  return html;
}

/* ── 시스템 프롬프트 생성 ── */
export function buildSystemPrompt(): string {
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
