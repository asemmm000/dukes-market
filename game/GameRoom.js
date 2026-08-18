const {
  ARTIFACTS, MONEY_CARD_TYPES, SPECIAL_CARD_TYPES,
  STARTING_BUDGET, HAND_SIZE, TOTAL_ROUNDS, MAX_BID, GHOST_BONUS,
} = require('./constants');
const { buildFullDeck, drawCards, shuffle } = require('./deck');

const MONEY_TYPES = Object.keys(MONEY_CARD_TYPES).filter(t => !MONEY_CARD_TYPES[t].isBank);

class GameRoom {
  constructor(code, hostId) {
    this.code = code;
    this.hostId = hostId;
    this.players = new Map();   // socketId -> player
    this.tokenMap = new Map();  // 🔐 token -> socketId (للريكونكت)
    this.status = 'lobby';
    this.deck = [];
    this.discard = [];
    this.artifactsQueue = [];
    this.round = null;
    this.roundNumber = 0;
  }

  addPlayer(id, name) {
    if (this.players.size >= 6) throw new Error('الغرفة ممتلئة');
    if (this.status !== 'lobby') throw new Error('اللعبة بدأت بالفعل');
    const token = require('crypto').randomBytes(16).toString('hex');
    this.tokenMap.set(token, id);
    this.players.set(id, {
      id, name, connected: true,
      budget: STARTING_BUDGET, hand: [], artifacts: [],
      token, // نحتفظ به للبحث العكسي
    });
    return token;
  }

  // دالة جديدة: استبدال socketId بالـ token
  reconnectPlayer(token, newSocketId) {
    // إيجاد الـ token
    const oldSocketId = this.tokenMap.get(token);
    if (!oldSocketId) throw new Error('token غير صالح أو منتهي');
    const player = this.players.get(oldSocketId);
    if (!player) throw new Error('لاعب غير موجود');
    if (player.connected) throw new Error('اللاعب متصل بالفعل');

    // نقل البيانات للـ socket ID الجديد
    player.id = newSocketId;
    player.connected = true;
    this.players.delete(oldSocketId);
    this.players.set(newSocketId, player);
    this.tokenMap.set(token, newSocketId);

    // ترحيل إرسال الجولة الحالية إن وُجد (كان مربوطاً بالمعرّف القديم)
    if (this.round && this.round.submissions[oldSocketId]) {
      this.round.submissions[newSocketId] = this.round.submissions[oldSocketId];
      delete this.round.submissions[oldSocketId];
    }

    // لو كان المضيف، حدّث hostId
    if (oldSocketId === this.hostId) this.hostId = newSocketId;

    return player;
  }

  removePlayer(id) {
    const p = this.players.get(id);
    if (p) p.connected = false;
  }

  activePlayers() {
    return [...this.players.values()].filter(p => p.connected);
  }

  publicPlayers() {
    return [...this.players.values()].map(p => ({
      id: p.id, name: p.name, connected: p.connected,
      handCount: p.hand.length,
      artifacts: p.artifacts.map(a => ({ id: a.id, name: a.name, value: a.value, fake: !!a.fake })),
      isHost: p.id === this.hostId,
    }));
  }

  startGame() {
    if (this.players.size < 2) throw new Error('تحتاج لاعبَين على الأقل');
    this.status = 'playing';
    this.deck = buildFullDeck();
    this.discard = [];
    this.artifactsQueue = shuffle(ARTIFACTS).slice(0, TOTAL_ROUNDS);
    for (const p of this.players.values()) {
      p.budget = STARTING_BUDGET;
      p.artifacts = [];
      p.hand = drawCards({ deck: this.deck, discard: this.discard }, HAND_SIZE);
    }
    this.roundNumber = 0;
    return this.startNextRound();
  }

  startNextRound() {
    this.roundNumber++;
    if (this.roundNumber > TOTAL_ROUNDS) {
      this.status = 'finished';
      return { type: 'game_over', payload: this.finalScores() };
    }
    // تعبئة اليد حتى الحجم الكامل في كل جولة (باستثناء الأولى المعبأة أصلاً)
    if (this.roundNumber > 1) {
      for (const p of this.activePlayers()) {
        const need = HAND_SIZE - p.hand.length;
        if (need > 0) {
          const state = { deck: this.deck, discard: this.discard };
          const newCards = drawCards(state, need);
          this.deck = state.deck; this.discard = state.discard;
          p.hand.push(...newCards);
        }
      }
    }
    const artifact = this.artifactsQueue[this.roundNumber - 1];
    this.round = { number: this.roundNumber, artifact, submissions: {}, resolved: false }; // 👈 أضفنا resolved
    return { type: 'round_start', payload: { number: this.roundNumber, artifact } };
  }

  allSubmitted() {
    return this.activePlayers().every(p => this.round.submissions[p.id]);
  }

  discardCard(card) { this.discard.push(card); }

  // payload: { baseBid, moneyCardUids: [uid,...], bankCardUid: uid|null, actionCard: {uid, targetId} | null }
  submitTurn(playerId, payload) {
    const player = this.players.get(playerId);
    if (!player) throw new Error('لاعب غير موجود');
    if (!this.round || this.round.submissions[playerId]) throw new Error('تم الإرسال مسبقاً');

    let { baseBid, moneyCardUids = [], bankCardUid = null, actionCard = null } = payload;

    // 1) بطاقة البنك: تضاعف الميزانية فوراً
    if (bankCardUid) {
      const idx = player.hand.findIndex(c => c.uid === bankCardUid && c.type === 'bank');
      if (idx === -1) throw new Error('بطاقة بنك غير صالحة');
      player.budget *= 2;
      this.discardCard(player.hand[idx]);
      player.hand.splice(idx, 1);
    }

    // 2) بطاقات النقد كتعزيز للمزايدة (تُستهلك دائماً)
    let moneyBoost = 0;
    for (const uid of moneyCardUids || []) {
      const idx = player.hand.findIndex(c => c.uid === uid);
      if (idx === -1) throw new Error('بطاقة مال غير موجودة');
      const card = player.hand[idx];
      if (!MONEY_TYPES.includes(card.type)) throw new Error('بطاقة غير صالحة للمزايدة');
      moneyBoost += MONEY_CARD_TYPES[card.type].value;
      this.discardCard(card);
      player.hand.splice(idx, 1);
    }

    // 3) المزايدة الأساسية من الميزانية
    baseBid = Math.max(0, Math.min(MAX_BID, Number(baseBid) || 0));
    baseBid = Math.min(baseBid, player.budget);

    // 4) بطاقة فعل واحدة اختيارية (خبث/تحالف/لص)
    let playedAction = null;
    if (actionCard && actionCard.uid) {
      const idx = player.hand.findIndex(c => c.uid === actionCard.uid);
      if (idx === -1) throw new Error('بطاقة غير موجودة');
      const type = player.hand[idx].type;
      const info = SPECIAL_CARD_TYPES[type];
      if (!info) throw new Error('بطاقة غير صالحة');
      if (info.needsTarget && !actionCard.targetId) throw new Error('هذه البطاقة تحتاج هدفاً');
      if (actionCard.targetId && !this.players.has(actionCard.targetId)) throw new Error('هدف غير صالح');
      playedAction = { type, targetId: actionCard.targetId || null };
      this.discardCard(player.hand[idx]);
      player.hand.splice(idx, 1);
    }

    const effectiveBid = baseBid + moneyBoost;
    this.round.submissions[playerId] = { baseBid, moneyBoost, effectiveBid, actionCard: playedAction };
    return this.allSubmitted();
  }

  fillMissing() {
    for (const p of this.activePlayers()) {
      if (!this.round.submissions[p.id]) {
        this.round.submissions[p.id] = { baseBid: 0, moneyBoost: 0, effectiveBid: 0, actionCard: null };
      }
    }
  }

  moveArtifact(fromId, toId, instance) {
    const from = this.players.get(fromId);
    const to = this.players.get(toId);
    const idx = from.artifacts.indexOf(instance);
    if (idx > -1) from.artifacts.splice(idx, 1);
    to.artifacts.push(instance);
  }

  resolveRound() {
    this.fillMissing();
    const subs = this.round.submissions;
    const events = [];

    const byType = (t) => Object.entries(subs)
      .filter(([, s]) => s.actionCard?.type === t)
      .map(([pid, s]) => ({ casterId: pid, targetId: s.actionCard.targetId }));

    const protectedIds = new Set(Object.entries(subs).filter(([, s]) => s.actionCard?.type === 'protection').map(([pid]) => pid));
    const maskedIds    = new Set(Object.entries(subs).filter(([, s]) => s.actionCard?.type === 'mask').map(([pid]) => pid));
    const ghostIds     = new Set(Object.entries(subs).filter(([, s]) => s.actionCard?.type === 'ghost').map(([pid]) => pid));

    // مكافأة الشبح
    for (const gid of ghostIds) {
      this.players.get(gid).budget += GHOST_BONUS;
      events.push({ type: 'ghost_vanish', playerId: gid });
    }

    // تجسس
    const spyResults = [];
    for (const spy of byType('spy')) {
      const blocked = maskedIds.has(spy.targetId) || ghostIds.has(spy.targetId);
      if (blocked) { spyResults.push({ casterId: spy.casterId, targetId: spy.targetId, blocked: true }); continue; }
      const target = this.players.get(spy.targetId);
      spyResults.push({ casterId: spy.casterId, targetId: spy.targetId, targetBudget: target.budget });
    }

    // بلوفات التاجر الكاذب
    const fakeBroadcasts = byType('fake_merchant').map(fm => ({
      casterId: fm.casterId,
      fakeBudget: this.players.get(fm.casterId).budget + 10 + Math.floor(Math.random() * 15),
    }));

    // تحديد الفائز (الأشباح غير مؤهلين)
    const eligible = this.activePlayers().filter(p => !ghostIds.has(p.id));
    const bidsPublic = eligible.map(p => ({ pid: p.id, effectiveBid: subs[p.id].effectiveBid }))
      .sort((a, b) => b.effectiveBid - a.effectiveBid);
    const maxEff = Math.max(0, ...bidsPublic.map(b => b.effectiveBid));
    const topBidders = bidsPublic.filter(b => b.effectiveBid === maxEff && maxEff > 0);
    let winnerId = topBidders.length ? topBidders[Math.floor(Math.random() * topBidders.length)].pid : null;

    const artifactDef = this.round.artifact;
    let finalHolder = null;
    let artifactInstance = null;

    if (winnerId) {
      const winner = this.players.get(winnerId);
      winner.budget -= subs[winnerId].baseBid;
      artifactInstance = { ...artifactDef, fake: false };
      winner.artifacts.push(artifactInstance);
      finalHolder = winnerId;
      events.push({ type: 'won_auction', playerId: winnerId, bid: subs[winnerId].effectiveBid });

      // المحتال: يزيّف قطعة الفائز
      const scam = byType('con_artist').find(c => c.targetId === winnerId);
      if (scam && !protectedIds.has(winnerId) && !ghostIds.has(winnerId)) {
        artifactInstance.fake = true;
        const refund = Math.floor(artifactDef.value / 2);
        artifactInstance.value = 0;
        this.players.get(scam.casterId).budget += refund;
        events.push({ type: 'scam', casterId: scam.casterId, victimId: winnerId, refund });
      }

      // سكين: يسرق (يوقفه الحماية أو الشبح)
      const knifeAtk = byType('knife').find(k => k.targetId === finalHolder);
      if (knifeAtk && !protectedIds.has(finalHolder) && !ghostIds.has(finalHolder)) {
        this.moveArtifact(finalHolder, knifeAtk.casterId, artifactInstance);
        events.push({ type: 'knife_theft', thiefId: knifeAtk.casterId, victimId: finalHolder });
        finalHolder = knifeAtk.casterId;
      }

      // نينجا: يسرق من الحائز الحالي، يتجاوز الحماية (لكن ليس الشبح)
      const ninjaAtk = byType('ninja').find(n => n.targetId === finalHolder);
      if (ninjaAtk && !ghostIds.has(finalHolder)) {
        this.moveArtifact(finalHolder, ninjaAtk.casterId, artifactInstance);
        events.push({ type: 'ninja_theft', thiefId: ninjaAtk.casterId, victimId: finalHolder });
        finalHolder = ninjaAtk.casterId;
      }
    }

    // الساحر: يبادل أضعف قطعة عنده بأقوى قطعة عند الهدف (مستقل عن نتيجة المزاد)
    for (const wz of byType('wizard')) {
      if (protectedIds.has(wz.targetId) || ghostIds.has(wz.targetId)) continue;
      const caster = this.players.get(wz.casterId);
      const target = this.players.get(wz.targetId);
      if (!caster.artifacts.length || !target.artifacts.length) continue;
      const casterLow = caster.artifacts.reduce((a, b) => (a.value <= b.value ? a : b));
      const targetHigh = target.artifacts.reduce((a, b) => (a.value >= b.value ? a : b));
      this.moveArtifact(wz.casterId, wz.targetId, casterLow);
      this.moveArtifact(wz.targetId, wz.casterId, targetHigh);
      events.push({ type: 'wizard_swap', casterId: wz.casterId, targetId: wz.targetId, gave: casterLow, took: targetHigh });
    }

    // التحالف/الخيانة (على الحائز الحالي بعد كل السرقات)
    let allianceResult = null;
    if (finalHolder && !ghostIds.has(finalHolder)) {
      const contracts = byType('secret_contract');
      const partnerships = byType('partnership');
      const betrayals = byType('betrayal');
      const alliance = contracts
        .map(c => [c.casterId, c.targetId])
        .find(([a, b]) => partnerships.some(ps => ps.casterId === b && ps.targetId === a));
      if (alliance) {
        const partnerId = alliance[0] === finalHolder ? alliance[1] : (alliance[1] === finalHolder ? alliance[0] : null);
        if (partnerId) {
          const betrayedByPartner = betrayals.find(b => b.casterId === partnerId && b.targetId === finalHolder);
          if (betrayedByPartner && !protectedIds.has(finalHolder)) {
            this.moveArtifact(finalHolder, partnerId, artifactInstance);
            allianceResult = { type: 'betrayal', betrayerId: partnerId, victimId: finalHolder };
            finalHolder = partnerId;
          } else if (artifactInstance) {
            const bonus = Math.floor(artifactInstance.value / 2);
            this.players.get(partnerId).budget += bonus;
            allianceResult = { type: 'shared', partnerId, holderId: finalHolder, bonus };
          }
        }
      }
    }

    const result = {
      round: this.roundNumber,
      artifact: artifactDef,
      bidsPublic,
      winnerId,
      finalHolder,
      events,
      alliance: allianceResult,
      fakeBroadcasts,
    };
    this.round.result = result;
    this.round.spyResults = spyResults;
    return result;
  }

  finalScores() {
    return [...this.players.values()].map(p => {
      const artifactsValue = p.artifacts.reduce((s, a) => s + a.value, 0);
      return {
        id: p.id, name: p.name, budget: p.budget,
        artifacts: p.artifacts, artifactsValue,
        total: p.budget + artifactsValue,
      };
    }).sort((a, b) => b.total - a.total);
  }
}

module.exports = GameRoom;
