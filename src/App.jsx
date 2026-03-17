import { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import ConditionsCard from './components/ConditionsCard';
import EmptyState from './components/EmptyState';
import WeatherAnimation from './components/WeatherAnimation';
import { fetchWeather } from './utils/weatherApi';
import { fetchAISummary } from './utils/anthropicApi';
import { getGearBadges } from './utils/gearLogic';

export default function App() {
  const [peak, setPeak] = useState(null);
  const [weather, setWeather] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = useCallback(async (selectedPeak) => {
    setPeak(selectedPeak);
    setIsLoading(true);
    setError(null);
    setSummary('');
    setWeather(null);

    try {
      const data = await fetchWeather(selectedPeak.latitude, selectedPeak.longitude);

      // Map weatherApi output to the shape components expect
      const current = data.current;
      // Format sunrise/sunset ISO strings to readable time
      const formatTime = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      };

      const mappedWeather = {
        temp_f: current.temp,
        feels_like_f: current.feelsLike,
        wind_mph: current.windSpeed,
        wind_gusts: current.windGusts,
        wind_deg: current.windDirection,
        precip_pct: current.precipProb,
        precip_amount: current.precipAmount,
        weather_code: current.weatherCode,
        humidity_pct: current.humidity,
        uv_index: current.uvIndex,
        visibility_mi: Math.round((current.visibility / 1609.34) * 10) / 10,
        sunrise: formatTime(data.sunrise),
        sunset: formatTime(data.sunset),
        hourly: data.hourly.map((h) => ({
          hour: h.hour,
          temp_f: h.temp,
          feels_like_f: h.feelsLike,
          wind_mph: h.windSpeed,
          wind_gusts: h.windGusts,
          precip_pct: h.precipProb,
          weather_code: h.weatherCode,
          uv_index: h.uvIndex,
        })),
      };

      // Compute gear badges (gearLogic expects raw weatherApi format)
      mappedWeather._badges = getGearBadges(data);

      setWeather(mappedWeather);

      // Fetch AI summary (non-blocking for the card render)
      fetchAISummary(selectedPeak.name, selectedPeak.elevation_ft, data)
        .then((text) => setSummary(text))
        .catch(() => setSummary('Conditions loaded. Check the data below for details.'));
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isNight = weather
    ? (() => {
        const now = new Date();
        const [sunH, sunM] = (weather.sunrise || '6:00').split(':').map(Number);
        const [setH, setM] = (weather.sunset || '18:00').split(':').map(Number);
        const sunriseMin = sunH * 60 + sunM;
        const sunsetMin = setH * 60 + setM;
        const nowMin = now.getHours() * 60 + now.getMinutes();
        return nowMin < sunriseMin || nowMin > sunsetMin;
      })()
    : false;

  return (
    <>
      <WeatherAnimation
        weatherCode={weather?.weather_code ?? 0}
        temp={weather?.temp_f ?? 60}
        windSpeed={weather?.wind_mph ?? 5}
        isNight={isNight}
      />

      <div className="flex flex-col h-[100svh] px-4 py-3">
        {/* Search bar */}
        <div className={peak ? 'mb-2' : 'flex-1 flex items-center'}>
          <SearchBar onSelect={handleSelect} compact={!!peak} />
        </div>

        {/* Content area */}
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => peak && handleSelect(peak)}
              className="text-sm text-sky-400 hover:text-sky-300 underline"
            >
              Retry
            </button>
          </div>
        ) : peak ? (
          <div className="flex-1 min-h-0 animate-fade-in">
            <ConditionsCard
              peak={peak}
              weather={weather}
              summary={summary}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}
