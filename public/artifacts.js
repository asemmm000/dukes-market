// كل قطعة: SVG inline كامل، قابل للتلوين والتحريك
const ARTIFACT_SVGS = {
  crown: `
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" class="artifact-svg">
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFD700"/>
          <stop offset="100%" style="stop-color:#B8860B"/>
        </linearGradient>
        <filter id="crownGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- قاعدة التاج -->
      <rect x="10" y="55" width="80" height="18" rx="4" fill="url(#crownGrad)" stroke="#8B6914" stroke-width="1.5"/>
      <!-- أسنان التاج -->
      <polygon points="10,55 10,20 28,38 50,10 72,38 90,20 90,55" fill="url(#crownGrad)" stroke="#8B6914" stroke-width="1.5"/>
      <!-- الجواهر -->
      <circle cx="50" cy="42" r="6" fill="#E8115B" stroke="#8B6914" stroke-width="1" filter="url(#crownGlow)"/>
      <circle cx="26" cy="52" r="4" fill="#1178E8" stroke="#8B6914" stroke-width="1"/>
      <circle cx="74" cy="52" r="4" fill="#11E84A" stroke="#8B6914" stroke-width="1"/>
      <circle cx="15" cy="60" r="3" fill="#FFD700"/>
      <circle cx="85" cy="60" r="3" fill="#FFD700"/>
      <!-- نقوش -->
      <line x1="20" y1="58" x2="80" y2="58" stroke="#8B6914" stroke-width="0.8" stroke-dasharray="3,2"/>
    </svg>`,

  sword: `
    <svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg" class="artifact-svg">
      <defs>
        <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#C0C0C0"/>
          <stop offset="50%" style="stop-color:#F8F8FF"/>
          <stop offset="100%" style="stop-color:#808080"/>
        </linearGradient>
        <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#8B4513"/>
          <stop offset="100%" style="stop-color:#D2691E"/>
        </linearGradient>
      </defs>
      <!-- الشفرة -->
      <polygon points="20,4 16,85 24,85" fill="url(#bladeGrad)" stroke="#696969" stroke-width="0.8"/>
      <!-- حارس اليد -->
      <rect x="5" y="83" width="30" height="8" rx="3" fill="#B8860B" stroke="#8B6914" stroke-width="1"/>
      <circle cx="5" cy="87" r="3" fill="#FFD700"/>
      <circle cx="35" cy="87" r="3" fill="#FFD700"/>
      <!-- المقبض -->
      <rect x="15" y="91" width="10" height="22" rx="2" fill="url(#handleGrad)" stroke="#5C3317" stroke-width="1"/>
      <!-- لف المقبض -->
      <line x1="15" y1="95" x2="25" y2="95" stroke="#8B6914" stroke-width="1.5"/>
      <line x1="15" y1="99" x2="25" y2="99" stroke="#8B6914" stroke-width="1.5"/>
      <line x1="15" y1="103" x2="25" y2="103" stroke="#8B6914" stroke-width="1.5"/>
      <line x1="15" y1="107" x2="25" y2="107" stroke="#8B6914" stroke-width="1.5"/>
      <!-- نهاية المقبض -->
      <circle cx="20" cy="114" r="5" fill="#B8860B" stroke="#8B6914" stroke-width="1"/>
      <circle cx="20" cy="114" r="2" fill="#FFD700"/>
      <!-- بريق الشفرة -->
      <line x1="19" y1="10" x2="20" y2="40" stroke="white" stroke-width="0.5" opacity="0.6"/>
    </svg>`,

  scroll: `
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" class="artifact-svg">
      <defs>
        <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#F5DEB3"/>
          <stop offset="100%" style="stop-color:#DEB887"/>
        </linearGradient>
      </defs>
      <!-- ظل -->
      <ellipse cx="52" cy="72" rx="38" ry="5" fill="#00000033"/>
      <!-- أسطوانة يسار -->
      <ellipse cx="16" cy="40" rx="8" ry="36" fill="#8B6914"/>
      <ellipse cx="16" cy="40" rx="6" ry="34" fill="#B8860B"/>
      <!-- أسطوانة يمين -->
      <ellipse cx="84" cy="40" rx="8" ry="36" fill="#8B6914"/>
      <ellipse cx="84" cy="40" rx="6" ry="34" fill="#B8860B"/>
      <!-- ورق البردي -->
      <rect x="16" y="10" width="68" height="60" fill="url(#scrollGrad)" rx="2"/>
      <!-- نصوص وهمية -->
      <line x1="26" y1="22" x2="74" y2="22" stroke="#8B6914" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="26" y1="29" x2="70" y2="29" stroke="#8B6914" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="26" y1="36" x2="74" y2="36" stroke="#8B6914" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="26" y1="43" x2="65" y2="43" stroke="#8B6914" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="26" y1="50" x2="74" y2="50" stroke="#8B6914" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="26" y1="57" x2="68" y2="57" stroke="#8B6914" stroke-width="1.2" stroke-linecap="round"/>
      <!-- ختم -->
      <circle cx="50" cy="40" r="10" fill="#B8860B" opacity="0.3" stroke="#8B6914" stroke-width="1"/>
      <text x="50" y="44" text-anchor="middle" font-size="10" fill="#8B6914">✦</text>
    </svg>`,

  ring: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="artifact-svg">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFD700"/>
          <stop offset="50%" style="stop-color:#FFF8DC"/>
          <stop offset="100%" style="stop-color:#B8860B"/>
        </linearGradient>
        <radialGradient id="gemGrad" cx="40%" cy="35%">
          <stop offset="0%" style="stop-color:#FF69B4"/>
          <stop offset="100%" style="stop-color:#8B0045"/>
        </radialGradient>
        <filter id="gemGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- الخاتم -->
      <ellipse cx="50" cy="68" rx="28" ry="10" fill="none" stroke="url(#ringGrad)" stroke-width="10"/>
      <!-- قاعدة الفص -->
      <path d="M 30 58 Q 50 40 70 58" fill="url(#ringGrad)" stroke="#8B6914" stroke-width="1"/>
      <!-- الفص -->
      <ellipse cx="50" cy="40" rx="18" ry="22" fill="url(#ringGrad)" stroke="#8B6914" stroke-width="1.5"/>
      <!-- الجوهرة -->
      <ellipse cx="50" cy="38" rx="11" ry="13" fill="url(#gemGrad)" filter="url(#gemGlow)"/>
      <!-- بريق -->
      <ellipse cx="45" cy="32" rx="4" ry="3" fill="white" opacity="0.5" transform="rotate(-20,45,32)"/>
      <ellipse cx="43" cy="31" rx="1.5" ry="1" fill="white" opacity="0.8"/>
    </svg>`,

  vase: `
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" class="artifact-svg">
      <defs>
        <linearGradient id="vaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#1a4a7a"/>
          <stop offset="40%" style="stop-color:#2563ab"/>
          <stop offset="60%" style="stop-color:#4a90d9"/>
          <stop offset="100%" style="stop-color:#1a4a7a"/>
        </linearGradient>
      </defs>
      <!-- ظل -->
      <ellipse cx="50" cy="115" rx="28" ry="5" fill="#00000033"/>
      <!-- جسم المزهرية -->
      <path d="M 35 15 Q 28 18 26 30 Q 22 50 24 75 Q 26 95 50 108 Q 74 95 76 75 Q 78 50 74 30 Q 72 18 65 15 Z"
            fill="url(#vaseGrad)" stroke="#1a3a6a" stroke-width="1.5"/>
      <!-- العنق -->
      <path d="M 35 15 Q 38 8 42 6 L 58 6 Q 62 8 65 15"
            fill="url(#vaseGrad)" stroke="#1a3a6a" stroke-width="1.5"/>
      <!-- فتحة -->
      <ellipse cx="50" cy="6" rx="12" ry="4" fill="#0d2a4a" stroke="#1a3a6a" stroke-width="1"/>
      <!-- زخارف -->
      <path d="M 28 45 Q 50 38 72 45" stroke="#FFD700" stroke-width="1.5" fill="none"/>
      <path d="M 26 60 Q 50 53 74 60" stroke="#FFD700" stroke-width="1.5" fill="none"/>
      <!-- نقش وردة -->
      <circle cx="50" cy="75" r="10" fill="none" stroke="#FFD700" stroke-width="1"/>
      <circle cx="50" cy="75" r="4" fill="#FFD700" opacity="0.6"/>
      <line x1="50" y1="64" x2="50" y2="86" stroke="#FFD700" stroke-width="0.8"/>
      <line x1="39" y1="75" x2="61" y2="75" stroke="#FFD700" stroke-width="0.8"/>
      <!-- بريق -->
      <ellipse cx="36" cy="40" rx="4" ry="12" fill="white" opacity="0.12" transform="rotate(-10,36,40)"/>
    </svg>`,

  rareCoin: `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="artifact-svg">
      <defs>
        <radialGradient id="coinGrad" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:#FFF8DC"/>
          <stop offset="60%" style="stop-color:#FFD700"/>
          <stop offset="100%" style="stop-color:#B8860B"/>
        </radialGradient>
        <filter id="coinShadow">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000066"/>
        </filter>
      </defs>
      <!-- حافة خارجية -->
      <circle cx="50" cy="50" r="44" fill="#8B6914" filter="url(#coinShadow)"/>
      <!-- الوجه الرئيسي -->
      <circle cx="50" cy="50" r="40" fill="url(#coinGrad)"/>
      <!-- خطوط الحافة (حز) -->
      <circle cx="50" cy="50" r="37" fill="none" stroke="#B8860B" stroke-width="1.5" stroke-dasharray="4,2"/>
      <!-- الصورة (رأس ملك مبسّط) -->
      <circle cx="50" cy="38" r="12" fill="#B8860B" opacity="0.4"/>
      <ellipse cx="50" cy="32" rx="7" ry="6" fill="#B8860B" opacity="0.5"/>
      <!-- التاج الصغير -->
      <polygon points="43,28 46,22 50,26 54,22 57,28" fill="#B8860B" opacity="0.6"/>
      <!-- النص -->
      <text x="50" y="60" text-anchor="middle" font-size="7" fill="#8B6914" font-family="serif">DUKES MARKET</text>
      <text x="50" y="70" text-anchor="middle" font-size="9" fill="#8B6914" font-family="serif">✦ I ✦</text>
      <!-- بريق -->
      <ellipse cx="36" cy="36" rx="8" ry="5" fill="white" opacity="0.25" transform="rotate(-30,36,36)"/>
    </svg>`,

  painting: `
    <svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" class="artifact-svg">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#1a0a2e"/>
          <stop offset="100%" style="stop-color:#4a1a6a"/>
        </linearGradient>
      </defs>
      <!-- الإطار الخارجي -->
      <rect x="3" y="3" width="94" height="84" rx="3" fill="#6B4423" stroke="#4a2e10" stroke-width="1"/>
      <!-- الإطار الداخلي ذهبي -->
      <rect x="7" y="7" width="86" height="76" rx="2" fill="none" stroke="#B8860B" stroke-width="3"/>
      <rect x="10" y="10" width="80" height="70" rx="1" fill="none" stroke="#FFD700" stroke-width="0.8"/>
      <!-- اللوحة نفسها -->
      <rect x="11" y="11" width="78" height="68" fill="url(#skyGrad)"/>
      <!-- سماء ونجوم -->
      <circle cx="25" cy="22" r="1.2" fill="white" opacity="0.9"/>
      <circle cx="45" cy="17" r="1" fill="white" opacity="0.7"/>
      <circle cx="65" cy="20" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="80" cy="15" r="0.8" fill="white" opacity="0.6"/>
      <circle cx="55" cy="25" r="1" fill="white" opacity="0.9"/>
      <circle cx="35" cy="30" r="0.7" fill="white" opacity="0.5"/>
      <!-- قمر -->
      <circle cx="75" cy="25" r="8" fill="#FFF8DC" opacity="0.9"/>
      <circle cx="78" cy="22" r="7" fill="#4a1a6a"/>
      <!-- جبال -->
      <polygon points="11,79 35,40 55,65 70,45 89,79" fill="#2a1245"/>
      <polygon points="11,79 30,50 50,72" fill="#1a0a2e"/>
      <!-- مياه -->
      <rect x="11" y="72" width="78" height="7" fill="#0d1a4a" opacity="0.8"/>
      <path d="M 11 74 Q 30 71 50 74 Q 70 77 89 74" stroke="#4a6aaa" stroke-width="1" fill="none"/>
      <!-- توقيع -->
      <text x="82" y="77" font-size="5" fill="#B8860B" font-style="italic">D.M</text>
      <!-- زوايا الإطار -->
      <circle cx="7" cy="7" r="3" fill="#FFD700"/>
      <circle cx="93" cy="7" r="3" fill="#FFD700"/>
      <circle cx="7" cy="83" r="3" fill="#FFD700"/>
      <circle cx="93" cy="83" r="3" fill="#FFD700"/>
    </svg>`,
};

// دالة للحصول على SVG بطيف ملوّن للحالة "مزيّف"
function getArtifactSVG(artifactId, { fake = false, size = 'md', glowing = false } = {}) {
  const svg = ARTIFACT_SVGS[artifactId] || ARTIFACT_SVGS.rareCoin;
  const sizeMap = { sm: '48px', md: '80px', lg: '140px', xl: '200px' };
  const wrapper = document.createElement('div');
  wrapper.className = `artifact-wrap ${glowing ? 'artifact-glow' : ''} ${fake ? 'artifact-fake' : ''}`;
  wrapper.style.width = sizeMap[size] || sizeMap.md;
  wrapper.style.height = sizeMap[size] || sizeMap.md;
  wrapper.innerHTML = svg;
  return wrapper;
}

window.ARTIFACT_SVGS = ARTIFACT_SVGS;
window.getArtifactSVG = getArtifactSVG;