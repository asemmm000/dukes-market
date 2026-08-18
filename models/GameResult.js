const mongoose = require('mongoose');

const GameResultSchema = new mongoose.Schema({
  roomCode: String,
  players: [{
    name: String,
    total: Number,
    budget: Number,
    artifactsValue: Number,
  }],
  winnerName: String,
  playedAt: { type: Date, default: Date.now },
}, { collection: 'dukes_market_results' }); // 👈 اسم صريح للمجموعة

module.exports = mongoose.model('GameResult', GameResultSchema);
