// lib/compat.js — Ashta Koota (guna milan) compatibility scoring.
// Entirely Moon-based (nakshatra + rashi), so it works even when a birth
// time is unknown. Deterministic layer only; the LLM interprets the result.
//
// Prototype simplifications (revisit with astrologer consultant pre-launch):
// - Yoni: same animal 4, sworn-enemy pair 0, else 2 (full 14x14 Brihat
//   Samhita matrix has finer 1/3 gradations).
// - Vashya: same class 2, wild-vs-other 0.5, else 1 (classical tables vary).
// - Varna: classical rule is directional (groom >= bride); we apply it
//   user-first without gendering.

const GANA = ['deva','manushya','rakshasa','manushya','deva','manushya','deva','deva','rakshasa','rakshasa','manushya','manushya','deva','rakshasa','deva','rakshasa','deva','rakshasa','rakshasa','manushya','manushya','deva','rakshasa','rakshasa','manushya','manushya','deva'];

const NADI_CYCLE = [0, 1, 2, 2, 1, 0]; // adi, madhya, antya zigzag per 6 nakshatras
const NADI_NAMES = ['Adi', 'Madhya', 'Antya'];
const nadiOf = (n) => NADI_CYCLE[n % 6];

const YONI = ['horse','elephant','sheep','serpent','serpent','dog','cat','sheep','cat','rat','rat','cow','buffalo','tiger','buffalo','tiger','deer','deer','dog','monkey','mongoose','monkey','lion','horse','lion','cow','elephant'];
const YONI_ENEMIES = [['horse','buffalo'],['elephant','lion'],['sheep','monkey'],['serpent','mongoose'],['dog','deer'],['cat','rat'],['cow','tiger']];

// Varna by rashi element: water=Brahmin(3), fire=Kshatriya(2), earth=Vaishya(1), air=Shudra(0)
const VARNA_RANK = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3];
const VARNA_NAMES = ['Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];

const VASHYA = ['quadruped','quadruped','human','water','wild','human','human','insect','human','water','human','water'];

const RASHI_LORDS = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

const FRIENDS = {
  Sun:     { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
  Moon:    { friends: ['Sun', 'Mercury'], enemies: [] },
  Mars:    { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
  Venus:   { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  Saturn:  { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] },
};

function relation(a, b) {
  if (FRIENDS[a].friends.includes(b)) return 'friend';
  if (FRIENDS[a].enemies.includes(b)) return 'enemy';
  return 'neutral';
}

// Tara: count A->B inclusive mod 9; 3rd (Vipat), 5th (Pratyari), 7th (Vadha) are inauspicious.
function taraGood(fromNak, toNak) {
  const count = ((toNak - fromNak + 27) % 27) + 1;
  const r = count % 9 || 9;
  return ![3, 5, 7].includes(r);
}

export function computeCompatibility(chartA, chartB) {
  const nakA = chartA.planets.find((p) => p.name === 'Moon').nakshatraIndex;
  const nakB = chartB.planets.find((p) => p.name === 'Moon').nakshatraIndex;
  const rasA = chartA.planets.find((p) => p.name === 'Moon').rashiIndex;
  const rasB = chartB.planets.find((p) => p.name === 'Moon').rashiIndex;

  const kutas = [];

  // 1. Varna (1) — temperament class hierarchy
  const varnaPts = VARNA_RANK[rasA] >= VARNA_RANK[rasB] ? 1 : 0;
  kutas.push({
    key: 'varna', name: 'Varna', points: varnaPts, max: 1,
    detail: `${VARNA_NAMES[VARNA_RANK[rasA]]} + ${VARNA_NAMES[VARNA_RANK[rasB]]}`,
    theme: 'ego and work styles',
  });

  // 2. Vashya (2) — mutual influence
  const vA = VASHYA[rasA], vB = VASHYA[rasB];
  const vashyaPts = vA === vB ? 2 : (vA === 'wild' || vB === 'wild') ? 0.5 : 1;
  kutas.push({
    key: 'vashya', name: 'Vashya', points: vashyaPts, max: 2,
    detail: `${vA} + ${vB}`, theme: 'mutual influence and power balance',
  });

  // 3. Tara (3) — birth-star fortune, both directions
  const taraPts = (taraGood(nakA, nakB) ? 1.5 : 0) + (taraGood(nakB, nakA) ? 1.5 : 0);
  kutas.push({
    key: 'tara', name: 'Tara', points: taraPts, max: 3,
    detail: 'nakshatra distance in both directions', theme: 'shared luck and wellbeing',
  });

  // 4. Yoni (4) — instinctive/physical compatibility
  const yA = YONI[nakA], yB = YONI[nakB];
  const yoniEnemy = YONI_ENEMIES.some(([x, y]) => (x === yA && y === yB) || (x === yB && y === yA));
  const yoniPts = yA === yB ? 4 : yoniEnemy ? 0 : 2;
  kutas.push({
    key: 'yoni', name: 'Yoni', points: yoniPts, max: 4,
    detail: `${yA} + ${yB}`, theme: 'physical and instinctive chemistry',
  });

  // 5. Graha Maitri (5) — friendship of Moon-sign lords
  const lordA = RASHI_LORDS[rasA], lordB = RASHI_LORDS[rasB];
  let maitriPts;
  if (lordA === lordB) maitriPts = 5;
  else {
    const ab = relation(lordA, lordB), ba = relation(lordB, lordA);
    const pair = [ab, ba].sort().join('-');
    maitriPts = { 'friend-friend': 5, 'friend-neutral': 4, 'neutral-neutral': 3, 'enemy-friend': 1, 'enemy-neutral': 0.5, 'enemy-enemy': 0 }[pair];
  }
  kutas.push({
    key: 'graha_maitri', name: 'Graha Maitri', points: maitriPts, max: 5,
    detail: `${lordA} + ${lordB}`, theme: 'mental wavelength and friendship',
  });

  // 6. Gana (6) — temperament type
  const gA = GANA[nakA], gB = GANA[nakB];
  let ganaPts;
  if (gA === gB) ganaPts = 6;
  else if ((gA === 'deva' && gB === 'manushya') || (gA === 'manushya' && gB === 'deva')) ganaPts = 5;
  else if (gA === 'rakshasa' || gB === 'rakshasa') ganaPts = gA === 'deva' || gB === 'deva' ? 1 : 0;
  kutas.push({
    key: 'gana', name: 'Gana', points: ganaPts, max: 6,
    detail: `${gA} + ${gB}`, theme: 'core temperament',
  });

  // 7. Bhakoot (7) — Moon-sign distance
  const dist = ((rasB - rasA + 12) % 12) + 1;
  const bhakootBad = [2, 12, 5, 9, 6, 8].includes(dist) && rasA !== rasB;
  kutas.push({
    key: 'bhakoot', name: 'Bhakoot', points: bhakootBad ? 0 : 7, max: 7,
    detail: `Moon signs ${dist}/${((rasA - rasB + 12) % 12) + 1} apart`, theme: 'emotional rhythm and life direction',
  });

  // 8. Nadi (8) — constitutional energy; same nadi is the classical caution
  const nA = nadiOf(nakA), nB = nadiOf(nakB);
  kutas.push({
    key: 'nadi', name: 'Nadi', points: nA === nB ? 0 : 8, max: 8,
    detail: `${NADI_NAMES[nA]} + ${NADI_NAMES[nB]}`, theme: 'energetic constitution',
  });

  const total = +kutas.reduce((s, k) => s + k.points, 0).toFixed(1);
  const band = total >= 31 ? 'exceptional'
    : total >= 25 ? 'very strong'
    : total >= 18 ? 'solid'
    : 'challenging on paper';

  // Manglik cross-check: matching status (both or neither) is classically favorable
  const mA = chartA.features.find((f) => f.key === 'manglik')?.present ?? null;
  const mB = chartB.features.find((f) => f.key === 'manglik')?.present ?? null;
  const manglik = {
    a: mA, b: mB,
    matched: mA !== null && mB !== null ? mA === mB : null,
  };

  return { kutas, total, max: 36, band, manglik };
}
