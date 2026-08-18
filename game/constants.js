const ARTIFACTS = [
  { id: 'crown',    name: '👑 تاج ملكي',    value: 15 },
  { id: 'sword',    name: '🗡️ سيف قديم',    value: 12 },
  { id: 'scroll',   name: '📜 مخطوطة',      value: 10 },
  { id: 'ring',     name: '💍 خاتم',        value: 8  },
  { id: 'vase',     name: '🏺 مزهرية',      value: 6  },
  { id: 'rareCoin', name: '🪙 عملة نادرة',  value: 5  },
  { id: 'painting', name: '🖼️ لوحة',        value: 4  },
];

// بطاقات المال - تُستخدم لتعزيز المزايدة (باستثناء البنك)
const MONEY_CARD_TYPES = {
  coin:     { icon: '💵', name: 'عملة واحدة', count: 20, value: 1,  category: 'money' },
  coin_bag: { icon: '💰', name: 'كيس عملات',  count: 10, value: 5,  category: 'money' },
  gem:      { icon: '💎', name: 'جوهرة',      count: 5,  value: 10, category: 'money' },
  bank:     { icon: '🏦', name: 'بنك',        count: 2,  value: 0,  category: 'money', isBank: true },
};

// بطاقات الخبث والتحالف والّلصوص - "بطاقات فعل" (تحتاج غالباً هدف)
const SPECIAL_CARD_TYPES = {
  // خبث
  fake_merchant:   { icon:'🦊', name:'تاجر كاذب', count:4, needsTarget:false, category:'trick' },
  spy:             { icon:'🕵️', name:'جاسوس',     count:3, needsTarget:true,  category:'trick' },
  mask:            { icon:'🎭', name:'قناع',       count:4, needsTarget:false, category:'trick' },
  knife:           { icon:'🗡️', name:'سكين',       count:3, needsTarget:true,  category:'trick' },
  // تحالف
  secret_contract: { icon:'📜', name:'عقد سري',    count:4, needsTarget:true,  category:'alliance' },
  partnership:     { icon:'🤝', name:'شراكة',      count:3, needsTarget:true,  category:'alliance' },
  betrayal:        { icon:'🔪', name:'خيانة',      count:3, needsTarget:true,  category:'alliance' },
  protection:      { icon:'🛡️', name:'حماية',      count:3, needsTarget:false, category:'alliance' },
  // لصوص
  ninja:           { icon:'🥷', name:'النينجا',    count:3, needsTarget:true,  category:'thief' },
  wizard:          { icon:'🧙', name:'الساحر',     count:2, needsTarget:true,  category:'thief' },
  ghost:           { icon:'👻', name:'الشبح',      count:3, needsTarget:false, category:'thief' },
  con_artist:      { icon:'🎪', name:'المحتال',    count:3, needsTarget:true,  category:'thief' },
};

const STARTING_BUDGET = 20;
const HAND_SIZE = 5;
const TOTAL_ROUNDS = 5;
const MAX_BID = 10;
const GHOST_BONUS = 2;

module.exports = {
  ARTIFACTS, MONEY_CARD_TYPES, SPECIAL_CARD_TYPES,
  STARTING_BUDGET, HAND_SIZE, TOTAL_ROUNDS, MAX_BID, GHOST_BONUS,
};
