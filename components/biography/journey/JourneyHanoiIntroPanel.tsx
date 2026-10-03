"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { stageWeight } from "@/lib/biography/journeyMotion";
import { applyStageWeightStyle } from "@/components/biography/journey/journeyPanelStyle";
import { journeyHanoiIntroContent } from "@/lib/biography/journeyHanoiIntroContent";

export type JourneyHanoiIntroPanelHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

const HANOI_OVERVIEW = getStageById("hanoi-overview");
// quick fade at both edges of the hanoi-overview window itself — visible regardless of whether the
// user arrived here via Begin Journey's cinematic jump or by scrolling here organically, since
// visibility is purely a function of progress, not of how progress got there.
const EDGE_FADE = 0.02;

/**
 * The Hanoi-overview landing state's intro block — same minimal overlay pattern as
 * JourneyHeroContent (ref-driven update(progress), no card/border), shown only for the
 * hanoi-overview stage, before any of the 5 pins have been visited. Its own CTA hands off to the
 * existing pin-click scroll path (onStart), so starting the Hanoi journey activates Pin 01 through
 * the same single scroll-progress source of truth every other navigation in this page already uses.
 */
export function JourneyHanoiIntroPanel({
  handleRef,
  reducedMotion,
  onStart,
  onSkip,
  showReturnLink,
  onReturnToSummary,
}: {
  handleRef: React.MutableRefObject<JourneyHanoiIntroPanelHandle | null>;
  reducedMotion: boolean;
  onStart: () => void;
  onSkip: () => void;
  /** true once the user has already reached hanoi-complete at least once this session — offers a
   *  quiet way back to that summary instead of only "start from pin 1" or "skip the chapter." */
  showReturnLink?: boolean;
  onReturnToSummary?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        const weight = stageWeight(progress, HANOI_OVERVIEW.start, HANOI_OVERVIEW.end, EDGE_FADE);
        applyStageWeightStyle(el, weight, reducedMotion);
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-20 opacity-0">
      {/* "Map should remain visible behind the copy" — no dark panel/backdrop obscuring it; the
          shared edge vignette (JourneyEdgeFade) already gives the map's own left side enough
          contrast for the text to read. */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-6 md:left-[5%] md:right-auto md:top-[45%] md:w-[360px] md:translate-y-0 md:px-0">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.24em] text-journey-violet dark:text-journey-lilac">
            {journeyHanoiIntroContent.eyebrow}
          </p>
          <h2 className="font-display text-[54px] leading-[0.98] text-journey-ink dark:text-journey-paper md:text-[58px]">
            {journeyHanoiIntroContent.heading}
          </h2>
          <p className="max-w-[320px] font-body text-[16px] leading-[1.55] text-journey-body dark:text-journey-paper">
            {journeyHanoiIntroContent.body}
          </p>
          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={onStart}
              className="group flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-journey-ink opacity-100 transition-colors hover:text-journey-violet dark:text-journey-paper dark:hover:text-journey-lilac-soft"
            >
              {journeyHanoiIntroContent.ctaLabel}
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-journey-ink/50 transition-colors group-hover:border-journey-violet dark:border-journey-lilac/60 dark:group-hover:border-journey-glow">
                →
              </span>
            </button>
            {/* deliberately quiet, but still readable — never faded past legibility */}
            <button
              type="button"
              onClick={onSkip}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-journey-muted transition-opacity hover:opacity-80 dark:text-journey-muted-dark"
            >
              Skip to next chapter
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

      {/* Compass + scale bar + coordinates, bottom-left — light mode only (a new addition, not part
          of the original dark-mode composition, so it stays out of dark mode's rendered output). */}
      <div className="absolute bottom-8 left-[5%] hidden flex-col gap-3 dark:!hidden md:flex">
        <div className="flex items-center gap-1.5 text-journey-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2 L15 12 L12 22 L9 12 Z" fill="currentColor" opacity="0.75" />
          </svg>
          <span className="font-mono text-[10px] tracking-[0.1em]">N</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="relative h-[7px] w-[120px] border-x border-t border-journey-ink/60">
            <div className="absolute left-1/2 top-0 h-full w-px bg-journey-ink/60" />
          </div>
          <div className="flex w-[120px] justify-between font-mono text-[9px] tracking-[0.05em] text-journey-muted">
            <span>0</span>
            <span>2</span>
            <span>4 km</span>
          </div>
        </div>
        <p className="font-mono text-[10px] tracking-[0.1em] text-journey-muted">{journeyHanoiIntroContent.coordinates}</p>
      </div>

      {/* dark-mode coordinate line — unchanged from the original composition */}
      <p className="absolute bottom-8 left-[5%] hidden font-mono text-[10px] tracking-[0.1em] text-journey-muted-dark dark:md:block">
        {journeyHanoiIntroContent.coordinates}
      </p>

      {/* small italic caption, bottom-right — light mode only */}
      <div className="absolute bottom-8 right-[5%] hidden text-right font-display italic text-[15px] leading-[1.4] text-journey-body dark:!hidden md:block">
        {journeyHanoiIntroContent.captionLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
