"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GLOSSARY, findGlossaryTerms } from "@/lib/glossary";

/* ---------- constants ---------- */

const INTENTS = [
  { key: "someone", label: "Someone I'm seeing", emoji: "💫" },
  { key: "marriage", label: "Marriage timing", emoji: "💍" },
  { key: "career", label: "A career decision", emoji: "🧭" },
  { key: "rough", label: "It's been a rough year", emoji: "🌧️" },
  { key: "curious", label: "Just curious", emoji: "✨" },
];

const SEED_QUESTIONS = {
  someone: "What does my chart say about the person I'm seeing?",
  marriage: "When does my chart actually favor marriage?",
  career: "I'm weighing a career decision — what does my timing look like?",
  rough: "Why has this year felt so heavy?",
  curious: "What's the most interesting thing in my chart?",
};

// Deterministic star field — pure function of index, so SSR and client match.
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: ((i * 47.3 + 11) % 100).toFixed(2),
  top: ((i * 31.7 + 7) % 100).toFixed(2),
  size: 1 + (i % 3),
  delay: ((i % 9) * 0.55).toFixed(2),
}));

/* ---------- timezone helpers (historic DST matters) ---------- */

function tzOffsetAt(timeZone, date) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(
    dtf.formatToParts(date).map((x) => [x.type, x.value])
  );
  const asUTC = Date.UTC(
    +p.year,
    +p.month - 1,
    +p.day,
    p.hour === "24" ? 0 : +p.hour,
    +p.minute,
    +p.second
  );
  return (asUTC - date.getTime()) / 60000;
}

function offsetForLocal(timeZone, dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const localAsUTC = Date.UTC(y, m - 1, d, hh, mm);
  let offset = tzOffsetAt(timeZone, new Date(localAsUTC));
  offset = tzOffsetAt(timeZone, new Date(localAsUTC - offset * 60000));
  return offset;
}

/* ---------- rich text: render **term** as bold ---------- */

function Rich({ text }) {
  // **term** -> bold (glossary style); stray *word* -> italic. No other markdown.
  const parts = text.split(/\*\*(.+?)\*\*/g);
  const italicize = (s, keyBase) =>
    s.split(/\*([^*\n]+)\*/g).map((p, j) =>
      j % 2 ? <em key={`${keyBase}-${j}`}>{p}</em> : p
    );
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-gold-soft">
            {p}
          </strong>
        ) : (
          italicize(p, i)
        )
      )}
    </>
  );
}

/* ---------- small UI bits ---------- */

function StarField() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Wordmark({ small }) {
  return (
    <div className={`font-display tracking-wide ${small ? "text-2xl" : "text-4xl"}`}>
      <span className="text-gold">✦</span> Naksha
    </div>
  );
}

/* ---------- reusable birth details form ---------- */

function BirthForm({ cta, onCast, compact }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState([]);
  const [city, setCity] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (city) return;
    if (cityQuery.trim().length < 2) {
      setCityResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            cityQuery.trim()
          )}&count=5&language=en&format=json`
        );
        const data = await res.json();
        setCityResults(data.results || []);
      } catch {
        setCityResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [cityQuery, city]);

  const cityLabel = (c) => [c.name, c.admin1, c.country].filter(Boolean).join(", ");

  async function submit() {
    setError("");
    if (!date) return setError("We need the birth date.");
    if (!timeUnknown && !time)
      return setError("Add the birth time — or tap “I don't know it.”");
    if (!city) return setError("Pick the birth city from the list.");

    const tzOffsetMinutes = offsetForLocal(
      city.timezone,
      date,
      timeUnknown ? "12:00" : time
    );
    setBusy(true);
    const err = await onCast({
      date,
      time: timeUnknown ? "12:00" : time,
      timeUnknown,
      tzOffsetMinutes,
      lat: city.latitude,
      lon: city.longitude,
      place: cityLabel(city),
    });
    setBusy(false);
    if (err) setError(err);
  }

  const gap = compact ? "gap-4" : "gap-5";

  return (
    <div className={`flex flex-col ${gap}`}>
      <label className="block">
        <span className="text-sm text-muted">Birth date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="card mt-1 w-full px-4 py-3 bg-transparent outline-none focus:border-gold/60 [color-scheme:dark]"
        />
      </label>

      <label className="block">
        <span className="text-sm text-muted">Birth time (local)</span>
        <input
          type="time"
          value={time}
          disabled={timeUnknown}
          onChange={(e) => setTime(e.target.value)}
          className="card mt-1 w-full px-4 py-3 bg-transparent outline-none focus:border-gold/60 disabled:opacity-40 [color-scheme:dark]"
        />
        <button
          type="button"
          onClick={() => setTimeUnknown(!timeUnknown)}
          className={`mt-2 text-sm cursor-pointer ${
            timeUnknown ? "text-gold" : "text-muted underline decoration-dotted"
          }`}
        >
          {timeUnknown ? "✓ Birth time unknown" : "I don't know it"}
        </button>
        {timeUnknown && !compact && (
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Ask your mom — she knows. Until then we&apos;ll read from the Moon,
            which carries most of the story anyway.
          </p>
        )}
      </label>

      <label className="block relative">
        <span className="text-sm text-muted">Birth city</span>
        <input
          type="text"
          value={cityQuery}
          placeholder="Start typing — e.g. Jaipur, Leicester, Fremont"
          onChange={(e) => {
            setCityQuery(e.target.value);
            setCity(null);
          }}
          className="card mt-1 w-full px-4 py-3 bg-transparent outline-none focus:border-gold/60 placeholder:text-muted/50"
        />
        {cityResults.length > 0 && !city && (
          <div className="card absolute z-10 mt-1 w-full overflow-hidden">
            {cityResults.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCity(c);
                  setCityQuery(cityLabel(c));
                  setCityResults([]);
                }}
                className="block w-full px-4 py-3 text-left text-sm hover:bg-white/10 cursor-pointer"
              >
                {cityLabel(c)}
              </button>
            ))}
          </div>
        )}
      </label>

      {error && <p className="text-red-300 text-sm">{error}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="mt-1 rounded-full bg-gold text-[#1b1405] font-medium px-6 py-3.5 hover:bg-gold-soft transition-colors cursor-pointer disabled:opacity-50"
      >
        {busy ? "Reading the sky…" : cta}
      </button>
    </div>
  );
}

/* ---------- side panel: chart, match score, glossary ---------- */

function ChartSummary({ chart, title }) {
  const cur = chart.dasha?.current;
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted">{title}</p>
      <p className="mt-1.5 text-sm">
        <span className="text-gold-soft">{chart.janmaNakshatra.nakshatra}</span>
        <span className="text-muted">
          {" "}· pada {chart.janmaNakshatra.pada}
          {chart.ascendant ? ` · ${chart.ascendant.rashi.split(" ")[0]} rising` : " · Moon-based"}
        </span>
      </p>
      {cur?.mahadasha && (
        <p className="text-xs text-muted mt-0.5">
          {cur.mahadasha.lord} mahadasha
          {cur.antardasha ? ` · ${cur.antardasha.lord} antardasha` : ""}
        </p>
      )}
      <table className="mt-2 w-full text-xs">
        <tbody>
          {chart.planets.map((p) => (
            <tr key={p.name} className="border-t border-line/50">
              <td className="py-1 pr-2 text-muted">{p.name}</td>
              <td className="py-1 pr-2">{p.rashi.split(" ")[0]}</td>
              <td className="py-1 text-right text-muted">
                {p.degreesInRashi.toFixed(1)}° · {p.nakshatra}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SidePanel({ chart, partnerChart, compat, glossaryKeys }) {
  return (
    <div className="flex flex-col gap-6">
      {chart && <ChartSummary chart={chart} title="Your chart" />}

      {partnerChart && <ChartSummary chart={partnerChart} title="Their chart" />}

      {compat && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">Guna match</p>
          <p className="mt-1.5 font-display text-2xl text-gold-soft">
            {compat.total}
            <span className="text-sm text-muted"> / {compat.max} · {compat.band}</span>
          </p>
          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gold"
              style={{ width: `${(compat.total / compat.max) * 100}%` }}
            />
          </div>
          <table className="mt-2 w-full text-xs">
            <tbody>
              {compat.kutas.map((k) => (
                <tr key={k.key} className="border-t border-line/50">
                  <td className="py-1 pr-2 text-muted">{k.name}</td>
                  <td className="py-1 pr-2 text-muted/70">{k.theme}</td>
                  <td className={`py-1 text-right ${k.points === 0 ? "text-red-300/80" : ""}`}>
                    {k.points}/{k.max}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {compat.manglik.matched === false && (
            <p className="text-xs text-muted mt-2">
              Manglik status differs between the charts — ask Naksha about it.
            </p>
          )}
        </div>
      )}

      {glossaryKeys.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted">Glossary</p>
          <dl className="mt-2 flex flex-col gap-3">
            {glossaryKeys.map((k) => (
              <div key={k}>
                <dt className="text-sm font-semibold text-gold-soft">
                  {GLOSSARY[k].term}
                </dt>
                <dd className="text-xs text-muted leading-relaxed mt-0.5">
                  {GLOSSARY[k].def}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

/* ---------- main page ---------- */

export default function Home() {
  const [step, setStep] = useState("intent"); // intent | birth | computing | revelation | chat
  const [intent, setIntent] = useState(null);

  // charts
  const [birth, setBirth] = useState(null);
  const [chart, setChart] = useState(null);
  const [revelation, setRevelation] = useState([]);

  // partner / compatibility
  const [partnerBirth, setPartnerBirth] = useState(null);
  const [partnerChart, setPartnerChart] = useState(null);
  const [compat, setCompat] = useState(null);
  const [showPartnerForm, setShowPartnerForm] = useState(false);

  // chat
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef(null);
  const taRef = useRef(null);

  // glossary + panels
  const [glossaryKeys, setGlossaryKeys] = useState([]);
  const [showPane, setShowPane] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const canvasRef = useRef(null);

  /* ----- glossary: accumulate terms seen in Naksha's output ----- */
  const absorbTerms = useCallback((text) => {
    const found = findGlossaryTerms(text);
    if (!found.length) return;
    setGlossaryKeys((prev) => {
      const next = [...prev];
      for (const k of found) if (!next.includes(k)) next.push(k);
      return next;
    });
  }, []);

  /* ----- cast own chart ----- */
  const castMyChart = useCallback(
    async (b) => {
      try {
        const res = await fetch("/api/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birth: b, intent }),
        });
        const data = await res.json();
        if (!res.ok) return data.error || "Something went wrong.";
        setBirth(b);
        setChart(data.chart);
        setRevelation(data.revelation);
        data.revelation.forEach(absorbTerms);
        setStep("revelation");
        return null;
      } catch {
        return "Something went wrong casting the chart.";
      }
    },
    [intent, absorbTerms]
  );

  /* ----- chat (solo or compatibility mode) ----- */
  const ask = useCallback(
    async (q, partnerOverride) => {
      const text = (q ?? question).trim();
      if (!text || asking) return;
      const partner = partnerOverride ?? partnerBirth;
      setQuestion("");
      if (taRef.current) taRef.current.style.height = "auto";
      setAsking(true);
      setMessages((m) => [...m, { role: "user", text }]);
      try {
        const url = partner ? "/api/compatibility" : "/api/reading";
        const body = partner
          ? { birthA: birth, birthB: partner, question: text, intent }
          : { birth, question: text, intent };
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error || "The stars are unreachable right now. Try again?"
          );
        if (data.compat) setCompat(data.compat);
        if (data.chartB) setPartnerChart(data.chartB);
        absorbTerms(data.reading);
        setMessages((m) => [...m, { role: "naksha", text: data.reading }]);
      } catch (e) {
        setMessages((m) => [
          ...m,
          { role: "naksha", text: e.message, error: true },
        ]);
      } finally {
        setAsking(false);
      }
    },
    [question, asking, birth, intent, partnerBirth, absorbTerms]
  );

  /* ----- partner chart ----- */
  const castPartnerChart = useCallback(
    async (b) => {
      setPartnerBirth(b);
      setShowPartnerForm(false);
      setStep("chat");
      ask("How compatible are we, really?", b);
      return null;
    },
    [ask]
  );

  function clearPartner() {
    setPartnerBirth(null);
    setPartnerChart(null);
    setCompat(null);
    setMessages((m) => [
      ...m,
      { role: "naksha", text: "Back to just your chart. Ask away." },
    ]);
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  /* ----- expanding composer ----- */
  function autosize() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 168) + "px";
  }

  /* ----- share card ----- */
  useEffect(() => {
    if (showCard && chart) drawShareCard(canvasRef.current, chart);
  }, [showCard, chart]);

  function downloadCard() {
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "naksha-card.png";
    a.click();
  }

  async function shareCard() {
    const canvas = canvasRef.current;
    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    const file = new File([blob], "naksha-card.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "My Naksha chart" });
        return;
      } catch {
        /* user cancelled — fall through to download */
      }
    }
    downloadCard();
  }

  const cur = chart?.dasha?.current;
  const paneAvailable = step === "revelation" || step === "chat";

  /* ---------- render ---------- */

  return (
    <main className="relative flex-1 flex justify-center px-5 py-10 gap-10">
      <StarField />

      {/* ---- STEP: intent ---- */}
      {step === "intent" && (
        <div className="rise w-full max-w-md mt-[12vh] text-center">
          <Wordmark />
          <p className="mt-3 text-muted">your stars, translated</p>
          <h1 className="font-display text-3xl mt-12 leading-snug">
            What brought you here?
          </h1>
          <p className="text-muted text-sm mt-2">
            No wrong answers. The stars don&apos;t judge.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {INTENTS.map((it) => (
              <button
                key={it.key}
                onClick={() => {
                  setIntent(it.key);
                  setStep("birth");
                }}
                className="card px-5 py-4 text-left text-lg hover:border-gold/60 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="mr-3">{it.emoji}</span>
                {it.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- STEP: birth details ---- */}
      {step === "birth" && (
        <div className="rise w-full max-w-md mt-[8vh]">
          <Wordmark small />
          <h1 className="font-display text-3xl mt-10 leading-snug">
            The moment you arrived.
          </h1>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            A Vedic chart is a snapshot of the sky at your first breath — date,
            time, and place. That&apos;s all we need.
          </p>
          <div className="mt-8">
            <BirthForm cta="Cast my chart" onCast={castMyChart} />
          </div>
          <button
            onClick={() => setStep("intent")}
            className="mt-4 text-muted text-sm cursor-pointer"
          >
            ← back
          </button>
        </div>
      )}

      {/* ---- STEP: revelation ---- */}
      {step === "revelation" && chart && (
        <div className="rise w-full max-w-md mt-[6vh] pb-16">
          <Wordmark small />
          <p className="text-muted text-sm mt-8">Born under</p>
          <h1 className="font-display text-4xl mt-1 text-gold-soft">
            {chart.janmaNakshatra.nakshatra}
          </h1>
          <p className="text-muted text-sm mt-1">
            pada {chart.janmaNakshatra.pada} · Moon in{" "}
            {chart.janmaNakshatra.rashi}
            {chart.ascendant
              ? ` · ${chart.ascendant.rashi.split(" ")[0]} rising`
              : ""}
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {revelation.map((line, i) => (
              <div
                key={i}
                className="card px-5 py-4 text-[15px] leading-relaxed rise"
                style={{ animationDelay: `${0.15 + i * 0.35}s` }}
              >
                <Rich text={line} />
              </div>
            ))}
          </div>

          {cur?.mahadasha && (
            <div
              className="card mt-4 px-5 py-4 rise"
              style={{ animationDelay: `${0.15 + revelation.length * 0.35}s` }}
            >
              <p className="text-xs uppercase tracking-widest text-muted">
                Your timeline
              </p>
              <p className="mt-2 text-[15px]">
                <span className="text-gold-soft">
                  {cur.mahadasha.lord} mahadasha
                </span>{" "}
                <span className="text-muted">
                  {new Date(cur.mahadasha.since).getFullYear()}–
                  {new Date(cur.mahadasha.until).getFullYear()}
                </span>
                {cur.antardasha && (
                  <>
                    {" · "}
                    <span className="text-gold-soft">
                      {cur.antardasha.lord} antardasha
                    </span>{" "}
                    <span className="text-muted">
                      until{" "}
                      {new Date(cur.antardasha.until).toLocaleDateString(
                        undefined,
                        { month: "short", year: "numeric" }
                      )}
                    </span>
                  </>
                )}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                setStep("chat");
                if (messages.length === 0)
                  ask(SEED_QUESTIONS[intent] || SEED_QUESTIONS.curious);
              }}
              className="rounded-full bg-gold text-[#1b1405] font-medium px-6 py-3.5 hover:bg-gold-soft transition-colors cursor-pointer"
            >
              Ask Naksha about it →
            </button>
            <button
              onClick={() => setShowCard(true)}
              className="card px-6 py-3.5 hover:border-gold/60 transition-colors cursor-pointer"
            >
              ✦ Get your star card
            </button>
          </div>
        </div>
      )}

      {/* ---- STEP: chat ---- */}
      {step === "chat" && (
        <div className="rise w-full max-w-md flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <Wordmark small />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPane(true)}
                className="text-sm text-gold-soft cursor-pointer lg:hidden"
              >
                ◐ chart
              </button>
              <button
                onClick={() => setShowCard(true)}
                className="text-sm text-gold-soft cursor-pointer"
              >
                ✦ card
              </button>
            </div>
          </div>
          <p className="text-muted text-xs mt-2">
            {chart?.janmaNakshatra?.nakshatra} · {cur?.mahadasha?.lord} mahadasha
            {chart?.meta?.birthTimeUnknown ? " · moon-based (time unknown)" : ""}
          </p>

          <div className="flex-1 mt-6 flex flex-col gap-4 pb-40">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rise max-w-[88%] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "self-end rounded-2xl rounded-br-sm bg-accent/25 border border-accent/30"
                    : `card self-start rounded-2xl rounded-bl-sm ${
                        m.error ? "text-red-300" : ""
                      }`
                }`}
              >
                <Rich text={m.text} />
              </div>
            ))}
            {asking && (
              <div className="card self-start rounded-2xl rounded-bl-sm px-4 py-3 text-muted text-sm">
                <span className="thinking-dot">✦</span>{" "}
                <span className="thinking-dot" style={{ animationDelay: "0.3s" }}>
                  ✦
                </span>{" "}
                <span className="thinking-dot" style={{ animationDelay: "0.6s" }}>
                  ✦
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-5 pb-5 pt-3 bg-gradient-to-t from-[#0b0a14] via-[#0b0a14ee] to-transparent">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                {partnerBirth ? (
                  <span className="text-xs text-gold-soft card rounded-full px-3 py-1">
                    💞 You + partner ({partnerBirth.place?.split(",")[0]})
                    <button
                      onClick={clearPartner}
                      className="ml-2 text-muted hover:text-foreground cursor-pointer"
                      title="Back to solo reading"
                    >
                      ✕
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setShowPartnerForm(true)}
                    className="text-xs text-gold-soft card rounded-full px-3 py-1 hover:border-gold/60 transition-colors cursor-pointer"
                  >
                    💞 Check compatibility
                  </button>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={taRef}
                  rows={1}
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    autosize();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask();
                    }
                  }}
                  placeholder={
                    partnerBirth
                      ? "Ask about the two of you…"
                      : "Ask about love, timing, career…"
                  }
                  className="card flex-1 px-4 py-3 bg-[#141221] outline-none focus:border-gold/60 placeholder:text-muted/50 resize-none overflow-y-auto text-[15px] leading-relaxed"
                  style={{ maxHeight: 168 }}
                />
                <button
                  type="submit"
                  disabled={asking || !question.trim()}
                  className="rounded-full bg-gold text-[#1b1405] font-medium px-5 py-3 disabled:opacity-40 cursor-pointer shrink-0"
                >
                  Ask
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---- desktop side panel ---- */}
      {paneAvailable && (
        <aside className="hidden lg:block w-80 shrink-0 mt-[6vh]">
          <div className="card px-5 py-5 sticky top-8 max-h-[85vh] overflow-y-auto">
            <SidePanel
              chart={chart}
              partnerChart={partnerChart}
              compat={compat}
              glossaryKeys={glossaryKeys}
            />
          </div>
        </aside>
      )}

      {/* ---- mobile side panel overlay ---- */}
      {showPane && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setShowPane(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[85%] max-w-sm h-full bg-[#12101e] border-l border-line px-5 py-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="font-display text-lg">Your sky</span>
              <button
                onClick={() => setShowPane(false)}
                className="text-muted cursor-pointer"
              >
                ✕ close
              </button>
            </div>
            <SidePanel
              chart={chart}
              partnerChart={partnerChart}
              compat={compat}
              glossaryKeys={glossaryKeys}
            />
          </div>
        </div>
      )}

      {/* ---- partner birth form modal ---- */}
      {showPartnerForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-5"
          onClick={() => setShowPartnerForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rise card w-full max-w-md px-6 py-6 bg-[#12101e] max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-display text-2xl">Their moment.</h2>
            <p className="text-muted text-sm mt-1 leading-relaxed">
              Partner, situationship, ex you&apos;re not over — the stars
              don&apos;t need labels. Guna matching reads from the Moon, so an
              unknown birth time is fine.
            </p>
            <div className="mt-6">
              <BirthForm cta="Cast their chart" onCast={castPartnerChart} compact />
            </div>
            <button
              onClick={() => setShowPartnerForm(false)}
              className="mt-4 text-muted text-sm cursor-pointer"
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {/* ---- share card modal ---- */}
      {showCard && chart && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          onClick={() => setShowCard(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rise flex flex-col items-center gap-4"
          >
            <canvas
              ref={canvasRef}
              width={1080}
              height={1350}
              className="w-[280px] sm:w-[320px] rounded-2xl shadow-2xl shadow-black"
            />
            <div className="flex gap-3">
              <button
                onClick={shareCard}
                className="rounded-full bg-gold text-[#1b1405] font-medium px-6 py-3 cursor-pointer"
              >
                Share
              </button>
              <button onClick={downloadCard} className="card px-6 py-3 cursor-pointer">
                Save
              </button>
              <button
                onClick={() => setShowCard(false)}
                className="px-4 py-3 text-muted cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------- share card renderer ---------- */

function drawShareCard(canvas, chart) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width; // 1080
  const H = canvas.height; // 1350

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#191430");
  bg.addColorStop(0.55, "#0e0c1c");
  bg.addColorStop(1, "#0b0a14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 90; i++) {
    const x = (((i * 173.3 + 41) % 1000) / 1000) * W;
    const y = (((i * 97.7 + 13) % 1000) / 1000) * H;
    const r = 0.8 + (i % 3) * 0.7;
    ctx.globalAlpha = 0.25 + ((i * 37) % 60) / 100;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(212,169,78,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(212,169,78,0.25)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  const center = W / 2;
  ctx.textAlign = "center";

  ctx.fillStyle = "#d4a94e";
  ctx.font = "64px Georgia, serif";
  ctx.fillText("✦", center, 250);
  ctx.fillStyle = "#a29db4";
  ctx.font = "500 34px Helvetica, Arial, sans-serif";
  ctx.fillText("B O R N   U N D E R", center, 360);

  ctx.fillStyle = "#e8c987";
  const name = chart.janmaNakshatra.nakshatra;
  ctx.font = `italic ${name.length > 14 ? 96 : 120}px Georgia, serif`;
  ctx.fillText(name, center, 500);

  ctx.fillStyle = "#ece9e2";
  ctx.font = "38px Helvetica, Arial, sans-serif";
  ctx.fillText(
    `Moon in ${chart.janmaNakshatra.rashi.split(" ")[0]} · pada ${chart.janmaNakshatra.pada}`,
    center,
    580
  );

  ctx.strokeStyle = "rgba(212,169,78,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center - 140, 660);
  ctx.lineTo(center + 140, 660);
  ctx.stroke();

  const cur = chart.dasha?.current;
  if (cur?.mahadasha) {
    ctx.fillStyle = "#a29db4";
    ctx.font = "500 30px Helvetica, Arial, sans-serif";
    ctx.fillText("C U R R E N T   C H A P T E R", center, 760);

    ctx.fillStyle = "#ece9e2";
    ctx.font = "italic 76px Georgia, serif";
    ctx.fillText(`${cur.mahadasha.lord} mahadasha`, center, 860);

    ctx.fillStyle = "#a29db4";
    ctx.font = "36px Helvetica, Arial, sans-serif";
    const since = new Date(cur.mahadasha.since).getFullYear();
    const until = new Date(cur.mahadasha.until).getFullYear();
    ctx.fillText(`${since} — ${until}`, center, 925);
  }

  if (chart.ascendant) {
    ctx.fillStyle = "#ece9e2";
    ctx.font = "40px Helvetica, Arial, sans-serif";
    ctx.fillText(`${chart.ascendant.rashi.split(" ")[0]} rising`, center, 1030);
  }

  ctx.fillStyle = "#d4a94e";
  ctx.font = "italic 52px Georgia, serif";
  ctx.fillText("✦ Naksha", center, 1210);
  ctx.fillStyle = "#a29db4";
  ctx.font = "28px Helvetica, Arial, sans-serif";
  ctx.fillText("your stars, translated", center, 1258);
}
