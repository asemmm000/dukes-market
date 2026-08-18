/* =====================================================
   Dukes Market — app.js
   يدمج: Reconnect + SVG Artifacts + Responsive Table
   ===================================================== */
const socket = io();

let myId = null, roomCode = null, myToken = null;
let myHand = [], myBudget = 0, playersList = [];
let timerInterval = null, hasSubmitted = false;
let isAnimating = false, pendingRoomUpdate = null;
let seatOrderKey = '';

const $ = id => document.getElementById(id);
const wait = ms => new Promise(r => setTimeout(r, ms));

// ── الثوابت ──────────────────────────────────────────
const MONEY_TYPES = ['coin','coin_bag','gem'];
const NEEDS_TARGET = ['spy','knife','secret_contract','partnership','betrayal','ninja','wizard','con_artist'];
const ARTIFACT_ID_MAP = { crown:'crown', sword:'sword', scroll:'scroll', ring:'ring', vase:'vase', rareCoin:'rareCoin', painting:'painting' };

// ── Utility ───────────────────────────────────────────
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

function toast(msg, type = 'info', duration = 3000) {
  const c = $('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

function saveSession(code, token) {
  try { localStorage.setItem('dm_code', code); localStorage.setItem('dm_token', token); } catch {}
}
function clearSession() {
  try { localStorage.removeItem('dm_code'); localStorage.removeItem('dm_token'); } catch {}
}
function loadSession() {
  try { return { code: localStorage.getItem('dm_code'), token: localStorage.getItem('dm_token') }; } catch { return {}; }
}

// ── Reconnect Banner ──────────────────────────────────
function showReconnectBanner() { $('reconnectBanner').classList.add('visible'); }
function hideReconnectBanner() { $('reconnectBanner').classList.remove('visible'); }

socket.on('connect', () => {
  myId = socket.id;
  hideReconnectBanner();
  const { code, token } = loadSession();
  if (code && token) attemptReconnect(code, token);
});

socket.on('disconnect', () => { showReconnectBanner(); });

function attemptReconnect(code, token) {
  socket.emit('reconnect_game', { code, token }, res => {
    if (res.ok) {
      roomCode = code; myToken = token;
      toast(`🔄 مرحباً مجدداً ${res.playerName}!`, 'good');
      show('screen-game');
    } else {
      clearSession();
    }
  });
}

// ── Home ──────────────────────────────────────────────
$('btnCreate').onclick = () => {
  const name = $('nameInput').value.trim() || 'لاعب';
  socket.emit('create_room', { name }, res => {
    if (!res.ok) return toast(res.error, 'bad');
    roomCode = res.code; myToken = res.token;
    saveSession(roomCode, myToken);
    $('roomCode').textContent = roomCode;
    show('screen-lobby');
  });
};

$('btnJoin').onclick = () => {
  const name = $('nameInput').value.trim() || 'لاعب';
  const code = $('codeInput').value.trim().toUpperCase();
  socket.emit('join_room', { code, name }, res => {
    if (!res.ok) return toast(res.error, 'bad');
    roomCode = res.code; myToken = res.token;
    saveSession(roomCode, myToken);
    $('roomCode').textContent = roomCode;
    show('screen-lobby');
  });
};

$('btnStart').onclick = () => {
  socket.emit('start_game', { code: roomCode }, res => { if (!res.ok) toast(res.error, 'bad'); });
};

// ── Room updates ──────────────────────────────────────
socket.on('room_update', (room) => {
  playersList = room.players;
  // Lobby list
  $('playerList').innerHTML = room.players.map(p =>
    `<li>${p.connected ? '🟢' : '🔴'} ${p.name} ${p.isHost ? '👑' : ''}</li>`
  ).join('');

  if (isAnimating) { pendingRoomUpdate = room; return; }
  layoutSeatsIfNeeded(room.players);
  renderSeatsData(room.players);
});

socket.on('player_disconnected', ({ name }) => toast(`⛔ ${name} فقد الاتصال`, 'warn'));
socket.on('player_reconnected', ({ name }) => toast(`✅ ${name} عاد للعبة`, 'good'));

// ── Private state ─────────────────────────────────────
socket.on('private_state', (state) => {
  myHand = state.hand; myBudget = state.budget;
  renderHandUI();
});

// ── Round start ───────────────────────────────────────
socket.on('round_start', ({ number, artifact, duration }) => {
  show('screen-game');
  renderArtifactBox(artifact, number);
  $('log').innerHTML = '';
  $('bidInput').value = 0;
  $('btnSubmit').disabled = false;
  hasSubmitted = false;
  startTimer(duration || 30000);
});

socket.on('reconnect_state', ({ roundNumber, artifact, hasSubmitted: hs, players }) => {
  playersList = players;
  layoutSeatsIfNeeded(players);
  renderSeatsData(players);
  renderArtifactBox(artifact, roundNumber);
  if (hs) { hasSubmitted = true; $('btnSubmit').disabled = true; }
});

socket.on('player_submitted', ({ playerId, submittedCount, totalActive }) => {
  $('submitCount').textContent = `${submittedCount}/${totalActive} أرسلوا`;
  const badge = document.querySelector(`#seat-${playerId} .submitted-badge`);
  if (badge) badge.style.display = 'block';
});

// ── Spy ───────────────────────────────────────────────
socket.on('spy_result', (r) => {
  const msg = r.blocked
    ? `🕵️ فشل التجسس (الهدف محمي)`
    : `🕵️ ميزانية الخصم: ${r.targetBudget} عملة`;
  toast(msg, 'info', 4000);
});

// ── Round result ──────────────────────────────────────
socket.on('round_result', async (result) => {
  clearInterval(timerInterval);
  $('timerText').textContent = '⏳';
  $('btnSubmit').disabled = true;

  isAnimating = true;
  await playRoundAnimations(result);
  isAnimating = false;

  if (pendingRoomUpdate) {
    layoutSeatsIfNeeded(pendingRoomUpdate.players);
    renderSeatsData(pendingRoomUpdate.players);
    pendingRoomUpdate = null;
  }
  appendResultLog(result);
});

// ── Game over ─────────────────────────────────────────
socket.on('game_over', (scores) => {
  clearSession();
  show('screen-gameover');
  $('finalList').innerHTML = scores.map((s, i) => {
    const preview = document.createElement('div');
    preview.className = 'artifacts-preview';
    (s.artifacts || []).forEach(a => {
      preview.appendChild(getArtifactSVG(a.id, { fake: a.fake, size: 'sm' }));
    });
    return `
      <li>
        <span>${i===0?'🥇':i===1?'🥈':'🥉'} ${s.name}</span>
        <span>${preview.outerHTML}</span>
        <span>${s.total} 💰</span>
      </li>`;
  }).join('');
});

// ── Timer ─────────────────────────────────────────────
function startTimer(durationMs) {
  clearInterval(timerInterval);
  const start = Date.now();
  timerInterval = setInterval(() => {
    const rem = Math.max(0, durationMs - (Date.now() - start));
    const pct = (rem / durationMs) * 100;
    $('timerFill').style.width = pct + '%';
    $('timerFill').classList.toggle('danger', rem < durationMs * 0.25);
    $('timerText').textContent = Math.ceil(rem / 1000) + 'ث';
    if (rem <= 0) { clearInterval(timerInterval); if (!hasSubmitted) doSubmit(); }
  }, 80);
}

// ── Artifact box ──────────────────────────────────────
function renderArtifactBox(artifact, roundNum) {
  const box = $('artifactBox');
  box.innerHTML = '';
  const svgEl = getArtifactSVG(artifact.id, { size: 'lg', glowing: true });
  const info = document.createElement('div');
  info.className = 'artifact-info';
  info.innerHTML = `
    <div class="artifact-name">${artifact.name}</div>
    <div class="artifact-value">القيمة: ${artifact.value} 💰</div>
    <div style="margin-top:6px;color:var(--gold-dim);font-size:.85rem">الجولة ${roundNum}/5</div>`;
  box.appendChild(svgEl);
  box.appendChild(info);
}

// ── Hand rendering ────────────────────────────────────
function renderHandUI() {
  $('budgetDisplay').textContent = myBudget;
  $('bidInput').max = Math.min(10, myBudget);

  // بطاقات البنك
  const bankCards = myHand.filter(c => c.type === 'bank');
  $('bankZone').innerHTML = '';
  if (!bankCards.length) { $('bankZone').innerHTML = '<em style="font-size:.8rem;color:var(--gold-dim)">لا تملك بطاقة بنك</em>'; }
  bankCards.forEach(c => {
    const card = buildCard(c.type);
    card.dataset.uid = c.uid;
    card.onclick = () => {
      const was = card.classList.contains('selected');
      $('bankZone').querySelectorAll('.dm-card.selected').forEach(el => el.classList.remove('selected'));
      card.classList.toggle('selected', !was);
    };
    $('bankZone').appendChild(card);
  });

  // بطاقات المال
  const moneyCards = myHand.filter(c => MONEY_TYPES.includes(c.type));
  $('moneyCardsZone').innerHTML = '';
  if (!moneyCards.length) { $('moneyCardsZone').innerHTML = '<em style="font-size:.8rem;color:var(--gold-dim)">لا تملك بطاقات مال</em>'; }
  moneyCards.forEach(c => {
    const card = buildCard(c.type);
    card.dataset.uid = c.uid;
    card.onclick = () => { card.classList.toggle('selected'); updateBoostTotal(); };
    $('moneyCardsZone').appendChild(card);
  });
  updateBoostTotal();

  // بطاقات الفعل
  handleActionSelect(myHand.filter(c => !MONEY_TYPES.includes(c.type) && c.type !== 'bank'));
}

function handleActionSelect(actionCards) {
  const zone = $('actionCardsZone');
  zone.innerHTML = '';
  if (!actionCards.length) {
    zone.innerHTML = '<em style="font-size:.8rem;color:var(--gold-dim)">لا تملك بطاقات فعل</em>';
    $('ghostBtn').classList.add('hidden');
    return;
  }
  actionCards.forEach(c => {
    const card = buildCard(c.type);
    card.dataset.uid = c.uid;
    card.onclick = () => {
      const was = card.classList.contains('selected');
      zone.querySelectorAll('.dm-card.selected').forEach(el => el.classList.remove('selected'));
      card.classList.toggle('selected', !was);
      const ts = $('targetSelect');
      if (!was && NEEDS_TARGET.includes(card.dataset.type)) {
        ts.classList.remove('hidden');
        ts.innerHTML = playersList.filter(p => p.id !== myId)
          .map(p => `<option value="${p.id}">${p.name}</option>`).join('');
      } else {
        ts.classList.add('hidden');
        ts.value = '';
      }
      $('ghostBtn').classList.toggle('hidden', !zone.querySelector('.dm-card.selected'));
    };
    zone.appendChild(card);
  });
}

function clearActionSelection() {
  $('actionCardsZone').querySelectorAll('.dm-card.selected').forEach(el => el.classList.remove('selected'));
  $('ghostBtn').classList.add('hidden');
  const ts = $('targetSelect');
  ts.classList.add('hidden');
  ts.value = '';
}

function updateBoostTotal() {
  let t = 0;
  $('moneyCardsZone').querySelectorAll('.dm-card.selected').forEach(el => {
    t += { coin:1, coin_bag:5, gem:10 }[el.dataset.type] || 0;
  });
  $('boostTotal').textContent = t;
}

// ── Submit ────────────────────────────────────────────
$('btnSubmit').onclick = () => doSubmit();

function doSubmit() {
  if (hasSubmitted) return;
  const baseBid = Number($('bidInput').value) || 0;
  const bankSel = $('bankZone').querySelector('.dm-card.selected');
  const moneySel = [...$('moneyCardsZone').querySelectorAll('.dm-card.selected')];
  const actionSel = $('actionCardsZone').querySelector('.dm-card.selected');
  const targetId = $('targetSelect').value || null;
  socket.emit('submit_turn', {
    code: roomCode, baseBid,
    bankCardUid: bankSel ? bankSel.dataset.uid : null,
    moneyCardUids: moneySel.map(el => el.dataset.uid),
    actionCard: actionSel ? { uid: actionSel.dataset.uid, targetId } : null,
  }, res => {
    if (!res.ok) { toast(res.error, 'bad'); return; }
    hasSubmitted = true;
    $('btnSubmit').disabled = true;
    toast('✅ تم الإرسال!', 'good', 2000);
  });
}

// =====================================================
// 🎨 الطاولة الدائرية + SVG + Animations
// =====================================================

function layoutSeatsIfNeeded(players) {
  const key = players.map(p => p.id).join(',');
  if (key === seatOrderKey) return;
  seatOrderKey = key;

  const table = $('table');
  table.innerHTML = '';
  const n = players.length;
  const radiusMap = { 2:34, 3:36, 4:36, 5:37, 6:38 };
  const rPct = radiusMap[n] || 36;

  // ارسم المقاعد أولاً بدون left/top
  const seats = players.map((p, i) => {
    const seat = document.createElement('div');
    seat.className = ['seat', p.id === myId ? 'me' : '', p.connected === false ? 'disconnected' : '']
      .filter(Boolean).join(' ');
    seat.id = `seat-${p.id}`;
    seat.innerHTML = `
      <div class="avatar">&#x1F9D1;</div>
      <div class="seat-name">${p.name}</div>
      <div class="seat-artifacts" id="sa-${p.id}"></div>
      <div class="submitted-badge" style="display:none">&#x2714;</div>`;
    table.appendChild(seat);
    return { seat, i };
  });

  // بعد الرسم — اقرأ الأبعاد الحقيقية وطبّق الموضع
  requestAnimationFrame(() => {
    seats.forEach(({ seat, i }) => {
      const angle  = (2 * Math.PI / n) * i - Math.PI / 2;
      const xPct   = 50 + rPct * Math.cos(angle);
      const yPct   = 50 + rPct * Math.sin(angle);
      const halfW  = seat.offsetWidth  / 2;
      const halfH  = seat.offsetHeight / 2;
      seat.style.left = `calc(${xPct}% - ${halfW}px)`;
      seat.style.top  = `calc(${yPct}% - ${halfH}px)`;
    });
  });
}

function renderSeatsData(players) {
  for (const p of players) {
    const el = document.getElementById(`sa-${p.id}`);
    if (!el) continue;
    el.innerHTML = '';
    (p.artifacts || []).forEach(a => {
      el.appendChild(getArtifactSVG(a.id || 'rareCoin', { fake: !!a.fake, size: 'sm' }));
    });
  }
}

// ── Flying artifact ───────────────────────────────────
function flyArtifact(fromId, toId, artifactId, fake = false) {
  return new Promise(resolve => {
    const fromEl = document.getElementById(`seat-${fromId}`);
    const toEl   = document.getElementById(`seat-${toId}`);
    if (!fromEl || !toEl) return resolve();

    const fR = fromEl.getBoundingClientRect();
    const tR = toEl.getBoundingClientRect();

    const flyer = document.createElement('div');
    flyer.className = 'artifact-flyer';
    flyer.style.left = (fR.left + fR.width / 2 - 22) + 'px';
    flyer.style.top  = (fR.top  + fR.height / 2 - 22) + 'px';
    flyer.appendChild(getArtifactSVG(artifactId || 'rareCoin', { fake, size: 'sm' }));
    document.body.appendChild(flyer);

    requestAnimationFrame(() => {
      const dx = (tR.left + tR.width / 2)  - (fR.left + fR.width / 2);
      const dy = (tR.top  + tR.height / 2) - (fR.top  + fR.height / 2);
      flyer.style.transform = `translate(${dx}px,${dy}px) scale(1.6) rotate(360deg)`;
      flyer.style.opacity = '0.9';
    });

    setTimeout(() => { flyer.remove(); resolve(); }, 820);
  });
}

// ── Seat pulses ───────────────────────────────────────
function pulseSeat(id, cls, ms = 1200) {
  const el = document.getElementById(`seat-${id}`);
  if (!el) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}

// ── Play all round animations sequentially ────────────
async function playRoundAnimations(result) {
  const artId = result.artifact?.id || 'rareCoin';

  if (result.winnerId) {
    pulseSeat(result.winnerId, 'seat-win');
    await wait(900);
  }

  for (const ev of (result.events || [])) {
    switch (ev.type) {
      case 'ghost_vanish':
        pulseSeat(ev.playerId, 'seat-ghost');
        toast('👻 لاعب اختفى!', 'info');
        await wait(800);
        break;

      case 'scam':
        pulseSeat(ev.victimId, 'seat-scam');
        toast('🎪 قطعة مزيّفة!', 'bad');
        await wait(700);
        break;

      case 'knife_theft':
        await flyArtifact(ev.victimId, ev.thiefId, artId);
        pulseSeat(ev.thiefId, 'seat-steal');
        toast('🗡️ سرقة بالسكين!', 'warn');
        await wait(300);
        break;

      case 'ninja_theft':
        await flyArtifact(ev.victimId, ev.thiefId, artId);
        pulseSeat(ev.thiefId, 'seat-steal-ninja');
        toast('🥷 النينجا ضرب!', 'warn');
        await wait(300);
        break;

      case 'wizard_swap':
        await Promise.all([
          flyArtifact(ev.casterId, ev.targetId, ev.gave?.id || 'rareCoin'),
          flyArtifact(ev.targetId, ev.casterId, ev.took?.id || 'rareCoin'),
        ]);
        toast('🧙 تبديل سحري!', 'info');
        await wait(400);
        break;
    }
  }

  if (result.alliance?.type === 'betrayal') {
    await flyArtifact(result.alliance.victimId, result.alliance.betrayerId, artId);
    pulseSeat(result.alliance.betrayerId, 'seat-steal');
    toast('🔪 خيانة!', 'bad');
    await wait(400);
  }
  if (result.alliance?.type === 'shared') {
    pulseSeat(result.alliance.partnerId, 'seat-alliance');
    toast('🤝 تحالف ناجح!', 'good');
    await wait(600);
  }
}

// ── Result log ────────────────────────────────────────
function appendResultLog(result) {
  const nameOf = id => playersList.find(p => p.id === id)?.name || '؟';
  let html = `<p><strong>الجولة ${result.round}${result.timedOut ? ' ⌛' : ''}</strong></p>`;
  html += `<p>${result.bidsPublic.map(b => `${nameOf(b.pid)}: ${b.effectiveBid}`).join(' | ')}</p>`;
  html += result.winnerId
    ? `<p class="log-win">🏆 ${nameOf(result.winnerId)} فاز بالمزاد</p>`
    : `<p>❌ لا فائز هذه الجولة</p>`;

  for (const ev of (result.events || [])) {
    if (ev.type === 'scam')        html += `<p class="log-scam">🎪 ${nameOf(ev.casterId)} زيّف قطعة ${nameOf(ev.victimId)}</p>`;
    if (ev.type === 'knife_theft') html += `<p class="log-steal">🗡️ ${nameOf(ev.thiefId)} سرق من ${nameOf(ev.victimId)}</p>`;
    if (ev.type === 'ninja_theft') html += `<p class="log-ninja">🥷 ${nameOf(ev.thiefId)} تسلل وسرق من ${nameOf(ev.victimId)}</p>`;
    if (ev.type === 'wizard_swap') html += `<p>🧙 ${nameOf(ev.casterId)} بادل مع ${nameOf(ev.targetId)}</p>`;
    if (ev.type === 'ghost_vanish') html += `<p class="log-ghost">👻 ${nameOf(ev.playerId)} اختفى</p>`;
  }
  if (result.alliance?.type === 'shared')   html += `<p class="log-ally">🤝 ${nameOf(result.alliance.partnerId)} ربح ${result.alliance.bonus} من التحالف</p>`;
  if (result.alliance?.type === 'betrayal') html += `<p class="log-betray">🔪 ${nameOf(result.alliance.betrayerId)} خان ${nameOf(result.alliance.victimId)}</p>`;
  if (result.fakeBroadcasts?.length) {
    result.fakeBroadcasts.forEach(fb => html += `<p>🦊 ${nameOf(fb.casterId)} ادّعى ${fb.fakeBudget} (بلوف)</p>`);
  }

  $('log').innerHTML = html + '<hr style="border-color:var(--border);margin:8px 0">' + $('log').innerHTML;
}