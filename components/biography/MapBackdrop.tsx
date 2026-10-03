"use client";

/**
 * Decorative map backdrop behind the pins/route. When `riverPathD` is given
 * (a real, already-projected river path), it renders that. Otherwise falls
 * back to a generic abstract river + city-block texture for chapters that
 * don't have real geo data yet.
 */
export function MapBackdrop({
  width,
  height,
  riverPathD,
}: {
  width: number;
  height: number;
  riverPathD?: string | null;
}) {
  if (riverPathD) {
    return (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={riverPathD}
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-accent-light dark:stroke-journey-paper/20"
        />
        <path
          d={riverPathD}
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-transparent dark:stroke-journey-violet/40 dark:[filter:blur(6px)]"
        />
      </svg>
    );
  }

  const river = `M ${width * 0.78} ${-10}
    C ${width * 0.7} ${height * 0.12}, ${width * 0.82} ${height * 0.2}, ${width * 0.74} ${height * 0.3}
    S ${width * 0.58} ${height * 0.42}, ${width * 0.62} ${height * 0.52}
    S ${width * 0.5} ${height * 0.64}, ${width * 0.4} ${height * 0.7}
    S ${width * 0.22} ${height * 0.82}, ${width * 0.18} ${height + 10}`;

  const blocks = [
    { x: width * 0.1, y: height * 0.12, w: 54, h: 34 },
    { x: width * 0.2, y: height * 0.3, w: 40, h: 26 },
    { x: width * 0.36, y: height * 0.1, w: 60, h: 30 },
    { x: width * 0.15, y: height * 0.55, w: 46, h: 30 },
    { x: width * 0.4, y: height * 0.6, w: 50, h: 24 },
    { x: width * 0.55, y: height * 0.72, w: 44, h: 28 },
    { x: width * 0.68, y: height * 0.55, w: 38, h: 24 },
    { x: width * 0.3, y: height * 0.82, w: 56, h: 30 },
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={river}
        fill="none"
        strokeWidth={22}
        strokeLinecap="round"
        className="stroke-accent-light dark:stroke-journey-paper/20"
      />
      <path
        d={river}
        fill="none"
        strokeWidth={22}
        strokeLinecap="round"
        className="stroke-transparent dark:stroke-journey-violet/40 dark:[filter:blur(6px)]"
      />
      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx={4}
          className="fill-accent-light dark:fill-journey-paper/10 dark:stroke-journey-paper/10"
          stroke="none"
        />
      ))}
    </svg>
  );
}
