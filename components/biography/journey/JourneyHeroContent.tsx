"use client";
import { useEffect, useRef, useState } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { rampDownTo } from "@/lib/biography/journeyMotion";
import { journeyHeroContent } from "@/lib/biography/journeyHeroContent";
import type { JourneyChapterId } from "@/lib/biography/journeyTypes";

export type JourneyHeroContentHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

// Fully visible through earth-intro, faded out by the time the camera reaches Hanoi — matches the
// same window the map's own Earth-hero padding/glow use (see JourneyMapCanvas), so the text, the
// globe's framing, and the "glowing Hanoi" marker all resolve together instead of independently.
const FADE_COMPLETE_AT = getStageById("hanoi-approach").start;

/**
 * The Earth-hero stage's left-side title/CTA block — plain overlay text, not a card, sitting beside
 * (not on top of) the globe. Purely presentational/ref-driven, mirroring JourneyStoryLayer's
 * update(progress) pattern so this introduces no additional scroll listener.
 */
export function JourneyHeroContent({
  handleRef,
  reducedMotion,
  onBeginJourney,
  onJump,
}: {
  handleRef: React.MutableRefObject<JourneyHeroContentHandle | null>;
  reducedMotion: boolean;
  onBeginJourney: () => void;
  /** jump straight to a chapter instead of scrolling there */
  onJump?: (id: JourneyChapterId) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Disables the CTA the instant it's clicked, independent of the progress-driven fade below (which
  // takes a beat to reach the >0.05 "inert" threshold) — belt-and-suspenders against a double click
  // firing beginJourneyTransition twice. Re-enabled automatically if the user scrolls back to a
  // fully-visible Earth stage, rather than staying disabled forever after one use.
  const [isBeginning, setIsBeginning] = useState(false);

  useEffect(() => {
    handleRef.current = {
      update: (progress) => {
        const el = rootRef.current;
        if (!el) return;
        const weight = rampDownTo(progress, FADE_COMPLETE_AT, FADE_COMPLETE_AT);
        const visible = weight > 0.05;
        el.style.opacity = String(weight);
        el.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * 16}px)`;
        el.style.pointerEvents = visible ? "auto" : "none";
        el.inert = !visible;
        setIsBeginning((prev) => (prev && weight > 0.5 ? false : prev));
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  const handleClick = () => {
    if (isBeginning) return;
    setIsBeginning(true);
    onBeginJourney();
  };

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 px-6 md:left-[4.5vw] md:right-auto md:top-[28vh] md:w-[340px] md:translate-y-0 md:px-0"
    >
      <p className="mb-[28px] font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-journey-muted dark:text-[rgba(218,216,212,0.42)]">
        {journeyHeroContent.eyebrow}
      </p>
      <h2 className="mb-[28px] font-display text-[56px] leading-[0.98] text-journey-ink dark:text-journey-paper md:text-[68px]">
        {journeyHeroContent.headingLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <p className="mb-[30px] max-w-[300px] font-body text-[16px] leading-[1.6] text-journey-body dark:text-[rgba(231,230,228,0.70)]">
        {journeyHeroContent.body}
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={isBeginning}
        className="group flex w-fit items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-journey-ink dark:text-journey-paper transition-colors disabled:cursor-default disabled:opacity-60"
      >
        {journeyHeroContent.ctaLabel}
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,72,64,0.18)] text-journey-violet transition-colors duration-200 group-hover:border-journey-violet group-hover:text-journey-violet dark:border-[rgba(131,179,214,0.35)] dark:text-[rgba(131,179,214,0.9)]">
          →
        </span>
      </button>
      {onJump && (
        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-journey-muted dark:text-[rgba(218,216,212,0.5)]">
          <span>or jump to</span>
          <button type="button" onClick={() => onJump("hanoi")} className="text-journey-ink underline-offset-4 hover:underline dark:text-journey-paper">Hanoi</button>
          <button type="button" onClick={() => onJump("us")} className="text-journey-ink underline-offset-4 hover:underline dark:text-journey-paper">Gainesville</button>
          <button type="button" onClick={() => onJump("today")} className="text-journey-ink underline-offset-4 hover:underline dark:text-journey-paper">Today</button>
        </p>
      )}
    </div>
  );
}
