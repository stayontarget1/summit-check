import { getSeverityColor } from '../utils/severityCalc';
import { degreesToCompass } from '../utils/windDirection';

const cells = [
  {
    key: 'temp',
    label: 'Temp / Feels',
    getValue: (w) => `${Math.round(w.temp_f)}\u00B0 / ${Math.round(w.feels_like_f)}\u00B0`,
    getSeverity: (w) => getSeverityColor('temp', w.temp_f),
  },
  {
    key: 'wind',
    label: 'Wind',
    getValue: (w) => `${Math.round(w.wind_mph)} mph ${degreesToCompass(w.wind_deg)}`,
    getSeverity: (w) => getSeverityColor('wind', w.wind_mph),
  },
  {
    key: 'precip',
    label: 'Precip',
    getValue: (w) => `${w.precip_pct}%`,
    getSeverity: (w) => getSeverityColor('precip', w.precip_pct),
  },
  {
    key: 'humidity',
    label: 'Humidity',
    getValue: (w) => `${w.humidity_pct}%`,
    getSeverity: (w) => getSeverityColor('humidity', w.humidity_pct),
  },
  {
    key: 'uv',
    label: 'UV Index',
    getValue: (w) => `${w.uv_index}`,
    getSeverity: (w) => getSeverityColor('uv', w.uv_index),
  },
  {
    key: 'visibility',
    label: 'Visibility',
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
          className="hud-cell flex flex-col items-center px-1.5 py-2"
        >
          <span className={`text-sm font-mono-data font-bold ${cell.getSeverity(weather)}`}>
            {cell.getValue(weather)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}
