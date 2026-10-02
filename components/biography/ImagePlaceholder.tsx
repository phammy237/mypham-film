"use client";

/**
 * Stand-in for a photo that hasn't been dropped in yet. Used across the preview
 * card, the expanded story hero, and story-section layouts so every image slot
 * is fully visible/demoable before real photos exist.
 */
export function ImagePlaceholder({
  className = "",
  caption,
  bare = false,
}: {
  className?: string;
  caption?: string;
  /** true when the parent already supplies its own border/rounding/background (e.g. a modal hero) */
  bare?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden ${
        bare
          ? ""
          : "rounded-xl border border-dashed border-accent/25 bg-accent-light/40 dark:border-white/10 dark:bg-white/[0.03]"
      } ${className}`}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-accent/40 dark:text-white/20"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      {caption && (
        <p className="px-3 text-center font-mono text-[10px] uppercase tracking-wider text-accent/50 dark:text-white/25">
          {caption}
        </p>
      )}
    </div>
  );
}
