const colorMap = {
  blue: 'bg-blue-500/20 text-blue-300',
  red: 'bg-red-500/20 text-red-300',
  orange: 'bg-orange-500/20 text-orange-300',
  yellow: 'bg-yellow-500/20 text-yellow-300',
  purple: 'bg-purple-500/20 text-purple-300',
  gray: 'bg-gray-500/20 text-gray-300',
};

export default function GearBadges({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge, i) => (
        <span
          key={`${badge.label}-${i}`}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colorMap[badge.color] || colorMap.gray}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
