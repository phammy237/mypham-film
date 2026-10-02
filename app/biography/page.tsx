"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobeHero } from "@/components/biography/GlobeHero";
import { RegionOverview } from "@/components/biography/RegionOverview";
import { ChapterMap } from "@/components/biography/ChapterMap";
import { ChapterTransition } from "@/components/biography/ChapterTransition";
import { HanoiJourneySection } from "@/components/biography/HanoiJourneySection";
import { USJourneySection } from "@/components/biography/USJourneySection";
import { JourneyTimelineRail, railIndexFor } from "@/components/biography/JourneyTimelineRail";
import { useStoryState } from "@/lib/hooks/useStoryState";
import { useWorldTopology } from "@/lib/hooks/useWorldTopology";
import { heroCopy } from "@/data/biography/biography";

export default function BiographyPage() {
  const story = useStoryState();
  const countries = useWorldTopology();
  const [zoomingIntoVietnam, setZoomingIntoVietnam] = useState(false);
  const reducedMotion = !!useReducedMotion();
  const beginTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (beginTimerRef.current !== null) clearTimeout(beginTimerRef.current);
  }, []);

  const handleBeginJourney = () => {
    if (beginTimerRef.current !== null || zoomingIntoVietnam) return;
    if (reducedMotion) {
      story.beginJourney();
      return;
    }
    setZoomingIntoVietnam(true);
    beginTimerRef.current = setTimeout(() => {
      beginTimerRef.current = null;
      story.beginJourney();
    }, 1100);
  };

  // Scrolling past the hero starts the same "begin in Vietnam" transition, exactly once — a
  // wheel-based nudge, not a scroll-position trap, so normal page scrolling is never blocked.
  const wheelTriggeredRef = useRef(false);
  useEffect(() => {
    if (story.stage !== "globe") return;
    wheelTriggeredRef.current = false;
    const onWheel = (e: WheelEvent) => {
      if (wheelTriggeredRef.current || zoomingIntoVietnam) return;
      if (e.deltaY > 24) {
        wheelTriggeredRef.current = true;
        handleBeginJourney();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.stage, zoomingIntoVietnam]);

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />
      <JourneyTimelineRail activeIndex={railIndexFor(story.stage, story.chapterIndex)} />

      <div className="px-[5vw] pb-24 pt-28 lg:pl-20 xl:pl-24">
        <AnimatePresence mode="wait">
          {story.stage === "globe" && (
            <motion.section
              key="globe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto grid min-h-[70vh] max-w-[1400px] items-center gap-10 lg:grid-cols-[0.85fr_1fr]"
            >
              <div className="order-2 lg:order-1">
                <p className="f-hand text-3xl text-[var(--blue)]" style={{ transform: "rotate(-2deg)", transformOrigin: "left" }}>{heroCopy.eyebrow.toLowerCase()}</p>
                <h1 className="f-h1 mt-3 whitespace-pre-line">
                  <span className="f-mark">{heroCopy.heading}</span>
                </h1>
                <p className="f-type mt-6 max-w-md text-base leading-relaxed text-[var(--muted)]">
                  {heroCopy.subheading}
                </p>
                <button
                  onClick={handleBeginJourney}
                  disabled={zoomingIntoVietnam}
                  className="f-btn f-btn-butter mt-7 disabled:opacity-70"
                >
                  {heroCopy.cta}
                  <span aria-hidden="true">→</span>
                </button>
                <div className="mt-4 f-mono flex items-center gap-2 text-[var(--muted)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 5l-2 14" />
                  </svg>
                  {heroCopy.dragHint}
                </div>
              </div>

              <div className="order-1 flex justify-center lg:order-2">
                <GlobeHero
                  countries={countries}
                  highlightCountryIds={["704"]}
                  initialTarget={{ lat: 21, lon: 105.85 }}
                  markers={[{ id: "hanoi", position: { lat: 21, lon: 105.85 }, label: "Hanoi" }]}
                  zoomedIn={zoomingIntoVietnam}
                  interactive={!zoomingIntoVietnam}
                  ambient={false}
                  size={600}
                  ariaLabel="Interactive globe highlighting Vietnam"
                />
              </div>
            </motion.section>
          )}

          {story.stage === "region" && (
            <motion.section
              key="region"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-[1400px] py-6"
            >
              <button
                onClick={() => {
                  setZoomingIntoVietnam(false);
                  wheelTriggeredRef.current = false;
                  story.back();
                }}
                className="f-mono mb-5 inline-flex items-center gap-1.5 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                ← Back to globe
              </button>
              <RegionOverview
                chapter={story.chapter}
                countries={countries}
                onExplore={story.enterMap}
                onSkip={
                  story.hasNextChapter
                    ? () => story.revisitChapter(story.chapterIndex + 1)
                    : story.enterMap
                }
              />
            </motion.section>
          )}

          {story.stage === "transition" && (
            <ChapterTransition countries={countries} onArrive={story.arriveAtDestination} />
          )}

          {story.stage === "map" && (
            <motion.section
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-[1800px] py-6"
            >
              <button
                onClick={story.back}
                className="f-mono mb-5 inline-flex items-center gap-1.5 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                ← Back to {story.chapter.regionLabel}
              </button>
              {story.chapter.id === "vietnam" ? (
                <HanoiJourneySection onChapterComplete={story.continueNextChapter} />
              ) : story.chapter.id === "united-states" ? (
                <USJourneySection />
              ) : (
                <ChapterMap
                  chapter={story.chapter}
                  completedPinIds={story.completedPinIds}
                  activePinId={story.activePinId}
                  onSelectPin={story.selectPin}
                />
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  );
}
