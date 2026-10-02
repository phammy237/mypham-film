/**
 * Pure scroll-progress math shared by the journey's generic stage crossfade and the Earth →
 * Vietnam → Hanoi camera/map approach. No React, no DOM — every function here is a deterministic
 * transformation of a progress number, safe to call every scroll tick without side effects.
 */

export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** smoothstep — an easing curve applied to already-scrubbed progress, not an independent animation */
export function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** fast start, decelerating to a stop — the "fly somewhere and settle" curve used for the one
 *  programmatic (non-scroll) camera transition in the journey, Begin Journey's Earth→Hanoi jump. */
export function easeOutCubic(t: number): number {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
}

/** progress (0–1) local to a [start, end) window, clamped to 0–1 outside it */
export function localProgress(progress: number, stage: { start: number; end: number }): number {
  return clamp01((progress - stage.start) / (stage.end - stage.start));
}

/** triangular falloff: 1 inside [start, end], ramping to 0 across `fade` on either side */
export function stageWeight(progress: number, start: number, end: number, fade: number): number {
  if (progress < start - fade || progress > end + fade) return 0;
  if (progress >= start && progress <= end) return 1;
  if (progress < start) return (progress - (start - fade)) / fade;
  return 1 - (progress - end) / fade;
}

/** one-sided ramp: 1 before (at - fade), ramping to 0 by `at`, staying 0 after — never ramps back up */
export function rampDownTo(progress: number, at: number, fade: number): number {
  if (progress <= at - fade) return 1;
  if (progress >= at) return 0;
  return (at - progress) / fade;
}

/** one-sided ramp: 0 before (at - fade), ramping to 1 by `at`, staying 1 after — never ramps back down */
export function rampUpFrom(progress: number, at: number, fade: number): number {
  if (progress <= at - fade) return 0;
  if (progress >= at) return 1;
  return (progress - (at - fade)) / fade;
}

/** scroll distance dedicated to each of the 20 journey stages, in viewport-heights */
export const STAGE_VH = 90;
/** how far (in normalized progress) a stage fades in/out into its neighbors — the crossfade overlap */
export function motionFade(stageCount: number): number {
  return (1 / stageCount) * 0.6;
}
export function reducedMotionFade(stageCount: number): number {
  return (1 / stageCount) * 0.25;
}
