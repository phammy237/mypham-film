/**
 * Shared imperative "how visible is this panel right now" DOM update — every ref-driven journey
 * overlay (JourneyHanoiIntroPanel, JourneyUsIntroPanel, JourneyChapterComplete, JourneyInterlude)
 * applies the same opacity/slide-in/pointer-events/inert combination from a stage weight (0-1).
 * Deliberately not in lib/biography/journeyMotion.ts — that module is pure math, no DOM.
 */
export function applyStageWeightStyle(el: HTMLElement, weight: number, reducedMotion: boolean, slidePx = 16): void {
  const visible = weight > 0.05;
  el.style.opacity = String(weight);
  el.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * slidePx}px)`;
  el.style.pointerEvents = visible ? "auto" : "none";
  el.inert = !visible;
}
