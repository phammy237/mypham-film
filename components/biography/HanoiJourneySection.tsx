"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { hanoiJourneyCopy, hanoiJourneyPins } from "@/data/biography/hanoiJourney";
import { useJourneyState } from "@/lib/hooks/useJourneyState";
import { useHanoiMapProjection } from "@/lib/hooks/useHanoiMapProjection";
import { HanoiMap } from "@/components/biography/HanoiMap";
import { PinPreviewCard } from "@/components/biography/PinPreviewCard";
import { MobilePreviewSheet } from "@/components/biography/MobilePreviewSheet";
import { JourneyProgress } from "@/components/biography/JourneyProgress";
import { JourneyLegend } from "@/components/biography/JourneyLegend";
import { ChapterStoryModal } from "@/components/biography/ChapterStoryModal";
import { ChapterCheckpoint } from "@/components/biography/ChapterCheckpoint";
import { NotYetInterlude } from "@/components/biography/NotYetInterlude";

type View = "map" | "checkpoint" | "interlude";

export function HanoiJourneySection({
  onLearnMore,
  onChapterComplete,
}: {
  onLearnMore?: (pinId: string) => void;
  /** called when the reader crosses the ocean at the end of the interlude — will drive the globe transition / U.S. chapter once that's built */
  onChapterComplete?: () => void;
}) {
  const journey = useJourneyState(hanoiJourneyPins);
  const prefersReducedMotion = useReducedMotion();
  const { projectedPins, riverPathD, lakePathD, roadsPathD } = useHanoiMapProjection(journey.pins);

  const [storyOpen, setStoryOpen] = useState(false);
  const [pendingCheckpoint, setPendingCheckpoint] = useState(false);
  const [view, setView] = useState<View>("map");

  const handleLearnMore = () => {
    const willCompleteAll =
      !journey.completedIds.includes(journey.activePin.id) && journey.completedIds.length + 1 === journey.total;
    journey.markActiveCompleted();
    setStoryOpen(true);
    if (willCompleteAll) setPendingCheckpoint(true);
    onLearnMore?.(journey.activePin.id);
  };

  const handleCloseStory = () => {
    setStoryOpen(false);
    if (pendingCheckpoint) {
      setPendingCheckpoint(false);
      setView("checkpoint");
    }
  };

  const handleStay = () => setView("map");
  const handleContinue = () => setView("interlude");
  // no U.S. chapter to skip to yet, so "skip directly" leads to the same interlude for now
  const handleSkip = () => setView("interlude");
  const handleCrossOcean = () => {
    if (onChapterComplete) {
      onChapterComplete();
    } else {
      setView("map"); // temporary: return to the settled map until the globe transition / U.S. chapter exists
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (view !== "map") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      journey.next();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      journey.prev();
    }
  };

  const journeyEnded = view === "checkpoint" || view === "interlude";
  const pinStatusFor = journeyEnded ? () => "completed" as const : journey.statusFor;

  if (view === "interlude") {
    return <NotYetInterlude onCrossOcean={handleCrossOcean} />;
  }

  return (
    <section
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden rounded-3xl border border-border bg-base p-5 shadow-sm dark:border-white/10 dark:bg-navy md:p-8"
      aria-label="Hanoi journey map"
    >
      <div className="relative z-10 mb-5 flex flex-wrap items-start justify-between gap-4 md:mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{hanoiJourneyCopy.eyebrow}</p>
          <h2 className="heading mt-2 text-3xl md:text-4xl">{hanoiJourneyCopy.heading}</h2>
          <p className="body-copy mt-1.5 text-sm dark:text-white/50">{hanoiJourneyCopy.instruction}</p>
        </div>
        <JourneyProgress index={journey.activeIndex} total={journey.total} />
      </div>

      <motion.div className="relative" animate={{ scale: view === "checkpoint" ? 0.96 : 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
        <HanoiMap
          pins={projectedPins}
          activePinId={journey.activePin.id}
          statusFor={pinStatusFor}
          onSelectPin={journey.selectById}
          riverPathD={riverPathD}
          lakePathD={lakePathD}
          roadsPathD={roadsPathD}
          reducedMotion={!!prefersReducedMotion}
          progressOverride={view === "checkpoint" ? 1 : undefined}
          settled={view === "checkpoint"}
        />

        {/* desktop floating panel: pin preview, or the end-of-chapter checkpoint */}
        <div className="absolute right-4 top-1/2 hidden w-[300px] -translate-y-1/2 lg:block xl:w-[320px]">
          <AnimatePresence mode="wait">
            {view === "checkpoint" ? (
              <ChapterCheckpoint key="checkpoint" onContinue={handleContinue} onStay={handleStay} onSkip={handleSkip} />
            ) : (
              <PinPreviewCard
                key="preview"
                pin={journey.activePin}
                metaLabel={`Hanoi · Ages ${journey.activePin.ageRange}`}
                index={journey.activeIndex}
                total={journey.total}
                onLearnMore={handleLearnMore}
                onPrev={journey.prev}
                onNext={journey.next}
                canPrev={journey.canPrev}
                canNext={journey.canNext}
              />
            )}
          </AnimatePresence>
        </div>

        <JourneyLegend className="absolute bottom-4 left-4 hidden md:inline-flex" />
      </motion.div>

      {/* tablet/below-lg: panel sits under the map instead of floating over it */}
      <div className="mt-5 hidden md:block lg:hidden">
        {view === "checkpoint" ? (
          <ChapterCheckpoint onContinue={handleContinue} onStay={handleStay} onSkip={handleSkip} className="max-w-md" />
        ) : (
          <PinPreviewCard
            pin={journey.activePin}
            metaLabel={`Hanoi · Ages ${journey.activePin.ageRange}`}
            index={journey.activeIndex}
            total={journey.total}
            onLearnMore={handleLearnMore}
            onPrev={journey.prev}
            onNext={journey.next}
            canPrev={journey.canPrev}
            canNext={journey.canNext}
            className="max-w-md"
          />
        )}
      </div>

      {view === "checkpoint" ? (
        <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
          <ChapterCheckpoint
            onContinue={handleContinue}
            onStay={handleStay}
            onSkip={handleSkip}
            className="rounded-b-none rounded-t-2xl border-b-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
          />
        </div>
      ) : (
        <MobilePreviewSheet
          pin={journey.activePin}
          metaLabel={`Hanoi · Ages ${journey.activePin.ageRange}`}
          index={journey.activeIndex}
          total={journey.total}
          onLearnMore={handleLearnMore}
          onPrev={journey.prev}
          onNext={journey.next}
          canPrev={journey.canPrev}
          canNext={journey.canNext}
        />
      )}

      <AnimatePresence>
        {storyOpen && (
          <ChapterStoryModal
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
