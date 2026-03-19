export default function EmptyState() {
  return (
    <svg
      viewBox="0 0 320 100"
      className="w-full max-w-[280px] mt-10 opacity-25 mountain-glow"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        points="0,90 40,60 65,72 100,35 130,55 160,28 185,50 210,38 240,62 270,45 300,65 320,55"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-cyan-700"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points="0,95 50,78 90,85 130,70 170,80 200,68 240,75 280,65 320,72"
        stroke="currentColor"
        strokeWidth="1"
        className="text-cyan-900"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
