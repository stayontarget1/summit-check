const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW',
];

/**
 * Convert wind direction in degrees to a compass bearing string.
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {string} Compass bearing (e.g. "NNW")
 */
export function degreesToCompass(degrees) {
  if (degrees == null || isNaN(degrees)) return '--';
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS_POINTS[index];
}
