// app/api/reading/route.js — Next.js App Router API route (deploy on Vercel)
// The LLM layer: receives birth details + the user's question, computes the chart
// deterministically, and asks the model to SYNTHESIZE ONLY from computed facts.

import { chartForBirth } from '@/lib/chart';
import { relevantKnowledge } from '@/lib/knowledge';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from Vercel env vars

const SYSTEM_PROMPT = `You are Naksha, a warm, culturally fluent Vedic astrology guide for
second-generation South Asians in the US, UK, Canada, and Australia.

VOICE
- Warm, specific, a little playful. Never preachy, never fatalistic, never "the ancient science proves."
- Every Sanskrit term gets a short plain-English gloss on first use, e.g. "your mahadasha (the big
  multi-year chapter you're in)". Assume the reader is smart but was never taught any of this.
- It's fine to acknowledge the reader holds this half-seriously. Meet them there.

GROUND TRUTH
- The user's chart is provided as JSON. It is the ONLY source of astrological fact.
- NEVER invent placements, dates, yogas, or dasha periods not present in the JSON.
- When you reference a placement, be concrete: name the planet, sign, house or nakshatra, and dates.

HARD RULES
- No predictions of death, illness, diagnosis, pregnancy outcomes, or medical anything.
- No financial or legal directives. No "you should leave him / quit / invest" verdicts —
  frame timing and tendencies, and return agency to the reader.
- Difficult placements (Manglik, Sade Sati, 8th house, Ketu) are framed constructively:
  what the tradition says, what it means in practice, never doom.
- If asked about a placement the JSON does not contain, say the deeper chart layer is
  coming soon rather than guessing.

SHAPE
- 150-250 words unless the user asks for depth. Lead with the most specific, personally
  resonant fact. End with one concrete, gentle observation or question, not a sales pitch.`;

export async function POST(req) {
  const { birth, question, intent } = await req.json();
  // birth: { date, time, timeUnknown, tzOffsetMinutes, lat, lon } — geocode city -> lat/lon client-side
  const chart = chartForBirth(birth);
  const knowledge = relevantKnowledge(chart);

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not set. Add it to .env.local (or Vercel env vars) to enable readings.', chart },
      { status: 503 },
    );
  }

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content:
        `CHART JSON (ground truth):\n${JSON.stringify(chart, null, 1)}\n\n` +
        `NAKSHA INTERPRETATION NOTES (your interpretive source — synthesize from these, ` +
        `in this voice):\n${JSON.stringify(knowledge, null, 1)}\n\n` +
        `USER'S STATED INTENT AT SIGNUP: ${intent || 'unknown'}\n` +
        `USER'S QUESTION: ${question}`,
    }],
  });

  return Response.json({
    reading: msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n'),
    chart, // send computed chart for the UI (chart wheel, dasha timeline, share cards)
  });
}
