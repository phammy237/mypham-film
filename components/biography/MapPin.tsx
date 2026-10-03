"use client";
import { motion } from "framer-motion";

export type PinStatus = "unvisited" | "active" | "completed";

export function MapPin({
  number,
  x,
  y,
  status,
  label,
  onClick,
  reducedMotion = false,
  disabled = false,
}: {
  number: number;
  x: number;
  y: number;
  status: PinStatus;
  label: string;
  onClick: () => void;
  reducedMotion?: boolean;
  /** neutralizes activation (no click, no hover/tap feedback) while keeping the accessible name —
   *  for contexts like the scroll-driven journey where pin selection isn't wired up yet */
  disabled?: boolean;
}) {
  const isActive = status === "active";
  const isCompleted = status === "completed";

  return (
    // Positioning/centering lives on this static wrapper, never touched by Framer Motion.
    // The button below owns whileHover/whileTap, which animate `transform` themselves —
    // putting the centering transform on the same element as those causes Motion to
    // overwrite the translate(-50%,-50%) offset, making the pin visibly jump on hover/tap.
    <div className="absolute z-20" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        aria-label={label}
        aria-current={isActive ? "step" : undefined}
        className={`group relative flex items-center justify-center rounded-full font-mono text-xs font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-film-cream dark:focus-visible:ring-offset-film-black ${
          disabled ? "cursor-default" : ""
        } ${
          isActive
            ? "h-9 w-9 bg-accent text-film-cream dark:text-film-black shadow-[0_0_0_6px_rgba(65,103,136,0.18)] dark:shadow-[0_0_22px_6px_rgba(65,103,136,0.65)]"
            : isCompleted
            ? "h-8 w-8 bg-accent/90 text-film-cream dark:text-film-black dark:shadow-[0_0_10px_2px_rgba(65,103,136,0.4)]"
            : "h-8 w-8 border-2 border-accent/50 bg-card text-accent hover:border-accent hover:bg-accent-light dark:bg-navy-mid dark:text-journey-paper dark:border-accent/40 dark:hover:bg-accent/25 dark:hover:text-journey-paper"
        }`}
        whileHover={disabled ? undefined : { scale: 1.12 }}
        whileTap={disabled ? undefined : { scale: 0.94 }}
      >
        {isActive && !reducedMotion && (
          <motion.span
            className="absolute inset-0 rounded-full bg-accent"
            animate={{ scale: [1, 1.55, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span className="relative">
          {isCompleted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            number
          )}
        </span>
      </motion.button>
    </div>
  );
}
