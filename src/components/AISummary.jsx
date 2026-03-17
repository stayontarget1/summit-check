export default function AISummary({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-2 py-1">
        <div className="h-4 w-full rounded bg-white/[0.06] animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-pulse" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="py-1">
      <p className="text-[17px] leading-snug text-white/85">
        <span className="text-white/20 mr-1 text-xl leading-none">&ldquo;</span>
        {summary}
      </p>
    </div>
  );
}
