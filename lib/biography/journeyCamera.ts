import { chapters } from "@/data/biography/biography";
import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, localProgress, rampDownTo, rampUpFrom, smoothstep, stageWeight } from "@/lib/biography/journeyMotion";
import { GLOBE_DEFAULT_DISTANCE, GLOBE_ZOOMED_DISTANCE, type GlobeViewState } from "@/components/biography/SatelliteGlobeCanvas";
import {
  computeGlobeArrivalOpacity,
  computeHanoiMapExitOpacity,
} from "@/lib/biography/transpacificCamera";

/** Hanoi — the one verified coordinate this whole approach is built around, reused verbatim. */
const HANOI = chapters[0].globeTarget;

const EARTH_INTRO = getStageById("earth-intro");
const VIETNAM_APPROACH = getStageById("vietnam-approach");
const HANOI_APPROACH = getStageById("hanoi-approach");
const HANOI_OVERVIEW = getStageById("hanoi-overview");

export const APPROACH_STAGE_IDS: ReadonlySet<string> = new Set([
  EARTH_INTRO.id,
  VIETNAM_APPROACH.id,
  HANOI_APPROACH.id,
  HANOI_OVERVIEW.id,
]);

/**
 * Named camera keyframes — the single centralized structure every interpolation below reads
 * from, instead of scattering distance numbers through components. Orientation is locked on
 * Hanoi throughout: earth-intro already faces it (Phase 3), so "rotate to center Vietnam" is a
 * no-op and the entire approach reads as a straight zoom toward a fixed point. Distances reuse
 * the already-tuned `GLOBE_DEFAULT_DISTANCE`/`GLOBE_ZOOMED_DISTANCE` constants from the globe
 * itself rather than guessing new numbers.
 */
export const APPROACH_CAMERA_KEYFRAMES: Record<"earth-intro" | "vietnam-approach" | "hanoi-approach", GlobeViewState> = {
  "earth-intro": { latitude: HANOI.lat, longitude: HANOI.lon, distance: GLOBE_DEFAULT_DISTANCE },
  // roughly midway between the full-Earth and closest-safe distances — close enough to read as
  // "approaching Southeast Asia" while the globe's curvature stays clearly visible
  "vietnam-approach": { latitude: HANOI.lat, longitude: HANOI.lon, distance: (GLOBE_DEFAULT_DISTANCE + GLOBE_ZOOMED_DISTANCE) / 2 },
  // the globe's own verified zoom limit — any closer starts showing texture blur, so the rest of
  // the "getting closer" feeling is carried by the map crossfade/scale instead
  "hanoi-approach": { latitude: HANOI.lat, longitude: HANOI.lon, distance: GLOBE_ZOOMED_DISTANCE },
};

function lerpViewState(a: GlobeViewState, b: GlobeViewState, t: number): GlobeViewState {
  return {
    latitude: lerp(a.latitude, b.latitude, t),
    longitude: lerp(a.longitude, b.longitude, t),
    distance: lerp(a.distance, b.distance, t),
  };
}

/**
 * Continuous globe camera for any overall scroll progress. A pure function of `progress` — at
 * every stage boundary the two adjacent branches evaluate to the exact same keyframe (t=1 on one
 * side, t=0 on the other), so there's never a visible snap between them.
 */
export function computeApproachViewState(progress: number, reducedMotion: boolean): GlobeViewState {
  if (reducedMotion) return APPROACH_CAMERA_KEYFRAMES["earth-intro"];
  if (progress <= VIETNAM_APPROACH.start) return APPROACH_CAMERA_KEYFRAMES["earth-intro"];
  if (progress <= VIETNAM_APPROACH.end) {
    const t = smoothstep(localProgress(progress, VIETNAM_APPROACH));
    return lerpViewState(APPROACH_CAMERA_KEYFRAMES["earth-intro"], APPROACH_CAMERA_KEYFRAMES["vietnam-approach"], t);
  }
  const t = smoothstep(localProgress(progress, HANOI_APPROACH));
  return lerpViewState(APPROACH_CAMERA_KEYFRAMES["vietnam-approach"], APPROACH_CAMERA_KEYFRAMES["hanoi-approach"], t);
}

/**
 * Globe opacity has two humps, occupying disjoint regions of the 0–1 progress domain so a plain
 * `Math.max` combines them safely: the original earth-intro → hanoi-overview approach (solid,
 * ramping to 0 by hanoi-overview, never ramping back up on its own), and Phase 7's departure →
 * arrival hump (0 through the Hanoi pin stages, ramping up as hanoi-departure reveals the globe
 * again, solid through transpacific-flight, ramping back to 0 approaching us-overview). The
 * second hump's own timing constants are centralized in transpacificCamera.ts, the single source
 * for the whole hanoi-departure/transpacific-flight/us-overview sequence.
 */
export function computeGlobeOpacity(progress: number, fade: number): number {
  const approach = rampDownTo(progress, HANOI_OVERVIEW.start, fade);
  const departureToArrival = computeGlobeArrivalOpacity(progress);
  return Math.max(approach, departureToArrival);
}

/**
 * Map opacity: fades in over the same window the globe fades out (mirroring it exactly), stays
 * solid across hanoi-overview and all five pin stages (Phase 5 absorbs those into the same
 * persistent map), then retracts during hanoi-departure — Pin 5 stays readable through that
 * stage's own leading hold fraction before fading, per transpacificCamera's DEPARTURE_RETRACT_AT.
 */
export function computeMapOpacity(progress: number, fade: number): number {
  const enter = rampUpFrom(progress, HANOI_OVERVIEW.start, fade);
  const exit = computeHanoiMapExitOpacity(progress);
  return Math.min(enter, exit);
}

/** container opacity for the combined 4-stage approach block — solid throughout, fading only at
 *  the very start (irrelevant, progress can't go below 0) and at the hanoi-overview→pin-1 edge */
export function computeApproachContainerOpacity(progress: number, fade: number): number {
  return stageWeight(progress, EARTH_INTRO.start, HANOI_OVERVIEW.end, fade);
}

export { EARTH_INTRO, VIETNAM_APPROACH, HANOI_APPROACH, HANOI_OVERVIEW, clamp01 };
