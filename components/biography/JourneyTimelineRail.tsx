"use client";

type RailStage = { id: string; number: string; label: string };

const STAGES: RailStage[] = [
  { id: "globe", number: "01", label: "Vietnam" },
  { id: "vietnam-map", number: "01", label: "Vietnam" },
  { id: "transition", number: "→", label: "Crossing" },
  { id: "us-map", number: "02", label: "United States" },
  { id: "final", number: "✓", label: "Complete" },
];

/**
 * Persistent left-edge progress rail, matching the reference's vertical timeline. The site's
 * journey is click/stage-driven rather than scroll-driven, so this reads as a fixed progress
 * indicator (which stage you're on) instead of a literal scroll-position marker — same visual
 * language, adapted to the existing interaction model rather than replacing it.
 */
export function JourneyTimelineRail({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="pointer-events-none fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 xl:left-10 lg:flex">
      <div className="relative flex flex-col items-center">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/10 dark:bg-white/15" />
        {STAGES.map((stage, i) => {
          const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming";
          return (
            <div key={stage.id} className="relative flex items-center justify-center py-7 first:pt-0 last:pb-0">
              {/* number sits centered ON the dot itself — keeps the rail's whole footprint
                  to a single narrow column so it never reaches into page content */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 font-mono text-[9px] transition-colors duration-300 ${
                  state === "active"
                    ? "border-accent bg-accent text-white shadow-[0_0_14px_rgba(91,58,142,0.65)] dark:border-accent-lavender dark:bg-accent-lavender dark:text-navy dark:shadow-[0_0_14px_rgba(155,139,181,0.75)]"
                    : state === "done"
                    ? "border-accent/60 bg-accent/15 text-accent dark:border-accent-lavender/60 dark:bg-accent-lavender/15 dark:text-accent-lavender"
                    : "border-black/20 bg-base text-black/30 dark:border-white/25 dark:bg-navy dark:text-white/30"
                }`}
              >
                {stage.number}
              </div>
              {/* label docks directly under whichever dot is active — never a fixed position,
                  so it always points at the right stage */}
              {state === "active" && (
                <div className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.15em] text-accent dark:text-accent-lavender">
                  {stage.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** maps the existing click-driven stage machine onto the rail's 5 waypoints */
export function railIndexFor(stage: string, chapterIndex: number): number {
  if (stage === "globe") return 0;
  if (stage === "transition") return 2;
  if (stage === "final") return 4;
  // region / map / story / checkpoint — which chapter determines which map waypoint
  return chapterIndex === 0 ? 1 : 3;
}
