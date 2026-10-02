import { getStageById } from "@/lib/biography/journeyStages";
import { lerp, smoothstep, localProgress } from "@/lib/biography/journeyMotion";

export type EarthRasterCrossfadeState = {
  /** the satellite day-imagery raster layer's opacity, 0-1 */
  dayOpacity: number;
  /** the VIIRS night-lights raster layer's opacity — capped well below dayOpacity's own peak so
   *  city lights read as a restrained accent, never a second competing full-brightness image */
  nightOpacity: number;
  /** multiplies every OpenFreeMap vector detail layer's own opacity (water fill, waterway,
   *  boundaries, roads, generic place labels) — near-0 at Earth hero, 1 by hanoi-overview */
  vectorOpacity: number;
};

const VIETNAM_APPROACH = getStageById("vietnam-approach");
const HANOI_APPROACH = getStageById("hanoi-approach");

/** night lights never exceed this even at their peak — "soft, subtle, cinematic," never a second
 *  full-brightness image fighting the day imagery */
const NIGHT_OPACITY_CAP = 0.55;

/**
 * Single source of truth for the Earth-hero raster<->vector crossfade — a pure function of the
 * existing journey scroll progress, exactly like computeJourneyVignetteState/
 * computeJourneyMapPadding. Only ever asked for progress inside [0, hanoi-approach.end]; the
 * journey holds at {day:0, night:0, vector:1} for everything from hanoi-overview onward (the
 * existing, untouched editorial vector atlas), so this module doesn't need to know about any
 * stage past that.
 */
export function computeEarthRasterCrossfade(progress: number): EarthRasterCrossfadeState {
  // EARTH HERO: satellite Earth fully dominant, vector detail barely present (0.05 -> 0.10, a
  // gentle settle rather than a flat constant)
  if (progress < VIETNAM_APPROACH.start) {
    const t = smoothstep(progress / Math.max(VIETNAM_APPROACH.start, 0.0001));
    return { dayOpacity: 1, nightOpacity: NIGHT_OPACITY_CAP, vectorOpacity: lerp(0.05, 0.1, t) };
  }
  // EARTH -> VIETNAM: raster 1 -> .55, vector .10 -> .45
  if (progress < VIETNAM_APPROACH.end) {
    const t = smoothstep(localProgress(progress, VIETNAM_APPROACH));
    return {
      dayOpacity: lerp(1, 0.55, t),
      nightOpacity: lerp(NIGHT_OPACITY_CAP, NIGHT_OPACITY_CAP * 0.55, t),
      vectorOpacity: lerp(0.1, 0.45, t),
    };
  }
  // VIETNAM APPROACH: raster .55 -> 0, vector .45 -> 1 — reaching exactly {0,1} right at this
  // stage's own end so the hand-off into hanoi-overview's untouched vector styling is seamless,
  // never leaving a residual sliver of satellite imagery under the city-scale map.
  if (progress < HANOI_APPROACH.end) {
    const t = smoothstep(localProgress(progress, HANOI_APPROACH));
    return {
      dayOpacity: lerp(0.55, 0, t),
      nightOpacity: lerp(NIGHT_OPACITY_CAP * 0.55, 0, t),
      vectorOpacity: lerp(0.45, 1, t),
    };
  }
  // hanoi-overview and everything after: pure vector, exactly as before this change
  return { dayOpacity: 0, nightOpacity: 0, vectorOpacity: 1 };
}
