"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { stageWeight } from "@/lib/biography/journeyMotion";
import { applyStageWeightStyle } from "@/components/biography/journey/journeyPanelStyle";
import type { JourneyStageId } from "@/lib/biography/journeyTypes";

export type JourneyChapterCompleteHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

// Deliberately tighter than JourneyHanoiIntroPanel's 0.02 (≈45vh of overlap at this journey's
// stage width) — two full-bleed, centered text blocks reading "on top of" each other for that long
// looks broken, not cinematic, unlike a compact side card brushing past another one mid-scroll.
// ≈14vh of overlap instead: still a real crossfade (never an instant snap), just short enough that
// only someone scrubbing very slowly ever sees both at once.
const EDGE_FADE = 0.006;

/**
 * Shared chapter-complete overlay — "no card," centered, full-bleed over the map's own return-to-
 * overview camera — used for both hanoi-complete and us-complete. Same ref-driven update(progress)
 * pattern as JourneyHanoiIntroPanel: visible only while its own stage is on screen, invisible (and
 * inert) otherwise, so it never has to be conditionally mounted/unmounted.
 */
export function JourneyChapterComplete({
  handleRef,
  stageId,
  reducedMotion,
  eyebrow,
  heading,
  paragraph,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  handleRef: React.MutableRefObject<JourneyChapterCompleteHandle | null>;
  stageId: JourneyStageId;
  reducedMotion: boolean;
  eyebrow: string;
  heading: string;
  paragraph: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stage = getStageById(stageId);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        const weight = stageWeight(progress, stage.start, stage.end, EDGE_FADE);
        applyStageWeightStyle(el, weight, reducedMotion);
      },
    };
    return () => {
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleRef, reducedMotion, stage.start, stage.end]);

  return (
    // Quiet, lower-left editorial ending — deliberately NOT centered/full-bleed. "The point is the
    // map remaining the dominant object," not a giant inspirational sentence taking over the frame.
    <div
      ref={rootRef}
      className="pointer-events-none absolute left-[8%] bottom-[16%] z-20 flex max-w-[360px] flex-col items-start gap-3 opacity-0"
    >
      <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-journey-violet dark:text-journey-lilac">{eyebrow}</p>
      <h2 className="font-display text-[40px] leading-[1.05] text-journey-ink dark:text-journey-paper md:text-[46px]">{heading}</h2>
      <p className="max-w-[320px] font-body text-[15px] leading-[1.55] text-journey-body dark:text-journey-paper">{paragraph}</p>
      <div className="mt-[10px] flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={onPrimary}
          className="group flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-journey-ink transition-colors hover:text-journey-violet dark:text-journey-paper dark:hover:text-journey-lilac-soft"
        >
          {primaryLabel}
          <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-journey-muted transition-opacity hover:opacity-80 dark:text-journey-muted-dark"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}
