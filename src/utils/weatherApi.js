const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch weather data from Open-Meteo for a given latitude/longitude.
 * Returns parsed current conditions and 24-hour forecast.
 */
export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weathercode',
      'windspeed_10m',
      'windgusts_10m',
      'winddirection_10m',
      'visibility',
      'relativehumidity_2m',
      'uv_index',
    ].join(','),
    temperature_unit: 'fahrenheit',
    windspeed_unit: 'mph',
    forecast_days: '2',
    daily: 'sunrise,sunset',
    timezone: 'auto',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return parseWeatherData(data);
}

/**
 * Find the hourly index closest to the current time.
 */
function findClosestHourIndex(times) {
  const now = new Date();
  let closestIdx = 0;
  let closestDiff = Infinity;

  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - now.getTime());
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIdx = i;
    }
  }

  return closestIdx;
}

/**
 * Parse raw Open-Meteo response into a clean object.
 */
function parseWeatherData(data) {
  const { hourly, daily } = data;
  const times = hourly.time;
  const currentIdx = findClosestHourIndex(times);

  const current = {
    temp: hourly.temperature_2m[currentIdx],
    feelsLike: hourly.apparent_temperature[currentIdx],
    windSpeed: hourly.windspeed_10m[currentIdx],
    windGusts: hourly.windgusts_10m[currentIdx],
    windDirection: hourly.winddirection_10m[currentIdx],
    precipProb: hourly.precipitation_probability[currentIdx],
    precipAmount: hourly.precipitation[currentIdx],
    weatherCode: hourly.weathercode[currentIdx],
    humidity: hourly.relativehumidity_2m[currentIdx],
    uvIndex: hourly.uv_index[currentIdx],
    visibility: hourly.visibility[currentIdx],
  };

  // Build the next 24 hours of forecast data starting from the current index
  const hourlyForecast = [];
  for (let i = currentIdx; i < Math.min(currentIdx + 24, times.length); i++) {
    hourlyForecast.push({
      hour: hourly.time[i],
      temp: hourly.temperature_2m[i],
      feelsLike: hourly.apparent_temperature[i],
      windSpeed: hourly.windspeed_10m[i],
      windGusts: hourly.windgusts_10m[i],
      precipProb: hourly.precipitation_probability[i],
      weatherCode: hourly.weathercode[i],
      uvIndex: hourly.uv_index[i],
    });
  }

  // Parse sunrise/sunset from the first day of daily data
  const sunrise = daily.sunrise?.[0] ?? null;
  const sunset = daily.sunset?.[0] ?? null;

  return {
    current,
    hourly: hourlyForecast,
    sunrise,
    sunset,
  };
}
