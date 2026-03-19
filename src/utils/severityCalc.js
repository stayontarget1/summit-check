/**
 * Returns a Tailwind text color class based on severity.
 * HUD palette: cyan/teal = nominal, amber = caution, red = danger, ice-blue = cold
 */
export function getSeverityColor(type, value) {
  const v = Number(value);

  switch (type) {
    case 'temp': {
      if (v <= 10) return 'text-blue-400';
      if (v <= 25) return 'text-blue-300';
      if (v <= 32) return 'text-cyan-300';
      if (v <= 50) return 'text-gray-200';
      if (v <= 70) return 'text-emerald-400';
      if (v <= 85) return 'text-amber-400';
      if (v <= 95) return 'text-orange-400';
      return 'text-red-400';
    }
    case 'wind': {
      if (v <= 10) return 'text-emerald-400';
      if (v <= 25) return 'text-amber-400';
      if (v <= 40) return 'text-orange-400';
      return 'text-red-400';
    }
    case 'precip': {
      if (v <= 10) return 'text-emerald-400';
      if (v <= 40) return 'text-amber-400';
      if (v <= 70) return 'text-orange-400';
      return 'text-red-400';
    }
    case 'humidity': {
      if (v <= 40) return 'text-emerald-400';
      if (v <= 65) return 'text-amber-400';
      if (v <= 80) return 'text-orange-400';
      return 'text-red-400';
    }
    case 'uv': {
      if (v <= 2) return 'text-emerald-400';
      if (v <= 5) return 'text-amber-400';
      if (v <= 7) return 'text-orange-400';
      return 'text-red-400';
    }
    case 'visibility': {
      if (v >= 10) return 'text-emerald-400';
      if (v >= 5) return 'text-amber-400';
      if (v >= 2) return 'text-orange-400';
      return 'text-red-400';
    }
    default:
      return 'text-gray-200';
  }
}

/**
 * Returns overall severity level for a block of hourly data.
 * 0 = good, 1 = moderate, 2 = caution, 3 = severe
 */
export function getOverallSeverity(hourlySlice) {
  if (!hourlySlice || hourlySlice.length === 0) return 0;

  let max = 0;

  for (const h of hourlySlice) {
    if (h.wind_mph > 40) max = Math.max(max, 3);
    else if (h.wind_mph > 25) max = Math.max(max, 2);
    else if (h.wind_mph > 10) max = Math.max(max, 1);

    if (h.temp_f <= 10 || h.temp_f >= 100) max = Math.max(max, 3);
    else if (h.temp_f <= 25 || h.temp_f >= 95) max = Math.max(max, 2);
    else if (h.temp_f <= 32 || h.temp_f >= 85) max = Math.max(max, 1);

    if (h.precip_pct > 70) max = Math.max(max, 2);
    else if (h.precip_pct > 40) max = Math.max(max, 1);

    if (h.weather_code === 95 || h.weather_code === 96 || h.weather_code === 99) {
      max = Math.max(max, 3);
    }
  }

  return max;
}

/**
 * Returns a bg color class at low opacity for severity level.
 */
export function severityBgClass(level) {
  switch (level) {
    case 0: return 'bg-emerald-500/8';
    case 1: return 'bg-amber-500/8';
    case 2: return 'bg-orange-500/8';
    case 3: return 'bg-red-500/8';
    default: return 'bg-white/5';
  }
}
