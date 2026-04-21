/* ── 만세력 기반 사주팔자 계산 모듈 ── */

export const CHEONGAN = ['갑','을','병','정','무','기','경','신','임','계'] as const;
export const JIJI = ['자','축','인','묘','진','사','오','미','신','유','술','해'] as const;
export const OHAENG_GAN = ['목','목','화','화','토','토','금','금','수','수'] as const;
export const OHAENG_JI = ['수','토','목','목','토','화','화','토','금','금','토','수'] as const;

const JEOLGI_TABLE = [
  { month: 1,  solarMonth: 2,  day: 4  },
  { month: 2,  solarMonth: 3,  day: 6  },
  { month: 3,  solarMonth: 4,  day: 5  },
  { month: 4,  solarMonth: 5,  day: 6  },
  { month: 5,  solarMonth: 6,  day: 6  },
  { month: 6,  solarMonth: 7,  day: 7  },
  { month: 7,  solarMonth: 8,  day: 7  },
  { month: 8,  solarMonth: 9,  day: 8  },
  { month: 9,  solarMonth: 10, day: 8  },
  { month: 10, solarMonth: 11, day: 7  },
  { month: 11, solarMonth: 12, day: 7  },
  { month: 12, solarMonth: 1,  day: 6  },
];

const SIJI_TO_JIJI = [
  { name: '자시', jiIdx: 0,  start: 23, end: 1  },
  { name: '축시', jiIdx: 1,  start: 1,  end: 3  },
  { name: '인시', jiIdx: 2,  start: 3,  end: 5  },
  { name: '묘시', jiIdx: 3,  start: 5,  end: 7  },
  { name: '진시', jiIdx: 4,  start: 7,  end: 9  },
  { name: '사시', jiIdx: 5,  start: 9,  end: 11 },
  { name: '오시', jiIdx: 6,  start: 11, end: 13 },
  { name: '미시', jiIdx: 7,  start: 13, end: 15 },
  { name: '신시', jiIdx: 8,  start: 15, end: 17 },
  { name: '유시', jiIdx: 9,  start: 17, end: 19 },
  { name: '술시', jiIdx: 10, start: 19, end: 21 },
  { name: '해시', jiIdx: 11, start: 21, end: 23 },
];

const WOLGAN_START = [2, 4, 6, 8, 0];
const SIGAN_START = [0, 2, 4, 6, 8];
const SIBI_UNSEONG = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const JANGSEONG_MAP: Record<number, number> = { 0: 11, 2: 2, 4: 2, 6: 5, 8: 8 };
const SIPSEONG_NAMES = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];

export interface OhaengCount { 목: number; 화: number; 토: number; 금: number; 수: number; }

export interface PillarInfo {
  ganji: string;
  gan: string;
  ji: string;
  ganIdx: number;
  jiIdx: number;
  name?: string;
}

export interface SajuResult {
  year: PillarInfo;
  month: PillarInfo;
  day: PillarInfo;
  hour: PillarInfo | null;
  ohaeng: Record<string, { gan: string; ji: string }>;
  ohaengCount: OhaengCount;
  lackOhaeng: string[];
  strongOhaeng: { name: string; count: number };
  sipseong: Record<string, string>;
  unseong: string | null;
  dayYinYang: '양' | '음';
  summary: string;
  yearGanji: string;
  monthGanji: string;
  dayGanji: string;
  hourGanji: string | null;
}

function getSajuMonth(solarMonth: number, solarDay: number): number {
  for (let i = JEOLGI_TABLE.length - 1; i >= 0; i--) {
    const j = JEOLGI_TABLE[i];
    if (j.solarMonth === solarMonth && solarDay >= j.day) return j.month;
    if (j.solarMonth < solarMonth && j.solarMonth !== 1) return j.month;
  }
  return 12;
}

function parseSiji(sijiStr: string): number | null {
  if (!sijiStr) return null;
  for (let i = 0; i < SIJI_TO_JIJI.length; i++) {
    if (sijiStr.includes(SIJI_TO_JIJI[i].name)) return i;
  }
  for (let i = 0; i < JIJI.length; i++) {
    if (sijiStr.includes(JIJI[i] + '시')) return i;
  }
  return null;
}

export function calcManseryuk(birthdate: string, birthtime?: string | null, _calendar?: string): SajuResult {
  const y = parseInt(birthdate.slice(0, 4));
  const m = parseInt(birthdate.slice(5, 7));
  const d = parseInt(birthdate.slice(8, 10));

  let sajuYear = y;
  if (m < 2 || (m === 2 && d < 4)) sajuYear = y - 1;
  const yearGanIdx = ((sajuYear - 4) % 10 + 10) % 10;
  const yearJiIdx = ((sajuYear - 4) % 12 + 12) % 12;

  const sajuMonth = getSajuMonth(m, d);
  const wolganBase = WOLGAN_START[yearGanIdx % 5];
  const monthGanIdx = (wolganBase + (sajuMonth - 1)) % 10;
  const monthJiIdx = (sajuMonth + 1) % 12;

  const baseDate = new Date(2000, 0, 7);
  const targetDate = new Date(y, m - 1, d);
  const dayDiff = Math.round((targetDate.getTime() - baseDate.getTime()) / 86400000);
  const dayGanIdx = ((6 + dayDiff) % 10 + 10) % 10;
  const dayJiIdx = ((4 + dayDiff) % 12 + 12) % 12;

  let hourGanIdx: number | null = null;
  let hourJiIdx: number | null = null;
  let hourName: string | null = null;
  if (birthtime) {
    const parsed = parseSiji(birthtime);
    if (parsed !== null) {
      hourJiIdx = parsed;
      hourName = SIJI_TO_JIJI[parsed].name;
      const siganBase = SIGAN_START[dayGanIdx % 5];
      hourGanIdx = (siganBase + hourJiIdx) % 10;
    }
  }

  const yearGanji = CHEONGAN[yearGanIdx] + JIJI[yearJiIdx];
  const monthGanji = CHEONGAN[monthGanIdx] + JIJI[monthJiIdx];
  const dayGanji = CHEONGAN[dayGanIdx] + JIJI[dayJiIdx];
  const hourGanji = hourGanIdx !== null && hourJiIdx !== null ? (CHEONGAN[hourGanIdx] + JIJI[hourJiIdx]) : null;

  const ohaeng: Record<string, { gan: string; ji: string }> = {
    year: { gan: OHAENG_GAN[yearGanIdx], ji: OHAENG_JI[yearJiIdx] },
    month: { gan: OHAENG_GAN[monthGanIdx], ji: OHAENG_JI[monthJiIdx] },
    day: { gan: OHAENG_GAN[dayGanIdx], ji: OHAENG_JI[dayJiIdx] },
  };
  if (hourGanIdx !== null && hourJiIdx !== null) {
    ohaeng.hour = { gan: OHAENG_GAN[hourGanIdx], ji: OHAENG_JI[hourJiIdx] };
  }

  const ohaengCount: OhaengCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [ohaeng.year, ohaeng.month, ohaeng.day].forEach(o => {
    ohaengCount[o.gan as keyof OhaengCount]++;
    ohaengCount[o.ji as keyof OhaengCount]++;
  });
  if (ohaeng.hour) {
    ohaengCount[ohaeng.hour.gan as keyof OhaengCount]++;
    ohaengCount[ohaeng.hour.ji as keyof OhaengCount]++;
  }

  const lackOhaeng = Object.entries(ohaengCount).filter(([, v]) => v === 0).map(([k]) => k);
  const strongOhaeng = Object.entries(ohaengCount).sort((a, b) => b[1] - a[1])[0];

  const sipseong: Record<string, string> = {};
  const pillars = [
    { name: '년간', idx: yearGanIdx },
    { name: '월간', idx: monthGanIdx },
  ];
  if (hourGanIdx !== null) pillars.push({ name: '시간', idx: hourGanIdx });
  pillars.forEach(p => {
    const diff = ((p.idx - dayGanIdx) % 10 + 10) % 10;
    sipseong[p.name] = SIPSEONG_NAMES[diff];
  });

  let unseong: string | null = null;
  const isYangGan = dayGanIdx % 2 === 0;
  if (isYangGan && JANGSEONG_MAP[dayGanIdx] !== undefined) {
    const jsIdx = JANGSEONG_MAP[dayGanIdx];
    const diff = ((dayJiIdx - jsIdx) % 12 + 12) % 12;
    unseong = SIBI_UNSEONG[diff];
  } else {
    const yangPair = dayGanIdx - 1;
    if (JANGSEONG_MAP[yangPair] !== undefined) {
      const jsIdx = JANGSEONG_MAP[yangPair];
      const diff = ((jsIdx - dayJiIdx) % 12 + 12) % 12;
      unseong = SIBI_UNSEONG[diff];
    }
  }

  const dayYinYang: '양' | '음' = dayGanIdx % 2 === 0 ? '양' : '음';

  let summary = `년주:${yearGanji}(${OHAENG_GAN[yearGanIdx]}${OHAENG_JI[yearJiIdx]}) 월주:${monthGanji}(${OHAENG_GAN[monthGanIdx]}${OHAENG_JI[monthJiIdx]}) 일주:${dayGanji}(${OHAENG_GAN[dayGanIdx]}${OHAENG_JI[dayJiIdx]})`;
  if (hourGanji && hourGanIdx !== null && hourJiIdx !== null) {
    summary += ` 시주:${hourGanji}(${OHAENG_GAN[hourGanIdx]}${OHAENG_JI[hourJiIdx]})`;
  }

  return {
    year: { ganji: yearGanji, gan: CHEONGAN[yearGanIdx], ji: JIJI[yearJiIdx], ganIdx: yearGanIdx, jiIdx: yearJiIdx },
    month: { ganji: monthGanji, gan: CHEONGAN[monthGanIdx], ji: JIJI[monthJiIdx], ganIdx: monthGanIdx, jiIdx: monthJiIdx },
    day: { ganji: dayGanji, gan: CHEONGAN[dayGanIdx], ji: JIJI[dayJiIdx], ganIdx: dayGanIdx, jiIdx: dayJiIdx },
    hour: hourGanji && hourGanIdx !== null && hourJiIdx !== null ? { ganji: hourGanji, gan: CHEONGAN[hourGanIdx], ji: JIJI[hourJiIdx], ganIdx: hourGanIdx, jiIdx: hourJiIdx, name: hourName ?? undefined } : null,
    ohaeng, ohaengCount, lackOhaeng,
    strongOhaeng: { name: strongOhaeng[0], count: strongOhaeng[1] },
    sipseong, unseong, dayYinYang, summary,
    yearGanji, monthGanji, dayGanji, hourGanji,
  };
}

export function getTodayManseryuk(): SajuResult {
  const today = new Date();
  return calcManseryuk(today.toISOString().slice(0, 10), null);
}
