// lib/knowledge.mjs — Naksha interpretation knowledge base (starter set)
// Written in brand voice: warm, specific, plain-English glosses, constructive framing.
// The LLM receives ONLY the entries relevant to a given chart. Expand with an astrologer
// consultant before launch; keep every entry consistent with classical principles.

export const DASHA_LORDS = {
  Sun: {
    theme: 'visibility and selfhood',
    text: "A Sun mahadasha (the multi-year chapter ruled by the Sun) turns the lights on you. Career, reputation, father-figures, and the question 'who am I when everyone's watching' come to the front. It rewards stepping up and claiming authorship of your life, and it quietly punishes hiding. Ego bruises are part of the curriculum, not a sign it's going wrong.",
    love: "In relationships, this chapter asks whether you're seen — actually seen — by your person. Partnerships that require you to shrink tend to strain now.",
    career: "Promotions, title changes, and visibility moves land better in this period than quiet grinding. Take the stage when it's offered.",
  },
  Moon: {
    theme: 'feeling and belonging',
    text: "The Moon's chapter softens everything. Home, mother, emotional life, and your inner tides take priority over external conquest. People often move house, deepen family ties, or finally deal with feelings they'd outrun. Your sensitivity is turned up — treat that as data, not weakness.",
    love: "Emotional safety becomes non-negotiable. Chemistry without comfort stops being enough.",
    career: "Work that involves care, community, or the public tends to flow; pure status-chasing feels hollow now.",
  },
  Mars: {
    theme: 'drive and courage',
    text: "Mars runs a short, hot chapter — seven years of energy, ambition, conflict, and courage. Things move fast: bold moves pay off, but so does learning where your temper and impatience live. Physical outlets aren't optional in this period; they're how the engine stays cool.",
    love: "Passion spikes, and so do arguments. The lesson is fighting *for* the relationship instead of *in* it.",
    career: "Competitive environments, launches, and hard deadlines suit this chapter. Channel it or it channels you.",
  },
  Rahu: {
    theme: 'hunger and the unfamiliar',
    text: "Rahu (the Moon's north node — the point of obsession and appetite) rules an eighteen-year chapter of wanting more. Foreign lands, unconventional paths, technology, sudden rises — Rahu specializes in getting you what you crave and then asking if you actually wanted it. For diaspora kids, Rahu periods often echo the immigrant leap itself: unfamiliar territory, high stakes, real rewards. Stay honest about *why* you want what you want, and this chapter builds empires.",
    love: "Attractions in Rahu periods run intense and unconventional — different backgrounds, whirlwinds, 'not my usual type.' Exciting, real, and worth a slow second look before big commitments.",
    career: "Unconventional bets, startups, foreign moves, and new industries are Rahu's home turf. The ceiling is high; read the fine print.",
  },
  Jupiter: {
    theme: 'growth and meaning',
    text: "Jupiter's sixteen-year chapter is classically the most generous — expansion, wisdom, teachers, children, and luck that looks suspiciously like preparation meeting opportunity. Things grow now: careers, families, waistlines, worldviews. The invitation is to grow in the direction of meaning, not just size.",
    love: "Marriage, children, and 'making it official' are classic Jupiter-period events. Partners who help you grow are the ones that last.",
    career: "Mentors matter enormously now. Teaching, advising, law, finance, and anything requiring judgment tend to flourish.",
  },
  Saturn: {
    theme: 'structure and maturity',
    text: "Saturn's nineteen-year chapter has a hard reputation it only half deserves. Yes, it's slower and heavier — Saturn strips what's flimsy and keeps what's real. But everything you build in a Saturn period is built to last: the career with foundations, the relationship that survives boredom, the discipline that becomes identity. Delay is not denial here; it's quality control.",
    love: "Saturn periods favor the real over the shiny. Age gaps, long timelines, and serious commitments are classic. What survives Saturn tends to survive, period.",
    career: "Slow, structural wins: institutions, expertise, seniority. The compound interest chapter of a career.",
  },
  Mercury: {
    theme: 'mind and connection',
    text: "Mercury's seventeen-year chapter quickens the mind. Communication, commerce, learning, writing, deals, and sheer social throughput all rise. It's a brilliant period for building skills and networks — the risk is scattering yourself across a hundred clever things and finishing none.",
    love: "You fall for minds now. Banter is the love language; being misunderstood is the deal-breaker.",
    career: "Writing, media, analytics, trade, and anything that monetizes cleverness runs hot. Pick three things, not thirty.",
  },
  Ketu: {
    theme: 'release and depth',
    text: "Ketu (the Moon's south node — the point of detachment) rules a short seven-year chapter that quietly rearranges your relationship with wanting itself. Things you gripped loosen; spiritual questions get loud; what's inessential falls away, sometimes before you agreed to let it go. It can feel disorienting from inside and looks like profound growth from ten years later.",
    love: "Ketu periods can make you allergic to performative romance. What remains is either deeply real or clearly done.",
    career: "External ambition often cools while mastery deepens. Research, spirituality, healing, and specialist crafts suit the chapter.",
  },
  Venus: {
    theme: 'love and enjoyment',
    text: "Venus runs the longest chapter — twenty years of relationships, beauty, comfort, art, and money in its enjoyable forms. Life sweetens and the stakes move to the heart: who you love, what you value, how much pleasure you'll actually let yourself have. The shadow side is comfort becoming complacency.",
    love: "This is *the* marriage-and-love mahadasha in the classical texts. Relationships begun, deepened, or formalized now carry the chapter's signature.",
    career: "Aesthetics, luxury, entertainment, finance, and people-centered work flourish. Your taste becomes a professional asset.",
  },
};

export const NAKSHATRAS_KB = {
  'Ashwini': "Born under Ashwini — the swift healers' star. You start fast, hate waiting rooms of any kind, and have a gift for arriving exactly when someone needs rescuing. Your growth edge: finishing what you brilliantly begin.",
  'Bharani': "Bharani natives carry more intensity than they advertise. You metabolize big experiences — endings, beginnings, the whole cycle — better than almost anyone, and people sense they can bring you their heaviest things.",
  'Krittika': "Krittika is the blade and the flame: you cut through nonsense and cook raw situations into something nourishing. Your honesty is a service; your delivery is the lifelong tuning project.",
  'Rohini': "Rohini is the Moon's favorite home — magnetic, sensual, creative, built for beauty and comfort. Things (and people) grow around you. Watch the tendency to be adored rather than known.",
  'Mrigashira': "The searching deer. Mrigashira natives are professionally curious — always one more question, one more path, one more 'but what if.' Your restlessness is a compass, not a flaw; it just needs a worthy quest.",
  'Ardra': "Ardra is the storm star — you feel things at full voltage and see truths others politely avoid. After your storms, the air is clearer for everyone. Emotional intensity is your feature, not your bug.",
  'Punarvasu': "The return of the light. Punarvasu natives are renewal specialists — you can rebuild after almost anything, and your optimism is structural, not naive. Home matters; you carry yours with you.",
  'Pushya': "Pushya is classically the most nourishing nakshatra — the caretaker's star. People stabilize around you. Your challenge is receiving even a fraction of the care you give.",
  'Ashlesha': "Ashlesha natives read rooms, subtexts, and people with almost unfair precision. That perceptiveness can heal or handle; choosing which is your lifelong power move.",
  'Magha': "Magha is the throne of the ancestors — you carry lineage whether you asked to or not. Questions of heritage, family name, and what you owe the past hit different for you. Lead like the ancestors are watching, because per this star, they are.",
  'Purva Phalguni': "The star of pleasure and performance. You bring warmth, romance, and occasion-energy into ordinary rooms. Rest without guilt is the advanced skill.",
  'Uttara Phalguni': "The star of the generous contract — you're the friend who shows up with a plan and stays through cleanup. Partnerships, formal and romantic, are where your life happens. Choose co-signers, not passengers.",
  'Hasta': "Hasta is the hand — skill, craft, wit, and the ability to actually *make* the thing others only discuss. Your hands (literal or metaphorical) are the career.",
  'Chitra': "The jewel star. Chitra natives design — lives, rooms, images, selves. You see the more beautiful version of everything. The edge: letting things be finished instead of perfect.",
  'Swati': "The independent wind. Swati natives need room — in relationships, careers, and conversations. You bend without breaking and scatter seeds widely. Roots are a choice you make late and well.",
  'Vishakha': "The star of the focused goal. Vishakha natives are triumphant finishers — patient, strategic, and a little relentless once the target locks. Make sure the goal deserves you.",
  'Anuradha': "The friendship star. Anuradha natives build bridges — across groups, cultures, and awkward silences. Devotion is your engine; being far from 'home' and thriving anyway is a classic Anuradha life.",
  'Jyeshtha': "The elder star. You were probably responsible before it was age-appropriate. Authority sits naturally on you, along with the private weight of it. Letting others carry things is the growth arc.",
  'Mula': "The root star. Mula natives dig to the bottom of things — comfortable half-truths don't survive you. Your life may include real uprootings; what you rebuild afterward is always truer.",
  'Purva Ashadha': "The invincible star. Early-victory energy: conviction, declaration, momentum. You're persuasive enough that your main responsibility is being right about what you're persuading people toward.",
  'Uttara Ashadha': "The later victory — the win that comes from endurance rather than flash. Universal principles matter to you; you'd rather lose correctly than win cheap. You usually win anyway, eventually.",
  'Shravana': "The listening star. Shravana natives learn by ear — stories, languages, traditions, the thing someone didn't quite say. You're the keeper of other people's histories. Your own story deserves a narrator too.",
  'Dhanishta': "The star of rhythm and abundance. Music, timing, and group harmony come naturally; you know when to enter and when to rest. Wealth follows tempo for you — yours, not everyone else's.",
  'Shatabhisha': "The hundred healers. A solitary, systems-minded star: you see how the whole thing works and how to fix it, and you need real privacy to recharge. Your independence isn't distance; it's method.",
  'Purva Bhadrapada': "The intense visionary star. You run deeper currents than casual company suspects — big questions, transformation, the occasional productive brood. Depth is the gift; sharing it is the practice.",
  'Uttara Bhadrapada': "The deep-ocean star. Legendary steadiness: you absorb chaos and return calm. People anchor to you in storms. Your stillness is strength — just don't let it become hiding.",
  'Revati': "The last nakshatra — the guide who gets travelers safely across. Revati natives are protectors of the vulnerable, natural finishers of cycles, kind past the point of convenience. The world's softness lives with you; guard your reserves.",
};

export const FEATURES_KB = {
  manglik: "Manglik status (Mars in certain houses) has a scary reputation in auntie circles that the classical tradition itself heavily qualifies — many charts cancel it outright, and two Manglik partners classically neutralize each other. In practice it points to heat in partnership: intensity, independence, and the need for a partner who isn't fragile. It is not a curse and modern astrologers treat it with far more nuance than wedding-season gossip does.",
  gaja_kesari_yoga: "Gaja Kesari — the elephant-and-lion yoga, formed by Jupiter in a strong angle from your Moon — is one of the classic marks of respected, resilient people. It suggests a mind that recovers, a reputation that grows over time, and elders' blessings that actually landed.",
  budha_aditya_yoga: "Budha-Aditya (Sun and Mercury together) is the sharp-communicator combination: intellect wired directly into identity. Classic signature of writers, analysts, and people who win arguments they probably shouldn't have entered.",
  chandra_mangala_yoga: "Chandra-Mangala (Moon with Mars) pairs feeling with drive — emotional courage, entrepreneurial instinct, and a talent for turning feelings into action (and occasionally into income). The practice is pausing between the feeling and the action.",
  kemadruma_indication: "A solitary Moon (kemadruma indication) classically suggests stretches of emotional self-reliance — feeling like you carried things alone. Modern reading: you built internal resources most people never had to develop. The invitation of adulthood is letting support in anyway.",
  sade_sati_now: "You're currently in Sade Sati — Saturn's roughly seven-and-a-half-year transit around your natal Moon. Auntie lore treats it as doom; the tradition treats it as a pruning season. Things that are structurally weak in your life get stress-tested; what survives is genuinely yours. Heavier, yes. Meaningless, never. It ends, and people routinely look back on it as the years that made them.",
};

export const COMPAT_KB = {
  framing: "Ashta Koota (the classical eight-test, 36-point Moon match) is a map of a relationship's textures, not a grade on the relationship. Traditional astrologers treat it as a first screen that full-chart factors routinely override — Venus, the 7th house, and dashas all outrank it. Plenty of thriving marriages matched low; plenty of 30+ matches still had to do the work.",
  nadi_zero: "A Nadi score of zero is the classic auntie alarm — and the most heavily qualified result in the whole system. Classical texts list several outright exceptions (same rashi with different nakshatras, friendly sign lords, and others), and traditions prescribe remedies rather than refusals. Modern astrologers read it as: pay attention to health, energy, and how you recharge as a couple.",
  bhakoot_zero: "A Bhakoot zero (the 6/8, 5/9, or 2/12 sign distances) classically points to friction in emotional rhythm — money, family direction, timing of big moves. It is also one of the most commonly cancelled doshas: matching or friendly sign lords soften it substantially. It describes a pattern to manage, not a verdict.",
  gana_low: "A low Gana score means one of you runs gentler and one runs more intense — deva and rakshasa temperaments. The tradition flags it as friction; lived experience often reads it as complementary heat, provided both people respect the difference instead of trying to convert each other.",
  manglik_matched: "Both charts carrying Manglik status is classically a non-issue — two Mangliks neutralize each other. The heat matches.",
  manglik_mismatched: "One chart is Manglik and the other isn't — the classic wedding-season worry. The tradition itself heavily qualifies it: many placements cancel Manglik outright, and modern astrologers treat it as a note about intensity mismatch in partnership, not a prohibition.",
};

// Retrieval for compatibility readings: framing + notes for the flagged results.
export function relevantCompatKnowledge(compat) {
  const kb = { framing: COMPAT_KB.framing };
  const k = Object.fromEntries(compat.kutas.map((x) => [x.key, x]));
  if (k.nadi?.points === 0) kb.nadi = COMPAT_KB.nadi_zero;
  if (k.bhakoot?.points === 0) kb.bhakoot = COMPAT_KB.bhakoot_zero;
  if (k.gana?.points <= 1) kb.gana = COMPAT_KB.gana_low;
  if (compat.manglik.matched === true && compat.manglik.a) kb.manglik = COMPAT_KB.manglik_matched;
  if (compat.manglik.matched === false) kb.manglik = COMPAT_KB.manglik_mismatched;
  return kb;
}

// Retrieval: given a computed chart, return only the entries the LLM needs.
export function relevantKnowledge(chart) {
  const kb = {};
  const cur = chart.dasha.current;
  if (cur?.mahadasha) kb.mahadasha = { lord: cur.mahadasha.lord, ...DASHA_LORDS[cur.mahadasha.lord] };
  if (cur?.antardasha) kb.antardasha = { lord: cur.antardasha.lord, theme: DASHA_LORDS[cur.antardasha.lord].theme };
  kb.janmaNakshatra = { name: chart.janmaNakshatra.nakshatra, text: NAKSHATRAS_KB[chart.janmaNakshatra.nakshatra] };
  kb.features = chart.features.filter(f => f.present && FEATURES_KB[f.key])
    .map(f => ({ key: f.key, text: FEATURES_KB[f.key] }));
  return kb;
}
