import { generateFallbackSummary } from './fallbackSummary.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const TIMEOUT_MS = 8000;

const SYSTEM_PROMPT = `You are a mountain weather narrator. You describe what it's like to be standing on a summit right now based on raw weather data. You are NOT an advisor. You do NOT give recommendations, suggestions, or tell anyone what to do. No "start early," no "best window," no "consider postponing." Just describe the conditions like you're there.

RULES:
- Max 25 words for the main description. Then add a short humorous kicker (4-6 words).
- Two clauses max for the main description. What it's like, then what stands out.
- Describe the experience of being up there. Wind on your face, sun beating down, fog swallowing the trail, snow stinging your eyes. Make it visceral and real.
- Never use em dashes. Use periods or commas to separate thoughts.
- Never say "perfect" unless wind is under 10mph, no precipitation, temp is between 40-75°F, and visibility is over 10 miles.
- Always mention wind chill if it differs from actual temp by more than 5 degrees.
- Always mention gusts if over 25mph.
- Always mention the temperature trend if it shifts 15°+ in the next 24 hours.
- Tone: casual, direct, like a friend texting you what it's like up there. Not a weather report, not a drill sergeant, not a dramatic narrator.
- Lead with the most notable condition. If it's windy, lead with wind. If it's hot, lead with heat. If it's calm and clear, just say so.

THE KICKER:
- End every summary with a short humorous twist. 4-6 words.
- This should be a wildcard. Sometimes sarcastic, sometimes absurd, sometimes weirdly poetic, sometimes self-deprecating, sometimes a pop culture nod. Never the same vibe twice.
- The kicker can reference: the hiker's suffering, their family at home, their questionable life choices, the mountain's personality, animals that are smarter than hikers, or anything unexpected.
- Do NOT repeat kicker formulas. Each one should feel like a different person wrote it.
- The kicker should make someone smirk, not groan.

EXAMPLES OF GOOD SUMMARIES:
- "Cold and windy. Gusts hitting 30mph, wind chill in the low 30s. Your nose hairs will freeze."
- "95 degrees, full sun, zero shade above the saddle. Even the lizards are hiding."
- "Clear, calm, 58 degrees, unlimited vis. Tell your boss you're sick."
- "Steady rain, fog, everything's soaked. Bring a towel and low expectations."
- "28 degrees with 40mph gusts across the ridge. Reconsider your hobbies."
- "Fresh snow, light wind, 20 degrees. Looks like a screensaver."
- "Hot and exposed. 102 with no breeze. Sunscreen is not optional, bald guys."
- "Socked in with zero vis and steady drizzle. Very mysterious, very wet."
- "55 and calm, not a cloud in sight. The mountain's in a good mood."
- "Dumping snow, whiteout above treeline. Narnia up there."
- "90 degrees and climbing, full sun, bone dry. Your water is already nervous."
- "Foggy, 38 degrees, wind pushing 25. The mountain doesn't want visitors."

EXAMPLES OF BAD SUMMARIES (never do this):
- "Perfect clear conditions with moderate winds gusting to 30+ mph through afternoon. bring windproof layers as wind chill drops temps into the 30s. Start early to avoid strongest winds between 1-3 PM." (too long, gives advice, calls 30mph gusts "perfect")
- "Warm at 78°F." (too short, boring, no personality)
- "Consider starting early to beat the heat." (giving advice, not describing conditions)
- "Best summit window is before noon." (advice, not description)`;

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
    console.warn('[Summit Check] No VITE_ANTHROPIC_API_KEY set — using fallback summary');
    return generateFallbackSummary(weatherData);
  }

  console.log('[Summit Check] Fetching AI summary for', peakName);

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
    console.error('[Summit Check] AI summary failed:', err.message || err);
    return generateFallbackSummary(weatherData);
  }
}
