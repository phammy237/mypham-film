"use client";
import { useMemo, useState } from "react";
import { geoMercator } from "d3-geo";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import type { FeatureCollection, Point } from "geojson";
import { usJourneyCopy, usJourneyPins } from "@/data/biography/usJourney";
import { useJourneyState } from "@/lib/hooks/useJourneyState";
import { HanoiMap, HANOI_MAP_WIDTH, HANOI_MAP_HEIGHT, type ProjectedPin } from "@/components/biography/HanoiMap";
import { PinPreviewCard } from "@/components/biography/PinPreviewCard";
import { MobilePreviewSheet } from "@/components/biography/MobilePreviewSheet";
import { JourneyProgress } from "@/components/biography/JourneyProgress";
import { JourneyLegend } from "@/components/biography/JourneyLegend";
import { ExpandedStory } from "@/components/biography/ExpandedStory";

// Two widely-spaced points at continental scale — a generous margin keeps them
// from sitting flush against the map's edges the way Hanoi's dense cluster doesn't need to.
const MARGIN = 180;

/**
 * Phase 2: pin interactions, preview cards, and the expanded photo story.
 * The chapter checkpoint/interlude flow and the globe-crossing transition
 * still land in Phase 3 — see HanoiJourneySection for that fuller pattern.
 */
export function USJourneySection() {
  const journey = useJourneyState(usJourneyPins);
  const prefersReducedMotion = useReducedMotion();
  const [storyOpen, setStoryOpen] = useState(false);

  const projectedPins = useMemo(() => {
    const pinFeatureCollection: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: journey.pins.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: { type: "Point", coordinates: [p.coordinates.lon, p.coordinates.lat] },
      })),
    };

    const projection = geoMercator().fitExtent(
      [
        [MARGIN, MARGIN],
        [HANOI_MAP_WIDTH - MARGIN, HANOI_MAP_HEIGHT - MARGIN],
      ],
      pinFeatureCollection
    );

    const projected: ProjectedPin[] = journey.pins.map((p) => {
      const point = projection([p.coordinates.lon, p.coordinates.lat]);
      return {
        ...p,
        x: point ? (point[0] / HANOI_MAP_WIDTH) * 100 : 50,
        y: point ? (point[1] / HANOI_MAP_HEIGHT) * 100 : 50,
      };
    });

    return projected;
  }, [journey.pins]);

  const metaLabel = `United States · ${journey.activePin.yearRange}`;

  const handleLearnMore = () => {
    journey.markActiveCompleted();
    setStoryOpen(true);
  };
  const handleCloseStory = () => setStoryOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      journey.next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      journey.prev();
    }
  };

  return (
    <section
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden rounded-3xl border border-border bg-base p-5 shadow-sm dark:border-journey-paper/30 dark:bg-navy md:p-8"
      aria-label="United States journey map"
    >
      <div className="relative z-10 mb-5 flex flex-wrap items-start justify-between gap-4 md:mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{usJourneyCopy.eyebrow}</p>
          <h2 className="heading mt-2 text-3xl md:text-4xl">{usJourneyCopy.heading}</h2>
          <p className="body-copy mt-1.5 text-sm dark:text-journey-muted-dark">{usJourneyCopy.instruction}</p>
        </div>
        <JourneyProgress index={journey.activeIndex} total={journey.total} />
      </div>

      <div className="relative">
        {/* No real geo backdrop for the U.S. chapter yet — HanoiMap's river/road/lake
            props are optional, so it renders cleanly without them. */}
        <HanoiMap
          pins={projectedPins}
          activePinId={journey.activePin.id}
          statusFor={journey.statusFor}
          onSelectPin={journey.selectById}
          reducedMotion={!!prefersReducedMotion}
        />

        {/* desktop floating panel: pin preview */}
        <div className="absolute right-4 top-1/2 hidden w-[300px] -translate-y-1/2 lg:block xl:w-[320px]">
          <PinPreviewCard
            pin={journey.activePin}
            metaLabel={metaLabel}
            index={journey.activeIndex}
            total={journey.total}
            onLearnMore={handleLearnMore}
            onPrev={journey.prev}
            onNext={journey.next}
            canPrev={journey.canPrev}
            canNext={journey.canNext}
          />
        </div>

        <JourneyLegend className="absolute bottom-4 left-4 hidden md:inline-flex" />
      </div>

      {/* tablet/below-lg: panel sits under the map instead of floating over it */}
      <div className="mt-5 hidden md:block lg:hidden">
        <PinPreviewCard
          pin={journey.activePin}
          metaLabel={metaLabel}
          index={journey.activeIndex}
          total={journey.total}
          onLearnMore={handleLearnMore}
          onPrev={journey.prev}
          onNext={journey.next}
          canPrev={journey.canPrev}
          canNext={journey.canNext}
          className="max-w-md"
        />
      </div>

      <MobilePreviewSheet
        pin={journey.activePin}
        metaLabel={metaLabel}
        index={journey.activeIndex}
        total={journey.total}
        onLearnMore={handleLearnMore}
        onPrev={journey.prev}
        onNext={journey.next}
        canPrev={journey.canPrev}
        canNext={journey.canNext}
      />

      <AnimatePresence>
        {storyOpen && (
          <ExpandedStory
            pin={journey.activePin}
            index={journey.activeIndex}
            total={journey.total}
            onClose={handleCloseStory}
            onPrev={journey.prev}
            onNext={journey.next}
            canPrev={journey.canPrev}
            canNext={journey.canNext}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
