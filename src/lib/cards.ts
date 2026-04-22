/* ── 타로 카드 데이터 (78장) ── */

export interface TarotCard {
  sym: string;
  name: string;
  en: string;
  keywords: string;
  reversedKeywords?: string;
  reversed?: boolean;
  image?: string;
}

// Next.js에서는 SVG를 컴포넌트로 사용 → 심볼은 문자열 ID로 관리
export type CardSymbol = 'pentacle' | 'wand' | 'world' | string;

export const CARDS: TarotCard[] = [
  // ── 메이저 아르카나 (22장) ──
  { sym: '🎭', name: '광대', en: 'The Fool', keywords: '새로운 시작, 순수, 모험', reversedKeywords: '무모함, 부주의, 방향 상실' },
  { sym: '🔮', name: '마법사', en: 'The Magician', keywords: '의지, 창조, 기술', reversedKeywords: '속임, 재능 낭비, 자신감 부족' },
  { sym: '🌙', name: '여사제', en: 'The High Priestess', keywords: '직관, 신비, 지혜', reversedKeywords: '직관 무시, 비밀, 단절' },
  { sym: '👑', name: '여황제', en: 'The Empress', keywords: '풍요, 모성, 창의', reversedKeywords: '의존, 공허, 창의력 고갈' },
  { sym: '🏛️', name: '황제', en: 'The Emperor', keywords: '권위, 안정, 통제', reversedKeywords: '독재, 경직, 통제력 상실' },
  { sym: '📿', name: '교황', en: 'The Hierophant', keywords: '전통, 가르침, 믿음', reversedKeywords: '반항, 비전통, 잘못된 조언' },
  { sym: '💕', name: '연인', en: 'The Lovers', keywords: '사랑, 선택, 조화', reversedKeywords: '불화, 잘못된 선택, 가치 충돌' },
  { sym: '⚔️', name: '전차', en: 'The Chariot', keywords: '의지, 승리, 추진력', reversedKeywords: '방향 상실, 공격성, 좌절' },
  { sym: '🦁', name: '힘', en: 'Strength', keywords: '용기, 인내, 내면의 힘', reversedKeywords: '자기 의심, 나약함, 불안' },
  { sym: '🏔️', name: '은둔자', en: 'The Hermit', keywords: '내면탐구, 지혜, 고독', reversedKeywords: '고립, 외로움, 편협' },
  { sym: '🎡', name: '운명의 수레바퀴', en: 'Wheel of Fortune', keywords: '전환점, 기회, 흐름', reversedKeywords: '불운, 저항, 변화 거부' },
  { sym: '⚖️', name: '정의', en: 'Justice', keywords: '균형, 진실, 원인결과', reversedKeywords: '불공정, 편견, 책임 회피' },
  { sym: '🔄', name: '매달린 남자', en: 'The Hanged Man', keywords: '희생, 기다림, 새 관점', reversedKeywords: '지연, 무의미한 희생, 고집' },
  { sym: '🥀', name: '죽음', en: 'Death', keywords: '변화, 끝과 시작, 전환', reversedKeywords: '변화 저항, 정체, 집착' },
  { sym: '🏺', name: '절제', en: 'Temperance', keywords: '조화, 인내, 균형', reversedKeywords: '불균형, 과잉, 충돌' },
  { sym: '🔗', name: '악마', en: 'The Devil', keywords: '집착, 욕망, 속박', reversedKeywords: '해방, 자각, 속박에서 벗어남' },
  { sym: '⚡', name: '탑', en: 'The Tower', keywords: '변화, 각성, 해방', reversedKeywords: '변화 회피, 내부 동요, 지연된 위기' },
  { sym: '🌟', name: '별', en: 'The Star', keywords: '희망, 영감, 치유', reversedKeywords: '절망, 영감 부족, 자신감 상실' },
  { sym: '🌛', name: '달', en: 'The Moon', keywords: '직관, 감정, 신비', reversedKeywords: '혼란, 기만, 공포' },
  { sym: '☀️', name: '태양', en: 'The Sun', keywords: '활력, 성공, 기쁨', reversedKeywords: '낙관 과잉, 지연된 성공, 번아웃' },
  { sym: '📯', name: '심판', en: 'Judgement', keywords: '부활, 각성, 결단', reversedKeywords: '자기비판, 후회, 판단 실수' },
  { sym: 'world', name: '세계', en: 'The World', keywords: '완성, 달성, 통합', reversedKeywords: '미완성, 지연, 목표 부재' },
  // ── 마이너 아르카나 — 완드 (14장) ──
  { sym: 'wand', name: '지팡이의 시작', en: 'Ace of Wands', keywords: '창의적 시작, 열정, 잠재력', reversedKeywords: '지연, 의욕 상실, 막힘' },
  { sym: 'wand', name: '두 개의 지팡이', en: 'Two of Wands', keywords: '계획, 결단, 미래 전망', reversedKeywords: '우유부단, 두려움, 계획 실패' },
  { sym: 'wand', name: '세 개의 지팡이', en: 'Three of Wands', keywords: '확장, 진취, 협력', reversedKeywords: '지연, 실망, 방해' },
  { sym: 'wand', name: '네 개의 지팡이', en: 'Four of Wands', keywords: '축하, 가정의 화목, 안정', reversedKeywords: '불안정, 갈등, 축하 지연' },
  { sym: 'wand', name: '다섯 개의 지팡이', en: 'Five of Wands', keywords: '경쟁, 갈등, 도전', reversedKeywords: '갈등 해소, 타협, 내적 갈등' },
  { sym: 'wand', name: '여섯 개의 지팡이', en: 'Six of Wands', keywords: '승리, 인정, 자신감', reversedKeywords: '실패, 자만, 인정 부족' },
  { sym: 'wand', name: '일곱 개의 지팡이', en: 'Seven of Wands', keywords: '수호, 용기, 도전', reversedKeywords: '포기, 압도, 방어 실패' },
  { sym: 'wand', name: '여덟 개의 지팡이', en: 'Eight of Wands', keywords: '속도, 메시지, 빠른 변화', reversedKeywords: '지연, 혼란, 성급함' },
  { sym: 'wand', name: '아홉 개의 지팡이', en: 'Nine of Wands', keywords: '인내, 경계, 끈기', reversedKeywords: '지침, 의심, 포기' },
  { sym: 'wand', name: '열 개의 지팡이', en: 'Ten of Wands', keywords: '부담, 책임, 과부하', reversedKeywords: '짐 내려놓기, 위임, 해방' },
  { sym: 'wand', name: '지팡이의 시종', en: 'Page of Wands', keywords: '탐험, 열정, 메시지', reversedKeywords: '좌절, 소식 지연, 방향 상실' },
  { sym: 'wand', name: '지팡이의 기사', en: 'Knight of Wands', keywords: '모험, 충동, 에너지', reversedKeywords: '성급함, 무모함, 지연' },
  { sym: 'wand', name: '지팡이의 여왕', en: 'Queen of Wands', keywords: '카리스마, 열정, 자신감', reversedKeywords: '질투, 자기중심, 자신감 하락' },
  { sym: 'wand', name: '지팡이의 왕', en: 'King of Wands', keywords: '비전, 리더십, 창의', reversedKeywords: '독단, 비현실적, 무책임' },
  // ── 마이너 아르카나 — 컵 (14장) ──
  { sym: '🏆', name: '성배의 시작', en: 'Ace of Cups', keywords: '새로운 감정, 사랑, 직관', reversedKeywords: '감정 차단, 공허, 사랑 거부' },
  { sym: '🏆', name: '두 개의 성배', en: 'Two of Cups', keywords: '유대, 파트너십, 상호 이해', reversedKeywords: '불화, 단절, 불균형' },
  { sym: '🏆', name: '세 개의 성배', en: 'Three of Cups', keywords: '우정, 축하, 공동체', reversedKeywords: '과잉, 소외, 셋째 존재' },
  { sym: '🏆', name: '네 개의 성배', en: 'Four of Cups', keywords: '권태, 재고, 명상', reversedKeywords: '새로운 자각, 기회 포착, 동기부여' },
  { sym: '🏆', name: '다섯 개의 성배', en: 'Five of Cups', keywords: '상실, 후회, 슬픔', reversedKeywords: '수용, 회복, 앞으로 나아감' },
  { sym: '🏆', name: '여섯 개의 성배', en: 'Six of Cups', keywords: '추억, 순수함, 과거', reversedKeywords: '과거 집착, 향수병, 미성숙' },
  { sym: '🏆', name: '일곱 개의 성배', en: 'Seven of Cups', keywords: '환상, 선택, 꿈', reversedKeywords: '현실 직시, 결단, 환상 깨짐' },
  { sym: '🏆', name: '여덟 개의 성배', en: 'Eight of Cups', keywords: '이별, 새 출발, 내면 여정', reversedKeywords: '미련, 방황, 떠나지 못함' },
  { sym: '🏆', name: '아홉 개의 성배', en: 'Nine of Cups', keywords: '소원 성취, 만족, 행복', reversedKeywords: '불만족, 탐욕, 과시' },
  { sym: '🏆', name: '열 개의 성배', en: 'Ten of Cups', keywords: '가족의 행복, 조화, 완성', reversedKeywords: '가정 불화, 깨진 꿈, 불화' },
  { sym: '🏆', name: '성배의 시종', en: 'Page of Cups', keywords: '창의, 감수성, 새 소식', reversedKeywords: '감정 미숙, 비현실적, 소식 부재' },
  { sym: '🏆', name: '성배의 기사', en: 'Knight of Cups', keywords: '낭만, 제안, 감성', reversedKeywords: '변덕, 비현실, 감정 조종' },
  { sym: '🏆', name: '성배의 여왕', en: 'Queen of Cups', keywords: '공감, 직관, 돌봄', reversedKeywords: '감정 과잉, 의존, 직관 무시' },
  { sym: '🏆', name: '성배의 왕', en: 'King of Cups', keywords: '감정 지배, 지혜, 관용', reversedKeywords: '감정 억압, 냉담, 조종' },
  // ── 마이너 아르카나 — 소드 (14장) ──
  { sym: '🗡️', name: '검의 시작', en: 'Ace of Swords', keywords: '명료함, 진실, 새로운 생각', reversedKeywords: '혼란, 거짓, 판단력 흐림' },
  { sym: '🗡️', name: '두 개의 검', en: 'Two of Swords', keywords: '교착, 결정 회피, 균형', reversedKeywords: '정보 과다, 우유부단, 속임' },
  { sym: '🗡️', name: '세 개의 검', en: 'Three of Swords', keywords: '슬픔, 상처, 이별', reversedKeywords: '회복, 용서, 상처 극복' },
  { sym: '🗡️', name: '네 개의 검', en: 'Four of Swords', keywords: '휴식, 회복, 명상', reversedKeywords: '불안, 소진, 강제 활동' },
  { sym: '🗡️', name: '다섯 개의 검', en: 'Five of Swords', keywords: '갈등, 패배, 자존심', reversedKeywords: '화해, 후회, 과거 청산' },
  { sym: '🗡️', name: '여섯 개의 검', en: 'Six of Swords', keywords: '이동, 전환, 회복', reversedKeywords: '정체, 과거 미련, 불완전한 회복' },
  { sym: '🗡️', name: '일곱 개의 검', en: 'Seven of Swords', keywords: '전략, 기만, 도주', reversedKeywords: '양심의 가책, 발각, 정직' },
  { sym: '🗡️', name: '여덟 개의 검', en: 'Eight of Swords', keywords: '속박, 자기제한, 두려움', reversedKeywords: '해방, 새 관점, 자유' },
  { sym: '🗡️', name: '아홉 개의 검', en: 'Nine of Swords', keywords: '불안, 악몽, 걱정', reversedKeywords: '희망, 걱정 해소, 회복' },
  { sym: '🗡️', name: '열 개의 검', en: 'Ten of Swords', keywords: '종말, 위기, 새 시작', reversedKeywords: '회복, 최악 지남, 재기' },
  { sym: '🗡️', name: '검의 시종', en: 'Page of Swords', keywords: '호기심, 감시, 소통', reversedKeywords: '험담, 산만, 계획 부재' },
  { sym: '🗡️', name: '검의 기사', en: 'Knight of Swords', keywords: '돌진, 야망, 결단', reversedKeywords: '성급, 무계획, 공격성' },
  { sym: '🗡️', name: '검의 여왕', en: 'Queen of Swords', keywords: '독립, 명석함, 직설', reversedKeywords: '냉정, 편견, 소통 단절' },
  { sym: '🗡️', name: '검의 왕', en: 'King of Swords', keywords: '지성, 권위, 분석', reversedKeywords: '독단, 잔인, 권력 남용' },
  // ── 마이너 아르카나 — 펜타클 (14장) ──
  { sym: 'pentacle', name: '별의 동전', en: 'Ace of Pentacles', keywords: '물질적 시작, 기회, 풍요', reversedKeywords: '기회 놓침, 재정 불안, 계획 실패' },
  { sym: 'pentacle', name: '두 개의 동전', en: 'Two of Pentacles', keywords: '균형, 적응, 유연성', reversedKeywords: '불균형, 과부하, 우선순위 혼란' },
  { sym: 'pentacle', name: '세 개의 동전', en: 'Three of Pentacles', keywords: '협력, 기술, 노력', reversedKeywords: '비협조, 미숙, 인정 부족' },
  { sym: 'pentacle', name: '네 개의 동전', en: 'Four of Pentacles', keywords: '소유, 절약, 안정', reversedKeywords: '인색, 집착, 물질 의존' },
  { sym: 'pentacle', name: '다섯 개의 동전', en: 'Five of Pentacles', keywords: '결핍, 어려움, 고난', reversedKeywords: '회복, 도움 수용, 고난 끝' },
  { sym: 'pentacle', name: '여섯 개의 동전', en: 'Six of Pentacles', keywords: '나눔, 자선, 균형', reversedKeywords: '불공정, 빚, 시혜적 태도' },
  { sym: 'pentacle', name: '일곱 개의 동전', en: 'Seven of Pentacles', keywords: '인내, 평가, 결실', reversedKeywords: '조급함, 보상 부재, 잘못된 투자' },
  { sym: 'pentacle', name: '여덟 개의 동전', en: 'Eight of Pentacles', keywords: '성실, 숙련, 노력', reversedKeywords: '완벽주의, 단순 노동, 의욕 저하' },
  { sym: 'pentacle', name: '아홉 개의 동전', en: 'Nine of Pentacles', keywords: '독립, 풍요, 여유', reversedKeywords: '과시, 재정 위험, 외로움' },
  { sym: 'pentacle', name: '열 개의 동전', en: 'Ten of Pentacles', keywords: '유산, 가족 번영, 완성', reversedKeywords: '가족 갈등, 재산 분쟁, 불안정' },
  { sym: 'pentacle', name: '동전의 시종', en: 'Page of Pentacles', keywords: '학습, 목표, 성실', reversedKeywords: '게으름, 비현실적 목표, 기회 놓침' },
  { sym: 'pentacle', name: '동전의 기사', en: 'Knight of Pentacles', keywords: '근면, 신뢰, 꾸준함', reversedKeywords: '정체, 지루함, 고집' },
  { sym: 'pentacle', name: '동전의 여왕', en: 'Queen of Pentacles', keywords: '실용, 풍요, 돌봄', reversedKeywords: '과보호, 물질 의존, 자기 방치' },
  { sym: 'pentacle', name: '동전의 왕', en: 'King of Pentacles', keywords: '부, 안정, 성공', reversedKeywords: '탐욕, 물질주의, 재정 실패' },
];

export const TITLES: Record<string, string> = {
  tarot: '다아라',
  palm: 'AI 손금·관상',
  star: '별자리 운세',
  match: '연애 궁합',
  money: '재물운',
  today: '오늘의 운세',
  monthly: '월간 운세',
};

export const CARD_POS = ['오늘', '미래', '주의할일'] as const;

/* ── 별자리+날짜 기반 시드 셔플 ── */

// 간단한 시드 기반 난수 생성기 (mulberry32)
function seededRandom(seed: number) {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 별자리와 현재 날짜를 기반으로 카드를 셔플합니다.
 * 같은 별자리 + 같은 날짜 → 같은 셔플 결과
 * 정방향/역방향도 시드 기반으로 결정됩니다.
 */
export function drawSeededCards(count: number, zodiac?: string): TarotCard[] {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const seedStr = `${zodiac || 'default'}-${dateStr}`;
  const baseSeed = hashString(seedStr);

  // 시드 기반 셔플 (Fisher-Yates)
  const deck = CARDS.map((card, idx) => ({ ...card, originalIndex: idx }));
  for (let i = deck.length - 1; i > 0; i--) {
    const rnd = seededRandom(baseSeed + i);
    const j = Math.floor(rnd * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // 정방향/역방향 결정 (각 카드마다 시드 기반)
  return deck.slice(0, count).map((card, i) => {
    const reversalRnd = seededRandom(baseSeed + 1000 + i);
    const reversed = reversalRnd < 0.35; // 35% 확률로 역방향
    return {
      ...card,
      reversed,
      keywords: reversed ? (card.reversedKeywords || card.keywords) : card.keywords,
    };
  });
}

/** 완전 랜덤 (기존 호환) */
export function drawRandomCards(count: number): TarotCard[] {
  const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => {
    const reversed = Math.random() < 0.35;
    return {
      ...card,
      reversed,
      keywords: reversed ? (card.reversedKeywords || card.keywords) : card.keywords,
    };
  });
}

/** 카드 이미지 경로 (public/img/tarot/ 기준, 영문명을 파일명으로) */
export function getCardImagePath(card: TarotCard): string | null {
  // en 이름을 kebab-case 파일명으로 변환: "The Fool" → "the-fool"
  const filename = card.en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `/img/tarot/${filename}.webp`;
}

export function isCustomSymbol(sym: string): boolean {
  return ['pentacle', 'wand', 'world'].includes(sym);
}

/** 정방향/역방향 라벨 */
export function getDirectionLabel(card: TarotCard): string {
  return card.reversed ? '역방향 ↓' : '정방향 ↑';
}
