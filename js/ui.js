/* ══════════════════════════════════════════
   ui.js — UI 컴포넌트, DOM 조작, 이벤트 핸들러
   ══════════════════════════════════════════ */

/* ── 온보딩 스플래시 ── */
let obSlideIdx = 0;
function nextOnboardingSlide() {
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.ob-dot');
  const btn = document.getElementById('onboarding-btn');
  obSlideIdx++;
  if (obSlideIdx >= slides.length) { closeOnboarding(); return; }
  slides.forEach((s, i) => s.classList.toggle('active', i === obSlideIdx));
  dots.forEach((d, i) => d.classList.toggle('active', i === obSlideIdx));
  if (obSlideIdx === slides.length - 1) btn.textContent = '시작하기';
}
function closeOnboarding() {
  const overlay = document.getElementById('onboarding-overlay');
  overlay.style.opacity = '0';
  setTimeout(() => overlay.remove(), 400);
  safeLSSet('undaara_onboarded', '1');
}
function showOnboarding() {
  if (localStorage.getItem('undaara_onboarded')) {
    document.getElementById('onboarding-overlay')?.remove();
    return;
  }
}

/* ── 답변 스타일링 ── */
function formatReply(text) {
  // XSS 방어: AI 응답에서 HTML 태그 제거
  if (typeof DOMPurify !== 'undefined') {
    text = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  } else {
    text = text.replace(/<[^>]*>/g, '');
  }
  text = text.replace(/^#{1,3}\s*/gm, '');
  text = text.replace(/^[-*_─—]{2,}\s*$/gm, '');
  const headingRe = /^(🔮|🌙|⚠️|✨|⭐|💰|♡|◈|🌅|💕|🏠|💼|🩺|🍀|🔢|🎨|💵|💲|🫰|🤑|💸|🧡|❤️|💛|💚|💙|💜|🩷|🔥|📊|🏥|🧘|♈|♉|♊|♋|♌|♍|♎|♏|♐|♑|♒|♓)(.+)/;
  const lines = text.split('\n');
  let html = '';
  let inSection = false;

  const safeBold = s => s.replace(/\*\*(.+?)\*\*/g, (_, t) => `<span class="hl-accent">${escapeHtml(t)}</span>`);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (!inSection) html += '<br>';
      continue;
    }
    const m = line.match(headingRe);
    if (m) {
      if (inSection) html += '</div>';
      html += `<div class="reply-section"><div class="reply-heading">${m[1]}${safeBold(m[2])}</div><div class="reply-body">`;
      inSection = true;
    } else {
      html += `<p>${safeBold(line)}</p>`;
    }
  }
  if (inSection) html += '</div></div>';
  return html;
}

/* ── 사용량 표시 ── */
function updateUsageIndicator() {
  const badge = document.getElementById('user-info-badge');
  if (!badge) return;
  const used = getUsageToday();
  const limit = getDailyLimit();
  const dots = Array.from({length: limit > 5 ? 5 : limit}, (_, i) =>
    `<div class="usage-dot${i < used ? ' used' : ''}"></div>`
  ).join('');
  const indEl = badge.querySelector('.usage-indicator');
  if (indEl) indEl.innerHTML = dots;
}

function updateUserBadge() {
  const u = getUserInfo(); const badge = document.getElementById('user-info-badge');
  if (!u) { badge.style.display = 'none'; return; }
  badge.style.display = 'flex';
  const limit = getDailyLimit();
  const used = getUsageToday();
  const dots = Array.from({length: Math.min(limit, 5)}, (_, i) =>
    `<div class="usage-dot${i < used ? ' used' : ''}"></div>`
  ).join('');
  const premBadge = isPremium() ? `<span style="font-size:10px;color:var(--gold);margin-right:2px">★PRO</span>` : '';
  const safeName = escapeHtml(u.name);
  badge.innerHTML = `${premBadge}<span class="user-badge-name">${safeName}</span><span class="user-badge-dot">·</span><span>${u.zodiac}</span><div class="usage-indicator">${dots}</div><span style="margin-left:6px;font-size:11px;color:var(--text-muted)">${used}/${limit}</span><span style="margin-left:auto;font-size:11px;color:var(--indigo-light)">수정 ✎</span>`;
}

/* ── 사용자 정보 모달 ── */
function selectGender(val, el) {
  selectedGender = val;
  document.querySelectorAll('.user-modal-gender .gender-btn:not(.cal-btn)').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}
function selectCalendar(val, el) {
  selectedCalendar = val;
  document.querySelectorAll('.cal-btn:not(.match-p-cal)').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function showUserInfoModal() {
  document.getElementById('user-modal-overlay').style.display = 'flex';
  const u = getUserInfo();
  if (u) {
    document.getElementById('um-name').value = u.name || '';
    setBirthSelects('um-birth-y', 'um-birth-m', 'um-birth-d', u.birthdate);
    document.getElementById('um-siji').value = u.siji || '';
    document.getElementById('um-job').value = u.job || '';
    if (u.gender) { selectedGender = u.gender; document.querySelectorAll('.user-modal-gender .gender-btn:not(.cal-btn)').forEach(b => { if (b.textContent.trim() === u.gender || (u.gender==='선택안함'&&b.textContent.trim()==='선택안함')) b.classList.add('active'); }); }
    selectedCalendar = u.calendar || '양력';
  } else {
    selectedCalendar = '양력';
  }
  document.querySelectorAll('.cal-btn:not(.match-p-cal)').forEach(b => { b.classList.remove('active'); if (b.textContent.includes(selectedCalendar === '음력' ? '음력' : '양력')) b.classList.add('active'); });
}
function ensureUserInfo(callback) {
  const u = getUserInfo();
  if (u) return true;
  pendingAction = callback || null;
  showUserInfoModal();
  return false;
}
function autoFillZodiac(zodiac) {
  if (!zodiac) return;
  const groups = { a: 'zg-a', today: 'zg-today', mo: 'zg-mo', m1: 'zg-m1', monthly: 'zg-monthly' };
  for (const [group, gridId] of Object.entries(groups)) {
    const grid = document.getElementById(gridId);
    if (!grid) continue;
    const btns = grid.querySelectorAll('.zodiac-btn');
    btns.forEach(b => {
      b.classList.remove('sel-a', 'sel-m1', 'sel-m2', 'sel-mo', 'sel-today', 'sel-monthly');
      if (b.textContent.includes(zodiac.replace('자리',''))) {
        b.classList.add(group === 'today' || group === 'monthly' ? 'sel-a' : 'sel-' + group);
        sel[group] = zodiac;
      }
    });
  }
}
function showUmError(msg) {
  const el = document.getElementById('um-error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}
function submitUserInfo() {
  const name = document.getElementById('um-name').value.trim();
  const birth = getBirthFromSelects('um-birth-y', 'um-birth-m', 'um-birth-d');
  if (!name) { showUmError('이름을 입력해 주세요'); document.getElementById('um-name').focus(); return; }
  const yBtn = document.querySelector('.birth-pick-btn[data-group="um-birth-y"][data-role="y"]');
  const mBtn = document.querySelector('.birth-pick-btn[data-group="um-birth-y"][data-role="m"]');
  const dBtn = document.querySelector('.birth-pick-btn[data-group="um-birth-y"][data-role="d"]');
  if (!yBtn?.dataset.value) { showUmError('태어난 년도를 선택해 주세요'); return; }
  if (!mBtn?.dataset.value) { showUmError('태어난 월을 선택해 주세요'); return; }
  if (!dBtn?.dataset.value) { showUmError('태어난 일을 선택해 주세요'); return; }
  if (!birth) { showUmError('생년월일을 모두 선택해 주세요'); return; }
  const gender = selectedGender || '선택안함';
  const siji = document.getElementById('um-siji').value;
  const job = document.getElementById('um-job').value.trim();
  const calendar = selectedCalendar || '양력';
  saveUserInfo(name, birth, gender, siji, job, calendar);
  document.getElementById('user-modal-overlay').style.display = 'none';
  updateUserBadge();
  if (typeof updateMatchMyInfo === 'function') updateMatchMyInfo();
  if (typeof updateMoneyMyInfo === 'function') updateMoneyMyInfo();
  const u = getUserInfo();
  autoFillZodiac(u.zodiac);
  const safeName = escapeHtml(u.name);
  addMsg('bot', `<b>${safeName}</b>님, 오늘의 운세가 준비됐어요 😊<br>어제와는 다른 흐름이 보여요. 카드를 뽑아 확인해 보세요 ✨<br><span style="font-size:11px;color:var(--text-muted)">지금 가장 많이 받는 상담: ${getPopularMenu()} 🔥</span>`, 'text', null, false);
  if (pendingAction) { const fn = pendingAction; pendingAction = null; fn(); }
}

/* ── UI 공통 ── */
const panelScrollPos = {};
function goMenu(menu, el) {
  const activePanel = document.querySelector('.panel.active');
  if (activePanel) panelScrollPos[activePanel.id] = activePanel.scrollTop;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + menu);
  panel.classList.add('active');
  document.querySelectorAll('.main-title-text').forEach(t => t.textContent = TITLES[menu]);
  currentMsgBoxId = menu === 'tarot' ? 'messages' : 'messages-' + menu;
  if (menu === 'match' && typeof updateMatchMyInfo === 'function') updateMatchMyInfo();
  if (menu === 'money' && typeof updateMoneyMyInfo === 'function') updateMoneyMyInfo();
  toggleSidebar(true);
  if (panelScrollPos[panel.id] !== undefined) {
    setTimeout(() => panel.scrollTop = panelScrollPos[panel.id], 0);
  }
}
function showChatPanel(sourceMenu) {
  const targetId = sourceMenu === 'tarot' ? 'messages' : 'messages-' + sourceMenu;
  currentMsgBoxId = targetId;
  document.querySelectorAll('.main-title-text').forEach(t => t.textContent = TITLES[sourceMenu] || TITLES.tarot);
}

/* ── 사이드바 ── */
function toggleSidebar(collapse) {
  const sb = document.querySelector('.sidebar');
  if (!sb || window.innerWidth > 768) return;
  if (collapse === undefined) collapse = !sb.classList.contains('collapsed');
  sb.classList.toggle('collapsed', collapse);
  // body에 클래스 추가 → CSS로 sp-top-bar 숨김 처리
  document.body.classList.toggle('sb-collapsed', collapse);
}

function togglePanelMessages(btn) {
  const box = btn.parentElement;
  const isCollapsed = box.classList.toggle('collapsed');
  btn.querySelector('.pm-toggle-arrow').textContent = isCollapsed ? '▼' : '▲';
  btn.querySelector('.pm-toggle-label').textContent = isCollapsed ? '결과 보기' : '결과 접기';
}

/* ── 메시지 출력 ── */
function addMsg(role, content, type = 'text', cardIndex = null, showShare = true) {
  const box = document.getElementById(currentMsgBoxId);
  if (box.classList.contains('panel-messages') && !box.querySelector('.pm-toggle-btn')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'pm-toggle-btn';
    toggleBtn.innerHTML = '<span class="pm-toggle-arrow">▲</span> <span class="pm-toggle-label">결과 접기</span>';
    toggleBtn.onclick = function() { togglePanelMessages(this); };
    box.insertBefore(toggleBtn, box.firstChild);
    box.classList.remove('collapsed');
  }
  const wrap = document.createElement('div'); wrap.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
  if (cardIndex !== null) wrap.setAttribute('data-card-index', cardIndex);
  const av = document.createElement('div'); av.className = 'msg-avatar ' + (role === 'user' ? 'user' : 'bot'); av.textContent = role === 'user' ? '나' : '✦';
  const msgContent = document.createElement('div'); msgContent.className = 'msg-content';
  const label = document.createElement('span'); label.className = 'msg-label';
  label.textContent = role === 'user' ? '나의 질문' : '운 다아라';
  const bubble = document.createElement('div');
  if (type === 'card-reveal') { bubble.className = 'card-reveal-msg'; bubble.innerHTML = content; }
  else if (type === 'ad') { bubble.className = 'ad-interstitial'; bubble.innerHTML = content; }
  else if (type === 'palm-result') { bubble.className = 'palm-result-msg'; bubble.innerHTML = content; }
  else { bubble.className = 'msg-bubble'; bubble.innerHTML = content; }
  msgContent.appendChild(label); msgContent.appendChild(bubble);
  // 봇 메시지에 공유 버튼 (showShare=true이고 typing 아닌 경우)
  if (showShare && role === 'bot' && content !== '생각하고 있어요···' && content !== '카드를 해석하고 있어요···' && content !== '사진을 찬찬히 살펴보고 있어요···') {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'msg-share-btn';
    shareBtn.innerHTML = '<svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>공유';
    shareBtn.onclick = function() { shareResult(bubble); };
    msgContent.appendChild(shareBtn);
  }
  role === 'user' ? (wrap.appendChild(msgContent), wrap.appendChild(av)) : (wrap.appendChild(av), wrap.appendChild(msgContent));
  box.appendChild(wrap); box.scrollTop = box.scrollHeight;
  return bubble;
}

function scrollToCardMsg(i) {
  if (!drawnCards || !flippedCards[i]) return;
  const msg = document.querySelector(`[data-card-index="${i}"]`);
  if (msg) {
    goMenu('tarot', document.querySelector('.n-tarot'));
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    msg.style.transition = 'background 0.3s';
    msg.style.background = 'rgba(99,102,241,0.1)';
    setTimeout(() => msg.style.background = '', 1200);
  }
}

/* ── 별자리 선택 ── */
function selectZ(group, el, name) {
  const ids = { a: 'zg-a', m1: 'zg-m1', m2: 'zg-m2', mo: 'zg-mo', today: 'zg-today', monthly: 'zg-monthly' };
  const myGroups = ['a', 'today', 'mo', 'm1', 'monthly'];
  const u = getUserInfo();
  if (u && u.zodiac && myGroups.includes(group) && name !== u.zodiac) {
    showZodiacMismatchModal(u.zodiac, name, function() {
      applyZodiacSelection(group, el, name, ids);
    });
    return;
  }
  applyZodiacSelection(group, el, name, ids);
}
function applyZodiacSelection(group, el, name, ids) {
  document.querySelectorAll('#' + ids[group] + ' .zodiac-btn').forEach(b => b.classList.remove('sel-a', 'sel-m1', 'sel-m2', 'sel-mo', 'sel-today', 'sel-monthly'));
  el.classList.add(group === 'today' || group === 'monthly' ? 'sel-a' : 'sel-' + group); sel[group] = name;
}
function showZodiacMismatchModal(savedZodiac, selectedZodiac, onContinue) {
  let overlay = document.getElementById('zodiac-mismatch-overlay');
  if (overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = 'zodiac-mismatch-overlay';
  overlay.className = 'zodiac-mismatch-overlay';
  overlay.innerHTML = `
    <div class="zodiac-mismatch-modal">
      <div class="zmm-icon">⚠️</div>
      <div class="zmm-title serif">별자리가 달라요</div>
      <div class="zmm-body">
        입력하신 생년월일 기준 별자리는 <b class="hl-gold">${escapeHtml(savedZodiac)}</b>인데,<br>
        지금 <b style="color:var(--indigo-light)">${escapeHtml(selectedZodiac)}</b>를 선택하셨어요.
      </div>
      <div class="zmm-buttons">
        <button class="zmm-btn zmm-continue" id="zmm-continue">${escapeHtml(selectedZodiac)}로 계속하기</button>
        <button class="zmm-btn zmm-change" id="zmm-change">내 정보 수정하기</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('zmm-continue').onclick = function() {
    overlay.remove();
    onContinue();
  };
  document.getElementById('zmm-change').onclick = function() {
    overlay.remove();
    showUserInfoModal();
  };
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
}

/* ── 결과 공유 ── */
function shareResult(bubble) {
  const clone = bubble.cloneNode(true);
  clone.querySelectorAll('.followup-prompt, .msg-share-btn, .palm-share-actions').forEach(el => el.remove());
  const text = clone.innerText.trim();
  const shareText = `${text}\n\n✨ 운 다아라 — AI 타로·운세·손금\n${location.origin}`;

  function onShared() {
    if (!isPremium() && addShareBonus()) {
      showShareToast('공유 감사해요! 보너스 1회가 추가됐어요 ✨');
      updateUserBadge();
    }
  }

  if (navigator.share) {
    navigator.share({ title: '운 다아라 운세 결과', text: shareText }).then(onShared).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      showShareToast('결과가 복사됐어요! 붙여넣기로 공유하세요');
      onShared();
    }).catch(() => {
      showShareToast('복사에 실패했어요');
    });
  }
}

async function shareResultAsImage(bubble) {
  const btn = bubble.querySelector('.palm-share-img-btn');
  if (btn) { btn.disabled = true; btn.textContent = '이미지 생성 중···'; }

  const card = document.createElement('div');
  card.className = 'share-capture-card';

  const clone = bubble.cloneNode(true);
  clone.querySelectorAll('.followup-prompt, .msg-share-btn, .palm-share-actions').forEach(el => el.remove());

  const header = clone.querySelector('.palm-result-header');
  const resultText = clone.querySelector('.palm-result-text');

  card.innerHTML = `
    <div class="scc-top">
      <div class="scc-brand">✦ 운 다아라</div>
      <div class="scc-date">${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
    ${header ? `<div class="scc-header">${header.innerHTML}</div>` : ''}
    <div class="scc-body">${resultText ? resultText.innerHTML : clone.innerHTML}</div>
    <div class="scc-footer">
      <div class="scc-url">undaara.com</div>
      <div class="scc-tagline">AI 타로 · 운세 · 손금 · 관상</div>
    </div>
  `;

  document.body.appendChild(card);

  try {
    const canvas = await html2canvas(card, {
      backgroundColor: '#0c1321',
      scale: 2,
      useCORS: true,
      logging: false,
      width: card.offsetWidth,
      height: card.offsetHeight,
    });
    card.remove();

    canvas.toBlob(async (blob) => {
      if (!blob) { showShareToast('이미지 생성에 실패했어요'); return; }
      const file = new File([blob], 'undaara-result.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: '운 다아라 분석 결과',
            text: '✨ AI가 분석한 나의 손금/관상 결과\n',
            files: [file],
          });
        } catch (e) {
          if (e.name !== 'AbortError') downloadBlob(blob, 'undaara-result.png');
        }
      } else {
        downloadBlob(blob, 'undaara-result.png');
        showShareToast('이미지가 저장됐어요! 인스타·카톡에 공유해 보세요');
      }
      if (btn) { btn.disabled = false; btn.textContent = '📸 이미지로 공유'; }
    }, 'image/png');
  } catch (e) {
    card.remove();
    console.error('Share image error:', e);
    showShareToast('이미지 생성 중 오류가 생겼어요');
    if (btn) { btn.disabled = false; btn.textContent = '📸 이미지로 공유'; }
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showShareToast(msg) {
  let toast = document.getElementById('share-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.className = 'share-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ── 생년월일 커스텀 피커 ── */
function initBirthSelects(yId, mId, dId) {
  const yEl = document.getElementById(yId), mEl = document.getElementById(mId), dEl = document.getElementById(dId);
  if (!yEl || !mEl || !dEl) return;
  function makeBtn(el, label, groupId) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'birth-pick-btn ' + el.className;
    btn.textContent = label;
    btn.dataset.value = '';
    btn.dataset.group = groupId;
    el.parentNode.replaceChild(btn, el);
    return btn;
  }
  const group = yId;
  const yBtn = makeBtn(yEl, '년', group);
  const mBtn = makeBtn(mEl, '월', group);
  const dBtn = makeBtn(dEl, '일', group);
  yBtn.dataset.role = 'y'; mBtn.dataset.role = 'm'; dBtn.dataset.role = 'd';
  yBtn.addEventListener('click', () => openBirthPicker('year', yBtn, mBtn, dBtn));
  mBtn.addEventListener('click', () => openBirthPicker('month', yBtn, mBtn, dBtn));
  dBtn.addEventListener('click', () => openBirthPicker('day', yBtn, mBtn, dBtn));
}

let bpOverlay = null;
let bpDecade = 1970;
const BP_MAX_YEAR = new Date().getFullYear();

function openBirthPicker(mode, yBtn, mBtn, dBtn) {
  if (mode === 'year') { bpDecade = Math.floor(BP_MAX_YEAR / 10) * 10; showBpYear(yBtn, mBtn, dBtn); }
  else if (mode === 'month') { showBpMonth(yBtn, mBtn, dBtn); }
  else { showBpDay(yBtn, mBtn, dBtn); }
}

function bpWrap(content) {
  if (bpOverlay) bpOverlay.remove();
  const ov = document.createElement('div');
  ov.className = 'bp-overlay';
  const pop = document.createElement('div');
  pop.className = 'bp-popup';
  pop.innerHTML = content;
  ov.appendChild(pop);
  ov.addEventListener('click', e => { if (e.target === ov) closeBp(); });
  document.body.appendChild(ov);
  bpOverlay = ov;
  return pop;
}

function closeBp() { if (bpOverlay) { bpOverlay.remove(); bpOverlay = null; } }

function showBpYear(yBtn, mBtn, dBtn) {
  const start = bpDecade, end = Math.min(bpDecade + 9, BP_MAX_YEAR);
  const prevVis = bpDecade > 1940 ? '' : 'visibility:hidden';
  const nextVis = bpDecade + 10 <= BP_MAX_YEAR ? '' : 'visibility:hidden';
  let items = '';
  for (let y = start; y <= end; y++) {
    const sel = yBtn.dataset.value === String(y) ? ' selected' : '';
    items += `<button class="bp-item${sel}" data-val="${y}">${y}년</button>`;
  }
  const pop = bpWrap(
    `<div class="bp-header"><button class="bp-nav" style="${prevVis}" data-dir="prev">◀</button><span class="bp-title">${start}~${end}</span><button class="bp-nav" style="${nextVis}" data-dir="next">▶</button></div>` +
    `<div class="bp-grid bp-grid-year">${items}</div>` +
    `<button class="bp-close-bottom" onclick="closeBp()">닫기</button>`
  );
  pop.querySelectorAll('.bp-nav').forEach(b => b.onclick = () => {
    bpDecade += b.dataset.dir === 'prev' ? -10 : 10;
    showBpYear(yBtn, mBtn, dBtn);
  });
  pop.querySelectorAll('.bp-item').forEach(b => b.onclick = () => {
    yBtn.dataset.value = b.dataset.val;
    yBtn.textContent = b.dataset.val + '년';
    yBtn.classList.add('has-value');
    closeBp();
  });
}

function showBpMonth(yBtn, mBtn, dBtn) {
  let items = '';
  for (let m = 1; m <= 12; m++) {
    const mv = String(m).padStart(2, '0');
    const sel = mBtn.dataset.value === mv ? ' selected' : '';
    items += `<button class="bp-item${sel}" data-val="${mv}">${m}월</button>`;
  }
  const pop = bpWrap(
    `<div class="bp-header"><span class="bp-title">월 선택</span></div>` +
    `<div class="bp-grid bp-grid-month">${items}</div>` +
    `<button class="bp-close-bottom" onclick="closeBp()">닫기</button>`
  );
  pop.querySelectorAll('.bp-item').forEach(b => b.onclick = () => {
    mBtn.dataset.value = b.dataset.val;
    mBtn.textContent = parseInt(b.dataset.val) + '월';
    mBtn.classList.add('has-value');
    closeBp();
  });
}

function showBpDay(yBtn, mBtn, dBtn) {
  const now = new Date();
  const y = parseInt(yBtn.dataset.value) || now.getFullYear();
  const m = parseInt(mBtn.dataset.value) || (now.getMonth() + 1);
  const days = new Date(y, m, 0).getDate();
  const firstDay = new Date(y, m - 1, 1).getDay();
  const dayNames = ['일','월','화','수','목','금','토'];
  let dayHeader = dayNames.map((d, i) => `<span class="bp-day-name${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}">${d}</span>`).join('');
  let items = '';
  for (let e = 0; e < firstDay; e++) items += '<span class="bp-empty"></span>';
  for (let d = 1; d <= days; d++) {
    const dv = String(d).padStart(2, '0');
    const sel = dBtn.dataset.value === dv ? ' selected' : '';
    const dow = (firstDay + d - 1) % 7;
    const dayClass = dow === 0 ? ' sun' : dow === 6 ? ' sat' : '';
    items += `<button class="bp-item${sel}${dayClass}" data-val="${dv}">${d}</button>`;
  }
  const isPartner = yBtn.dataset.group && yBtn.dataset.group.includes('match');
  const calLabel = isPartner ? (matchPartnerCalendar || '양력') : (selectedCalendar || '양력');
  const pop = bpWrap(
    `<div class="bp-header"><span class="bp-title">${y}년 ${m}월 <span class="bp-cal-tag">${calLabel}</span></span></div>` +
    `<div class="bp-grid bp-grid-day">${dayHeader}${items}</div>` +
    `<button class="bp-close-bottom" onclick="closeBp()">닫기</button>`
  );
  pop.querySelectorAll('.bp-item').forEach(b => b.onclick = () => {
    dBtn.dataset.value = b.dataset.val;
    dBtn.textContent = parseInt(b.dataset.val) + '일';
    dBtn.classList.add('has-value');
    closeBp();
  });
}

function getBirthFromSelects(yId, mId, dId) {
  const g = document.querySelector(`.birth-pick-btn[data-group="${yId}"][data-role="y"]`);
  const gm = document.querySelector(`.birth-pick-btn[data-group="${yId}"][data-role="m"]`);
  const gd = document.querySelector(`.birth-pick-btn[data-group="${yId}"][data-role="d"]`);
  const y = g ? g.dataset.value : '';
  const m = gm ? gm.dataset.value : '';
  const d = gd ? gd.dataset.value : '';
  if (!y || !m || !d) return '';
  return `${y}-${m}-${d}`;
}
function setBirthSelects(yId, mId, dId, dateStr) {
  if (!dateStr) return;
  const [y, m, d] = dateStr.split('-');
  const g = document.querySelector(`.birth-pick-btn[data-group="${yId}"][data-role="y"]`);
  const gm = document.querySelector(`.birth-pick-btn[data-group="${yId}"][data-role="m"]`);
  const gd = document.querySelector(`.birth-pick-btn[data-group="${yId}"][data-role="d"]`);
  if (g) { g.dataset.value = y; g.textContent = y + '년'; g.classList.add('has-value'); }
  if (gm) { gm.dataset.value = m; gm.textContent = parseInt(m) + '월'; gm.classList.add('has-value'); }
  if (gd) { gd.dataset.value = d; gd.textContent = parseInt(d) + '일'; gd.classList.add('has-value'); }
}
