import { getOverallSeverity, severityBgClass } from '../utils/severityCalc';

const BLOCKS = [
  { label: 'Next 6h', start: 0, end: 6 },
  { label: '6-12h', start: 6, end: 12 },
  { label: '12-18h', start: 12, end: 18 },
  { label: '18-24h', start: 18, end: 24 },
];

function getWeatherIcon(code) {
  if (code == null) return '\u2601\uFE0F';
  if (code === 0 || code === 1) return '\u2600\uFE0F';
  if (code === 2) return '\u26C5';
  if (code === 3) return '\u2601\uFE0F';
  if (code >= 51 && code <= 67) return '\u{1F327}\uFE0F';
  if (code >= 71 && code <= 77) return '\u2744\uFE0F';
  if (code >= 80 && code <= 82) return '\u{1F327}\uFE0F';
  if (code >= 95) return '\u26C8\uFE0F';
  if (code === 45 || code === 48) return '\u{1F32B}\uFE0F';
  return '\u2601\uFE0F';
}

function getDominantIcon(slice) {
  if (!slice || slice.length === 0) return '\u2601\uFE0F';
  const counts = {};
  for (const h of slice) {
    const icon = getWeatherIcon(h.weather_code);
    counts[icon] = (counts[icon] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

const SEVERITY_BORDER = {
  0: 'border-t-emerald-500/40',
  1: 'border-t-amber-500/40',
  2: 'border-t-orange-500/40',
  3: 'border-t-red-500/40',
};

export default function HourlyOutlook({ hourly }) {
  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {BLOCKS.map(({ label, start, end }) => {
        const slice = hourly.slice(start, end);
        if (slice.length === 0) return null;

        const temps = slice.map((h) => h.temp_f);
        const winds = slice.map((h) => h.wind_mph);
        const hi = Math.round(Math.max(...temps));
        const lo = Math.round(Math.min(...temps));
        const windHi = Math.round(Math.max(...winds));
        const windLo = Math.round(Math.min(...winds));
        const severity = getOverallSeverity(slice);
        const icon = getDominantIcon(slice);

        return (
          <div
            key={label}
            className={`flex flex-col items-center rounded-lg px-1 py-1.5 border-t-2 ${SEVERITY_BORDER[severity] || ''} ${severityBgClass(severity)}`}
          >
            <span className="text-[11px] text-gray-500 font-medium">{label}</span>
            <span className="text-base leading-none mt-0.5">{icon}</span>
            <span className="text-xs font-mono-data font-bold text-white/90 mt-0.5">
              {hi}/{lo}
            </span>
            <span className="text-[11px] text-gray-500 font-mono-data">
              {windLo}-{windHi}
            </span>
          </div>
        );
      })}
    </div>
  );
}
