const colorMap = {
  blue: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20',
  red: 'bg-red-500/15 text-red-300 border border-red-500/20',
  orange: 'bg-orange-500/15 text-orange-300 border border-orange-500/20',
  yellow: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/20',
  gray: 'bg-gray-500/15 text-gray-300 border border-gray-500/20',
};

export default function GearBadges({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge, i) => (
        <span
          key={`${badge.label}-${i}`}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono-data font-bold ${colorMap[badge.color] || colorMap.gray}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
