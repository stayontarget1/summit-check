import { generateFallbackSummary } from './fallbackSummary.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const TIMEOUT_MS = 8000;

const SYSTEM_PROMPT =
  'You are a concise mountain weather advisor for hikers and mountaineers in the United States. ' +
  'Given raw weather data for a summit, write a 1-2 sentence plain-english conditions summary. ' +
  'Be direct, practical, and specific to the conditions — whether that\'s extreme cold, extreme heat, ' +
  'rain, lightning, wind, fog, snow, or perfect weather. Mention timing windows when relevant ' +
  '(e.g., \'be off the summit by noon\'). Reference real hazards hikers face: lightning, heat exhaustion, ' +
  'hypothermia, whiteout, rockfall from freeze-thaw, slick trails. Never use generic filler. Never hedge. ' +
  'Speak like an experienced mountaineer briefing a partner. Keep it under 40 words.';

/**
 * Format weather data into a readable string for the AI prompt.
 */
function formatWeatherForPrompt(peakName, elevation, weatherData) {
  const { current, hourly } = weatherData;

  let prompt = `Peak: ${peakName} (${elevation} ft)\n`;
  prompt += `Current conditions:\n`;
  prompt += `  Temp: ${current.temp}°F (feels like ${current.feelsLike}°F)\n`;
  prompt += `  Wind: ${current.windSpeed} mph, gusts ${current.windGusts} mph\n`;
  prompt += `  Precip probability: ${current.precipProb}%\n`;
  prompt += `  Weather code: ${current.weatherCode}\n`;
  prompt += `  Humidity: ${current.humidity}%\n`;
  prompt += `  UV Index: ${current.uvIndex}\n`;
  prompt += `  Visibility: ${current.visibility}m\n`;

  if (hourly && hourly.length > 0) {
    prompt += `\nNext ${hourly.length} hours forecast:\n`;
    for (const h of hourly.slice(0, 12)) {
      const time = new Date(h.hour).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      });
      prompt += `  ${time}: ${h.temp}°F, wind ${h.windSpeed}mph, gusts ${h.windGusts}mph, precip ${h.precipProb}%, code ${h.weatherCode}\n`;
    }
  }

  return prompt;
}

/**
 * Fetch an AI-generated weather summary from the Anthropic API.
 * Falls back to a rule-based summary on failure.
 */
export async function fetchAISummary(peakName, elevation, weatherData) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateFallbackSummary(weatherData);
  }

  const userMessage = formatWeatherForPrompt(peakName, elevation, weatherData);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 150,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      throw new Error('Empty response from Anthropic API');
    }

    return text.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    return generateFallbackSummary(weatherData);
  }
}
