// ---------- Grafik: Portraits und Piktogramme (alles SVG, Tinte und matte Farben) ----------
const INK='#241f1b';
function portraitSVG(p,size){
  const w=size||150,h=Math.round(w*1.13);const id='g'+p.id;
  const dark=c=>c; // Platzhalter, Töne sind bereits matt gewählt
  let hair='';
  const hc=p.hairc;
  switch(p.hair){
    case 'bun':hair=`<path d="M46 50 Q48 16 76 14 Q106 16 106 50 L102 44 Q96 30 76 28 Q56 30 50 48 Z" fill="${hc}"/><circle cx="104" cy="26" r="12" fill="${hc}"/>`;break;
    case 'cap':hair=`<path d="M38 50 Q40 24 75 22 Q110 24 112 50 L112 56 L38 56 Z" fill="${hc}"/><path d="M32 56 L120 56 L123 62 L30 62 Z" fill="${INK}" opacity=".8"/><rect x="66" y="40" width="18" height="8" fill="${p.acc}"/>`;break;
    case 'long':hair=`<path d="M44 48 Q48 12 78 12 Q108 16 106 48 L108 100 Q104 104 98 100 L98 60 Q92 30 76 30 Q58 32 54 58 L54 102 Q48 106 44 100 Z" fill="${hc}"/>`;break;
    case 'short':hair=`<path d="M46 48 Q48 16 76 14 Q106 16 106 48 L102 46 Q96 30 76 28 Q56 30 50 50 Z" fill="${hc}"/>`;break;
    case 'curly':hair=`<path d="M42 50 Q40 14 76 12 Q112 14 110 50 Q104 44 98 48 Q94 32 76 30 Q58 32 54 48 Q48 44 42 50 Z" fill="${hc}"/><circle cx="46" cy="40" r="8" fill="${hc}"/><circle cx="106" cy="40" r="8" fill="${hc}"/><circle cx="60" cy="22" r="8" fill="${hc}"/><circle cx="92" cy="22" r="8" fill="${hc}"/>`;break;
    case 'bob':hair=`<path d="M44 48 Q48 12 78 12 Q108 16 106 48 L106 84 Q100 90 94 84 L94 56 Q90 32 76 30 Q60 32 58 56 L58 84 Q52 90 46 84 Z" fill="${hc}"/>`;break;
    case 'beanie':hair=`<path d="M42 54 Q44 18 76 16 Q108 18 110 54 Z" fill="${hc}"/><rect x="40" y="48" width="72" height="12" rx="3" fill="${hc}" stroke="${INK}" stroke-width="2" opacity=".95"/><circle cx="76" cy="16" r="6" fill="${hc}"/>`;break;
    default:hair='';
  }
  let cloth='';const cc=p.clothc;
  switch(p.cloth){
    case 'vest':cloth=`<path d="M20 ${h} L30 128 Q75 108 120 128 L130 ${h} Z" fill="${cc}"/><path d="M34 ${h} L40 130 Q58 122 66 120 L68 ${h} Z M116 ${h} L110 130 Q92 122 84 120 L82 ${h} Z" fill="#9a9a9a" opacity=".7"/><rect x="62" y="104" width="26" height="26" fill="${p.skin}"/>`;break;
    case 'headset':cloth=`<path d="M22 ${h} L30 128 Q75 108 120 128 L128 ${h} Z" fill="${cc}"/><rect x="62" y="104" width="26" height="26" fill="${p.skin}"/><path d="M42 54 q-8 24 2 44" stroke="${p.acc}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="42" cy="58" r="7" fill="${p.acc}"/><path d="M44 98 q6 10 18 8" stroke="${p.acc}" stroke-width="3" fill="none"/>`;break;
    case 'jacket':cloth=`<path d="M14 ${h} L26 124 Q75 100 124 124 L136 ${h} Z" fill="${cc}"/><path d="M58 122 L75 150 L92 122 Z" fill="#d6c9a8"/><path d="M68 124 L75 ${h} L82 124 Z" fill="${p.acc}"/><rect x="60" y="100" width="30" height="28" fill="${p.skin}"/>`;break;
    case 'blazer':cloth=`<path d="M20 ${h} L30 126 Q75 106 120 126 L130 ${h} Z" fill="${cc}"/><path d="M58 126 L75 146 L92 126 L92 ${h} L58 ${h} Z" fill="#e8dcc4"/><rect x="63" y="104" width="24" height="26" fill="${p.skin}"/>`;break;
    case 'overall':cloth=`<path d="M20 ${h} L30 126 Q75 110 120 126 L130 ${h} Z" fill="${cc}"/><path d="M54 126 L58 ${h} L66 ${h} L62 128 Z M96 126 L92 ${h} L84 ${h} L88 128 Z" fill="${p.acc}"/><rect x="62" y="104" width="26" height="26" fill="${p.skin}"/>`;break;
    case 'sweater':cloth=`<path d="M18 ${h} L28 124 Q75 104 122 124 L132 ${h} Z" fill="${cc}"/><path d="M56 122 Q75 136 94 122 L94 130 Q75 144 56 130 Z" fill="${INK}" opacity=".35"/><rect x="62" y="104" width="26" height="26" fill="${p.skin}"/>`;break;
    case 'shirt':cloth=`<path d="M20 ${h} L30 126 Q75 108 120 126 L130 ${h} Z" fill="${cc}"/><path d="M62 124 L75 140 L88 124" fill="none" stroke="${INK}" stroke-width="2.5"/><rect x="63" y="104" width="24" height="26" fill="${p.skin}"/>`;break;
    default:cloth=`<path d="M20 ${h} L30 126 Q75 108 120 126 L130 ${h} Z" fill="${cc}"/><rect x="62" y="104" width="26" height="26" fill="${p.skin}"/>`;
  }
  const glasses=p.glasses?`<circle cx="64" cy="62" r="11" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="88" cy="62" r="11" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M75 62 h2" stroke="${INK}" stroke-width="2.5"/>`:'';
  const eye=(cx)=>`<ellipse cx="${cx}" cy="63" rx="6.5" ry="5" fill="#f6f1e6"/><circle cx="${cx+1}" cy="63.5" r="3.6" fill="#3b3a44"/><circle cx="${cx+2.2}" cy="62.2" r="1.3" fill="#fff"/>`;
  return `<svg viewBox="0 0 150 ${h}" width="${w}" height="${h}" aria-label="Portrait ${p.name}">
    <defs><radialGradient id="${id}" cx="50%" cy="38%" r="72%"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="#1b2224"/></radialGradient></defs>
    <rect width="150" height="${h}" fill="url(#${id})"/>
    ${cloth}
    <path d="M48 44 Q50 18 75 16 Q102 18 104 46 L102 88 Q98 112 75 114 Q52 112 48 88 Z" fill="${p.skin}"/>
    <path d="M90 40 L88 92 Q84 110 75 114 Q98 112 102 88 L104 46 Q100 24 90 40 Z" fill="${INK}" opacity=".12"/>
    <ellipse cx="60" cy="76" rx="7" ry="4" fill="${p.acc}" opacity=".22"/><ellipse cx="92" cy="76" rx="7" ry="4" fill="${p.acc}" opacity=".22"/>
    ${eye(64)}${eye(88)}
    <path d="M56 54 q8 -5 16 -1 M80 53 q8 -4 16 1" stroke="${p.hairc}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M76 66 q-4 12 1 16" stroke="${INK}" stroke-width="2" fill="none" opacity=".45"/>
    <path d="M64 92 q12 9 24 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
    ${hair}${glasses}
  </svg>`;
}
// Piktogramme 84×84: Tinte auf Papier, ein Akzent
const PAPER='#f3eadb',RUST='#b8452b',OLIVE='#6f7040',TEAL='#2f6f6a',MUST='#d0a033',SLATE='#7b8a8f',BONE='#d6c9a8';
const ICONS={
  wire:`<path d="M8 30 L28 40 L46 28 L62 42 L76 30" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M40 29 L36 44 L44 40 L39 56" fill="none" stroke="${RUST}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="10" y="58" width="64" height="12" fill="${SLATE}" stroke="${INK}" stroke-width="3"/>`,
  bed:`<rect x="12" y="40" width="60" height="26" fill="${PAPER}" stroke="${INK}" stroke-width="3.5"/><rect x="12" y="34" width="22" height="10" fill="${INK}"/><circle cx="24" cy="30" r="9" fill="${BONE}" stroke="${INK}" stroke-width="3"/><path d="M54 18 v16 M46 26 h16" stroke="${RUST}" stroke-width="5" stroke-linecap="round"/>`,
  truck:`<path d="M6 62 h72" stroke="${INK}" stroke-width="3"/><rect x="18" y="26" width="40" height="28" fill="${OLIVE}" stroke="${INK}" stroke-width="3.5"/><rect x="58" y="36" width="14" height="18" fill="${MUST}" stroke="${INK}" stroke-width="3.5"/><circle cx="28" cy="58" r="6" fill="${INK}"/><circle cx="62" cy="58" r="6" fill="${INK}"/>`,
  twoq:`<circle cx="28" cy="36" r="11" fill="${BONE}" stroke="${INK}" stroke-width="3.5"/><circle cx="56" cy="36" r="11" fill="${BONE}" stroke="${INK}" stroke-width="3.5"/><path d="M12 70 q16 -20 24 -8 M72 70 q-16 -20 -24 -8" fill="none" stroke="${INK}" stroke-width="3.5"/><text x="36" y="22" font-size="22" font-weight="700" fill="${RUST}" font-family="sans-serif">?</text>`,
  folders:`<rect x="10" y="26" width="26" height="34" fill="${MUST}" stroke="${INK}" stroke-width="3"/><rect x="30" y="20" width="26" height="34" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><rect x="50" y="14" width="26" height="34" fill="${MUST}" stroke="${INK}" stroke-width="3"/><circle cx="42" cy="66" r="8" fill="${BONE}" stroke="${INK}" stroke-width="3"/><path d="M26 82 q16 -16 32 0" fill="none" stroke="${INK}" stroke-width="3.5"/>`,
  quarrel:`<circle cx="28" cy="34" r="11" fill="${BONE}" stroke="${INK}" stroke-width="3.5"/><circle cx="56" cy="34" r="11" fill="${BONE}" stroke="${INK}" stroke-width="3.5"/><path d="M12 68 q16 -20 24 -8 M72 68 q-16 -20 -24 -8" fill="none" stroke="${INK}" stroke-width="3.5"/><path d="M36 46 l12 0 M42 40 l0 12" stroke="${RUST}" stroke-width="4" stroke-linecap="round" transform="rotate(45 42 46)"/>`,
  warn:`<path d="M14 66 L42 20 L70 66 Z" fill="${MUST}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M42 36 v14" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="42" cy="58" r="3" fill="${INK}"/>`,
  grab:`<rect x="30" y="30" width="40" height="30" fill="${PAPER}" stroke="${INK}" stroke-width="3.5"/><path d="M30 36 h40" stroke="${INK}" stroke-width="2"/><path d="M8 50 q10 -14 22 -4 q4 10 -2 18 q-10 8 -20 -4" fill="${BONE}" stroke="${INK}" stroke-width="3.5"/><path d="M26 40 l8 -8" stroke="${RUST}" stroke-width="4" stroke-linecap="round"/>`,
  paper:`<rect x="14" y="16" width="56" height="52" fill="${PAPER}" stroke="${INK}" stroke-width="3.5"/><path d="M22 28 h40 M22 36 h40 M22 44 h24 M22 52 h32" stroke="${INK}" stroke-width="3"/><path d="M50 44 h12 v14 h-12 z" fill="${RUST}"/>`,
  bridge:`<path d="M12 60 q14 -34 30 -10 q16 -28 30 10" fill="none" stroke="${TEAL}" stroke-width="5" stroke-linecap="round"/><path d="M26 44 l-8 -4 M58 44 l8 -4" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="42" cy="24" r="6" fill="${MUST}" stroke="${INK}" stroke-width="3"/>`,
  visitor:`<circle cx="42" cy="26" r="11" fill="${BONE}" stroke="${INK}" stroke-width="3.5"/><path d="M18 72 q24 -34 48 0 Z" fill="${INK}"/><path d="M36 44 l6 10 l6 -10" fill="${RUST}"/><rect x="56" y="54" width="18" height="14" fill="${MUST}" stroke="${INK}" stroke-width="3"/>`,
  door:`<rect x="26" y="14" width="34" height="56" fill="${OLIVE}" stroke="${INK}" stroke-width="3.5"/><circle cx="52" cy="44" r="3" fill="${MUST}"/><path d="M8 42 h14 m-6 -6 l6 6 l-6 6" fill="none" stroke="${RUST}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  signal:`<rect x="30" y="12" width="24" height="56" rx="4" fill="${INK}"/><circle cx="42" cy="24" r="7" fill="${RUST}"/><circle cx="42" cy="42" r="7" fill="${BONE}"/><circle cx="42" cy="60" r="7" fill="${BONE}"/><path d="M42 68 v10 M30 78 h24" stroke="${INK}" stroke-width="4"/>`,
  storm:`<path d="M18 50 q-12 0 -10 -12 q2 -12 16 -10 q6 -14 22 -10 q14 2 16 14 q14 0 12 12 q-2 8 -12 8 Z" fill="${SLATE}" stroke="${INK}" stroke-width="3.5"/><path d="M44 50 l-8 14 h10 l-8 16" fill="none" stroke="${MUST}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  chair:`<rect x="24" y="38" width="36" height="8" fill="${OLIVE}" stroke="${INK}" stroke-width="3"/><rect x="24" y="14" width="10" height="26" fill="${OLIVE}" stroke="${INK}" stroke-width="3"/><path d="M28 46 v22 M56 46 v22" stroke="${INK}" stroke-width="4"/><path d="M62 18 l12 12 M74 18 l-12 12" stroke="${RUST}" stroke-width="4" stroke-linecap="round"/>`,
  scales:`<path d="M42 14 v56 M22 70 h40" stroke="${INK}" stroke-width="4"/><path d="M18 26 h48" stroke="${INK}" stroke-width="4"/><path d="M10 46 q8 10 16 0 Z M58 46 q8 10 16 0 Z" fill="${MUST}" stroke="${INK}" stroke-width="3"/><path d="M18 26 v20 M66 26 v20" stroke="${INK}" stroke-width="2.5"/>`,
  alone:`<circle cx="24" cy="34" r="9" fill="${BONE}" stroke="${INK}" stroke-width="3.5"/><path d="M10 66 q14 -22 28 0 Z" fill="${TEAL}" stroke="${INK}" stroke-width="3"/><circle cx="60" cy="30" r="7" fill="${BONE}" stroke="${INK}" stroke-width="3"/><circle cx="72" cy="36" r="7" fill="${BONE}" stroke="${INK}" stroke-width="3"/><path d="M48 66 q20 -20 36 0 Z" fill="${SLATE}" stroke="${INK}" stroke-width="3"/>`,
  chart:`<path d="M14 70 h58 M14 70 v-54" stroke="${INK}" stroke-width="4"/><rect x="22" y="48" width="8" height="22" fill="${OLIVE}"/><rect x="36" y="36" width="8" height="34" fill="${OLIVE}"/><rect x="50" y="42" width="8" height="28" fill="${OLIVE}"/><rect x="64" y="22" width="8" height="48" fill="${RUST}"/>`,
  mic:`<rect x="34" y="12" width="16" height="30" rx="8" fill="${INK}"/><path d="M26 36 q0 18 16 18 q16 0 16 -18 M42 54 v14 M30 68 h24" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="20" r="5" fill="${RUST}"/>`,
  fund:`<circle cx="42" cy="42" r="24" fill="${MUST}" stroke="${INK}" stroke-width="3.5"/><path d="M42 28 v28 M34 36 q8 -6 16 0 q-8 6 -16 12 q8 6 16 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
  wrench:`<path d="M20 64 L48 36" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M46 20 a14 14 0 1 1 18 18 l-8 -2 l-8 -8 Z" fill="${SLATE}" stroke="${INK}" stroke-width="3.5"/><rect x="8" y="66" width="30" height="10" fill="${RUST}" stroke="${INK}" stroke-width="3"/>`,
  arrows:`<rect x="48" y="22" width="26" height="40" fill="${PAPER}" stroke="${INK}" stroke-width="3.5"/><path d="M10 32 h28 m-8 -8 l8 8 l-8 8 M10 54 h28 m-8 -8 l8 8 l-8 8" fill="none" stroke="${TEAL}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  tired:`<circle cx="42" cy="40" r="20" fill="${BONE}" stroke="${INK}" stroke-width="3.5"/><path d="M30 36 q6 4 12 0 M42 36 q6 4 12 0" stroke="${INK}" stroke-width="3" fill="none"/><path d="M34 52 q8 -6 16 0" stroke="${INK}" stroke-width="3" fill="none"/><text x="58" y="26" font-size="18" fill="${RUST}" font-family="sans-serif" font-weight="700">z</text>`,
  doorclose:`<rect x="26" y="14" width="34" height="56" fill="${SLATE}" stroke="${INK}" stroke-width="3.5"/><circle cx="34" cy="44" r="3" fill="${INK}"/><path d="M76 42 h-14 m6 -6 l-6 6 l6 6" fill="none" stroke="${RUST}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  puzzle:`<path d="M16 20 h22 q-4 -10 6 -10 q10 0 6 10 h20 v22 q10 -4 10 6 q0 10 -10 6 v20 h-54 Z" fill="${PAPER}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M40 40 h14 v14 h-14 z" fill="${RUST}"/>`,
  bubbles:`<path d="M10 20 h40 v24 h-26 l-8 8 v-8 h-6 Z" fill="${PAPER}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M34 40 h40 v24 h-6 v8 l-8 -8 h-26 Z" fill="${MUST}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`,
  clockman:`<circle cx="30" cy="34" r="18" fill="${PAPER}" stroke="${INK}" stroke-width="3.5"/><path d="M30 22 v12 l8 6" fill="none" stroke="${RUST}" stroke-width="3.5" stroke-linecap="round"/><circle cx="62" cy="40" r="8" fill="${BONE}" stroke="${INK}" stroke-width="3"/><path d="M48 72 q14 -20 28 0 Z" fill="${TEAL}" stroke="${INK}" stroke-width="3"/>`,
  letter:`<rect x="12" y="24" width="60" height="40" fill="${PAPER}" stroke="${INK}" stroke-width="3.5"/><path d="M12 24 l30 24 l30 -24" fill="none" stroke="${INK}" stroke-width="3.5"/><circle cx="64" cy="22" r="8" fill="${RUST}"/>`,
  tunnel:`<path d="M10 70 v-30 a32 32 0 0 1 64 0 v30 Z" fill="${INK}"/><path d="M22 70 v-24 a20 20 0 0 1 40 0 v24 Z" fill="#3b3a44"/><rect x="34" y="50" width="16" height="12" fill="${SLATE}" stroke="${BONE}" stroke-width="2"/><circle cx="38" cy="56" r="2" fill="${MUST}"/><circle cx="46" cy="56" r="2" fill="${MUST}"/>`,
  eraser:`<rect x="14" y="16" width="52" height="52" fill="${PAPER}" stroke="${INK}" stroke-width="3.5"/><path d="M22 28 h36 M22 38 h36 M22 48 h20" stroke="${INK}" stroke-width="3"/><rect x="44" y="44" width="28" height="14" fill="${RUST}" stroke="${INK}" stroke-width="3" transform="rotate(-30 58 51)"/>`,
  point:`<path d="M20 44 h20 v-20 q0 -6 6 -6 q6 0 6 6 v20 h16 q6 0 6 6 v10 q0 10 -10 10 h-30 q-8 0 -14 -8 Z" fill="${BONE}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M8 24 l8 8 M8 44 h10" stroke="${RUST}" stroke-width="3.5" stroke-linecap="round"/>`,
};
const iconSVG=(key,size)=>`<svg viewBox="0 0 84 84" width="${size||84}" height="${size||84}" class="ico-svg" aria-hidden="true">${ICONS[key]||ICONS.warn}</svg>`;

// ---------- Spielmaterial: Symbole, Würfel, Spielfiguren ----------
// Feste Symbole für Wirkungen. Jede Wirkung sieht auf Karte, Leiste und Abrechnung gleich aus.
const GLYPH={
  v:`<path d="M8 2h4l-1 3 2.2 8.5L10 18l-3.2-4.5L9 5z" fill="${TEAL}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`,
  p:`<path d="M5 2h7l4 4v12H5z" fill="${OLIVE}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 2v4h4M7.5 10h6M7.5 13h6" fill="none" stroke="${PAPER}" stroke-width="1.3"/>`,
  chip:`<circle cx="10" cy="10" r="7" fill="${MUST}" stroke="${INK}" stroke-width="1.6"/><circle cx="10" cy="10" r="3.2" fill="none" stroke="${INK}" stroke-width="1"/>`,
  folge:`<rect x="4" y="2.5" width="12" height="15" rx="1.5" fill="${BONE}" stroke="${INK}" stroke-width="1.4"/><path d="M7 5.5h6l-6 9h6z" fill="none" stroke="${RUST}" stroke-width="1.4" stroke-linejoin="round"/>`,
  sued:`<circle cx="10" cy="10" r="7.5" fill="${RUST}" stroke="${INK}" stroke-width="1.4"/><text x="10" y="14" text-anchor="middle" font-size="11" font-weight="800" fill="${PAPER}" font-family="sans-serif">S</text>`,
  moon:`<path d="M13 3a7 7 0 1 0 4 11A6 6 0 0 1 13 3z" fill="${SLATE}" stroke="${INK}" stroke-width="1.4"/>`,
  lock:`<rect x="4.5" y="9" width="11" height="8.5" rx="1.5" fill="${SLATE}" stroke="${INK}" stroke-width="1.4"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9" fill="none" stroke="${INK}" stroke-width="1.6"/>`,
  ok:`<path d="M3.5 10.5l4 4 9-9" fill="none" stroke="#3f7a3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  boom:`<path d="M10 2l2 5 5-2-3 5 4 3-5 .5L12 18l-2-4-3 4 .5-5L3 12l4-2.5L4 5l5 2z" fill="${MUST}" stroke="${RUST}" stroke-width="1.4" stroke-linejoin="round"/>`,
  pair:`<circle cx="7" cy="8" r="3.2" fill="${BONE}" stroke="${INK}" stroke-width="1.3"/><circle cx="13.5" cy="8" r="3.2" fill="${BONE}" stroke="${INK}" stroke-width="1.3"/><path d="M2.5 17q4.5-6 9 0M8.5 17q4.5-6 9 0" fill="none" stroke="${INK}" stroke-width="1.3"/>`,
  next:`<circle cx="8" cy="10" r="6" fill="${MUST}" stroke="${INK}" stroke-width="1.4"/><path d="M14 10h4m-2-2l2 2-2 2" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`,
  tired:`<path d="M4 15h12M5 15V6M9 15V8M13 15V5" stroke="${RUST}" stroke-width="2.2" stroke-linecap="round"/>`,
  shield:`<path d="M10 2l6 2.5v5c0 4-3 7-6 8.5-3-1.5-6-4.5-6-8.5v-5z" fill="${BONE}" stroke="${INK}" stroke-width="1.4"/><path d="M7 10l2 2 4-4" fill="none" stroke="#3f7a3a" stroke-width="2" stroke-linecap="round"/>`,
};
const glyph=(k,s)=>`<svg viewBox="0 0 20 20" width="${s||16}" height="${s||16}" aria-hidden="true" class="gl">${GLYPH[k]||''}</svg>`;
// Wirkungs-Plakette: Symbol plus Wert, z. B. Vertrauen −1
const pill=(k,val,title,cls)=>`<span class="pill k-${k} ${cls||''}" title="${title||''}">${glyph(k)}${val!==''&&val!=null?`<b>${val}</b>`:''}</span>`;
const sgn=n=>n>0?'+'+n:n<0?'−'+Math.abs(n):'±0';

// Würfel mit Augen (W6)
const PIPS={1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],6:[[28,26],[72,26],[28,50],[72,50],[28,74],[72,74]]};
function dieSVG(n,size,cls){
  const pips=(PIPS[n]||[]).map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8.5" fill="${n===1?RUST:INK}"/>`).join('');
  return `<svg viewBox="0 0 100 100" width="${size||40}" height="${size||40}" class="die ${cls||''}" aria-label="Würfel ${n}"><rect x="5" y="5" width="90" height="90" rx="18" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>${pips}</svg>`;
}
// Zwölfseitiger Würfel für die Eigenart
function d12SVG(n,size,cls){
  const pts=Array.from({length:5},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;return `${50+44*Math.cos(a)},${54+44*Math.sin(a)}`}).join(' ');
  return `<svg viewBox="0 0 100 100" width="${size||48}" height="${size||48}" class="die d12 ${cls||''}" aria-label="W12 ${n}"><polygon points="${pts}" fill="${MUST}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><text x="50" y="66" text-anchor="middle" font-size="36" font-weight="800" fill="${INK}" font-family="sans-serif">${n}</text></svg>`;
}
// Hürde: Würfelumriss mit Zahl
const hurdleSVG=(n,size)=>`<svg viewBox="0 0 100 100" width="${size||34}" height="${size||34}" class="hurdle" aria-label="Hürde ${n}"><rect x="6" y="6" width="88" height="88" rx="18" fill="${PAPER}" stroke="${RUST}" stroke-width="7" stroke-dasharray="14 7"/><text x="50" y="68" text-anchor="middle" font-size="50" font-weight="800" fill="${RUST}" font-family="sans-serif">${n}</text></svg>`;
// Spielfigur für die Leisten
const pawnSVG=(c,size)=>`<svg viewBox="0 0 40 48" width="${size||22}" height="${Math.round((size||22)*1.2)}" class="pawn" aria-hidden="true"><circle cx="20" cy="11" r="8" fill="${c}" stroke="${INK}" stroke-width="3"/><path d="M8 44q0-18 12-24q12 6 12 24z" fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`;
// Kartenrückseite
const cardBackSVG=(w,label)=>`<svg viewBox="0 0 63 88" width="${w||40}" height="${Math.round((w||40)*88/63)}" class="cback" aria-hidden="true"><rect x="2" y="2" width="59" height="84" rx="6" fill="${'#6e4522'}" stroke="${INK}" stroke-width="3"/><rect x="8" y="8" width="47" height="72" rx="3" fill="none" stroke="${MUST}" stroke-width="2" stroke-dasharray="4 3"/><text x="31.5" y="50" text-anchor="middle" font-size="${label?11:22}" font-weight="800" fill="${MUST}" font-family="sans-serif">${label||'NO'}</text></svg>`;
