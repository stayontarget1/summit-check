import AISummary from './AISummary';
import GearBadges from './GearBadges';
import ConditionsGrid from './ConditionsGrid';
import HourlyOutlook from './HourlyOutlook';

function SkeletonBlock({ className }) {
  return <div className={`skeleton ${className}`} />;
}

function Skeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="space-y-1.5">
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
      <div className="flex gap-1.5">
        <SkeletonBlock className="h-5 w-16 rounded-full" />
        <SkeletonBlock className="h-5 w-20 rounded-full" />
        <SkeletonBlock className="h-5 w-14 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-14" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

export default function ConditionsCard({ peak, weather, summary, isLoading }) {
  return (
    <div className="glass-card rounded-2xl animate-[fadeIn_0.35s_ease-out]">
      {isLoading ? (
        <Skeleton />
      ) : (
        <div className="p-4 space-y-3">
          {/* Header */}
          {peak && (
            <div>
              <h2 className="text-lg font-semibold text-white/95 leading-tight">
                {peak.name}
              </h2>
              <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-0.5 font-mono-data">
                <span>{peak.elevation_ft?.toLocaleString()} ft</span>
                {weather?.sunrise && (
                  <>
                    <span className="text-cyan-400/20">|</span>
                    <span>{weather.sunrise}</span>
                    <span className="text-cyan-400/20">|</span>
                    <span>{weather.sunset}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* AI Summary */}
          <AISummary summary={summary} isLoading={false} />

          {/* Gear Badges */}
          {weather && <GearBadges badges={weather._badges} />}

          {/* Conditions Grid */}
          <ConditionsGrid weather={weather} />

          {/* Hourly Outlook */}
          <HourlyOutlook hourly={weather?.hourly} />
        </div>
      )}
    </div>
  );
}
