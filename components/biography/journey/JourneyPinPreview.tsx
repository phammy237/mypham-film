"use client";

export type JourneyPinPreviewData = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  /** short one-line description, shown when there's room */
  description?: string;
};

/**
 * Minimal hover/tap teaser — number, title, subtitle, a short description if space allows, and a
 * real "Learn more" action. Shown while hovering any pin (any status — unvisited, active, or
 * completed), not just the one currently being read; the full reading experience lives in the
 * scroll-driven story panels (see JourneyStoryLayer). Deliberately not a heading element: this is
 * transient UI chrome, not document content, so it stays out of the page's heading hierarchy.
 *
 * Floating UI over the map, not a boxed dashboard widget — subtle dark/light translucent surface,
 * no heavy border, no large card footprint.
 */
export function JourneyPinPreview({
  pin,
  onLearnMore,
}: {
  pin: JourneyPinPreviewData | null;
  onLearnMore: (pinId: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-6 transition-opacity duration-200 md:inset-x-auto md:bottom-auto md:right-6 md:top-1/2 md:-translate-y-1/2 md:justify-end md:px-0 md:pb-0 lg:right-10 ${
        pin ? "opacity-100" : "opacity-0"
      }`}
    >
      {pin && (
        <div className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-card/95 px-5 py-4 shadow-xl dark:bg-navy-mid/95 md:w-[300px]">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-medium text-white dark:bg-accent-lavender dark:text-navy">
            {String(pin.number).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="heading text-lg leading-tight">{pin.title}</p>
            <p className="body-copy mt-0.5 text-sm dark:text-journey-paper">{pin.subtitle}</p>
            {pin.description && (
              <p className="mt-1 line-clamp-2 font-body text-xs leading-relaxed text-muted dark:text-journey-muted-dark">
                {pin.description}
              </p>
            )}
            <button
              type="button"
              onClick={() => onLearnMore(pin.id)}
              className="mt-2 font-mono text-xs text-accent transition-colors hover:text-accent dark:text-accent-lavender dark:hover:text-accent-lavender"
            >
              Learn more →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
