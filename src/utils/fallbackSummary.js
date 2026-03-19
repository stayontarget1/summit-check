/**
 * Generate a compact weather summary when the AI API is unavailable.
 * Format: key numbers in a single readable line.
 */
export function generateFallbackSummary(weatherData) {
  const { current } = weatherData;
  const temp = Math.round(current.temp);
  const feelsLike = Math.round(current.feelsLike);
  const wind = Math.round(current.windSpeed);
  const gusts = Math.round(current.windGusts);
  const precip = current.precipProb;
  const visMi = Math.round((current.visibility / 1609.34) * 10) / 10;

  const parts = [`${temp}°F`];

  if (Math.abs(temp - feelsLike) > 5) {
    parts[0] += ` (feels ${feelsLike}°F)`;
  }

  if (gusts > 25) {
    parts.push(`${wind}mph wind, gusts ${gusts}mph`);
  } else {
    parts.push(`${wind}mph wind`);
  }

  if (precip > 0) {
    parts.push(`${precip}% precip`);
  }

  if (visMi < 5) {
    parts.push(`${visMi}mi vis`);
  }

  return parts.join(', ') + '.';
}
