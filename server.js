require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const { createRoom, getRoom, rooms } = require('./game/roomManager');
const GameResult = require('./models/GameResult');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { dbName: 'dukes_market' }) // 👈 اسم قاعدة بيانات واضح
    .then(() => console.log('✅ MongoDB connected (dukes_market)'))
    .catch(err => console.error('Mongo error', err));
}

const ROUND_DURATION_MS = 30000;
const RESULT_DISPLAY_MS = 6000; // وقت عرض نتيجة الجولة قبل بدء التالية (يكفي للأنيميشن)

function broadcastRoom(room) {
  io.to(room.code).emit('room_update', {
    code: room.code, status: room.status,
    hostId: room.hostId, players: room.publicPlayers(),
  });
}

function sendPrivateHands(room) {
  for (const p of room.players.values()) {
    io.to(p.id).emit('private_state', { budget: p.budget, hand: p.hand, artifacts: p.artifacts });
  }
}

function scheduleRoundTimer(room) {
  clearRoundTimer(room);
  room._timer = setTimeout(() => {
    if (room.round && !room.round.resolved) {
      resolveAndAdvance(room, true);
    }
  }, ROUND_DURATION_MS);
}

function clearRoundTimer(room) {
  if (room._timer) { clearTimeout(room._timer); room._timer = null; }
}

function emitRoundStart(room, payload) {
  io.to(room.code).emit('round_start', {
    ...payload,
    duration: ROUND_DURATION_MS,
    startTime: Date.now(),
  });
  scheduleRoundTimer(room);
}

io.on('connection', (socket) => {
  socket.on('create_room', ({ name }, cb) => {
    try {
      const room = createRoom(socket.id, name || 'لاعب');
      // createRoom يستدعي addPlayer داخلياً، نحتاج نعيد الـ token
      const player = room.players.get(socket.id);
      socket.join(room.code);
      cb?.({ ok: true, code: room.code, token: player.token }); // 🔐 نعيد token
      broadcastRoom(room);
    } catch (e) { cb?.({ ok: false, error: e.message }); }
  });

  socket.on('join_room', ({ code, name }, cb) => {
    try {
      const room = getRoom(code);
      if (!room) throw new Error('الغرفة غير موجودة');
      const token = room.addPlayer(socket.id, name || 'لاعب');
      socket.join(room.code);
      cb?.({ ok: true, code: room.code, token }); // 🔐 نعيد token
      broadcastRoom(room);
    } catch (e) { cb?.({ ok: false, error: e.message }); }
  });

  // حدث جديد: إعادة الاتصال
  socket.on('reconnect_game', ({ code, token }, cb) => {
    try {
      const room = getRoom(code);
      if (!room) throw new Error('الغرفة غير موجودة أو انتهت');
      const player = room.reconnectPlayer(token, socket.id);
      socket.join(room.code);

      // إرسال كل البيانات الخاصة بهذا اللاعب فوراً
      socket.emit('private_state', {
        budget: player.budget, hand: player.hand, artifacts: player.artifacts,
      });

      // إعادة إرسال حالة الجولة الحالية لو اللعبة شغّالة
      if (room.status === 'playing' && room.round) {
        socket.emit('reconnect_state', {
          roomCode: room.code,
          roundNumber: room.round.number,
          artifact: room.round.artifact,
          hasSubmitted: !!room.round.submissions[socket.id],
          players: room.publicPlayers(),
        });
      }

      cb?.({ ok: true, playerName: player.name });
      broadcastRoom(room);
      io.to(room.code).emit('player_reconnected', { name: player.name });
    } catch (e) { cb?.({ ok: false, error: e.message }); }
  });

  socket.on('start_game', ({ code }, cb) => {
    try {
      const room = getRoom(code);
      if (!room) throw new Error('غرفة غير موجودة');
      if (socket.id !== room.hostId) throw new Error('فقط المضيف يبدأ اللعبة');
      const event = room.startGame();
      broadcastRoom(room);
      sendPrivateHands(room);
      emitRoundStart(room, event.payload); // 👈 يبدأ المؤقّت هنا
      cb?.({ ok: true });
    } catch (e) { cb?.({ ok: false, error: e.message }); }
  });

  socket.on('submit_turn', ({ code, baseBid, moneyCardUids, bankCardUid, actionCard }, cb) => {
    try {
      const room = getRoom(code);
      if (!room) throw new Error('غرفة غير موجودة');
      if (room.round?.resolved) throw new Error('انتهت الجولة بالفعل');
      const allDone = room.submitTurn(socket.id, { baseBid, moneyCardUids, bankCardUid, actionCard });
      const submittedCount = Object.keys(room.round.submissions).length;
      const totalActive = room.activePlayers().length;
      io.to(room.code).emit('player_submitted', { playerId: socket.id, submittedCount, totalActive });
      cb?.({ ok: true });
      if (allDone) resolveAndAdvance(room, false);
    } catch (e) { cb?.({ ok: false, error: e.message }); }
  });

  socket.on('disconnect', () => {
    for (const room of rooms.values()) {
      if (room.players.has(socket.id)) {
        room.removePlayer(socket.id); // يضع connected: false فقط
        broadcastRoom(room);
        io.to(room.code).emit('player_disconnected', {
          name: room.players.get(socket.id)?.name,
        });
        if (room.round && !room.round.resolved && room.allSubmitted()) {
          resolveAndAdvance(room, false);
        }
      }
    }
  });
});

function resolveAndAdvance(room, timedOut) {
  if (!room.round || room.round.resolved) return;
  room.round.resolved = true;
  clearRoundTimer(room);

  const result = room.resolveRound();
  result.timedOut = timedOut;

  for (const sr of room.round.spyResults) {
    io.to(sr.casterId).emit('spy_result', sr);
  }
  io.to(room.code).emit('round_result', result);
  sendPrivateHands(room);
  broadcastRoom(room);

  setTimeout(() => {
    const next = room.startNextRound();
    if (next.type === 'game_over') {
      io.to(room.code).emit('game_over', next.payload);
      if (process.env.MONGO_URI) {
        GameResult.create({
          roomCode: room.code,
          players: next.payload.map(p => ({ name: p.name, total: p.total, budget: p.budget, artifactsValue: p.artifactsValue })),
          winnerName: next.payload[0]?.name,
        }).catch(console.error);
      }
    } else {
      emitRoundStart(room, next.payload); // 👈 يبدأ مؤقّت الجولة التالية
    }
  }, RESULT_DISPLAY_MS);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🏛️ Dukes Market running on port ${PORT}`));
