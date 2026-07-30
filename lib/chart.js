// Shared chart wrapper: handles the unknown-birth-time degraded mode
// (Moon-based reading only — no lagna, no lagna-dependent features).
import { computeChart } from './engine';

export function chartForBirth(birth) {
  const time = birth.timeUnknown ? '12:00' : birth.time;
  const chart = computeChart({
    date: birth.date,
    time,
    tzOffsetMinutes: birth.tzOffsetMinutes,
    lat: birth.lat,
    lon: birth.lon,
  });

  if (birth.timeUnknown) {
    delete chart.ascendant;
    chart.meta.birthTimeUnknown = true;
    chart.meta.note =
      'Birth time unknown: Moon-based chart only. Ascendant (lagna) and lagna-dependent features are omitted; positions use local noon.';
    // Manglik depends on houses from the lagna — drop it rather than guess.
    chart.features = chart.features.filter((f) => f.key !== 'manglik');
  }

  return chart;
}
