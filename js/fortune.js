/* ── 운세 기능 (별자리·궁합·재물·오늘의 운세) ── */

async function runStar() {
  if (!ensureUserInfo(() => runStar())) return;
  if (!sel.a) { alert('별자리를 선택해 주세요!'); return; }
  const concern = document.getElementById('star-concern')?.value || '';
  showChatPanel('star');
  if (typeof logSocialEvent === 'function') logSocialEvent('star');
  const cacheKey = `star_${sel.a}${concern ? '_c' : ''}`;
  await askClaude(`나는 ${sel.a}이에요. 오늘(${new Date().toLocaleDateString('ko-KR')}) 나의 별자리 운세를 애정운, 금전운, 건강운으로 나눠서 따뜻하고 구체적으로 알려주세요.${concern ? ` 특히 "${concern}"에 대해 자세히 알려주세요.` : ''} 마지막에 오늘의 한마디로 마무리해 주세요.`, true, '⭐ 별자리 운세 요청', cacheKey, true);
}

let matchPartnerGender = '';
let matchPartnerCalendar = '양력';
function selectMatchGender(val, el) {
  matchPartnerGender = val;
  document.querySelectorAll('.match-p-gender').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}
function selectMatchCalendar(val, el) {
  matchPartnerCalendar = val;
  document.querySelectorAll('.match-p-cal').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function updateMatchMyInfo() {
  const el = document.getElementById('match-my-info');
  if (!el) return;
  const u = getUserInfo();
  if (!u) { el.innerHTML = '<span class="match-info-placeholder">나의 정보</span>'; return; }
  const ddi = getDdi(parseInt(u.birthdate.slice(0,4)));
  const emoji = DDI_EMOJI[ddi] || '';
  const cal = u.calendar || '양력';
  let html = `<span class="match-info-filled"><b>${u.name}</b> · ${emoji} ${ddi} · ${cal} · ${u.age}세 · ${u.gender}`;
  if (u.saju && u.saju.year) html += ` · ${u.saju.year.ganji || u.saju.year}${u.saju.month ? ' '+u.saju.month.ganji : ''} ${u.saju.day.ganji || u.saju.day}`;
  if (u.saju && u.saju.hour) html += ` ${u.saju.hour.ganji}`;
  if (u.siji) html += ` · ${u.siji.split('(')[0]}`;
  if (u.job) html += ` · ${u.job}`;
  html += `</span> <span style="font-size:11px;color:var(--text-muted)">수정 →</span>`;
  el.innerHTML = html;
}

function toggleMatchRelCustom() {
  const sel = document.getElementById('match-rel');
  const custom = document.getElementById('match-rel-custom');
  custom.style.display = sel.value === '직접입력' ? 'block' : 'none';
  if (sel.value === '직접입력') custom.focus();
}

function getPartnerInfo() {
  const name = document.getElementById('match-p-name').value.trim();
  const birth = getBirthFromSelects('match-p-birth-y', 'match-p-birth-m', 'match-p-birth-d');
  if (!name || !birth) return null;
  const gender = matchPartnerGender || '선택안함';
  const siji = document.getElementById('match-p-siji').value;
  const job = document.getElementById('match-p-job').value.trim();
  const zodiac = getZodiac(birth);
  const age = new Date().getFullYear() - parseInt(birth.slice(0,4));
  const saju = calcManseryuk(birth, siji || null);
  const ddi = getDdi(parseInt(birth.slice(0,4)));
  const calendar = matchPartnerCalendar || '양력';
  return { name, birthdate: birth, gender, zodiac, age, saji: saju, siju: saju, siji, job, ddi, calendar };
}

async function runMatch() {
  if (!ensureUserInfo(() => runMatch())) return;
  const partner = getPartnerInfo();
  if (!partner) { alert('상대방의 이름과 생년월일을 입력해 주세요!'); return; }
  let rel = document.getElementById('match-rel').value;
  if (rel === '직접입력') {
    rel = document.getElementById('match-rel-custom').value.trim();
    if (!rel) { alert('관계를 입력해 주세요!'); return; }
  }
  const u = getUserInfo();
  showChatPanel('match');
  if (typeof logSocialEvent === 'function') logSocialEvent('match');

  // 나의 띠·사주 정보
  const myYear = parseInt(u.birthdate.slice(0,4));
  const myDdi = getDdi(myYear);
  const myEmoji = DDI_EMOJI[myDdi] || '';
  const myCal = u.calendar || '양력';
  let myInfo = `${u.name}(${myEmoji} ${myDdi}, ${myCal} ${u.birthdate}, ${u.age}세, ${u.gender}`;
  if (u.saju && u.saju.summary) {
    myInfo += `, 만세력 사주: ${u.saju.summary}`;
    if (u.saju.dayYinYang) myInfo += `, 일간 ${u.saju.day.gan}(${u.saju.dayYinYang})`;
    if (u.saju.lackOhaeng && u.saju.lackOhaeng.length > 0) myInfo += `, 부족오행:${u.saju.lackOhaeng.join(',')}`;
  }
  if (u.siji) myInfo += `, ${u.siji.split('(')[0]}생`;
  if (u.job) myInfo += `, ${u.job}`;
  myInfo += ')';

  // 상대 띠·사주 정보
  const pYear = parseInt(partner.birthdate.slice(0,4));
  const pDdi = getDdi(pYear);
  const pEmoji = DDI_EMOJI[pDdi] || '';
  let pInfo = `${partner.name}(${pEmoji} ${pDdi}, ${partner.calendar || '양력'} ${partner.birthdate}, ${partner.age}세, ${partner.gender}`;
  if (partner.saji && partner.saji.summary) {
    pInfo += `, 만세력 사주: ${partner.saji.summary}`;
    if (partner.saji.dayYinYang) pInfo += `, 일간 ${partner.saji.day.gan}(${partner.saji.dayYinYang})`;
    if (partner.saji.lackOhaeng && partner.saji.lackOhaeng.length > 0) pInfo += `, 부족오행:${partner.saji.lackOhaeng.join(',')}`;
  }
  if (partner.siji) pInfo += `, ${partner.siji.split('(')[0]}생`;
  if (partner.job) pInfo += `, ${partner.job}`;
  pInfo += ')';

  const today = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
  const cacheKey = `match_${u.birthdate}_${partner.birthdate}_${rel}`;
  await askClaude(
    `궁합 분석을 부탁해요! 오늘은 ${today}입니다.\n` +
    `나: ${myInfo}\n상대: ${pInfo}\n관계: ${rel}\n\n` +
    `동양 사주학과 12지신 기반으로 두 사람의 궁합을 분석해 주세요. 별자리가 아닌 천간지지·오행 상생상극, 12지신 삼합·육합·상충·상극, 띠 궁합을 중심으로 풀어주세요.\n\n` +
    `아래 형식으로 알려주세요:\n\n` +
    `💕 두 사람의 궁합 점수\n(100점 만점으로 총점과 한줄 요약)\n\n` +
    `🐾 띠 궁합\n(두 사람의 띠가 삼합·육합·상충 중 어디에 해당하는지, 그 의미 2~3문장)\n\n` +
    `🔥 잘 맞는 점\n(사주 오행·천간지지 기반 2~3가지)\n\n` +
    `⚡ 조심할 점\n(충·극이 있는 부분 2~3가지)\n\n` +
    `💌 관계를 더 좋게 만드는 조언\n(오행 보완법, 구체적 행동 2~3가지)\n\n` +
    `✨ 운 다아라의 한마디\n(따뜻한 마무리)`,
    true, `♡ 궁합 분석 (${u.name} ↔ ${partner.name})`, cacheKey, true
  );
}

// 12지신 띠 계산
const DDI_ANIMALS = ['원숭이띠','닭띠','개띠','돼지띠','쥐띠','소띠','호랑이띠','토끼띠','용띠','뱀띠','말띠','양띠'];
const DDI_EMOJI = { '쥐띠':'🐀','소띠':'🐂','호랑이띠':'🐅','토끼띠':'🐇','용띠':'🐉','뱀띠':'🐍','말띠':'🐴','양띠':'🐑','원숭이띠':'🐵','닭띠':'🐔','개띠':'🐶','돼지띠':'🐷' };
function getDdi(year) { return DDI_ANIMALS[year % 12]; }

function selectDdi(group, el, name) {
  document.querySelectorAll('#zg-mo .zodiac-btn').forEach(b => b.classList.remove('sel-mo'));
  el.classList.add('sel-mo');
  sel.mo = name;
}

function updateMoneyMyInfo() {
  const el = document.getElementById('money-my-info');
  if (!el) return;
  const u = getUserInfo();
  if (!u) { el.innerHTML = '<span class="match-info-placeholder">내 정보를 입력하면 사주 기반 분석이 가능해요 →</span>'; return; }
  const ddi = getDdi(parseInt(u.birthdate.slice(0,4)));
  const emoji = DDI_EMOJI[ddi] || '';
  const cal = u.calendar || '양력';
  let html = `<span class="match-info-filled"><b>${u.name}</b> · ${emoji} ${ddi} · ${cal} · ${u.age}세`;
  if (u.saju && u.saju.year) html += ` · ${u.saju.year.ganji || u.saju.year}${u.saju.month ? ' '+u.saju.month.ganji : ''} ${u.saju.day.ganji || u.saju.day}`;
  if (u.saju && u.saju.hour) html += ` ${u.saju.hour.ganji}`;
  if (u.siji) html += ` · ${u.siji.split('(')[0]}생`;
  if (u.job) html += ` · ${u.job}`;
  html += `</span> <span style="font-size:11px;color:var(--text-muted)">수정 →</span>`;
  el.innerHTML = html;
  // 띠 자동 선택 (생년월일 기준)
  sel.mo = ddi;
  document.querySelectorAll('#zg-mo .zodiac-btn').forEach(b => {
    b.classList.remove('sel-mo');
    if (b.textContent.includes(ddi.replace('띠',''))) b.classList.add('sel-mo');
  });
}

async function runMoney() {
  if (!ensureUserInfo(() => runMoney())) return;
  if (!sel.mo) { alert('띠를 선택해 주세요!'); return; }
  const u = getUserInfo();
  const concern = document.getElementById('money-concern').value;
  showChatPanel('money');
  if (typeof logSocialEvent === 'function') logSocialEvent('money');

  const ddi = sel.mo;
  const today = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' });

  let sajuInfo = '';
  if (u.saju && u.saju.summary) {
    sajuInfo += `만세력 사주: ${u.saju.summary}. 일간 ${u.saju.day?.gan || ''}(${u.saju.dayYinYang || ''}). `;
    if (u.saju.ohaengCount) sajuInfo += `오행분포: 목${u.saju.ohaengCount.목} 화${u.saju.ohaengCount.화} 토${u.saju.ohaengCount.토} 금${u.saju.ohaengCount.금} 수${u.saju.ohaengCount.수}. `;
    if (u.saju.lackOhaeng && u.saju.lackOhaeng.length > 0) sajuInfo += `부족오행: ${u.saju.lackOhaeng.join(',')}. `;
    if (u.saju.unseong) sajuInfo += `십이운성: ${u.saju.unseong}. `;
  }
  if (u.siji) sajuInfo += `태어난 시: ${u.siji}. `;

  const cacheKey = `money_saju_${u.birthdate}_${ddi}`;
  await askClaude(
    `나는 ${ddi}(${DDI_EMOJI[ddi] || ''})이고, ${u.zodiac}이에요. ${sajuInfo}` +
    `오늘은 ${today}입니다.\n` +
    `${concern ? `요즘 "${concern}"에 대한 재정 고민이 있어요.\n` : ''}` +
    `동양 사주학과 12지신 기반으로 오늘의 재물운을 분석해 주세요. 타로가 아닌 천간지지·오행·12지신의 상생상극으로 풀어주세요.\n\n` +
    `아래 형식으로 알려주세요:\n\n` +
    `🪙 오늘의 재물 기운\n(내 띠와 사주의 오행이 오늘 날의 기운과 어떻게 만나는지 2~3문장)\n\n` +
    `💰 돈이 들어오는 흐름\n(재물이 유리한 시간대·방향·행동 2~3문장)\n\n` +
    `⚠️ 재물 주의사항\n(충·극이 있는 부분, 피해야 할 것 2~3문장)\n\n` +
    `🔮 이번 주 재물 전망\n(단기적 흐름 1~2문장)\n\n` +
    `✨ 운 다아라의 한마디\n(따뜻한 마무리)`,
    true, `◈ 사주 재물운 (${ddi})`, cacheKey, true
  );
}

async function runToday() {
  if (!ensureUserInfo(() => runToday())) return;
  if (!sel.today) { alert('별자리를 선택해 주세요!'); return; }
  const concern = document.getElementById('today-concern').value;
  showChatPanel('today');
  if (typeof logSocialEvent === 'function') logSocialEvent('today');
  const cacheKey = `today_${sel.today}${concern ? '_c' : ''}`;
  await askClaude(
    `나는 ${sel.today}이에요. 오늘(${new Date().toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})의 전체 운세를 봐주세요.${concern ? ` 특히 "${concern}"에 대해 신경이 쓰여요.` : ''} 오늘의 총운, 애정운, 금전운, 건강운, 오늘의 행운 색깔/숫자를 포함해서 따뜻하고 구체적으로 알려주세요. 마지막에 오늘 하루를 위한 운 다아라의 한마디로 마무리해 주세요 🌅`,
    true, `🌅 오늘의 운세 (${sel.today})`, cacheKey, false
  );
  // 1) 행운 카드 → 2) 추가 상담 순서
  setTimeout(() => {
    addLuckyCard(sel.today);
    setTimeout(() => addTodayFollowUp(), 400);
  }, 300);
}

function addTodayFollowUp() {
  const msgs = document.getElementById(typeof currentMsgBoxId !== 'undefined' ? currentMsgBoxId : 'messages');
  if (!msgs) return;
  const u = getUserInfo();
  const name = u ? u.name : '고객';
  const followMsgs = [
    `지금까지 본 건 큰 흐름이에요.\n${name}님의 오늘은 또 다른 이야기를 품고 있을 수 있답니다.\n더 깊이 알고 싶은 부분이 있으시면 알려주세요.`,
    `위 내용은 ${name}님의 전체적인 흐름을 살펴본 거예요.\n요즘 마음에 걸리는 일이 있으시다면, 편하게 말씀해 주세요.`,
    `운세는 날마다 조금씩 달라져요.\n${name}님에게 특별히 궁금한 점이 있으시면 편하게 여쭤보세요.`,
  ];
  const msg = followMsgs[Math.floor(Math.random() * followMsgs.length)];
  const html = `
    <div class="followup-prompt">
      <div class="followup-text">${msg.replace(/\n/g, '<br>')}</div>
      <div class="followup-input-wrap">
        <input type="text" class="followup-input" placeholder="궁금한 점을 편하게 말씀해 주세요..." onkeydown="if(event.key==='Enter')sendFollowUp(this)">
        <button class="followup-send" onclick="sendFollowUp(this.previousElementSibling)">보내기</button>
      </div>
    </div>`;
  const wrapper = document.createElement('div');
  wrapper.className = 'msg bot';
  wrapper.innerHTML = `<div class="msg-avatar">✦</div><div class="msg-content"><span class="msg-label">운 다아라</span><div class="msg-bubble">${html}</div></div>`;
  msgs.appendChild(wrapper);
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── 행운 카드 (이미지 스타일) ── */
const LUCKY_COLOR_MAP = {
  '빨간색':'#E53E3E','빨강':'#E53E3E','레드':'#E53E3E','red':'#E53E3E',
  '주황색':'#ED8936','주황':'#ED8936','오렌지':'#ED8936','orange':'#ED8936',
  '노란색':'#ECC94B','노랑':'#ECC94B','옐로우':'#ECC94B','yellow':'#ECC94B',
  '금색':'#D4A017','골드':'#D4A017','황금색':'#D4A017',
  '초록색':'#38A169','초록':'#38A169','녹색':'#38A169','그린':'#38A169','green':'#38A169',
  '연두색':'#68D391','연두':'#68D391',
  '파란색':'#3182CE','파랑':'#3182CE','블루':'#3182CE','blue':'#3182CE',
  '남색':'#2B6CB0','네이비':'#2B6CB0','navy':'#2B6CB0',
  '보라색':'#805AD5','보라':'#805AD5','퍼플':'#805AD5','purple':'#805AD5','라벤더':'#B794F4',
  '분홍색':'#ED64A6','분홍':'#ED64A6','핑크':'#ED64A6','pink':'#ED64A6','로즈':'#F56565',
  '하늘색':'#63B3ED','스카이블루':'#63B3ED','skyblue':'#63B3ED',
  '흰색':'#E2E8F0','화이트':'#E2E8F0','white':'#E2E8F0','아이보리':'#FFFFF0',
  '검정':'#2D3748','검은색':'#2D3748','블랙':'#2D3748','black':'#2D3748',
  '갈색':'#8B6914','브라운':'#8B6914','brown':'#8B6914',
  '민트':'#38B2AC','민트색':'#38B2AC','터콰이즈':'#38B2AC',
  '코랄':'#FC8181','살구색':'#FBD38D','베이지':'#F5E6CC',
  '옥색':'#2DD4BF','비취색':'#2DD4BF','청록':'#0D9488','청록색':'#0D9488',
  '자주색':'#9F1239','자주':'#9F1239','와인':'#881337','와인색':'#881337',
  '은색':'#94A3B8','실버':'#94A3B8','회색':'#6B7280',
  '크림색':'#FEF3C7','크림':'#FEF3C7','연보라':'#C4B5FD','연분홍':'#FBCFE8',
};

const OHAENG_SVG = {
  '목': '<svg viewBox="0 0 24 24" fill="none" stroke="#38A169" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V8"/><path d="M5 12s2.5-4 7-4 7 4 7 4"/><path d="M7 16s1.5-3 5-3 5 3 5 3"/><path d="M9 4s1-2 3-2 3 2 3 2"/></svg>',
  '화': '<svg viewBox="0 0 24 24" fill="none" stroke="#E53E3E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c-4-2-8-6-8-11a8 8 0 0116 0c0 5-4 9-8 11z"/><path d="M12 22c2-1 4-3 4-6a4 4 0 00-8 0c0 3 2 5 4 6z"/></svg>',
  '토': '<svg viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20l4-8 4 4 4-6 6 10H3z"/><circle cx="18" cy="6" r="2"/></svg>',
  '금': '<svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>',
  '수': '<svg viewBox="0 0 24 24" fill="none" stroke="#3182CE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l-2 7h4l-2 7"/><path d="M2 17c2-2 4-3 6-3s4 1 6 3 4 3 6 3"/><path d="M2 21c2-2 4-3 6-3s4 1 6 3 4 3 6 3"/></svg>',
};
const FLOW_SVG = {
  '상승기': '<svg viewBox="0 0 24 24" fill="none" stroke="#38A169" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  '안정기': '<svg viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="6" y2="12"/><polyline points="6 12 9 8 12 14 15 10 18 12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
  '전환기': '<svg viewBox="0 0 24 24" fill="none" stroke="#805AD5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10"/><path d="M3.51 15A9 9 0 0018.36 18.36L23 14"/></svg>',
};
const OHAENG_HANJA = { '목':'木', '화':'火', '토':'土', '금':'金', '수':'水' };

function addLuckyCard(zodiac) {
  try { _buildLuckyCard(zodiac); } catch(e) { console.error('행운카드 생성 오류:', e); }
}
function _buildLuckyCard(zodiac) {
  const msgs = document.getElementById(typeof currentMsgBoxId !== 'undefined' ? currentMsgBoxId : 'messages');
  if (!msgs) return;
  const botBubbles = msgs.querySelectorAll('.msg.bot .msg-bubble');
  const lastBubble = botBubbles[botBubbles.length - 1];
  if (!lastBubble) return;

  // AI 응답 텍스트에서 색깔/숫자 파싱
  const text = lastBubble.textContent || '';
  let luckyColor = '', luckyNumber = '';
  // 알려진 색 이름 목록에서 직접 매칭 (가장 확실한 방법)
  const knownColors = Object.keys(LUCKY_COLOR_MAP);
  for (const c of knownColors.sort((a, b) => b.length - a.length)) {
    if (text.includes(c)) { luckyColor = c; break; }
  }
  // 숫자 파싱
  const nMatch = text.match(/행운.{0,5}숫자\s*[:：→\-]?\s*(\d+)/) || text.match(/럭키\s*넘버\s*[:：→\-]?\s*(\d+)/);
  if (nMatch) luckyNumber = nMatch[1].trim();
  if (!luckyColor) luckyColor = '보라색';
  if (!luckyNumber) luckyNumber = String(Math.floor(Math.random() * 89) + 11);

  const hex = LUCKY_COLOR_MAP[luckyColor] || '#805AD5';
  const dateStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

  // 만세력 기반 오행 / 운의 흐름 계산
  let ohaengName = '화', flowText = '상승기';
  try {
    const u = getUserInfo();
    if (u && u.saju) {
      // 새 형식 (객체) 또는 구 형식 (문자열) 대응
      const dayGan = (u.saju.day && typeof u.saju.day === 'object') ? u.saju.day.gan : '';
      if (dayGan && typeof CHEONGAN !== 'undefined') {
        const idx = CHEONGAN.indexOf(dayGan);
        if (idx >= 0 && typeof OHAENG_GAN !== 'undefined') ohaengName = OHAENG_GAN[idx];
      }
      if (u.saju.unseong) {
        const upFlow = ['장생','관대','건록','제왕'];
        const stableFlow = ['목욕','양','태'];
        if (upFlow.includes(u.saju.unseong)) flowText = '상승기';
        else if (stableFlow.includes(u.saju.unseong)) flowText = '안정기';
        else flowText = '전환기';
      }
    }
  } catch {}

  // 오늘의 기운 한줄 (만세력)
  let todayFeeling = '기운이 맑은 날';
  try {
    const todayMs = getTodayManseryuk();
    const todayOh = OHAENG_GAN[todayMs.day.ganIdx];
    const feelings = {
      '목': '새싹처럼 성장하는 날', '화': '열정이 불타는 날',
      '토': '마음이 안정되는 날', '금': '결실을 맺는 날', '수': '지혜가 흐르는 날'
    };
    todayFeeling = feelings[todayOh] || '기운이 맑은 날';
  } catch {}

  const cardHtml = `
    <div class="lucky-card" id="lucky-card">
      <div class="lucky-card-inner" style="--lc:${hex}">
        <div class="lc-top-label">오늘의 감정</div>
        <div class="lc-feeling">${todayFeeling}</div>
        <div class="lc-sub">${dateStr} · ${zodiac}</div>

        <div class="lc-number-section">
          <div class="lc-section-label">행운의 숫자</div>
          <div class="lc-number" style="color:${hex};text-shadow:0 0 30px ${hex}66">${luckyNumber}</div>
        </div>

        <div class="lc-color-section">
          <div class="lc-section-label">행운의 색</div>
          <div class="lc-color-row">
            <div class="lc-color-chip" style="background:${hex};box-shadow:0 0 16px ${hex}88"></div>
            <div class="lc-color-name">${luckyColor}</div>
          </div>
        </div>

        <div class="lc-info-row">
          <div class="lc-info-box">
            <div class="lc-info-label">오행</div>
            <div class="lc-info-svg">${OHAENG_SVG[ohaengName] || OHAENG_SVG['화']}</div>
            <div class="lc-info-value">${ohaengName}(${OHAENG_HANJA[ohaengName] || ''})</div>
          </div>
          <div class="lc-info-box">
            <div class="lc-info-label">운의 흐름</div>
            <div class="lc-info-svg">${FLOW_SVG[flowText] || FLOW_SVG['상승기']}</div>
            <div class="lc-info-value">${flowText}</div>
          </div>
        </div>

        <div class="lc-brand">✦ 운 다아라 · undaara.com</div>
      </div>
      <div class="lucky-share-actions">
        <button class="lucky-share-btn lucky-img-btn" onclick="shareLuckyCardAsImage()">
          <svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          이미지로 공유
        </button>
        <button class="lucky-share-btn lucky-text-btn" onclick="shareLuckyCardAsText()">
          <svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          텍스트 복사
        </button>
      </div>
    </div>`;

  const wrapper = document.createElement('div');
  wrapper.className = 'msg bot';
  wrapper.innerHTML = `<div class="msg-avatar">✦</div><div class="msg-content"><div class="msg-bubble" style="padding:0;background:none;border:none;backdrop-filter:none">${cardHtml}</div></div>`;
  msgs.appendChild(wrapper);
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function shareLuckyCardAsImage() {
  const card = document.querySelector('.lucky-card-inner');
  if (!card) return;
  try {
    const canvas = await html2canvas(card, {
      backgroundColor: '#0f1623',
      scale: 2,
      useCORS: true,
      logging: false,
    });
    canvas.toBlob(async (blob) => {
      if (!blob) { showShareToast('이미지 생성에 실패했어요'); return; }
      const file = new File([blob], 'undaara-lucky.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ title: '운 다아라 - 오늘의 행운', files: [file] }); } catch {}
      } else {
        downloadBlob(blob, 'undaara-lucky.png');
        showShareToast('이미지가 저장되었어요!');
      }
    }, 'image/png');
  } catch { showShareToast('이미지 생성에 실패했어요'); }
}

function shareLuckyCardAsText() {
  const card = document.querySelector('.lucky-card-inner');
  if (!card) return;
  const feeling = card.querySelector('.lc-feeling')?.textContent || '';
  const num = card.querySelector('.lc-number')?.textContent || '';
  const color = card.querySelector('.lc-color-name')?.textContent || '';
  const oh = card.querySelector('.lc-info-box:first-child .lc-info-value')?.textContent || '';
  const flow = card.querySelector('.lc-info-box:last-child .lc-info-value')?.textContent || '';
  const dateStr = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' });
  const text = `오늘의 감정: ${feeling} / 행운의 숫자: ${num} / 행운의 색: ${color}`;
  navigator.clipboard.writeText(text).then(() => showShareToast('복사되었어요!')).catch(() => showShareToast('복사에 실패했어요'));
}

/* ── 손금·관상 분석 ── */

function resizeImage(dataUrl, maxWidth = 1024) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });
}

let palmMode = null; // 'right' | 'left' | 'face'

function selectPalmMode(mode, el) {
  palmMode = mode;
  document.querySelectorAll('.palm-mode-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const dropTitle = document.getElementById('palm-drop-title');
  const dropSub = document.getElementById('palm-drop-sub');
  if (mode === 'right') { dropTitle.textContent = '오른손 촬영'; dropSub.textContent = '손바닥이 보이게'; }
  else if (mode === 'left') { dropTitle.textContent = '왼손 촬영'; dropSub.textContent = '손바닥이 보이게'; }
  else { dropTitle.textContent = '얼굴 촬영'; dropSub.textContent = '정면으로 찍기'; }
  // 선택 후 스캐너 활성화 표시
  const scanner = document.querySelector('.palm-scanner');
  if (scanner) scanner.classList.add('ready');
}

function openPalmUpload() {
  if (!palmMode) {
    // 모드 미선택 시 버튼 강조 애니메이션
    const modeSelect = document.querySelector('.palm-mode-select');
    if (modeSelect) {
      modeSelect.classList.add('shake');
      setTimeout(() => modeSelect.classList.remove('shake'), 600);
    }
    return;
  }
  document.getElementById('palm-file').click();
}

function getPalmModeLabel() {
  if (palmMode === 'right') return '오른손';
  if (palmMode === 'left') return '왼손';
  if (palmMode === 'face') return '얼굴';
  return '';
}

function getPalmModeExpect() {
  if (palmMode === 'right') return '손바닥이 보이는 오른손 사진';
  if (palmMode === 'left') return '손바닥이 보이는 왼손 사진';
  if (palmMode === 'face') return '정면 얼굴 사진';
  return '';
}

function onPalmFile(e) {
  const file = e.target.files[0]; if (!file) return;
  const pc = document.getElementById('palm-copyright');
  if (pc) pc.style.display = 'none';
  const reader = new FileReader();
  reader.onload = async ev => {
    const resized = await resizeImage(ev.target.result, 1024);
    palmPreviewSrc = resized; palmImageData = resized.split(',')[1];
    const modeLabel = getPalmModeLabel();
    const modeExpect = getPalmModeExpect();
    const modeIcon = palmMode === 'face' ? '😊' : palmMode === 'right' ? '✋' : '🤚';
    const panel = document.getElementById('palm-panel');
    panel.innerHTML = `
  <div class="palm-header">
    <div class="palm-header-title serif">AI 손금·관상</div>
    <div class="palm-header-sub">사진이 준비됐어요</div>
  </div>
  <div class="palm-confirm-mode">
    <span class="palm-confirm-icon">${modeIcon}</span>
    <span class="palm-confirm-label">선택: <b>${modeLabel}</b></span>
    <span class="palm-confirm-hint">${modeExpect}이 맞나요?</span>
  </div>
  <div class="palm-preview-wrap">
    <img src="${palmPreviewSrc}" class="palm-preview-img" alt="${modeLabel} 사진">
    <div class="palm-preview-overlay"><button class="palm-analyze-btn" onclick="analyzePalm()">✨ AI 분석 시작하기</button></div>
  </div>
  <div class="palm-reupload-area">
    <p class="palm-reupload-hint">사진이 ${modeExpect}이 아니라면 다시 올려주세요</p>
    <button class="palm-reupload-btn" onclick="document.getElementById('pf2').click()">📷 다른 사진 선택</button>
    <button class="palm-reupload-btn palm-reset-btn" onclick="resetPalmPanel()">↩ 항목부터 다시 선택</button>
  </div>
  <input type="file" id="pf2" accept="image/*" onchange="onPalmFile(event)">`;
  };
  reader.readAsDataURL(file);
}

async function analyzePalm() {
  if (!ensureUserInfo(() => analyzePalm())) return;
  if (!palmImageData) return;
  if (!palmMode) { alert('오른손 / 왼손 / 관상 중 하나를 먼저 선택해 주세요!'); return; }
  if (!canUseAPI()) { document.getElementById('limit-modal-overlay').style.display = 'flex'; return; }
  showChatPanel('palm');
  const btn = document.getElementById('send-btn'), input = document.getElementById('chat-input');
  btn.disabled = true; input.disabled = true;
  const modeLabel = palmMode === 'right' ? '오른손 손금' : palmMode === 'left' ? '왼손 손금' : '관상';
  addMsg('user', `<div class="user-palm-preview"><img src="${palmPreviewSrc}" alt="${modeLabel}"><span>운 다아라, ${modeLabel} 분석 부탁해요!</span></div>`);
  const typingEl = addMsg('bot', '사진을 찬찬히 살펴보고 있어요···'); typingEl.classList.add('typing');
  let system, userText, resultTitle, resultSub;
  const ctx = getUserContext();
  if (palmMode === 'right' || palmMode === 'left') {
    const hand = palmMode === 'right' ? '오른손' : '왼손';
    system = `당신은 따뜻하고 섬세한 AI 행운 안내자 '운 다아라'입니다. 사용자에게 좋은 기운과 희망을 전하는 것이 당신의 사명입니다.${ctx}
사용자가 보내준 ${hand} 사진을 보고 감정선·지능선·생명선·운명선을 분석합니다.
${palmMode === 'right' ? '오른손은 현재와 미래, 현실에서 실제로 펼쳐지는 운세를 봅니다.' : '왼손은 타고난 잠재력과 근본적인 기질, 가능성을 봅니다.'}
각 선마다 1~2문장씩 작성하고 마지막엔 따뜻한 격려로 마무리해 주세요.
오늘 날짜와 사용자의 현재 위치 기운을 자연스럽게 반영해 주세요.
말투: "~님"으로 호칭하며 정중하고 따뜻한 존댓말. "오빠/언니" 같은 호칭은 쓰지 않습니다. 단정 짓지 않고 가능성으로 이야기해 주세요.`;
    userText = `이 ${hand}의 손금을 감정선, 지능선, 생명선, 운명선 순으로 따뜻하게 분석해 주세요.`;
    resultTitle = palmMode === 'right' ? '✋ 오른손 손금 분석' : '🤚 왼손 손금 분석';
    resultSub = palmMode === 'right' ? '현재·미래 — 감정선 · 지능선 · 생명선 · 운명선' : '잠재력·기질 — 감정선 · 지능선 · 생명선 · 운명선';
  } else {
    system = `당신은 따뜻하고 섬세한 AI 행운 안내자 '운 다아라'입니다. 사용자에게 좋은 기운과 희망을 전하는 것이 당신의 사명입니다.${ctx}
사용자가 보내준 얼굴 사진을 보고 이마·눈썹·눈·코·입 순으로 관상을 분석합니다.
각 부위마다 1~2문장씩 작성하고 마지막엔 따뜻한 격려로 마무리해 주세요.
오늘 날짜와 사용자의 현재 위치 기운을 자연스럽게 반영해 주세요.
말투: "~님"으로 호칭하며 정중하고 따뜻한 존댓말. "오빠/언니" 같은 호칭은 쓰지 않습니다. 단정 짓지 않고 가능성으로 이야기해 주세요.`;
    userText = '이 얼굴의 관상을 이마, 눈썹, 눈, 코, 입 순으로 따뜻하게 분석해 주세요.';
    resultTitle = '👁 관상 분석 결과';
    resultSub = '이마 · 눈썹 · 눈 · 코 · 입';
  }
  try {
    const res = await callGeminiAPI({ max_tokens: 3000, system, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: palmImageData } }, { type: 'text', text: userText }] }] });
    const reply = res?.content?.[0]?.text || '사진이 잘 보이지 않아요. 더 밝은 곳에서 다시 찍어 올려주시겠어요? 😊';
    typingEl.classList.remove('typing'); typingEl.className = 'palm-result-msg';
    typingEl.innerHTML = `<div class="palm-result-header"><img src="${palmPreviewSrc}" class="palm-result-thumb" alt="${modeLabel}"><div><div class="palm-result-title">${resultTitle}</div><div class="palm-result-sub">${resultSub}</div></div></div><div class="palm-result-text">${formatReply(reply)}</div><div class="palm-share-actions"><button class="palm-share-img-btn" onclick="shareResultAsImage(this.closest('.palm-result-msg'))"><svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>이미지로 공유</button><button class="palm-share-text-btn" onclick="shareResult(this.closest('.palm-result-msg'))"><svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>텍스트 복사</button></div>`;
    incrementUsage(); updateUserBadge();
    if (typeof logSocialEvent === 'function') logSocialEvent(palmMode === 'face' ? 'face' : 'palm');
    addFollowUp();
  } catch (err) {
    console.error('Palm analysis error:', err);
    typingEl.classList.remove('typing'); typingEl.innerHTML = '분석 중 오류가 생겼어요. 잠깐 후 다시 시도해 주세요 😊<br><small style="opacity:0.5">' + (err.message || '') + '</small>';
  }
  btn.disabled = false; input.disabled = false; input.focus();
  document.getElementById(currentMsgBoxId).scrollTop = 99999;
  palmImageData = null; palmPreviewSrc = null;
  resetPalmPanel();
}

function resetPalmPanel() {
  palmMode = null;
  document.getElementById('palm-panel').innerHTML = `
<div class="palm-header">
  <div class="palm-header-title serif">AI 손금·관상</div>
  <div class="palm-header-sub">먼저 항목을 선택해 주세요</div>
</div>
<div class="palm-mode-select">
  <button class="palm-mode-btn" onclick="selectPalmMode('right',this)"><span class="palm-mode-icon">✋</span><span class="palm-mode-label">오른손</span></button>
  <button class="palm-mode-btn" onclick="selectPalmMode('left',this)"><span class="palm-mode-icon">🤚</span><span class="palm-mode-label">왼손</span></button>
  <button class="palm-mode-btn" onclick="selectPalmMode('face',this)"><span class="palm-mode-icon">😊</span><span class="palm-mode-label">관상</span></button>
</div>
<div class="palm-scanner" onclick="openPalmUpload()">
  <div class="palm-scanner-ring"></div>
  <div class="palm-scanner-ring palm-scanner-ring-outer"></div>
  <div class="palm-scanner-inner">
    <div class="palm-scanner-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></div>
    <div class="palm-scanner-text" id="palm-drop-title">사진 업로드</div>
    <div class="palm-scanner-sub" id="palm-drop-sub">탭하여 스캔 시작</div>
  </div>
</div>
<input type="file" id="palm-file" accept="image/*" onchange="onPalmFile(event)">
<div class="palm-guide-grid">
  <div class="palm-guide-card">
    <div class="palm-guide-card-header"><div class="palm-guide-dot" style="background:#d3bbff"></div><span class="palm-guide-card-label" style="color:#d3bbff">Palm Lines</span></div>
    <div class="palm-guide-items">
      <div class="palm-guide-row"><span>감정선</span><div class="palm-guide-bar" style="background:#d3bbff;width:70%"></div></div>
      <div class="palm-guide-row"><span>지능선</span><div class="palm-guide-bar" style="background:#8ad4c5;width:60%"></div></div>
      <div class="palm-guide-row"><span>생명선</span><div class="palm-guide-bar" style="background:#e1c471;width:75%"></div></div>
      <div class="palm-guide-row"><span>운명선</span><div class="palm-guide-bar" style="background:#d3bbff;width:50%"></div></div>
    </div>
  </div>
  <div class="palm-guide-card">
    <div class="palm-guide-card-header"><div class="palm-guide-dot" style="background:#e1c471"></div><span class="palm-guide-card-label" style="color:#e1c471">Face Zones</span></div>
    <div class="palm-guide-items">
      <div class="palm-guide-row-bar"><span>이마·눈썹</span><div class="palm-bar-track"><div class="palm-bar-fill" style="width:65%;background:linear-gradient(90deg,rgba(225,196,113,0.2),#e1c471)"></div></div></div>
      <div class="palm-guide-row-bar"><span>눈·코·입</span><div class="palm-bar-track"><div class="palm-bar-fill" style="width:50%;background:linear-gradient(90deg,rgba(138,212,197,0.2),#8ad4c5)"></div></div></div>
    </div>
  </div>
</div>`;
}
