const { MONEY_CARD_TYPES, SPECIAL_CARD_TYPES } = require('./constants');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFullDeck() {
  const deck = [];
  let uid = 0;
  const allTypes = { ...MONEY_CARD_TYPES, ...SPECIAL_CARD_TYPES };
  for (const [type, info] of Object.entries(allTypes)) {
    for (let i = 0; i < info.count; i++) {
      deck.push({ uid: `c${uid++}`, type, category: info.category });
    }
  }
  return shuffle(deck);
}

// يسحب n بطاقة من deck، وإن نفدت يعيد خلط discard داخل deck
function drawCards(state, n) {
  const drawn = [];
  for (let i = 0; i < n; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break; // لا مزيد من البطاقات في اللعبة كلها
      state.deck = shuffle(state.discard);
      state.discard = [];
    }
    drawn.push(state.deck.pop());
  }
  return drawn;
}

module.exports = { buildFullDeck, drawCards, shuffle };
