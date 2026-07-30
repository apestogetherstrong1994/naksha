// lib/glossary.js — running-glossary definitions, in brand voice.
// Client-safe (no server deps). Keys are canonical; aliases map to the same entry.

export const GLOSSARY = {
  nakshatra: {
    term: 'Nakshatra',
    def: 'One of 27 lunar mansions — a finer-grained zodiac based on where the Moon sits. Your birth nakshatra is the core of Vedic personality reading.',
    aliases: ['nakshatras'],
  },
  'janma nakshatra': {
    term: 'Janma nakshatra',
    def: "Your birth star — the nakshatra the Moon occupied at the moment you were born. The 'you' of the chart.",
  },
  pada: {
    term: 'Pada',
    def: 'A quarter of a nakshatra. Each of the 27 nakshatras splits into 4 padas, adding nuance to a placement.',
    aliases: ['padas'],
  },
  rashi: {
    term: 'Rashi',
    def: 'A zodiac sign, sidereal style — computed against the actual stars, which is why it often differs from your Western sun sign.',
    aliases: ['rashis'],
  },
  lagna: {
    term: 'Lagna (ascendant)',
    def: 'The sign rising on the eastern horizon at your birth moment — the lens the whole chart is read through. Needs an accurate birth time.',
    aliases: ['ascendant', 'rising sign'],
  },
  mahadasha: {
    term: 'Mahadasha',
    def: 'The big multi-year life chapter, ruled by one planet. The Vimshottari system cycles through nine of them over 120 years.',
    aliases: ['mahadashas', 'maha dasha'],
  },
  antardasha: {
    term: 'Antardasha',
    def: 'The sub-chapter inside a mahadasha — a shorter period that colors the bigger chapter with a second planet\'s flavor.',
    aliases: ['antardashas', 'antar dasha', 'bhukti'],
  },
  dasha: {
    term: 'Dasha',
    def: 'A planetary period — the Vedic timing system. Which planet "runs" your life right now, and until when.',
    aliases: ['dashas'],
  },
  vimshottari: {
    term: 'Vimshottari',
    def: 'The standard 120-year dasha cycle, calculated from the Moon\'s position at birth. The most-used timing system in Vedic astrology.',
  },
  'sade sati': {
    term: 'Sade Sati',
    def: "Saturn's roughly 7.5-year transit around your natal Moon. Famous for being heavy; the tradition frames it as a pruning season, not a curse.",
    aliases: ['sadesati'],
  },
  manglik: {
    term: 'Manglik',
    def: 'Mars placed in certain houses — famous in marriage matching. Points to heat and independence in partnership; heavily qualified by the classical tradition, despite the gossip.',
    aliases: ['mangal dosha', 'kuja dosha'],
  },
  rahu: {
    term: 'Rahu',
    def: "The Moon's north node — the point of appetite, obsession, and the unfamiliar. Not a planet, but treated as one.",
  },
  ketu: {
    term: 'Ketu',
    def: "The Moon's south node — the point of release, detachment, and past mastery. Rahu's quieter twin.",
  },
  yoga: {
    term: 'Yoga',
    def: 'A special planetary combination in a chart that creates a specific life signature — some famous, some obscure.',
    aliases: ['yogas'],
  },
  'gaja kesari': {
    term: 'Gaja Kesari yoga',
    def: 'The elephant-and-lion combination — Jupiter in a strong angle from your Moon. A classical mark of resilience and growing reputation.',
    aliases: ['gaja kesari yoga'],
  },
  'budha-aditya': {
    term: 'Budha-Aditya yoga',
    def: 'Sun and Mercury together in one sign — the sharp-communicator signature. Intellect wired directly into identity.',
    aliases: ['budha aditya'],
  },
  'chandra-mangala': {
    term: 'Chandra-Mangala yoga',
    def: 'Moon with Mars — emotional courage and entrepreneurial drive. Feelings that convert into action.',
    aliases: ['chandra mangala'],
  },
  kemadruma: {
    term: 'Kemadruma',
    def: 'A solitary Moon with no planetary neighbors — classically read as stretches of emotional self-reliance.',
  },
  kendra: {
    term: 'Kendra',
    def: 'An angular house (1st, 4th, 7th, 10th) — the power positions of a chart. Planets in kendras act strongly.',
    aliases: ['kendras'],
  },
  ayanamsha: {
    term: 'Ayanamsha',
    def: 'The offset between the Western (tropical) and Vedic (sidereal) zodiacs — currently about 24°. Why your sign "changes" between systems.',
  },
  'ashta koota': {
    term: 'Ashta Koota',
    def: 'The classical eight-factor compatibility system — eight Moon-based tests scoring up to 36 points total. The engine behind "guna matching."',
    aliases: ['ashtakoota', 'guna milan', 'kuta', 'koota', 'gun milan'],
  },
  guna: {
    term: 'Gunas',
    def: 'The points in Vedic match-making — 36 total across eight tests. "How many gunas matched?" is the classic auntie question.',
    aliases: ['gunas'],
  },
  varna: {
    term: 'Varna',
    def: 'Kuta #1 (1 point) — temperament class of the Moon signs. About ego and work styles meshing.',
  },
  vashya: {
    term: 'Vashya',
    def: 'Kuta #2 (2 points) — mutual influence. Whether the two of you can actually sway each other.',
  },
  tara: {
    term: 'Tara',
    def: "Kuta #3 (3 points) — birth-star distance. The tradition's read on shared luck and wellbeing.",
  },
  yoni: {
    term: 'Yoni',
    def: 'Kuta #4 (4 points) — instinctive and physical compatibility, mapped through animal symbols for each nakshatra.',
  },
  'graha maitri': {
    term: 'Graha Maitri',
    def: 'Kuta #5 (5 points) — friendship between your Moon-sign rulers. Mental wavelength: do your minds default to alliance?',
  },
  gana: {
    term: 'Gana',
    def: 'Kuta #6 (6 points) — temperament type: deva (gentle), manushya (balanced), or rakshasa (intense). Mismatches read as friction, not villainy.',
  },
  bhakoot: {
    term: 'Bhakoot',
    def: 'Kuta #7 (7 points) — the distance between your Moon signs. About emotional rhythm and pulling in the same life direction.',
    aliases: ['bhakut', 'rashi kuta'],
  },
  nadi: {
    term: 'Nadi',
    def: 'Kuta #8 (8 points, the heaviest) — energetic constitution. Same-nadi matches are the classical caution flag, with well-known exceptions.',
  },
  kundli: {
    term: 'Kundli',
    def: 'The birth chart itself — the snapshot of the sky at your first breath. Also called kundali or janam patri.',
    aliases: ['kundali', 'janam patri', 'janampatri'],
  },
};

// Flat lookup: every alias and canonical key -> canonical key, longest first
// so multi-word terms win over substrings.
export const GLOSSARY_PATTERNS = Object.entries(GLOSSARY)
  .flatMap(([key, e]) => [key, ...(e.aliases || [])].map((alias) => ({ alias, key })))
  .sort((a, b) => b.alias.length - a.alias.length);

// Scan a text for glossary terms; returns canonical keys found.
export function findGlossaryTerms(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const { alias, key } of GLOSSARY_PATTERNS) {
    if (found.has(key)) continue;
    const idx = lower.indexOf(alias);
    if (idx === -1) continue;
    const before = lower[idx - 1], after = lower[idx + alias.length];
    const boundary = (c) => c === undefined || !/[a-z0-9]/.test(c);
    if (boundary(before) && boundary(after)) found.add(key);
  }
  return [...found];
}
