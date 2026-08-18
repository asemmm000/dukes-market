/* ============================================================
   DUKES MARKET — Card SVG Library
   No emoji. No clip-art. Pure geometry.
   ============================================================ */

/* helper: بتبني ال SVG wrapper بسرعة */
function _svg(w, h, content, extra = '') {
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${extra}>${content}</svg>`;
}

/* ── shared defs re-used across cards ─── */
const DEFS = {
  noise: `
    <filter id="noise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="overlay" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>`,
  innerShadow: `
    <filter id="inset">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="2" result="offset-blur"/>
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <feFlood flood-color="#000" flood-opacity=".4" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>`,
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MONEY CARDS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* shared frame for all money cards */
function _moneyFrame(label, centerContent, value) {
  return _svg(88, 124, `
    <defs>${DEFS.noise}</defs>

    <!-- bg -->
    <rect width="88" height="124" fill="#0e1a0e"/>

    <!-- texture overlay -->
    <rect width="88" height="124" fill="#fff" opacity=".025" filter="url(#noise)"/>

    <!-- outer border -->
    <rect x="3" y="3" width="82" height="118" rx="4"
          fill="none" stroke="#2a4a2a" stroke-width=".8"/>

    <!-- inner border (deco double line) -->
    <rect x="6" y="6" width="76" height="112" rx="3"
          fill="none" stroke="#1e381e" stroke-width=".5"/>

    <!-- corner ornaments -->
    <path d="M 8 8 L 14 8 L 14 6 L 6 6 L 6 14 L 8 14 Z" fill="#4caf50" opacity=".6"/>
    <path d="M 80 8 L 74 8 L 74 6 L 82 6 L 82 14 L 80 14 Z" fill="#4caf50" opacity=".6"/>
    <path d="M 8 116 L 14 116 L 14 118 L 6 118 L 6 110 L 8 110 Z" fill="#4caf50" opacity=".6"/>
    <path d="M 80 116 L 74 116 L 74 118 L 82 118 L 82 110 L 80 110 Z" fill="#4caf50" opacity=".6"/>

    <!-- top label -->
    <text x="44" y="18" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="6" letter-spacing="2"
          fill="#4caf50" opacity=".9">${label}</text>

    <!-- divider lines -->
    <line x1="10" y1="22" x2="78" y2="22" stroke="#2a4a2a" stroke-width=".5"/>
    <line x1="10" y1="102" x2="78" y2="102" stroke="#2a4a2a" stroke-width=".5"/>

    <!-- centre artwork -->
    ${centerContent}

    <!-- value badge -->
    <rect x="30" y="105" width="28" height="13" rx="2" fill="#1a2e1a"/>
    <text x="44" y="115" text-anchor="middle"
          font-family="Georgia, serif" font-size="8" font-weight="bold"
          fill="#a8c878">+${value}</text>

    <!-- bottom label (mirrored, rotated) -->
    <text x="44" y="121" text-anchor="middle"
          font-family="Georgia, serif" font-size="5"
          fill="#4caf50" opacity=".5" transform="rotate(180 44 120)">${label}</text>
  `);
}

const CARDS = {};

/* ── coin ──────────────────────────────────────────────── */
CARDS.coin = _moneyFrame('COIN', `
  <!-- coin circle -->
  <circle cx="44" cy="62" r="22" fill="none" stroke="#4caf50" stroke-width="1.2"/>
  <circle cx="44" cy="62" r="18" fill="#0f220f"/>
  <circle cx="44" cy="62" r="17" fill="none" stroke="#2a4a2a" stroke-width=".5" stroke-dasharray="3 2"/>

  <!-- roman numeral I -->
  <rect x="42" y="50" width="4" height="24" fill="#4caf50" opacity=".85"/>
  <rect x="39" y="50" width="10" height="2.5" fill="#4caf50" opacity=".85"/>
  <rect x="39" y="71.5" width="10" height="2.5" fill="#4caf50" opacity=".85"/>

  <!-- deco cross lines -->
  <line x1="26" y1="62" x2="34" y2="62" stroke="#2a4a2a" stroke-width=".8"/>
  <line x1="54" y1="62" x2="62" y2="62" stroke="#2a4a2a" stroke-width=".8"/>
`, 1);

/* ── coin_bag ──────────────────────────────────────────── */
CARDS.coin_bag = _moneyFrame('COIN BAG', `
  <!-- bag silhouette — pure geometry -->
  <!-- neck -->
  <rect x="37" y="32" width="14" height="6" rx="2" fill="none" stroke="#4caf50" stroke-width="1"/>
  <!-- tie knot -->
  <ellipse cx="44" cy="40" rx="5" ry="3" fill="#0e1a0e" stroke="#4caf50" stroke-width="1"/>
  <!-- body -->
  <path d="M 24 68 Q 24 88 44 90 Q 64 88 64 68 Q 64 48 44 46 Q 24 48 24 68 Z"
        fill="none" stroke="#4caf50" stroke-width="1.2"/>
  <!-- inner seam -->
  <path d="M 30 68 Q 30 82 44 84 Q 58 82 58 68 Q 58 54 44 52 Q 30 54 30 68 Z"
        fill="none" stroke="#2a4a2a" stroke-width=".5"/>
  <!-- V on bag -->
  <text x="44" y="73" text-anchor="middle"
        font-family="Georgia,serif" font-size="14" fill="#4caf50" opacity=".7">V</text>
  <!-- dots -->
  <circle cx="44" cy="38" r="1.2" fill="#4caf50" opacity=".4"/>
`, 5);

/* ── gem ───────────────────────────────────────────────── */
CARDS.gem = _moneyFrame('GEM', `
  <!-- diamond outline — faceted -->
  <polygon points="44,30 62,55 44,88 26,55"
           fill="none" stroke="#4caf50" stroke-width="1.2"/>
  <!-- facet lines -->
  <line x1="44" y1="30" x2="44" y2="88" stroke="#2a4a2a" stroke-width=".7"/>
  <line x1="26" y1="55" x2="62" y2="55" stroke="#2a4a2a" stroke-width=".7"/>
  <line x1="44" y1="30" x2="26" y2="55" stroke="#1e381e" stroke-width=".5"/>
  <line x1="44" y1="30" x2="62" y2="55" stroke="#1e381e" stroke-width=".5"/>
  <line x1="26" y1="55" x2="44" y2="88" stroke="#1e381e" stroke-width=".5"/>
  <line x1="62" y1="55" x2="44" y2="88" stroke="#1e381e" stroke-width=".5"/>
  <!-- top face fill -->
  <polygon points="44,30 62,55 44,55 26,55" fill="#4caf50" opacity=".06"/>
  <!-- gleam -->
  <line x1="38" y1="36" x2="33" y2="44" stroke="#a8c878" stroke-width=".8" stroke-linecap="round"/>
  <line x1="38" y1="36" x2="42" y2="38" stroke="#a8c878" stroke-width=".5" stroke-linecap="round"/>
`, 10);

/* ── bank ──────────────────────────────────────────────── */
CARDS.bank = _svg(88, 124, `
  <defs>${DEFS.noise}</defs>

  <!-- bg — richer, darker green -->
  <rect width="88" height="124" fill="#081408"/>
  <rect width="88" height="124" fill="#fff" opacity=".02" filter="url(#noise)"/>

  <!-- triple border (premium feel) -->
  <rect x="2" y="2" width="84" height="120" rx="4" fill="none" stroke="#4caf50" stroke-width=".5" opacity=".4"/>
  <rect x="4" y="4" width="80" height="116" rx="3" fill="none" stroke="#2a4a2a" stroke-width=".5"/>
  <rect x="7" y="7" width="74" height="110" rx="2" fill="none" stroke="#1a2e1a" stroke-width=".5"/>

  <!-- pediment top -->
  <polygon points="44,12 68,28 20,28" fill="none" stroke="#4caf50" stroke-width=".8" opacity=".7"/>
  <line x1="20" y1="28" x2="68" y2="28" stroke="#4caf50" stroke-width=".8" opacity=".7"/>

  <!-- columns -->
  <rect x="24" y="28" width="3" height="42" fill="#1a3a1a"/>
  <rect x="24.5" y="28" width="2" height="42" fill="none" stroke="#4caf50" stroke-width=".3" opacity=".5"/>
  <rect x="35" y="28" width="3" height="42" fill="#1a3a1a"/>
  <rect x="35.5" y="28" width="2" height="42" fill="none" stroke="#4caf50" stroke-width=".3" opacity=".5"/>
  <rect x="50" y="28" width="3" height="42" fill="#1a3a1a"/>
  <rect x="50.5" y="28" width="2" height="42" fill="none" stroke="#4caf50" stroke-width=".3" opacity=".5"/>
  <rect x="61" y="28" width="3" height="42" fill="#1a3a1a"/>
  <rect x="61.5" y="28" width="2" height="42" fill="none" stroke="#4caf50" stroke-width=".3" opacity=".5"/>

  <!-- base steps -->
  <rect x="18" y="70" width="52" height="4" fill="#1a3a1a" stroke="#4caf50" stroke-width=".3" opacity=".6"/>
  <rect x="14" y="74" width="60" height="4" fill="#1a3a1a" stroke="#4caf50" stroke-width=".3" opacity=".6"/>

  <!-- × 2 badge -->
  <rect x="28" y="82" width="32" height="16" rx="2" fill="#0f220f" stroke="#4caf50" stroke-width=".6"/>
  <text x="44" y="94" text-anchor="middle"
        font-family="Georgia,serif" font-size="11" font-weight="bold"
        fill="#a8c878">x 2</text>

  <!-- label -->
  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia, serif" font-size="5.5" letter-spacing="2.5"
        fill="#4caf50" opacity=".8">BANK</text>
`);


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TRICK CARDS  (red / dark crimson)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function _trickFrame(label, centerContent) {
  return _svg(88, 124, `
    <defs>${DEFS.noise}</defs>
    <rect width="88" height="124" fill="#1a0e10"/>
    <rect width="88" height="124" fill="#fff" opacity=".02" filter="url(#noise)"/>
    <rect x="3" y="3" width="82" height="118" rx="4" fill="none" stroke="#4a1a20" stroke-width=".8"/>
    <rect x="6" y="6" width="76" height="112" rx="3" fill="none" stroke="#3a1218" stroke-width=".4"/>

    <!-- corner diamonds -->
    <polygon points="8,3 12,8 8,13 4,8" fill="#c0404a" opacity=".6"/>
    <polygon points="80,3 84,8 80,13 76,8" fill="#c0404a" opacity=".6"/>
    <polygon points="8,111 12,116 8,121 4,116" fill="#c0404a" opacity=".6"/>
    <polygon points="80,111 84,116 80,121 76,116" fill="#c0404a" opacity=".6"/>

    <text x="44" y="18" text-anchor="middle"
          font-family="Georgia,serif" font-size="5.5" letter-spacing="2"
          fill="#c0404a" opacity=".9">${label}</text>
    <line x1="10" y1="22" x2="78" y2="22" stroke="#3a1218" stroke-width=".5"/>
    <line x1="10" y1="102" x2="78" y2="102" stroke="#3a1218" stroke-width=".5"/>

    ${centerContent}
  `);
}

/* ── fake_merchant ─────────────────────────────────────── */
CARDS.fake_merchant = _trickFrame('MERCHANT', `
  <!-- mask outline -->
  <path d="M 44 30 C 28 30 22 46 24 58 C 26 70 34 76 44 76 C 54 76 62 70 64 58 C 66 46 60 30 44 30 Z"
        fill="none" stroke="#c0404a" stroke-width="1.2"/>
  <!-- eye holes -->
  <ellipse cx="35" cy="50" rx="6" ry="5" fill="#1a0e10" stroke="#c0404a" stroke-width=".8"/>
  <ellipse cx="53" cy="50" rx="6" ry="5" fill="#1a0e10" stroke="#c0404a" stroke-width=".8"/>
  <!-- nose bridge -->
  <path d="M 41 50 Q 44 56 47 50" fill="none" stroke="#4a1a20" stroke-width=".8"/>
  <!-- decorative plume top -->
  <path d="M 44 30 Q 40 20 38 14 M 44 30 Q 44 18 44 12 M 44 30 Q 48 20 50 14"
        fill="none" stroke="#c0404a" stroke-width=".8" opacity=".5"/>
  <!-- smile line -->
  <path d="M 34 64 Q 44 70 54 64" fill="none" stroke="#4a1a20" stroke-width=".8"/>

  <!-- label bottom -->
  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#c0404a" opacity=".6">BLUFF</text>
`);

/* ── spy ───────────────────────────────────────────────── */
CARDS.spy = _trickFrame('SPY', `
  <!-- magnifying glass -->
  <circle cx="40" cy="54" r="18" fill="none" stroke="#c0404a" stroke-width="1.2"/>
  <circle cx="40" cy="54" r="13" fill="none" stroke="#4a1a20" stroke-width=".5"/>
  <!-- lens cross -->
  <line x1="40" y1="42" x2="40" y2="66" stroke="#3a1218" stroke-width=".6"/>
  <line x1="28" y1="54" x2="52" y2="54" stroke="#3a1218" stroke-width=".6"/>
  <!-- handle -->
  <line x1="54" y1="68" x2="65" y2="79"
        stroke="#c0404a" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="54" y1="68" x2="65" y2="79"
        stroke="#4a1a20" stroke-width="1.5" stroke-linecap="round"/>
  <!-- eye inside lens -->
  <ellipse cx="40" cy="54" rx="6" ry="4" fill="none" stroke="#c0404a" stroke-width=".7" opacity=".6"/>
  <circle cx="40" cy="54" r="2" fill="#c0404a" opacity=".5"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#c0404a" opacity=".6">INTEL</text>
`);

/* ── mask ──────────────────────────────────────────────── */
CARDS.mask = _trickFrame('MASK', `
  <!-- theater mask — comedy shape -->
  <path d="M 44 28 C 20 28 18 70 30 76 C 36 80 40 74 44 74 C 48 74 52 80 58 76 C 70 70 68 28 44 28 Z"
        fill="none" stroke="#c0404a" stroke-width="1.2"/>
  <!-- eyes — narrow slits -->
  <path d="M 32 50 Q 36 46 40 50" fill="none" stroke="#c0404a" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M 48 50 Q 52 46 56 50" fill="none" stroke="#c0404a" stroke-width="1.2" stroke-linecap="round"/>
  <!-- forehead ornament -->
  <line x1="44" y1="28" x2="44" y2="20" stroke="#c0404a" stroke-width=".8" opacity=".5"/>
  <circle cx="44" cy="19" r="2" fill="none" stroke="#c0404a" stroke-width=".7" opacity=".5"/>
  <!-- mouth -->
  <path d="M 36 63 Q 44 68 52 63" fill="none" stroke="#4a1a20" stroke-width=".8"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#c0404a" opacity=".6">CONCEAL</text>
`);

/* ── knife ─────────────────────────────────────────────── */
CARDS.knife = _trickFrame('KNIFE', `
  <!-- blade -->
  <polygon points="44,22 48,78 40,78" fill="none" stroke="#c0404a" stroke-width="1.1"/>
  <!-- blade edge highlight -->
  <line x1="44" y1="22" x2="46" y2="65" stroke="#d4a0a0" stroke-width=".5" opacity=".4"/>
  <!-- guard -->
  <rect x="34" y="76" width="20" height="5" rx="1.5"
        fill="none" stroke="#c0404a" stroke-width="1"/>
  <circle cx="34" cy="78.5" r="2" fill="none" stroke="#c0404a" stroke-width=".7"/>
  <circle cx="54" cy="78.5" r="2" fill="none" stroke="#c0404a" stroke-width=".7"/>
  <!-- handle -->
  <rect x="38" y="81" width="12" height="20" rx="2"
        fill="none" stroke="#4a1a20" stroke-width=".8"/>
  <!-- wrap lines -->
  <line x1="38" y1="85" x2="50" y2="85" stroke="#3a1218" stroke-width=".7"/>
  <line x1="38" y1="89" x2="50" y2="89" stroke="#3a1218" stroke-width=".7"/>
  <line x1="38" y1="93" x2="50" y2="93" stroke="#3a1218" stroke-width=".7"/>
  <!-- pommel -->
  <ellipse cx="44" cy="103" rx="6" ry="3" fill="none" stroke="#c0404a" stroke-width=".8"/>

  <text x="44" y="116" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#c0404a" opacity=".6">STEAL</text>
`);


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ALLIANCE CARDS (blue / navy)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function _allianceFrame(label, centerContent) {
  return _svg(88, 124, `
    <defs>${DEFS.noise}</defs>
    <rect width="88" height="124" fill="#0e1018"/>
    <rect width="88" height="124" fill="#fff" opacity=".02" filter="url(#noise)"/>
    <rect x="3" y="3" width="82" height="118" rx="4" fill="none" stroke="#1e2a50" stroke-width=".8"/>
    <rect x="6" y="6" width="76" height="112" rx="3" fill="none" stroke="#18223e" stroke-width=".4"/>

    <!-- corner stars (4-point) -->
    <path d="M 8 4 L 10 8 L 8 12 L 6 8 Z" fill="#5080d0" opacity=".6"/>
    <path d="M 80 4 L 82 8 L 80 12 L 78 8 Z" fill="#5080d0" opacity=".6"/>
    <path d="M 8 112 L 10 116 L 8 120 L 6 116 Z" fill="#5080d0" opacity=".6"/>
    <path d="M 80 112 L 82 116 L 80 120 L 78 116 Z" fill="#5080d0" opacity=".6"/>

    <text x="44" y="18" text-anchor="middle"
          font-family="Georgia,serif" font-size="5.5" letter-spacing="2"
          fill="#5080d0" opacity=".9">${label}</text>
    <line x1="10" y1="22" x2="78" y2="22" stroke="#1e2a50" stroke-width=".5"/>
    <line x1="10" y1="102" x2="78" y2="102" stroke="#1e2a50" stroke-width=".5"/>
    ${centerContent}
  `);
}

/* ── secret_contract ────────────────────────────────────── */
CARDS.secret_contract = _allianceFrame('CONTRACT', `
  <!-- scroll shape -->
  <!-- left roller -->
  <rect x="14" y="28" width="6" height="66" rx="3" fill="none" stroke="#5080d0" stroke-width=".8"/>
  <!-- right roller -->
  <rect x="68" y="28" width="6" height="66" rx="3" fill="none" stroke="#5080d0" stroke-width=".8"/>
  <!-- paper body -->
  <rect x="20" y="32" width="48" height="58" fill="none" stroke="#5080d0" stroke-width=".8"/>
  <!-- text lines -->
  <line x1="26" y1="42" x2="62" y2="42" stroke="#1e2a50" stroke-width=".7"/>
  <line x1="26" y1="48" x2="62" y2="48" stroke="#1e2a50" stroke-width=".7"/>
  <line x1="26" y1="54" x2="58" y2="54" stroke="#1e2a50" stroke-width=".7"/>
  <line x1="26" y1="60" x2="62" y2="60" stroke="#1e2a50" stroke-width=".7"/>
  <line x1="26" y1="66" x2="55" y2="66" stroke="#1e2a50" stroke-width=".7"/>
  <!-- seal -->
  <circle cx="44" cy="77" r="8" fill="none" stroke="#5080d0" stroke-width=".8"/>
  <circle cx="44" cy="77" r="5" fill="none" stroke="#1e2a50" stroke-width=".5"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#5080d0" opacity=".6">PACT</text>
`);

/* ── partnership ────────────────────────────────────────── */
CARDS.partnership = _allianceFrame('PARTNER', `
  <!-- two hands shaking — geometric -->
  <!-- left hand -->
  <path d="M 18 62 L 30 54 L 38 54 L 38 50 L 44 50 L 44 54 L 44 62"
        fill="none" stroke="#5080d0" stroke-width="1.1" stroke-linejoin="round"/>
  <!-- right hand -->
  <path d="M 70 62 L 58 54 L 50 54 L 50 50 L 44 50 L 44 54 L 44 62"
        fill="none" stroke="#5080d0" stroke-width="1.1" stroke-linejoin="round"/>
  <!-- clasp -->
  <rect x="38" y="58" width="12" height="8" rx="1" fill="none" stroke="#5080d0" stroke-width="1"/>
  <!-- cuffs -->
  <rect x="14" y="62" width="14" height="8" rx="2" fill="none" stroke="#1e2a50" stroke-width=".7"/>
  <rect x="60" y="62" width="14" height="8" rx="2" fill="none" stroke="#1e2a50" stroke-width=".7"/>
  <!-- dividing line between them -->
  <line x1="44" y1="32" x2="44" y2="48" stroke="#1e2a50" stroke-width=".5" stroke-dasharray="2 2"/>
  <!-- two circles at top symbolising two parties -->
  <circle cx="32" cy="40" r="8" fill="none" stroke="#5080d0" stroke-width=".7" opacity=".5"/>
  <circle cx="56" cy="40" r="8" fill="none" stroke="#5080d0" stroke-width=".7" opacity=".5"/>
  <line x1="36" y1="38" x2="52" y2="38" stroke="#1e2a50" stroke-width=".5"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#5080d0" opacity=".6">ALLIANCE</text>
`);

/* ── betrayal ───────────────────────────────────────────── */
CARDS.betrayal = _allianceFrame('BETRAYAL', `
  <!-- broken seal -->
  <circle cx="44" cy="52" r="20" fill="none" stroke="#5080d0" stroke-width="1" opacity=".4"/>
  <!-- crack lines through circle -->
  <path d="M 44 32 L 42 44 L 36 50 L 44 72" fill="none" stroke="#c0404a" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M 44 72 L 48 62 L 56 58 L 44 32" fill="none" stroke="#c0404a" stroke-width=".5" opacity=".4"/>
  <!-- broken pieces -->
  <line x1="30" y1="44" x2="38" y2="48" stroke="#5080d0" stroke-width=".6" opacity=".4"/>
  <line x1="50" y1="56" x2="58" y2="60" stroke="#5080d0" stroke-width=".6" opacity=".4"/>
  <!-- X mark -->
  <line x1="36" y1="78" x2="44" y2="88" stroke="#c0404a" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="44" y1="78" x2="36" y2="88" stroke="#c0404a" stroke-width="1.2" stroke-linecap="round"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#c0404a" opacity=".7">TRAITOR</text>
`);

/* ── protection ─────────────────────────────────────────── */
CARDS.protection = _allianceFrame('PROTECT', `
  <!-- shield outline -->
  <path d="M 44 28 L 66 36 L 66 60 Q 66 80 44 90 Q 22 80 22 60 L 22 36 Z"
        fill="none" stroke="#5080d0" stroke-width="1.2"/>
  <!-- inner shield border -->
  <path d="M 44 33 L 61 40 L 61 60 Q 61 76 44 84 Q 27 76 27 60 L 27 40 Z"
        fill="none" stroke="#1e2a50" stroke-width=".5"/>
  <!-- cross motif -->
  <line x1="44" y1="42" x2="44" y2="76" stroke="#5080d0" stroke-width="1" opacity=".5"/>
  <line x1="32" y1="58" x2="56" y2="58" stroke="#5080d0" stroke-width="1" opacity=".5"/>
  <!-- central diamond -->
  <polygon points="44,50 50,58 44,66 38,58" fill="none" stroke="#5080d0" stroke-width=".8"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#5080d0" opacity=".6">SHIELD</text>
`);


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   THIEF CARDS (amber / dark gold)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function _thiefFrame(label, centerContent) {
  return _svg(88, 124, `
    <defs>${DEFS.noise}</defs>
    <rect width="88" height="124" fill="#12100e"/>
    <rect width="88" height="124" fill="#fff" opacity=".025" filter="url(#noise)"/>
    <rect x="3" y="3" width="82" height="118" rx="4" fill="none" stroke="#3a2810" stroke-width=".8"/>
    <rect x="6" y="6" width="76" height="112" rx="3" fill="none" stroke="#2e200c" stroke-width=".4"/>

    <!-- corner triangles -->
    <polygon points="3,3 14,3 3,14" fill="#b07840" opacity=".5"/>
    <polygon points="85,3 74,3 85,14" fill="#b07840" opacity=".5"/>
    <polygon points="3,121 14,121 3,110" fill="#b07840" opacity=".5"/>
    <polygon points="85,121 74,121 85,110" fill="#b07840" opacity=".5"/>

    <text x="44" y="18" text-anchor="middle"
          font-family="Georgia,serif" font-size="5.5" letter-spacing="2"
          fill="#b07840" opacity=".9">${label}</text>
    <line x1="10" y1="22" x2="78" y2="22" stroke="#2e200c" stroke-width=".5"/>
    <line x1="10" y1="102" x2="78" y2="102" stroke="#2e200c" stroke-width=".5"/>
    ${centerContent}
  `);
}

/* ── ninja ──────────────────────────────────────────────── */
CARDS.ninja = _thiefFrame('NINJA', `
  <!-- running silhouette — pure geometry -->
  <!-- head -->
  <circle cx="44" cy="34" r="8" fill="none" stroke="#b07840" stroke-width="1"/>
  <!-- eye slit only (masked) -->
  <line x1="39" y1="34" x2="49" y2="34" stroke="#3a2810" stroke-width="1.5"/>
  <line x1="41" y1="34" x2="47" y2="34" stroke="#b07840" stroke-width=".5"/>
  <!-- torso -->
  <line x1="44" y1="42" x2="44" y2="68" stroke="#b07840" stroke-width="1.2"/>
  <!-- arms in motion -->
  <line x1="44" y1="50" x2="26" y2="44" stroke="#b07840" stroke-width="1.1"/>
  <line x1="44" y1="50" x2="62" y2="58" stroke="#b07840" stroke-width="1.1"/>
  <!-- throwing star at tip of front arm -->
  <polygon points="26,44 28,40 30,44 28,48" fill="none" stroke="#b07840" stroke-width=".7"/>
  <line x1="24" y1="44" x2="32" y2="44" stroke="#b07840" stroke-width=".5"/>
  <line x1="28" y1="40" x2="28" y2="48" stroke="#b07840" stroke-width=".5"/>
  <!-- legs -->
  <line x1="44" y1="68" x2="30" y2="86" stroke="#b07840" stroke-width="1.1"/>
  <line x1="44" y1="68" x2="56" y2="80" stroke="#b07840" stroke-width="1.1"/>
  <!-- speed lines -->
  <line x1="58" y1="40" x2="68" y2="40" stroke="#3a2810" stroke-width=".6" stroke-linecap="round"/>
  <line x1="60" y1="45" x2="70" y2="45" stroke="#3a2810" stroke-width=".6" stroke-linecap="round"/>
  <line x1="62" y1="50" x2="70" y2="50" stroke="#3a2810" stroke-width=".6" stroke-linecap="round"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#b07840" opacity=".6">SHADOW</text>
`);

/* ── wizard ─────────────────────────────────────────────── */
CARDS.wizard = _thiefFrame('WIZARD', `
  <!-- pointed hat -->
  <polygon points="44,22 58,58 30,58" fill="none" stroke="#b07840" stroke-width="1.1"/>
  <line x1="28" y1="58" x2="60" y2="58" stroke="#b07840" stroke-width=".8"/>
  <!-- hat brim -->
  <ellipse cx="44" cy="58" rx="18" ry="4" fill="none" stroke="#b07840" stroke-width=".8"/>
  <!-- star on hat -->
  <polygon points="44,30 45.8,35.5 51.5,35.5 46.9,39 48.7,44.5 44,41 39.3,44.5 41.1,39 36.5,35.5 42.2,35.5"
           fill="none" stroke="#b07840" stroke-width=".6" opacity=".6"/>
  <!-- wand -->
  <line x1="58" y1="62" x2="70" y2="94" stroke="#b07840" stroke-width="1.2" stroke-linecap="round"/>
  <!-- wand tip star -->
  <circle cx="58" cy="62" r="3" fill="none" stroke="#d4b080" stroke-width=".8"/>
  <!-- sparkles -->
  <line x1="64" y1="68" x2="68" y2="64" stroke="#d4b080" stroke-width=".7" stroke-linecap="round"/>
  <line x1="66" y1="72" x2="72" y2="70" stroke="#d4b080" stroke-width=".7" stroke-linecap="round"/>
  <line x1="62" y1="76" x2="64" y2="82" stroke="#d4b080" stroke-width=".6" stroke-linecap="round" opacity=".5"/>
  <!-- swap arrows below hat -->
  <path d="M 24 76 Q 24 86 34 86" fill="none" stroke="#b07840" stroke-width=".8" stroke-linecap="round"/>
  <polygon points="34,83 34,89 38,86" fill="#b07840" opacity=".7"/>
  <path d="M 64 76 Q 64 86 54 86" fill="none" stroke="#b07840" stroke-width=".8" stroke-linecap="round"/>
  <polygon points="54,83 54,89 50,86" fill="#b07840" opacity=".7"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#b07840" opacity=".6">SWAP</text>
`);

/* ── ghost ──────────────────────────────────────────────── */
CARDS.ghost = _thiefFrame('GHOST', `
  <!-- ghost outline — flowing hem -->
  <path d="M 44 26
           C 28 26 24 40 24 54
           L 24 82
           Q 28 78 32 82 Q 36 86 40 82 Q 44 78 48 82 Q 52 86 56 82 Q 60 78 64 82
           L 64 54
           C 64 40 60 26 44 26 Z"
        fill="none" stroke="#b07840" stroke-width="1.1"/>
  <!-- inner subtle shape -->
  <path d="M 44 32 C 33 32 30 43 30 54 L 30 72 L 58 72 L 58 54 C 58 43 55 32 44 32 Z"
        fill="none" stroke="#3a2810" stroke-width=".4"/>
  <!-- hollow eyes -->
  <ellipse cx="37" cy="52" rx="5" ry="6" fill="none" stroke="#b07840" stroke-width=".8"/>
  <ellipse cx="51" cy="52" rx="5" ry="6" fill="none" stroke="#b07840" stroke-width=".8"/>
  <!-- mouth -->
  <path d="M 38 63 Q 44 67 50 63" fill="none" stroke="#3a2810" stroke-width=".8"/>
  <!-- wispy lines at top -->
  <path d="M 38 26 Q 36 18 40 14" fill="none" stroke="#b07840" stroke-width=".6" opacity=".4" stroke-linecap="round"/>
  <path d="M 44 26 Q 44 16 44 12" fill="none" stroke="#b07840" stroke-width=".6" opacity=".4" stroke-linecap="round"/>
  <path d="M 50 26 Q 52 18 48 14" fill="none" stroke="#b07840" stroke-width=".6" opacity=".4" stroke-linecap="round"/>

  <text x="44" y="112" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#b07840" opacity=".6">VANISH</text>
`);

/* ── con_artist ─────────────────────────────────────────── */
CARDS.con_artist = _thiefFrame('CON ARTIST', `
  <!-- top hat -->
  <rect x="33" y="26" width="22" height="22" rx="1" fill="none" stroke="#b07840" stroke-width="1"/>
  <!-- brim -->
  <rect x="26" y="47" width="36" height="4" rx="1" fill="none" stroke="#b07840" stroke-width="1"/>
  <!-- hat band -->
  <rect x="33" y="42" width="22" height="4" fill="none" stroke="#3a2810" stroke-width=".6"/>

  <!-- two overlapping cards (the con) -->
  <rect x="22" y="56" width="26" height="36" rx="2" fill="none" stroke="#b07840" stroke-width="1"
        transform="rotate(-8 35 74)"/>
  <rect x="40" y="56" width="26" height="36" rx="2" fill="none" stroke="#3a2810" stroke-width=".8"
        transform="rotate(6 53 74)"/>
  <!-- star on one card -->
  <polygon points="35,70 36.4,74 41,74 37.3,76.6 38.7,81 35,78.4 31.3,81 32.7,76.6 29,74 33.6,74"
           fill="none" stroke="#b07840" stroke-width=".6"
           transform="rotate(-8 35 74)"/>
  <!-- question mark on other -->
  <text x="54" y="80" text-anchor="middle"
        font-family="Georgia,serif" font-size="12" fill="#3a2810"
        transform="rotate(6 54 74)">?</text>

  <text x="44" y="116" text-anchor="middle"
        font-family="Georgia,serif" font-size="5" letter-spacing="1"
        fill="#b07840" opacity=".6">FORGERY</text>
`);


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PUBLIC API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * buildCard(type, { size, selected, used })
 * returns a .dm-card div with the SVG inside
 */
function buildCard(type, { size = 'normal', selected = false, used = false } = {}) {
  const svg = CARDS[type];
  if (!svg) return null;
  const el = document.createElement('div');
  el.className = [
    'dm-card',
    size === 'lg' ? 'lg' : '',
    selected ? 'selected' : '',
    used ? 'used' : '',
  ].filter(Boolean).join(' ');
  el.dataset.type = type;
  el.innerHTML = svg;
  return el;
}

window.CARDS     = CARDS;
window.buildCard = buildCard;