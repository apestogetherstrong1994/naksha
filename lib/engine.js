// Naksha — Vedic chart engine (deterministic layer)
// Pure JS, deploys clean on Vercel serverless. No native bindings.
// Positions: astronomy-engine (geocentric, true ecliptic of date) minus Lahiri ayanamsha.

import * as A from 'astronomy-engine';

const DEG = 180 / Math.PI, RAD = Math.PI / 180;
const norm360 = d => ((d % 360) + 360) % 360;

export const RASHIS = ['Aries (Mesha)','Taurus (Vrishabha)','Gemini (Mithuna)','Cancer (Karka)','Leo (Simha)','Virgo (Kanya)','Libra (Tula)','Scorpio (Vrishchika)','Sagittarius (Dhanu)','Capricorn (Makara)','Aquarius (Kumbha)','Pisces (Meena)'];

export const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];

// Vimshottari lords + years, starting from Ashwini
const DASHA_SEQ = [['Ketu',7],['Venus',20],['Sun',6],['Moon',10],['Mars',7],['Rahu',18],['Jupiter',16],['Saturn',19],['Mercury',17]];
const TOTAL_DASHA_YEARS = 120;
const YEAR_MS = 365.25 * 24 * 3600 * 1000; // sidereal-ish year; fine for prototype

// ---- Lahiri (Chitrapaksha) ayanamsha approximation ----
// Anchor 23.853° at J2000, general precession ~50.2888"/yr with small secular term.
// Accurate to ~1-2 arcmin vs Swiss Ephemeris across 1930-2050 — well inside pada granularity (3°20').
export function lahiriAyanamsha(date) {
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86400000); // Julian centuries from J2000
  return 23.853 + (5028.796195 * T + 1.1054348 * T * T) / 3600;
}

// Mean lunar node (Rahu). Mean node is a common Vedic convention.
function meanRahu(date) {
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86400000);
  const omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441;
  return norm360(omega);
}

// Geocentric tropical (equinox-of-date) ecliptic longitude for a planet
function tropicalLongitude(body, time) {
  const vecEQJ = A.GeoVector(body, time, true);
  const ect = A.RotateVector(A.Rotation_EQJ_ECT(time), vecEQJ);
  return norm360(A.SphereFromVector(ect).lon);
}

// Tropical ascendant from local sidereal time + latitude
function tropicalAscendant(time, latDeg, lonDeg) {
  const gast = A.SiderealTime(time);                 // hours
  const lstDeg = norm360(gast * 15 + lonDeg);        // RAMC in degrees
  const eps = A.e_tilt(time).tobl * RAD;             // true obliquity
  const th = lstDeg * RAD, ph = latDeg * RAD;
  let asc = Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(ph) * Math.sin(eps))) * DEG;
  return norm360(asc);
}

function decorate(siderealLon) {
  const nIdx = Math.floor(siderealLon / (360 / 27));
  const within = siderealLon - nIdx * (360 / 27);
  return {
    longitude: +siderealLon.toFixed(4),
    rashi: RASHIS[Math.floor(siderealLon / 30)],
    rashiIndex: Math.floor(siderealLon / 30),
    degreesInRashi: +(siderealLon % 30).toFixed(2),
    nakshatra: NAKSHATRAS[nIdx],
    nakshatraIndex: nIdx,
    pada: Math.floor(within / (360 / 108)) + 1,
    fractionThroughNakshatra: within / (360 / 27),
  };
}

// ---- Vimshottari dasha timeline from the Moon ----
function vimshottari(moon, birthDate, levels = 2) {
  const startLordIdx = moon.nakshatraIndex % 9;
  const elapsedFrac = moon.fractionThroughNakshatra;
  const firstLord = DASHA_SEQ[startLordIdx];
  const balanceYears = firstLord[1] * (1 - elapsedFrac);

  const maha = [];
  let cursor = birthDate.getTime();
  for (let i = 0; i < 9; i++) {
    const [lord, years] = DASHA_SEQ[(startLordIdx + i) % 9];
    const spanYears = i === 0 ? balanceYears : years;
    const end = cursor + spanYears * YEAR_MS;
    const entry = { lord, start: new Date(cursor), end: new Date(end) };
    if (levels > 1) {
      // Antardashas: sub-periods proportional to lord years, starting with the mahadasha lord.
      // For the partial first mahadasha, back-compute the full period start so sub-period
      // boundaries land correctly, then keep only those ending after birth.
      const fullStart = i === 0 ? cursor - (years - spanYears) * YEAR_MS : cursor;
      const lordSeqStart = DASHA_SEQ.findIndex(d => d[0] === lord);
      let sub = fullStart;
      entry.antardashas = [];
      for (let j = 0; j < 9; j++) {
        const [subLord, subYears] = DASHA_SEQ[(lordSeqStart + j) % 9];
        const subSpan = (years * subYears / TOTAL_DASHA_YEARS) * YEAR_MS;
        const subEnd = sub + subSpan;
        if (subEnd > birthDate.getTime()) {
          entry.antardashas.push({ lord: subLord, start: new Date(Math.max(sub, birthDate.getTime())), end: new Date(subEnd) });
        }
        sub = subEnd;
      }
    }
    maha.push(entry);
    cursor = end;
  }
  return maha;
}

function currentDasha(timeline, now = new Date()) {
  const maha = timeline.find(m => now >= m.start && now < m.end);
  if (!maha) return null;
  const antar = maha.antardashas?.find(a => now >= a.start && now < a.end) || null;
  return {
    mahadasha: { lord: maha.lord, since: maha.start, until: maha.end },
    antardasha: antar ? { lord: antar.lord, since: antar.start, until: antar.end } : null,
  };
}

// ---- Feature extraction: yogas, doshas, transits ----
function houseFrom(refRashiIndex, planetRashiIndex) {
  return ((planetRashiIndex - refRashiIndex + 12) % 12) + 1;
}

function extractFeatures(planets, asc, now = new Date()) {
  const f = [];
  const P = Object.fromEntries(planets.map(p => [p.name, p]));
  const moonR = P.Moon.rashiIndex, ascR = asc.rashiIndex;

  // Manglik (from lagna and from Moon; houses 1,2,4,7,8,12 — South Indian convention incl. 2nd)
  const marsHouses = { fromLagna: houseFrom(ascR, P.Mars.rashiIndex), fromMoon: houseFrom(moonR, P.Mars.rashiIndex) };
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const manglik = manglikHouses.includes(marsHouses.fromLagna) || manglikHouses.includes(marsHouses.fromMoon);
  f.push({ key: 'manglik', present: manglik, detail: marsHouses });

  // Gaja Kesari: Jupiter in a kendra (1,4,7,10) from the Moon
  const jupFromMoon = houseFrom(moonR, P.Jupiter.rashiIndex);
  f.push({ key: 'gaja_kesari_yoga', present: [1, 4, 7, 10].includes(jupFromMoon), detail: { jupiterHouseFromMoon: jupFromMoon } });

  // Budha-Aditya: Sun and Mercury conjunct in the same sign
  f.push({ key: 'budha_aditya_yoga', present: P.Sun.rashiIndex === P.Mercury.rashiIndex, detail: {} });

  // Chandra-Mangala: Moon-Mars same sign
  f.push({ key: 'chandra_mangala_yoga', present: P.Moon.rashiIndex === P.Mars.rashiIndex, detail: {} });

  // Kemadruma-lite: no planet (excl. Sun/nodes) conjunct the Moon or in 2nd/12th from it
  const neighbors = planets.filter(p => !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(p.name))
    .filter(p => [1, 2, 12].includes(houseFrom(moonR, p.rashiIndex)));
  f.push({ key: 'kemadruma_indication', present: neighbors.length === 0, detail: {} });

  // Sade Sati: transiting Saturn in 12th, 1st, or 2nd from natal Moon
  const tSat = decorate(norm360(tropicalLongitude(A.Body.Saturn, A.MakeTime(now)) - lahiriAyanamsha(now)));
  const satFromMoon = houseFrom(moonR, tSat.rashiIndex);
  f.push({ key: 'sade_sati_now', present: [12, 1, 2].includes(satFromMoon), detail: { transitSaturnRashi: tSat.rashi, houseFromNatalMoon: satFromMoon } });

  return f;
}

// ---- Main entry point ----
// birth: { date: 'YYYY-MM-DD', time: 'HH:MM' (local), tzOffsetMinutes, lat, lon }
export function computeChart(birth, now = new Date()) {
  const [y, m, d] = birth.date.split('-').map(Number);
  const [hh, mm] = birth.time.split(':').map(Number);
  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - birth.tzOffsetMinutes * 60000;
  const birthDate = new Date(utcMs);
  const time = A.MakeTime(birthDate);
  const ayan = lahiriAyanamsha(birthDate);

  const bodies = [['Sun', A.Body.Sun], ['Moon', A.Body.Moon], ['Mercury', A.Body.Mercury], ['Venus', A.Body.Venus], ['Mars', A.Body.Mars], ['Jupiter', A.Body.Jupiter], ['Saturn', A.Body.Saturn]];
  const planets = bodies.map(([name, body]) => {
    const trop = name === 'Sun' ? A.SunPosition(time).elon
      : name === 'Moon' ? A.EclipticGeoMoon(time).lon
      : tropicalLongitude(body, time);
    return { name, ...decorate(norm360(trop - ayan)) };
  });
  const rahuLon = norm360(meanRahu(birthDate) - ayan);
  planets.push({ name: 'Rahu', ...decorate(rahuLon) });
  planets.push({ name: 'Ketu', ...decorate(norm360(rahuLon + 180)) });

  const asc = decorate(norm360(tropicalAscendant(time, birth.lat, birth.lon) - ayan));
  const moon = planets.find(p => p.name === 'Moon');
  const dashaTimeline = vimshottari(moon, birthDate);

  return {
    meta: { birthUTC: birthDate.toISOString(), ayanamsha: +ayan.toFixed(4), system: 'Lahiri sidereal, mean node, whole-sign houses' },
    ascendant: asc,
    planets,
    janmaNakshatra: { nakshatra: moon.nakshatra, pada: moon.pada, rashi: moon.rashi },
    dasha: { current: currentDasha(dashaTimeline, now), timeline: dashaTimeline },
    features: extractFeatures(planets, asc, now),
  };
}
