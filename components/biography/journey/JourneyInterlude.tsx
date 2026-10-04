"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { stageWeight } from "@/lib/biography/journeyMotion";
import { computeInterludeNowTextWeight, computeAcrossPacificLabelWeight } from "@/lib/biography/crossOceanCamera";
import { applyStageWeightStyle } from "@/components/biography/journey/journeyPanelStyle";
import { notYetInterludeCopy } from "@/data/biography/hanoiJourney";

export type JourneyInterludeHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

// see JourneyChapterComplete's own EDGE_FADE comment — tightened from the 0.02 "panel" convention
// so two full-bleed centered text beats never linger visibly on top of each other.
const EDGE_FADE = 0.006;
const NOT_YET = getStageById("hanoi-interlude-not-yet");

/**
 * The between-chapters interlude — two beats sharing one minimal, cinematic, no-card shell:
 * "not yet" (hanoi-interlude-not-yet) crossfades into "now" (hanoi-interlude-now) as the camera
 * itself drifts wider (see journeyMapCamera.ts's Hanoi -> Vietnam sequence for this window). Only
 * the second beat carries a CTA ("Cross the Ocean") — the first is purely reflective, matching
 * "keep this reflective, not resentful or dramatic." The "now" beat's own copy is deliberately
 * short-lived (see computeInterludeNowTextWeight) — it overlaps the start of the redesigned
 * cross-ocean globe transition (crossOceanCamera.ts) and must be long gone before the globe starts
 * rotating in earnest, not linger for its whole old stage window. A third, much smaller "Across the
 * Pacific" label appears later, near arrival, as that same transition's only other copy.
 */
export function JourneyInterlude({
  handleRef,
  reducedMotion,
  onCrossOcean,
}: {
  handleRef: React.MutableRefObject<JourneyInterludeHandle | null>;
  reducedMotion: boolean;
  onCrossOcean: () => void;
}) {
  const notYetRef = useRef<HTMLDivElement | null>(null);
  const nowRef = useRef<HTMLDivElement | null>(null);
  const acrossPacificRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const apply = (el: HTMLDivElement | null, weight: number) => {
      if (!el) return;
      applyStageWeightStyle(el, weight, reducedMotion);
    };
    handleRef.current = {
      update: (progress) => {
        apply(notYetRef.current, stageWeight(progress, NOT_YET.start, NOT_YET.end, EDGE_FADE));
        apply(nowRef.current, computeInterludeNowTextWeight(progress));
        apply(acrossPacificRef.current, computeAcrossPacificLabelWeight(progress));
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  return (
    <>
      <div
        ref={notYetRef}
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-6 text-center opacity-0 md:items-start md:px-[12%]"
      >
        {/* "darken the map more than normal here" — a local overlay, not a second vignette system;
            shares this block's own opacity fade automatically (no separate ref needed). */}
        <div className="pointer-events-none absolute inset-0 -z-10 dark:bg-[rgba(8,15,30,0.22)]" aria-hidden="true" />
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-journey-violet dark:text-journey-lilac">
          Between Chapters
        </p>
        <h2 className="max-w-[540px] font-display text-[44px] leading-[1.02] text-journey-ink dark:text-journey-paper md:text-left md:text-[50px]">
          {notYetInterludeCopy.heading}
        </h2>
        <p className="max-w-[480px] font-body text-[16px] leading-relaxed text-journey-body dark:text-journey-paper md:text-left">
          {notYetInterludeCopy.paragraph}
        </p>
      </div>

      {/* Positioned low and left, never centered over Earth — this beat overlaps the cross-ocean
          globe's own entry (see crossOceanCamera.ts), which needs the frame clear. */}
      <div
        ref={nowRef}
        className="pointer-events-none absolute bottom-[14vh] left-[7vw] z-20 flex max-w-[420px] flex-col items-start gap-4 px-6 text-left opacity-0 md:bottom-[16vh] md:left-[8vw] md:px-0"
      >
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-journey-violet dark:text-journey-lilac">
          Between Chapters
        </p>
        <h2 className="max-w-[440px] font-display text-[34px] leading-[1.05] text-journey-ink dark:text-journey-paper md:text-[38px]">
          {notYetInterludeCopy.resolution}
        </h2>
        <button
          type="button"
          onClick={onCrossOcean}
          className="group mt-1 flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-journey-ink transition-colors hover:text-journey-violet dark:text-journey-paper dark:hover:text-journey-lilac-soft"
        >
          {notYetInterludeCopy.cta}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* The cross-ocean transition's only other copy — a tiny mono label near arrival, gone before
          the real U.S. intro text takes over. No paragraph, no card. */}
      <div
        ref={acrossPacificRef}
        className="pointer-events-none absolute bottom-[14vh] left-[7vw] z-20 opacity-0 md:bottom-[16vh] md:left-[8vw]"
      >
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-journey-muted dark:text-journey-muted-dark">
          Across the Pacific
        </p>
      </div>
    </>
  );
}
