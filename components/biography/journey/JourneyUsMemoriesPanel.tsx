"use client";
import { forwardRef } from "react";
import { StoryMedia } from "@/components/biography/StoryMedia";
import { usMemoriesCopy, type MemoryMarker } from "@/data/biography/usJourney";

/**
 * The us-memories overlay — not anchored to a numbered pin, so it's a lighter sibling of
 * JourneyUsStoryPanel rather than a forced reuse of that pin-shaped component. Renders the
 * tasteful "more to come" copy while `markers` is empty (today's case); once real markers exist,
 * each renders as a small photo + caption secondary memory — deliberately never promoted into a
 * full numbered geographic pin, since that's not what these are.
 *
 * JourneyStoryLayer owns this element's opacity/transform via the forwarded ref, the same
 * imperative pattern as JourneyUsStoryPanel — nothing here animates on its own.
 */
export const JourneyUsMemoriesPanel = forwardRef<HTMLDivElement, { markers: MemoryMarker[]; loadMedia: boolean }>(
  function JourneyUsMemoriesPanel({ markers, loadMedia }, ref) {
    return (
      // Inline editorial annotation, lower-left — "it should look like annotation text on the map,"
      // never a centered floating card (no rounded rectangle, no shadow, no blur, no dark panel).
      <div
        ref={ref}
        role="region"
        aria-label="More U.S. memories"
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: "none" }}
        className="pointer-events-none absolute left-[8%] bottom-[16%] z-20 max-w-[360px]"
      >
        {markers.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-journey-violet dark:text-journey-lilac">
              {usMemoriesCopy.eyebrow}
            </p>
            <h2 className="font-display text-[32px] leading-[1.05] text-journey-ink dark:text-journey-paper">
              {usMemoriesCopy.heading}
            </h2>
            <p className="max-w-[320px] font-body text-[15px] leading-[1.55] text-journey-body dark:text-[rgba(231,230,228,0.70)]">
              {usMemoriesCopy.body}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-5">
            {markers.map((marker) => (
              <div key={marker.id}>
                {marker.image && (
                  <div className="mb-2 w-[220px]">
                    <StoryMedia images={[marker.image]} alt={marker.title} loadMedia={loadMedia} />
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <p className="font-display text-[15px] text-journey-ink dark:text-journey-paper">{marker.title}</p>
                  {marker.year && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-journey-violet/70 dark:text-journey-lilac/70">
                      {marker.year}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 max-w-[320px] font-body text-[13px] leading-relaxed text-journey-body dark:text-[rgba(231,230,228,0.70)]">
                  {marker.caption}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
