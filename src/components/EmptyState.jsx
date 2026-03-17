export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 -mt-8">
      <h1 className="text-2xl font-light tracking-wider text-white/90">
        Summit Check
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Mountain conditions at a glance
      </p>

      {/* Mountain silhouette */}
      <svg
        viewBox="0 0 320 100"
        className="w-full max-w-[280px] mt-8 opacity-30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="0,90 40,60 65,72 100,35 130,55 160,28 185,50 210,38 240,62 270,45 300,65 320,55"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gray-700"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points="0,95 50,78 90,85 130,70 170,80 200,68 240,75 280,65 320,72"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-800"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
