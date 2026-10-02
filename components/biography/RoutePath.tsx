"use client";
import { motion } from "framer-motion";

type Point = { x: number; y: number };

/** Builds a smooth cubic-bezier path through the given percentage points. */
function smoothPath(points: Point[], width: number, height: number): string {
  if (points.length < 2) return "";
  const px = points.map((p) => ({ x: (p.x / 100) * width, y: (p.y / 100) * height }));
  let d = `M ${px[0].x} ${px[0].y}`;
  for (let i = 0; i < px.length - 1; i++) {
    const p0 = px[i - 1] ?? px[i];
    const p1 = px[i];
    const p2 = px[i + 1];
    const p3 = px[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function RoutePath({
  points,
  width,
  height,
  progress = 1,
  reducedMotion = false,
  className = "",
}: {
  points: Point[];
  width: number;
  height: number;
  progress?: number;
  reducedMotion?: boolean;
  className?: string;
}) {
  const d = smoothPath(points, width, height);
  if (!d) return null;

  const transition = reducedMotion ? { duration: 0 } : { duration: 1.1, ease: "easeInOut" as const };

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d} fill="none" strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round" className="stroke-[#C9BAD9] dark:stroke-[#3D3560]" />
      {/* glow underlay, dark mode only */}
      <motion.path
        d={d}
        fill="none"
        stroke="#5B3A8E"
        strokeWidth={7}
        strokeLinecap="round"
        className="hidden opacity-60 dark:block dark:[filter:blur(4px)]"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: progress }}
        transition={transition}
      />
      {/* bright core line */}
      <motion.path
        d={d}
        fill="none"
        stroke="#5B3A8E"
        strokeWidth={2}
        strokeLinecap="round"
        className="dark:[filter:drop-shadow(0_0_3px_rgba(196,181,253,0.9))]"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: progress }}
        transition={transition}
      />
    </svg>
  );
}
