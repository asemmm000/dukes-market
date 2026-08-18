const socket = io();
let myId = null, roomCode = null, myHand = [], myBudget = 0, playersList = [];
let timerInterval = null, isAnimating = false, pendingRoomUpdate = null, hasSubmitted = false;
let seatIds = []; // لتتبّع هل نحتاج إعادة بناء الطاولة

const $ = id => document.getElementById(id);
function show(id) { document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden')); $(id).classList.remove('hidden'); }
const wait = ms => new Promise(r => setTimeout(r, ms));

const CARD_LABELS = {
  coin:'💵 عملة واحدة (+1)', coin_bag:'💰 كيس عملات (+5)', gem:'💎 جوهرة (+10)', bank:'🏦 بنك (×2 ميزانية)',
  fake_merchant:'🦊 تاجر كاذب', spy:'🕵️ جاسوس', mask:'🎭 قناع', knife:'🗡️ سكين',
  secret_contract:'📜 عقد سري', partnership:'🤝 شراكة', betrayal:'🔪 خيانة', protection:'🛡️ حماية',
  ninja:'🥷 النينجا', wizard:'🧙 الساحر', ghost:'👻 الشبح', con_artist:'🎪 المحتال',
};
const MONEY_TYPES = ['coin','coin_bag','gem'];
const NEEDS_TARGET = ['spy','knife','secret_contract','partnership','betrayal','ninja','wizard','con_artist'];

socket.on('connect', () => { myId = socket.id; });

// ------- Home / Lobby -------
$('btnCreate').onclick = () => {
  socket.emit('create_room', { name: $('nameInput').value }, res => {
    if (!res.ok) return alert(res.error);
    roomCode = res.code; show('screen-lobby'); $('roomCode').textContent = roomCode;
  });
};
$('btnJoin').onclick = () => {
  socket.emit('join_room', { code: $('codeInput').value, name: $('nameInput').value }, res => {
    if (!res.ok) return alert(res.error);
    roomCode = res.code; show('screen-lobby'); $('roomCode').textContent = roomCode;
  });
};
$('btnStart').onclick = () => socket.emit('start_game', { code: roomCode }, res => { if(!res.ok) alert(res.error); });

// ------- Room state -------
socket.on('room_update', (room) => {
  playersList = room.players;
  $('playerList').innerHTML = room.players.map(p => `<li>${p.name} ${p.isHost?'👑':''} ${p.connected?'':'⛔'}</li>`).join('');

  if (isAnimating) {
    pendingRoomUpdate = room; // نأجل تحديث الطاولة لحين انتهاء الأنيميشن
  } else {
    layoutSeatsIfNeeded(room.players);
    renderSeatsData(room.players);
  }
});

socket.on('private_state', (state) => {
  myHand = state.hand; myBudget = state.budget;
  renderHandUI();
});

// ------- Round lifecycle -------
socket.on('round_start', ({ number, artifact, duration, startTime }) => {
  show('screen-game');
  $('artifactBox').innerHTML = `<h2>الجولة ${number}/5</h2><h3>${artifact.name} (قيمة ${artifact.value})</h3>`;
  $('log').innerHTML = '';
  $('bidInput').value = 0;
  $('btnSubmit').disabled = false;
  hasSubmitted = false;
  startTimer(duration);
});

socket.on('player_submitted', ({ submittedCount, totalActive }) => {
  $('submitCount').textContent = `أرسل ${submittedCount}/${totalActive}`;
});

socket.on('spy_result', (r) => {
  const line = r.blocked
    ? `🕵️ محاولة تجسس فشلت (الهدف محمي/مخفي)`
    : `🕵️ تجسست ورأيت ميزانية الخصم: ${r.targetBudget} عملة`;
  $('log').innerHTML = `<p>${line}</p>` + $('log').innerHTML;
});

socket.on('round_result', async (result) => {
  clearInterval(timerInterval);
  $('timerText').textContent = '...';
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

socket.on('game_over', (scores) => {
  show('screen-gameover');
  $('finalList').innerHTML = scores.map(s =>
    `<li>${s.name}: ${s.total} (نقود ${s.budget} + قطع ${s.artifactsValue})</li>`).join('');
});

// ------- Timer -------
function startTimer(durationMs) {
  clearInterval(timerInterval);
  const start = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, durationMs - elapsed);
    const pct = (remaining / durationMs) * 100;
    $('timerFill').style.width = pct + '%';
    $('timerFill').classList.toggle('danger', remaining < durationMs * 0.25);
    $('timerText').textContent = Math.ceil(remaining / 1000) + 'ث';
    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (!hasSubmitted) autoSubmit(); // إرسال تلقائي بما اختاره اللاعب حتى الآن
    }
  }, 100);
}

function autoSubmit() {
  doSubmit(); // نفس منطق الزر، بأي قيم موجودة حالياً في الفورم
}

// ------- Hand rendering -------
function renderHandUI() {
  $('budgetDisplay').textContent = myBudget;
  $('bidInput').max = Math.min(10, myBudget);

  const bankCards = myHand.filter(c => c.type === 'bank');
  $('bankZone').innerHTML = bankCards.map(c =>
    `<label><input type="checkbox" class="bankCk" value="${c.uid}"> ${CARD_LABELS.bank}</label>`
  ).join('') || '<em>لا تملك بطاقة بنك</em>';

  const moneyCards = myHand.filter(c => MONEY_TYPES.includes(c.type));
  $('moneyCardsZone').innerHTML = moneyCards.map(c =>
    `<label><input type="checkbox" class="moneyCk" value="${c.uid}" data-value="${valueOf(c.type)}"> ${CARD_LABELS[c.type]}</label>`
  ).join('') || '<em>لا تملك بطاقات مال</em>';
  document.querySelectorAll('.moneyCk').forEach(el => el.onchange = updateBoostTotal);
  updateBoostTotal();

  const actionCards = myHand.filter(c => !MONEY_TYPES.includes(c.type) && c.type !== 'bank');
  $('actionCardSelect').innerHTML = '<option value="">بدون بطاقة</option>' +
    actionCards.map(c => `<option value="${c.uid}" data-type="${c.type}">${CARD_LABELS[c.type]}</option>`).join('');
}
function valueOf(type) { return { coin:1, coin_bag:5, gem:10 }[type] || 0; }
function updateBoostTotal() {
  let total = 0;
  document.querySelectorAll('.moneyCk:checked').forEach(el => total += Number(el.dataset.value));
  $('boostTotal').textContent = total;
}
$('actionCardSelect').onchange = () => {
  const opt = $('actionCardSelect').selectedOptions[0];
  const type = opt?.dataset.type;
  if (type && NEEDS_TARGET.includes(type)) {
    $('targetSelect').classList.remove('hidden');
    $('targetSelect').innerHTML = playersList.filter(p => p.id !== myId)
      .map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  } else {
    $('targetSelect').classList.add('hidden');
  }
};

// ------- Submit -------
$('btnSubmit').onclick = () => doSubmit();

function doSubmit() {
  if (hasSubmitted) return;
  const baseBid = $('bidInput').value || 0;
  const bankCk = document.querySelector('.bankCk:checked');
  const moneyCardUids = [...document.querySelectorAll('.moneyCk:checked')].map(el => el.value);
  const actionUid = $('actionCardSelect').value;
  const targetId = $('targetSelect').value || null;

  socket.emit('submit_turn', {
    code: roomCode, baseBid,
    bankCardUid: bankCk ? bankCk.value : null,
    moneyCardUids,
    actionCard: actionUid ? { uid: actionUid, targetId } : null,
  }, res => {
    if (!res.ok) { if (!hasSubmitted) alert(res.error); return; }
    hasSubmitted = true;
    $('btnSubmit').disabled = true;
  });
}

// ==========================================================
// 🎨 الطاولة + الأنيميشن
// ==========================================================

function layoutSeatsIfNeeded(players) {
  const ids = players.map(p => p.id).join(',');
  if (ids === seatIds.join(',')) return; // نفس اللاعبين، لا داعي لإعادة البناء
  seatIds = players.map(p => p.id);

  const table = $('table');
  table.innerHTML = '';
  const n = players.length;
  const radiusPct = 38; // % من نصف قطر الطاولة
  players.forEach((p, i) => {
    const angle = (2 * Math.PI / n) * i - Math.PI / 2;
    const x = 50 + radiusPct * Math.cos(angle);
    const y = 50 + radiusPct * Math.sin(angle);
    const seat = document.createElement('div');
    seat.className = 'seat' + (p.id === myId ? ' me' : '');
    seat.id = 'seat-' + p.id;
    seat.style.left = `calc(${x}% - 50px)`;
    seat.style.top = `calc(${y}% - 40px)`;
    seat.innerHTML = `
      <div class="avatar">🧑</div>
      <div class="name">${p.name}</div>
      <div class="artifacts" id="artifacts-${p.id}"></div>
    `;
    table.appendChild(seat);
  });
}

function renderSeatsData(players) {
  for (const p of players) {
    const el = document.getElementById(`artifacts-${p.id}`);
    if (el) {
      el.textContent = p.artifacts.map(a => a.fake ? '🚫' : emojiOf(a.name)).join(' ');
    }
  }
}

function emojiOf(name) {
  return name.split(' ')[0]; // أول رمز إيموجي في اسم القطعة
}

function pulseSeat(id, className, duration = 900) {
  const el = document.getElementById('seat-' + id);
  if (!el) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

function flyArtifact(fromId, toId, emoji) {
  return new Promise(resolve => {
    const fromEl = document.getElementById('seat-' + fromId);
    const toEl = document.getElementById('seat-' + toId);
    if (!fromEl || !toEl) return resolve();

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const flyer = document.createElement('div');
    flyer.className = 'artifact-flyer';
    flyer.textContent = emoji;
    flyer.style.left = (fromRect.left + fromRect.width / 2 - 15) + 'px';
    flyer.style.top = (fromRect.top + fromRect.height / 2 - 15) + 'px';
    flyer.style.opacity = '1';
    document.body.appendChild(flyer);

    requestAnimationFrame(() => {
      const dx = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2);
      const dy = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);
      flyer.style.transform = `translate(${dx}px, ${dy}px) scale(1.5) rotate(360deg)`;
      flyer.style.opacity = '0.85';
    });

    setTimeout(() => { flyer.remove(); resolve(); }, 800);
  });
}

async function playRoundAnimations(result) {
  const emoji = emojiOf(result.artifact.name);

  if (result.winnerId) {
    pulseSeat(result.winnerId, 'seat-win');
    await wait(750);
  } else {
    await wait(300);
  }

  for (const ev of result.events) {
    if (ev.type === 'ghost_vanish') {
      pulseSeat(ev.playerId, 'seat-ghost');
      await wait(700);
    }
    if (ev.type === 'scam') {
      pulseSeat(ev.victimId, 'seat-scam');
      await wait(700);
    }
    if (ev.type === 'knife_theft') {
      await flyArtifact(ev.victimId, ev.thiefId, '🗡️' + emoji);
      pulseSeat(ev.thiefId, 'seat-steal');
      await wait(250);
    }
    if (ev.type === 'ninja_theft') {
      await flyArtifact(ev.victimId, ev.thiefId, '🥷' + emoji);
      pulseSeat(ev.thiefId, 'seat-steal-ninja');
      await wait(250);
    }
    if (ev.type === 'wizard_swap') {
      await Promise.all([
        flyArtifact(ev.casterId, ev.targetId, emojiOf(ev.gave.name)),
        flyArtifact(ev.targetId, ev.casterId, emojiOf(ev.took.name)),
      ]);
      await wait(300);
    }
  }

  if (result.alliance?.type === 'betrayal') {
    await flyArtifact(result.alliance.victimId, result.alliance.betrayerId, '🔪' + emoji);
    pulseSeat(result.alliance.betrayerId, 'seat-steal');
    await wait(300);
  }
  if (result.alliance?.type === 'shared') {
    pulseSeat(result.alliance.partnerId, 'seat-alliance');
    await wait(600);
  }
}

function appendResultLog(result) {
  const nameOf = id => playersList.find(p => p.id === id)?.name || '؟';
  let html = `<h4>📢 نتيجة الجولة ${result.round}${result.timedOut ? ' (انتهى الوقت!)' : ''}</h4>`;
  html += `<p>الترتيب: ${result.bidsPublic.map(b => `${nameOf(b.pid)}(${b.effectiveBid})`).join(' | ')}</p>`;
  html += result.winnerId ? `<p>🏆 الفائز: ${nameOf(result.winnerId)}</p>` : `<p>❌ لا فائز</p>`;

  for (const ev of result.events) {
    if (ev.type === 'scam') html += `<p>🎪 ${nameOf(ev.casterId)} زيّف قطعة ${nameOf(ev.victimId)}!</p>`;
    if (ev.type === 'knife_theft') html += `<p>🗡️ ${nameOf(ev.thiefId)} سرق من ${nameOf(ev.victimId)}</p>`;
    if (ev.type === 'ninja_theft') html += `<p>🥷 ${nameOf(ev.thiefId)} تسلل وسرق من ${nameOf(ev.victimId)}</p>`;
    if (ev.type === 'wizard_swap') html += `<p>🧙 ${nameOf(ev.casterId)} بادل قطعاً مع ${nameOf(ev.targetId)}</p>`;
  }
  if (result.alliance?.type === 'shared') html += `<p>🤝 ${nameOf(result.alliance.partnerId)} حصل على ${result.alliance.bonus} من التحالف</p>`;
  if (result.alliance?.type === 'betrayal') html += `<p>🔪 خيانة! ${nameOf(result.alliance.betrayerId)} خان ${nameOf(result.alliance.victimId)}</p>`;
  if (result.fakeBroadcasts?.length) {
    result.fakeBroadcasts.forEach(fb => html += `<p>🦊 ${nameOf(fb.casterId)} ادّعى ${fb.fakeBudget} عملة (كذبة!)</p>`);
  }
  $('log').innerHTML = html + $('log').innerHTML;
}