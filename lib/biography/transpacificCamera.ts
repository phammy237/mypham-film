import { chapters, type GeoPoint } from "@/data/biography/biography";
import { usJourneyPins } from "@/data/biography/usJourney";
import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, localProgress, rampDownTo, rampUpFrom, smoothstep } from "@/lib/biography/journeyMotion";
import { slerpLatLon } from "@/lib/three/latLon";
import { GLOBE_ZOOMED_DISTANCE, type GlobeViewState } from "@/components/biography/SatelliteGlobeCanvas";

/**
 * Centralized, pure motion model for Phase 7's `hanoi-departure` → `transpacific-flight` →
 * `us-overview` sequence — the single place every camera keyframe, crossfade window, and route/
 * plane timing constant for this transition lives, so no component scatters its own copy. Every
 * export here is a deterministic function of the overall scroll progress (or a plain constant
 * derived from the existing 20-stage config), safe to call every scroll tick.
 */

/** Hanoi and the first stored U.S. destination — reused verbatim, never re-guessed. Rivermont
 *  (usJourneyPins[0]) is confirmed as the first stored U.S. location this phase reaches. */
export const FLIGHT_ORIGIN: GeoPoint = chapters[0].globeTarget;
export const FLIGHT_DESTINATION: GeoPoint = usJourneyPins[0].coordinates;

const HANOI_DEPARTURE = getStageById("hanoi-departure");
const TRANSPACIFIC_FLIGHT = getStageById("transpacific-flight");
const US_OVERVIEW = getStageById("us-overview");

/** The three stage slots this module owns end to end — GeographicJourney excludes these from both
 *  the generic per-stage placeholder crossfade and the generic placeholder render loop. */
export const TRANSPACIFIC_STAGE_IDS: ReadonlySet<string> = new Set([
  HANOI_DEPARTURE.id,
  TRANSPACIFIC_FLIGHT.id,
  US_OVERVIEW.id,
]);

export type TranspacificKeyframeId = "hanoi-map" | "hanoi-globe" | "pacific-midpoint" | "us-globe" | "us-map";

export type TranspacificFrame = {
  globeView: GlobeViewState;
  routeProgress: number;
  hanoiMapOpacity: number;
  globeOpacity: number;
  usMapOpacity: number;
  planeOpacity: number;
};

/** the mid-flight pullback distance — pulled back enough to read the Pacific crossing, still well
 *  inside the globe's own hard zoom limits (2.1–4.6), between GLOBE_DEFAULT_DISTANCE and its max */
const PACIFIC_PULLBACK_DISTANCE = 3.6;

/** Named camera keyframes — only the three ids that correspond to an actual globe orientation
 *  ("hanoi-map"/"us-map" are the flanking map-only states with no globe pose of their own; they
 *  exist in TranspacificKeyframeId purely to name every beat of the sequence). Distances reuse the
 *  globe's own already-tuned constants; only the mid-flight pullback is a new value. */
export const TRANSPACIFIC_CAMERA_KEYFRAMES: Record<
  Extract<TranspacificKeyframeId, "hanoi-globe" | "pacific-midpoint" | "us-globe">,
  GlobeViewState
> = {
  "hanoi-globe": { latitude: FLIGHT_ORIGIN.lat, longitude: FLIGHT_ORIGIN.lon, distance: GLOBE_ZOOMED_DISTANCE },
  // lat/lon here are nominal (the true midpoint framing) — computeTranspacificGlobeView derives the
  // live camera target from the route itself every frame rather than snapping through this point
  "pacific-midpoint": {
    latitude: slerpLatLon(FLIGHT_ORIGIN, FLIGHT_DESTINATION, 0.5).lat,
    longitude: slerpLatLon(FLIGHT_ORIGIN, FLIGHT_DESTINATION, 0.5).lon,
    distance: PACIFIC_PULLBACK_DISTANCE,
  },
  "us-globe": { latitude: FLIGHT_DESTINATION.lat, longitude: FLIGHT_DESTINATION.lon, distance: GLOBE_ZOOMED_DISTANCE },
};

/**
 * Hanoi's map/story stay fully readable through this leading fraction of hanoi-departure
 * (continuing Phase 6's Pin-5 dwell fix), then retract smoothly, fully gone by
 * DEPARTURE_RETRACT_AT. journeyCamera's map-opacity crossfade and hanoiCamera's own pin-5 →
 * overview camera blend-back both key off this single pair of numbers.
 */
const DEPARTURE_HOLD_FRACTION = 0.12;
const DEPARTURE_RETRACT_FRACTION = 0.4;
export const DEPARTURE_RETRACT_AT = lerp(HANOI_DEPARTURE.start, HANOI_DEPARTURE.end, DEPARTURE_RETRACT_FRACTION);
export const DEPARTURE_RETRACT_WIDTH =
  (HANOI_DEPARTURE.end - HANOI_DEPARTURE.start) * (DEPARTURE_RETRACT_FRACTION - DEPARTURE_HOLD_FRACTION);

/** Globe reveal-in starts before the map finishes retracting (wide overlap) so there is never a
 *  frame with neither the Hanoi map nor the globe visible. */
export const GLOBE_REVEAL_AT = HANOI_DEPARTURE.end;
export const GLOBE_REVEAL_WIDTH = (HANOI_DEPARTURE.end - HANOI_DEPARTURE.start) * 0.75;

/** The globe → U.S. map handoff is deliberately narrow relative to the whole flight stage, so the
 *  globe (and the route/plane on it) stays visible for most of transpacific-flight and only
 *  crossfades into the map during its final stretch. */
const US_HANDOFF_FRACTION = 0.3;
export const US_MAP_REVEAL_AT = US_OVERVIEW.start;
export const US_MAP_REVEAL_WIDTH = (TRANSPACIFIC_FLIGHT.end - TRANSPACIFIC_FLIGHT.start) * US_HANDOFF_FRACTION;

/** Fraction of route progress spent fading the plane/route in (from 0) and out (into 1). Mirrored
 *  independently inside SatelliteGlobeCanvas's own in-canvas fade (that generic component can't
 *  import a journey-specific module without an import cycle) — keep both in sync if this changes. */
export const FLIGHT_FADE_WINDOW = 0.08;

/** 0 before the flight starts, eased across transpacific-flight's own local progress, 1 once
 *  arrived — this single number doubles as the globe's live camera-tracking parameter and the
 *  flight route/plane's reveal fraction, so they can never drift apart. Reversing scroll reverses
 *  it along the identical curve, since it's a pure function of `progress`. */
export function computeFlightProgress(progress: number): number {
  if (progress <= TRANSPACIFIC_FLIGHT.start) return 0;
  if (progress >= TRANSPACIFIC_FLIGHT.end) return 1;
  return smoothstep(localProgress(progress, TRANSPACIFIC_FLIGHT));
}

/**
 * Continuous globe camera for hanoi-departure through us-overview (harmless/unused once the globe
 * is fully hidden beyond that). Orientation is a dateline-safe great-circle interpolation between
 * the exact stored Hanoi and Rivermont coordinates (see lib/three/latLon's slerpLatLon) — never a
 * raw longitude lerp — so the globe always takes the short Pacific-facing rotation instead of the
 * long way around through Europe/Africa, with no jump at ±180°.
 */
export function computeTranspacificGlobeView(progress: number, reducedMotion: boolean): GlobeViewState {
  const t = computeFlightProgress(progress);
  const { lat, lon } = slerpLatLon(FLIGHT_ORIGIN, FLIGHT_DESTINATION, t);
  if (reducedMotion) {
    // fixed, wider composition — no zoom pull dynamic — per the reduced-motion requirements
    return { latitude: lat, longitude: lon, distance: PACIFIC_PULLBACK_DISTANCE, routeProgress: t };
  }
  const distance =
    t <= 0.5
      ? lerp(GLOBE_ZOOMED_DISTANCE, PACIFIC_PULLBACK_DISTANCE, smoothstep(t / 0.5))
      : lerp(PACIFIC_PULLBACK_DISTANCE, GLOBE_ZOOMED_DISTANCE, smoothstep((t - 0.5) / 0.5));
  return { latitude: lat, longitude: lon, distance, routeProgress: t };
}

/** Hanoi map/story exit ramp — journeyCamera's computeMapOpacity combines this with its own
 *  hanoi-overview entry ramp; hanoiCamera's camera blend-back uses the raw AT/WIDTH constants
 *  above directly since it needs a blend fraction, not an opacity. */
export function computeHanoiMapExitOpacity(progress: number): number {
  return rampDownTo(progress, DEPARTURE_RETRACT_AT, DEPARTURE_RETRACT_WIDTH);
}

/** Globe's own reveal-in/arrival-out envelope — journeyCamera's computeGlobeOpacity combines this
 *  with its existing earth-approach ramp (the two never overlap in progress space). */
export function computeGlobeArrivalOpacity(progress: number): number {
  return Math.min(
    rampUpFrom(progress, GLOBE_REVEAL_AT, GLOBE_REVEAL_WIDTH),
    rampDownTo(progress, US_MAP_REVEAL_AT, US_MAP_REVEAL_WIDTH)
  );
}

/** U.S. map opacity — ramps up mirroring the globe's arrival fade-out, then holds at 1 (this
 *  phase never hides the U.S. map again; a later phase owns whatever comes after us-overview). */
export function computeUsMapOpacity(progress: number): number {
  return rampUpFrom(progress, US_MAP_REVEAL_AT, US_MAP_REVEAL_WIDTH);
}

/** Minimal travel-label / plane fade envelope, keyed off routeProgress itself so it can never
 *  drift from the route/plane it accompanies. */
export function computePlaneOpacity(routeProgress: number): number {
  const t = clamp01(routeProgress);
  const fadeIn = smoothstep(t / FLIGHT_FADE_WINDOW);
  const fadeOut = 1 - smoothstep((t - (1 - FLIGHT_FADE_WINDOW)) / FLIGHT_FADE_WINDOW);
  return clamp01(Math.min(fadeIn, fadeOut));
}

/** One-call bundle of the whole Phase-7 frame, for callers that want everything at once. Every
 *  field is derived from the same `progress` via the focused functions above — never a separate
 *  logic path, so nothing here can drift from what those functions return individually. */
export function computeTranspacificFrame(progress: number, reducedMotion: boolean): TranspacificFrame {
  const globeView = computeTranspacificGlobeView(progress, reducedMotion);
  const routeProgress = globeView.routeProgress ?? 0;
  return {
    globeView,
    routeProgress,
    hanoiMapOpacity: computeHanoiMapExitOpacity(progress),
    globeOpacity: computeGlobeArrivalOpacity(progress),
    usMapOpacity: computeUsMapOpacity(progress),
    planeOpacity: computePlaneOpacity(routeProgress),
  };
}
