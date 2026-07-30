// app/api/reading/route.js — Next.js App Router API route (deploy on Vercel)
// The LLM layer: receives birth details + the user's question, computes the chart
// deterministically, and asks the model to SYNTHESIZE ONLY from computed facts.

import { chartForBirth } from '@/lib/chart';
import { relevantKnowledge } from '@/lib/knowledge';
import { SYSTEM_PROMPT } from '@/lib/prompt';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from Vercel env vars



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
