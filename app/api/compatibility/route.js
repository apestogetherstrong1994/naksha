// app/api/compatibility/route.js — Ashta Koota match + LLM synthesis.
// Deterministic kuta scoring from both Moons; Claude interprets, never computes.

import { chartForBirth } from '@/lib/chart';
import { computeCompatibility } from '@/lib/compat';
import { relevantCompatKnowledge, NAKSHATRAS_KB } from '@/lib/knowledge';
import { SYSTEM_PROMPT, COMPAT_RULES } from '@/lib/prompt';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(req) {
  try {
    const { birthA, birthB, question, intent } = await req.json();
    if (!birthA?.date || !birthB?.date) {
      return Response.json({ error: 'Both birth details are required.' }, { status: 400 });
    }

    const chartA = chartForBirth(birthA);
    const chartB = chartForBirth(birthB);
    const compat = computeCompatibility(chartA, chartB);
    const knowledge = relevantCompatKnowledge(compat);

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY is not set.', compat, chartB },
        { status: 503 },
      );
    }

    // Kutas + Moon essentials only — full planet tables aren't needed for guna
    // matching and would just dilute the prompt.
    const moonSummary = (chart) => ({
      janmaNakshatra: chart.janmaNakshatra,
      nakshatraText: NAKSHATRAS_KB[chart.janmaNakshatra.nakshatra],
      currentDasha: chart.dasha.current,
      birthTimeUnknown: chart.meta.birthTimeUnknown || false,
      manglik: chart.features.find((f) => f.key === 'manglik') || null,
    });

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + COMPAT_RULES,
      messages: [{
        role: 'user',
        content:
          `USER'S MOON PROFILE (chart A, ground truth):\n${JSON.stringify(moonSummary(chartA), null, 1)}\n\n` +
          `PARTNER'S MOON PROFILE (chart B, ground truth):\n${JSON.stringify(moonSummary(chartB), null, 1)}\n\n` +
          `ASHTA KOOTA ANALYSIS (computed, ground truth):\n${JSON.stringify(compat, null, 1)}\n\n` +
          `NAKSHA INTERPRETATION NOTES (synthesize from these, in this voice):\n${JSON.stringify(knowledge, null, 1)}\n\n` +
          `USER'S STATED INTENT AT SIGNUP: ${intent || 'unknown'}\n` +
          `USER'S QUESTION: ${question || 'How compatible are we?'}`,
      }],
    });

    return Response.json({
      reading: msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n'),
      compat,
      chartB, // for the side panel
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Could not compute the compatibility reading.' }, { status: 500 });
  }
}
