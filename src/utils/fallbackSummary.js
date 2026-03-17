/**
 * Generate a plain-english weather summary from thresholds when the AI API is unavailable.
 */
export function generateFallbackSummary(weatherData) {
  const { current } = weatherData;
  const parts = [];

  // Temperature category
  const temp = current.temp;
  const feelsLike = current.feelsLike;

  if (temp < 0) {
    parts.push('Extreme cold conditions — exposed skin will freeze rapidly.');
  } else if (temp < 32) {
    if (temp < 20) {
      parts.push(`Bitterly cold at ${Math.round(temp)}°F${feelsLike < temp ? ` (feels like ${Math.round(feelsLike)}°F)` : ''}.`);
    } else {
      parts.push(`Cold conditions at ${Math.round(temp)}°F — below freezing.`);
    }
  } else if (temp < 55) {
    parts.push(`Cool at ${Math.round(temp)}°F.`);
  } else if (temp > 100) {
    parts.push(`Extreme heat at ${Math.round(temp)}°F — dangerous without adequate water and shade.`);
  } else if (temp > 90) {
    parts.push(`Hot at ${Math.round(temp)}°F — heat exhaustion risk, carry extra water.`);
  } else if (temp > 75) {
    parts.push(`Warm at ${Math.round(temp)}°F.`);
  } else {
    parts.push(`Mild conditions at ${Math.round(temp)}°F.`);
  }

  // Wind
  const wind = current.windSpeed;
  const gusts = current.windGusts;

  if (gusts > 50) {
    parts.push(`Dangerous gusts to ${Math.round(gusts)} mph — avoid exposed ridges.`);
  } else if (wind > 35) {
    parts.push(`High winds at ${Math.round(wind)} mph with gusts to ${Math.round(gusts)} mph.`);
  } else if (wind > 20) {
    parts.push(`Windy at ${Math.round(wind)} mph.`);
  } else if (wind > 10) {
    parts.push('Breezy.');
  }

  // Precipitation
  const precipProb = current.precipProb;
  const weatherCode = current.weatherCode;

  if (precipProb > 60) {
    if (temp < 32) {
      parts.push(`${precipProb}% chance of snow.`);
    } else {
      parts.push(`${precipProb}% chance of rain.`);
    }
  } else if (precipProb > 30) {
    if (temp < 32) {
      parts.push('Possible snow showers.');
    } else {
      parts.push('Possible rain.');
    }
  }

  // Thunderstorm warning from weather code
  if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
    parts.push('Thunderstorms active — lightning risk, get below treeline.');
  }

  // UV
  const uv = current.uvIndex;
  if (uv > 10) {
    parts.push('Extreme UV — sunburn in minutes without protection.');
  } else if (uv > 7) {
    parts.push('High UV — sun protection critical.');
  }

  // Humidity + heat combo
  if (current.humidity > 80 && temp > 75) {
    parts.push('Muggy — stay hydrated with electrolytes.');
  }

  // Visibility
  const visibility = current.visibility;
  if (visibility != null) {
    if (visibility < 402) {
      parts.push('Near-zero visibility — whiteout conditions.');
    } else if (visibility < 1609) {
      parts.push('Low visibility — bring navigation tools.');
    }
  }

  if (parts.length === 0) {
    return 'Conditions look good for the summit.';
  }

  return parts.slice(0, 3).join(' ');
}
