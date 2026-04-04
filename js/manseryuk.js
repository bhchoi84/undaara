/* ── 만세력 기반 사주팔자 계산 모듈 ── */

const CHEONGAN = ['갑','을','병','정','무','기','경','신','임','계'];
const JIJI     = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const OHAENG_GAN = ['목','목','화','화','토','토','금','금','수','수'];
const OHAENG_JI  = ['수','토','목','목','토','화','화','토','금','금','토','수'];

// 절기 테이블: 각 월의 절입일 (양력 기준 근사값)
// 인월(1월)=입춘~, 묘월(2월)=경칩~, ... 축월(12월)=소한~
// [월간지 인덱스, 절입 양력월, 절입일 근사]
const JEOLGI_TABLE = [
  { month: 1,  solarMonth: 2,  day: 4  }, // 인월 - 입춘
  { month: 2,  solarMonth: 3,  day: 6  }, // 묘월 - 경칩
  { month: 3,  solarMonth: 4,  day: 5  }, // 진월 - 청명
  { month: 4,  solarMonth: 5,  day: 6  }, // 사월 - 입하
  { month: 5,  solarMonth: 6,  day: 6  }, // 오월 - 망종
  { month: 6,  solarMonth: 7,  day: 7  }, // 미월 - 소서
  { month: 7,  solarMonth: 8,  day: 7  }, // 신월 - 입추
  { month: 8,  solarMonth: 9,  day: 8  }, // 유월 - 백로
  { month: 9,  solarMonth: 10, day: 8  }, // 술월 - 한로
  { month: 10, solarMonth: 11, day: 7  }, // 해월 - 입동
  { month: 11, solarMonth: 12, day: 7  }, // 자월 - 대설
  { month: 12, solarMonth: 1,  day: 6  }, // 축월 - 소한
];

// 시간 → 시지 매핑 (23~01=자, 01~03=축, ...)
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

// 년간에 따른 월간 시작 인덱스 (갑기→병인월, 을경→무인월, ...)
// 연간 % 5 → 인월 천간 인덱스
const WOLGAN_START = [2, 4, 6, 8, 0]; // 갑기→병(2), 을경→무(4), 병신→경(6), 정임→임(8), 무계→갑(0)

// 일간에 따른 시간 천간 시작 (갑기→갑자시, 을경→병자시, ...)
const SIGAN_START = [0, 2, 4, 6, 8]; // 갑기일→갑(0)자시, 을경일→병(2)자시 ...

// 십이운성
const SIBI_UNSEONG = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
// 양간(갑병무경임)의 장생 지지 인덱스
const JANGSEONG_MAP = {
  0: 11, // 갑 → 해(11)에서 장생
  2: 2,  // 병 → 인(2)
  4: 2,  // 무 → 인(2)
  6: 5,  // 경 → 사(5)
  8: 8,  // 임 → 신(8)
};

// 십성 (일간 기준 다른 천간과의 관계)
const SIPSEONG_NAMES = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];

/**
 * 만세력 기반 사주팔자 계산
 * @param {string} birthdate - 'YYYY-MM-DD' 형식
 * @param {string} [birthtime] - '자시(23~01)' 형식 또는 null
 * @param {string} [calendar] - '양력' 또는 '음력'
 * @returns {object} 사주 정보
 */
function calcManseryuk(birthdate, birthtime, calendar) {
  const y = parseInt(birthdate.slice(0, 4));
  const m = parseInt(birthdate.slice(5, 7));
  const d = parseInt(birthdate.slice(8, 10));

  // ── 1. 년주 (입춘 기준) ──
  // 입춘은 대략 2월 4일. 입춘 이전이면 전년도 간지 사용
  let sajuYear = y;
  if (m < 2 || (m === 2 && d < 4)) {
    sajuYear = y - 1;
  }
  const yearGanIdx = (sajuYear - 4) % 10;
  const yearJiIdx  = (sajuYear - 4) % 12;

  // ── 2. 월주 (절기 기준) ──
  let sajuMonth = getSajuMonth(m, d);
  // 월간 계산: 년간에 따라 인월(1월)의 천간이 결정됨
  const wolganBase = WOLGAN_START[yearGanIdx % 5];
  const monthGanIdx = (wolganBase + (sajuMonth - 1)) % 10;
  const monthJiIdx  = (sajuMonth + 1) % 12; // 인월=인(2), 묘월=묘(3) ...

  // ── 3. 일주 (기준일로부터 일수 계산) ──
  // 기준: 2000년 1월 7일 = 경진일 (경=6, 진=4)
  const baseDate = new Date(2000, 0, 7);
  const targetDate = new Date(y, m - 1, d);
  const dayDiff = Math.round((targetDate - baseDate) / 86400000);
  const dayGanIdx = ((6 + dayDiff) % 10 + 10) % 10;
  const dayJiIdx  = ((4 + dayDiff) % 12 + 12) % 12;

  // ── 4. 시주 (태어난 시간 기준) ──
  let hourGanIdx = null, hourJiIdx = null, hourName = null;
  if (birthtime) {
    const parsed = parseSiji(birthtime);
    if (parsed !== null) {
      hourJiIdx = parsed;
      hourName = SIJI_TO_JIJI[parsed].name;
      // 일간에 따른 시간 천간: 일간%5 → 자시 천간 시작
      const siganBase = SIGAN_START[dayGanIdx % 5];
      hourGanIdx = (siganBase + hourJiIdx) % 10;
    }
  }

  // ── 사주 조합 ──
  const yearGanji  = CHEONGAN[yearGanIdx]  + JIJI[yearJiIdx];
  const monthGanji = CHEONGAN[monthGanIdx] + JIJI[monthJiIdx];
  const dayGanji   = CHEONGAN[dayGanIdx]   + JIJI[dayJiIdx];
  const hourGanji  = hourGanIdx !== null ? (CHEONGAN[hourGanIdx] + JIJI[hourJiIdx]) : null;

  // ── 오행 분석 ──
  const ohaeng = {
    year:  { gan: OHAENG_GAN[yearGanIdx],  ji: OHAENG_JI[yearJiIdx] },
    month: { gan: OHAENG_GAN[monthGanIdx], ji: OHAENG_JI[monthJiIdx] },
    day:   { gan: OHAENG_GAN[dayGanIdx],   ji: OHAENG_JI[dayJiIdx] },
  };
  if (hourGanIdx !== null) {
    ohaeng.hour = { gan: OHAENG_GAN[hourGanIdx], ji: OHAENG_JI[hourJiIdx] };
  }

  // 오행 카운트
  const ohaengCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  [ohaeng.year, ohaeng.month, ohaeng.day].forEach(o => { ohaengCount[o.gan]++; ohaengCount[o.ji]++; });
  if (ohaeng.hour) { ohaengCount[ohaeng.hour.gan]++; ohaengCount[ohaeng.hour.ji]++; }

  // 부족한 오행 / 과다한 오행
  const totalCount = Object.values(ohaengCount).reduce((a, b) => a + b, 0);
  const lackOhaeng = Object.entries(ohaengCount).filter(([,v]) => v === 0).map(([k]) => k);
  const strongOhaeng = Object.entries(ohaengCount).sort((a, b) => b[1] - a[1])[0];

  // ── 일간 기준 십성 ──
  const sipseong = {};
  const pillars = [
    { name: '년간', idx: yearGanIdx },
    { name: '월간', idx: monthGanIdx },
  ];
  if (hourGanIdx !== null) pillars.push({ name: '시간', idx: hourGanIdx });
  pillars.forEach(p => {
    const diff = ((p.idx - dayGanIdx) % 10 + 10) % 10;
    sipseong[p.name] = SIPSEONG_NAMES[diff];
  });

  // ── 십이운성 (일간 기준) ──
  let unseong = null;
  const isYangGan = dayGanIdx % 2 === 0;
  if (isYangGan && JANGSEONG_MAP[dayGanIdx] !== undefined) {
    const jsIdx = JANGSEONG_MAP[dayGanIdx];
    const diff = ((dayJiIdx - jsIdx) % 12 + 12) % 12;
    unseong = SIBI_UNSEONG[diff];
  } else {
    // 음간은 역순
    const yangPair = dayGanIdx - 1; // 을→갑, 정→병 ...
    if (JANGSEONG_MAP[yangPair] !== undefined) {
      const jsIdx = JANGSEONG_MAP[yangPair];
      const diff = ((jsIdx - dayJiIdx) % 12 + 12) % 12;
      unseong = SIBI_UNSEONG[diff];
    }
  }

  // ── 음양 판단 ──
  const dayYinYang = dayGanIdx % 2 === 0 ? '양' : '음';

  // ── 요약 텍스트 ──
  let summary = `년주:${yearGanji}(${OHAENG_GAN[yearGanIdx]}${OHAENG_JI[yearJiIdx]}) ` +
                `월주:${monthGanji}(${OHAENG_GAN[monthGanIdx]}${OHAENG_JI[monthJiIdx]}) ` +
                `일주:${dayGanji}(${OHAENG_GAN[dayGanIdx]}${OHAENG_JI[dayJiIdx]})`;
  if (hourGanji) {
    summary += ` 시주:${hourGanji}(${OHAENG_GAN[hourGanIdx]}${OHAENG_JI[hourJiIdx]})`;
  }

  return {
    year:  { ganji: yearGanji,  gan: CHEONGAN[yearGanIdx],  ji: JIJI[yearJiIdx],  ganIdx: yearGanIdx,  jiIdx: yearJiIdx },
    month: { ganji: monthGanji, gan: CHEONGAN[monthGanIdx], ji: JIJI[monthJiIdx], ganIdx: monthGanIdx, jiIdx: monthJiIdx },
    day:   { ganji: dayGanji,   gan: CHEONGAN[dayGanIdx],   ji: JIJI[dayJiIdx],   ganIdx: dayGanIdx,   jiIdx: dayJiIdx },
    hour:  hourGanji ? { ganji: hourGanji, gan: CHEONGAN[hourGanIdx], ji: JIJI[hourJiIdx], ganIdx: hourGanIdx, jiIdx: hourJiIdx, name: hourName } : null,
    ohaeng,
    ohaengCount,
    lackOhaeng,
    strongOhaeng: { name: strongOhaeng[0], count: strongOhaeng[1] },
    sipseong,
    unseong,
    dayYinYang,
    summary,
    // 하위 호환
    yearGanji, monthGanji, dayGanji, hourGanji,
  };
}

/**
 * 절기 기준 사주 월 계산 (1=인월 ~ 12=축월)
 */
function getSajuMonth(solarMonth, solarDay) {
  // 역순으로 검색하여 해당 절기를 지났는지 확인
  for (let i = JEOLGI_TABLE.length - 1; i >= 0; i--) {
    const j = JEOLGI_TABLE[i];
    if (j.solarMonth === solarMonth && solarDay >= j.day) {
      return j.month;
    }
    if (j.solarMonth < solarMonth && j.solarMonth !== 1) {
      return j.month;
    }
  }
  // 1월 소한 이전 → 축월(12)
  // 1월 소한(6일) 이후는 위에서 잡힘
  return 12; // 축월
}

/**
 * 시간 문자열 파싱 → 지지 인덱스
 */
function parseSiji(sijiStr) {
  if (!sijiStr) return null;
  for (let i = 0; i < SIJI_TO_JIJI.length; i++) {
    if (sijiStr.includes(SIJI_TO_JIJI[i].name)) return i;
  }
  // 지지만으로도 매핑 시도
  for (let i = 0; i < JIJI.length; i++) {
    if (sijiStr.includes(JIJI[i] + '시')) return i;
  }
  return null;
}

/**
 * 만세력 사주를 사람이 읽을 수 있는 텍스트로 변환
 */
function formatManseryukText(saju) {
  let lines = [];
  lines.push(`사주팔자(만세력 기반)`);
  lines.push(`년주: ${saju.year.ganji} (${OHAENG_GAN[saju.year.ganIdx]}${OHAENG_JI[saju.year.jiIdx]})`);
  lines.push(`월주: ${saju.month.ganji} (${OHAENG_GAN[saju.month.ganIdx]}${OHAENG_JI[saju.month.jiIdx]})`);
  lines.push(`일주: ${saju.day.ganji} (${OHAENG_GAN[saju.day.ganIdx]}${OHAENG_JI[saju.day.jiIdx]})`);
  if (saju.hour) {
    lines.push(`시주: ${saju.hour.ganji} (${OHAENG_GAN[saju.hour.ganIdx]}${OHAENG_JI[saju.hour.jiIdx]}) [${saju.hour.name}]`);
  } else {
    lines.push(`시주: 미입력`);
  }
  lines.push(`일간: ${saju.day.gan} (${saju.dayYinYang}${OHAENG_GAN[saju.day.ganIdx]})`);
  lines.push(`오행 분포: 목${saju.ohaengCount.목} 화${saju.ohaengCount.화} 토${saju.ohaengCount.토} 금${saju.ohaengCount.금} 수${saju.ohaengCount.수}`);
  if (saju.lackOhaeng.length > 0) {
    lines.push(`부족한 오행: ${saju.lackOhaeng.join(', ')}`);
  }
  if (saju.unseong) {
    lines.push(`일주 십이운성: ${saju.unseong}`);
  }
  return lines.join('\n');
}

/**
 * 오늘 날의 만세력 정보
 */
function getTodayManseryuk() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  return calcManseryuk(dateStr, null);
}
