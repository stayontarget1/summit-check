const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const HEAVY_SNOW_CODES = new Set([71, 73, 75, 77]);
const THUNDERSTORM_CODES = new Set([95, 96, 99]);

/**
 * Returns an array of gear badge objects based on current and forecasted weather.
 * Each badge: { label: string, color: string }
 * Colors: "blue" (cold), "red"/"orange" (heat/danger), "yellow" (caution),
 *         "purple" (storms), "gray" (visibility/nav)
 */
export function getGearBadges(weatherData) {
  const { current, hourly } = weatherData;
  const badges = [];

  const temp = current.temp;
  const feelsLike = current.feelsLike;
  const wind = current.windSpeed;
  const gusts = current.windGusts;
  const precipProb = current.precipProb;
  const weatherCode = current.weatherCode;
  const uv = current.uvIndex;
  const visibility = current.visibility;
  const humidity = current.humidity;

  // Cold gear
  if (temp < 0) {
    badges.push({ label: 'Extreme cold gear', color: 'blue' });
  } else if (temp < 20) {
    badges.push({ label: 'Insulated layers', color: 'blue' });
  }

  // Wind chill / exposed skin
  if (feelsLike < 0) {
    badges.push({ label: 'Exposed skin risk', color: 'blue' });
  }

  // Traction devices — snow + below freezing
  if (SNOW_CODES.has(weatherCode) && temp < 32) {
    badges.push({ label: 'Traction devices', color: 'blue' });
  }

  // Avalanche awareness — heavy snow codes
  if (HEAVY_SNOW_CODES.has(weatherCode)) {
    badges.push({ label: 'Avalanche awareness', color: 'yellow' });
  }

  // Wind protection
  if (gusts > 50) {
    badges.push({ label: 'Dangerous wind', color: 'red' });
  } else if (wind > 30) {
    badges.push({ label: 'Wind protection', color: 'yellow' });
  }

  // Heat risk
  if (temp > 95) {
    badges.push({ label: 'Extreme heat — early start only', color: 'red' });
  } else if (temp > 85) {
    badges.push({ label: 'Heat risk — extra water', color: 'orange' });
  }

  // UV
  if (uv > 10) {
    badges.push({ label: 'Extreme UV', color: 'red' });
  } else if (uv > 7) {
    badges.push({ label: 'Sun protection critical', color: 'orange' });
  }

  // Rain gear
  if (precipProb > 60) {
    badges.push({ label: 'Rain gear', color: 'purple' });
  }

  // Lightning / thunderstorm
  if (THUNDERSTORM_CODES.has(weatherCode)) {
    badges.push({ label: 'Lightning risk', color: 'purple' });
  }

  // Afternoon storm pattern — check if precip rises after noon
  if (hourly && hourly.length > 0) {
    const morningHours = [];
    const afternoonHours = [];

    for (const h of hourly) {
      const hour = new Date(h.hour).getHours();
      if (hour >= 6 && hour < 12) {
        morningHours.push(h.precipProb);
      } else if (hour >= 12 && hour < 18) {
        afternoonHours.push(h.precipProb);
      }
    }

    if (morningHours.length > 0 && afternoonHours.length > 0) {
      const avgMorning =
        morningHours.reduce((a, b) => a + b, 0) / morningHours.length;
      const avgAfternoon =
        afternoonHours.reduce((a, b) => a + b, 0) / afternoonHours.length;

      if (avgAfternoon > avgMorning + 20 && avgAfternoon > 40) {
        badges.push({ label: 'Early start advised', color: 'yellow' });
      }
    }
  }

  // Visibility
  if (visibility != null) {
    if (visibility < 402) {
      badges.push({ label: 'Whiteout conditions', color: 'gray' });
    } else if (visibility < 1609) {
      badges.push({ label: 'Navigation tools', color: 'gray' });
    }
  }

  // Muggy conditions
  if (humidity > 80 && temp > 75) {
    badges.push({ label: 'Muggy — electrolytes', color: 'orange' });
  }

  return badges;
}
