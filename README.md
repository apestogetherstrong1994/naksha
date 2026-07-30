# Naksha — your stars, translated

Vedic astrology for second-generation South Asians in the West. Deterministic
chart engine (sidereal/Lahiri, Vimshottari dashas, yoga detection) + an LLM
synthesis layer that reads only from computed chart facts.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Readings (the chat step) need an Anthropic API key:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

Everything else — onboarding, chart computation, the revelation screen, and the
share card — works without a key.

## How it's wired

| Piece | File | Notes |
|---|---|---|
| Chart engine | `lib/engine.js` | Pure JS (astronomy-engine). Sidereal positions, lagna, nakshatras, Vimshottari timeline, yogas, live Sade Sati. Validated against Makar Sankranti 2024, Diwali 2024 new moon, published Lahiri ayanamsha. |
| Degraded mode | `lib/chart.js` | Unknown birth time → Moon-based chart only (no lagna, no Manglik), flagged in `meta`. |
| Interpretation KB | `lib/knowledge.js` | Brand-voice entries: 9 dasha lords, 27 nakshatras, 6 features. This is the moat — expand it. |
| Chart + revelation API | `app/api/chart/route.js` | Deterministic, no LLM. Powers the revelation screen. |
| Reading API | `app/api/reading/route.js` | Claude synthesis with voice + safety guardrails; chart JSON is the only source of astrological fact. |
| UI | `app/page.js` | Intent → birth ritual (Open-Meteo geocoding, historic-DST-aware tz offsets) → revelation → chat → share card (canvas). |

## Deploy (Vercel)

Push to GitHub, import in Vercel, set `ANTHROPIC_API_KEY` in project env vars.
No database — charts are recomputed per request.

## Before launch (from the build brief)

- Swap ayanamsha internals to swisseph-wasm for Swiss-exact values; verify
  cusp-adjacent charts. Match AstroSage defaults (node type, ayanamsha).
- Expand KB (rashi-per-house, 81 antardasha combos, more yogas) with an
  astrologer consultant; build the 20–30 chart eval set.
- Conversation memory, rate limiting on `/api/reading`, abuse filtering.
- ToS "for insight and entertainment" positioning; App Store 5.1.1 compliance.
