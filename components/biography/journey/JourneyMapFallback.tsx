"use client";

const ITINERARY = [
  "Hanoi, Vietnam — Home, Nam Thành Công, Ngôi Sao Hà Nội, Cầu Giấy, Nguyễn Huệ",
  "Rivermont Collegiate — Bettendorf, Iowa",
  "Gainesville, Florida — University of Florida",
];

/**
 * No-WebGL fallback for the journey map — this browser/device can't run MapLibre (or it threw at
 * runtime). Keeps the journey's content accessible without a real map, matching the bar
 * AbstractGlobeFallback already sets for the older /biography page's globe-only fallback, scoped
 * here to this page's own three-chapter itinerary instead.
 */
export function JourneyMapFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-base px-6 dark:bg-navy">
      <div className="max-w-sm rounded-2xl border border-border bg-card/60 px-6 py-5 text-center dark:border-journey-paper/30 dark:bg-navy-mid/60">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent dark:text-accent-lavender">The Journey</p>
        <p className="body-copy mt-3 text-sm leading-relaxed dark:text-journey-paper">
          Your browser can&apos;t render the interactive map, but here&apos;s the route:
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-left">
          {ITINERARY.map((stop) => (
            <li key={stop} className="font-body text-sm text-surface/85 dark:text-journey-paper">
              {stop}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
