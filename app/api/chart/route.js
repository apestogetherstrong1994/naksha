// app/api/chart/route.js — deterministic chart + revelation content, no LLM.
// Powers the revelation screen (step c of onboarding) before any chat happens.
import { chartForBirth } from '@/lib/chart';
import { DASHA_LORDS, NAKSHATRAS_KB, FEATURES_KB } from '@/lib/knowledge';

const CLIFFHANGERS = {
  someone: (antar, maha) =>
    `And about the person on your mind — your ${antar} period (the sub-chapter running right now) colors exactly who you're drawn to and why. Worth asking about.`,
  marriage: (antar, maha) =>
    `On marriage timing: your ${maha} mahadasha has specific windows that matter more than others. Ask, and Naksha will read them for you.`,
  career: (antar, maha) =>
    `On the career front, the ${antar} sub-period you're in right now changes what kind of moves land. Ask before you decide.`,
  rough: (antar, maha) =>
    `If this year has felt heavy — your chart has a very specific explanation for that. Ask, and Naksha will walk you through it.`,
  curious: (antar, maha) =>
    `And that's just the surface. Ask Naksha anything — it reads from your actual chart, not a horoscope column.`,
};

function buildRevelation(chart, intent) {
  const lines = [];
  const jn = chart.janmaNakshatra;

  // 1. Janma nakshatra — the identity hook.
  const nakText = NAKSHATRAS_KB[jn.nakshatra];
  if (nakText) lines.push(nakText);

  // 2. Current mahadasha — the "chapter you're in" line.
  const cur = chart.dasha.current;
  if (cur?.mahadasha) {
    const lord = cur.mahadasha.lord;
    const kb = DASHA_LORDS[lord];
    const until = new Date(cur.mahadasha.until).getFullYear();
    lines.push(
      `You're in your ${lord} mahadasha (the big multi-year chapter of your life) — the chapter of ${kb.theme}. It runs until ${until}.`
    );
  }

  // 3. One notable feature, constructively framed.
  const feature = chart.features.find((f) => f.present && FEATURES_KB[f.key]);
  if (feature) lines.push(FEATURES_KB[feature.key]);

  // 4. Cliffhanger tied to intent.
  const cliff = CLIFFHANGERS[intent] || CLIFFHANGERS.curious;
  lines.push(cliff(cur?.antardasha?.lord || 'current', cur?.mahadasha?.lord || 'current'));

  return lines;
}

export async function POST(req) {
  try {
    const { birth, intent } = await req.json();
    if (!birth?.date || birth.lat == null || birth.lon == null || birth.tzOffsetMinutes == null) {
      return Response.json({ error: 'Missing birth details.' }, { status: 400 });
    }
    const chart = chartForBirth(birth);
    return Response.json({ chart, revelation: buildRevelation(chart, intent) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Could not compute the chart.' }, { status: 500 });
  }
}
