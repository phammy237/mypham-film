"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { rampDownTo, rampUpFrom } from "@/lib/biography/journeyMotion";
import { US_INTRO_TEXT_ENTER_WIDTH } from "@/lib/biography/crossOceanCamera";
import { applyStageWeightStyle } from "@/components/biography/journey/journeyPanelStyle";
import { usJourneyCopy } from "@/data/biography/usJourney";

export type JourneyUsIntroPanelHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

const US_OVERVIEW = getStageById("us-overview");
const EDGE_FADE = 0.02; // matches JourneyHanoiIntroPanel's own EDGE_FADE

/**
 * The U.S.-overview landing state's intro block — same shell/behavior as JourneyHanoiIntroPanel
 * (left column, ref-driven update(progress), no card/border), shown only for the us-overview stage.
 * Two CTAs instead of one: "Start the Chapter" jumps straight into Rivermont's settled story
 * window (mirrors JourneyHanoiIntroPanel's onStart), while "Explore Freely" eases only as far as
 * rivermont-approach's own start — letting the user scroll/click through the map themselves rather
 * than being snapped straight into a story panel.
 *
 * Entrance is deliberately held back to us-overview's own final stretch (see
 * US_INTRO_TEXT_ENTER_WIDTH) — this stage's earlier ~90% is still the cross-ocean globe zooming in
 * and flattening into mercator (see crossOceanCamera.ts); the U.S. chapter's own copy must never
 * appear while that globe rim is still on screen.
 */
export function JourneyUsIntroPanel({
  handleRef,
  reducedMotion,
  onStartChapter,
  onExploreFreely,
  showReturnLink,
  onReturnToSummary,
}: {
  handleRef: React.MutableRefObject<JourneyUsIntroPanelHandle | null>;
  reducedMotion: boolean;
  onStartChapter: () => void;
  onExploreFreely: () => void;
  /** true once the user has already reached us-complete at least once this session — mirrors
   *  JourneyHanoiIntroPanel's own showReturnLink. */
  showReturnLink?: boolean;
  onReturnToSummary?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        const weight = Math.min(
          rampUpFrom(progress, US_OVERVIEW.end, US_INTRO_TEXT_ENTER_WIDTH),
          rampDownTo(progress, US_OVERVIEW.end + EDGE_FADE, EDGE_FADE)
        );
        applyStageWeightStyle(el, weight, reducedMotion);
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute left-0 right-0 top-1/2 z-20 -translate-y-1/2 px-6 opacity-0 md:left-[5%] md:right-auto md:top-[45%] md:w-[360px] md:translate-y-0 md:px-0"
    >
      {/* full-bleed map behind the copy — no dark panel/circular crop obscuring it */}
      <div className="flex flex-col gap-5">
        <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.24em] text-journey-violet dark:text-journey-lilac">
          {usJourneyCopy.eyebrow}
        </p>
        <h2 className="font-display text-[54px] leading-[0.98] text-journey-ink dark:text-journey-paper md:text-[58px]">
          {usJourneyCopy.heading}
        </h2>
        <p className="max-w-[320px] font-body text-[16px] leading-[1.55] text-journey-body dark:text-journey-paper">
          {usJourneyCopy.body}
        </p>
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={onStartChapter}
            className="group flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-journey-ink opacity-100 transition-colors hover:text-journey-violet dark:text-journey-paper dark:hover:text-journey-lilac-soft"
          >
            {usJourneyCopy.ctaLabel}
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-journey-ink/50 transition-colors group-hover:border-journey-violet dark:border-journey-lilac/60 dark:group-hover:border-journey-glow">
              →
            </span>
          </button>
          <button
            type="button"
            onClick={onExploreFreely}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-journey-muted transition-opacity hover:opacity-80 dark:text-journey-muted-dark"
          >
            {usJourneyCopy.secondaryCtaLabel}
          </button>
          {showReturnLink && onReturnToSummary && (
            <button
              type="button"
              onClick={onReturnToSummary}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-journey-muted transition-opacity hover:opacity-80 dark:text-journey-muted-dark"
            >
              Back to chapter summary
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
