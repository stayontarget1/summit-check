import { getSeverityColor } from '../utils/severityCalc';
import { degreesToCompass } from '../utils/windDirection';

const cells = [
  {
    key: 'temp',
    label: 'Temp / Feels',
    icon: '\u{1F321}\uFE0F',
    getValue: (w) => `${Math.round(w.temp_f)}\u00B0 / ${Math.round(w.feels_like_f)}\u00B0`,
    getSeverity: (w) => getSeverityColor('temp', w.temp_f),
  },
  {
    key: 'wind',
    label: 'Wind',
    icon: '\u{1F4A8}',
    getValue: (w) => `${Math.round(w.wind_mph)} mph ${degreesToCompass(w.wind_deg)}`,
    getSeverity: (w) => getSeverityColor('wind', w.wind_mph),
  },
  {
    key: 'precip',
    label: 'Precip',
    icon: '\u{1F327}\uFE0F',
    getValue: (w) => `${w.precip_pct}%`,
    getSeverity: (w) => getSeverityColor('precip', w.precip_pct),
  },
  {
    key: 'humidity',
    label: 'Humidity',
    icon: '\u{1F4A7}',
    getValue: (w) => `${w.humidity_pct}%`,
    getSeverity: (w) => getSeverityColor('humidity', w.humidity_pct),
  },
  {
    key: 'uv',
    label: 'UV Index',
    icon: '\u2600\uFE0F',
    getValue: (w) => `${w.uv_index}`,
    getSeverity: (w) => getSeverityColor('uv', w.uv_index),
  },
  {
    key: 'visibility',
    label: 'Visibility',
    icon: '\u{1F441}\uFE0F',
    getValue: (w) => `${w.visibility_mi} mi`,
    getSeverity: (w) => getSeverityColor('visibility', w.visibility_mi),
  },
];

export default function ConditionsGrid({ weather }) {
  if (!weather) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.key}
          className="flex flex-col items-center rounded-lg bg-white/[0.04] px-1.5 py-2"
        >
          <span className="text-sm leading-none">{cell.icon}</span>
          <span className={`text-sm font-semibold mt-1 ${cell.getSeverity(weather)}`}>
            {cell.getValue(weather)}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}
