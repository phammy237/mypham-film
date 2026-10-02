import { geoInterpolate } from "d3-geo";
import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, rampDownTo, rampUpFrom, smoothstep, stageWeight } from "@/lib/biography/journeyMotion";
import { slerpLatLon } from "@/lib/three/latLon";
import { FLIGHT_ORIGIN, FLIGHT_DESTINATION } from "@/lib/biography/transpacificCamera";
import {
  VIETNAM_PRESET,
  USA_PRESET,
  RIVERMONT_PRESET,
  type JourneyCameraPreset,
  type JourneyCameraState,
} from "@/lib/biography/mapCameraPresets";

/**
 * Single source of truth for the redesigned cross-ocean transition — "Hanoi map -> camera pulls
 * out -> flat map curves into a globe -> globe rotates eastward across the Pacific -> North America
 * comes around -> camera descends -> globe flattens into the U.S. map." Owns everything specific to
 * this one beat: camera, projection window, route reveal, the moving travel point, the departure/
 * arrival anchor labels, and the interlude text timing that overlaps it — replacing the old flat
 * mercator "whole world visible at once" composition entirely. Every export here is a pure function
 * of the overall journey scroll progress, safe to call every scroll tick and to reverse exactly.
 */

const HANOI_INTERLUDE_NOW = getStageById("hanoi-interlude-now");
const US_OVERVIEW = getStageById("us-overview");
const HANOI_APPROACH = getStageById("hanoi-approach");

/** The whole redesigned beat spans exactly these four existing stages — hanoi-interlude-now (the
 *  "Cross the Ocean" CTA), hanoi-departure, transpacific-flight, and us-overview — end to end, with
 *  no gap and no overlap with anything before/after. Stage *labels* in the rail are untouched; this
 *  is purely which continuous progress window this module's camera/route/label logic owns. */
export const CROSS_OCEAN_START = HANOI_INTERLUDE_NOW.start;
export const CROSS_OCEAN_END = US_OVERVIEW.end;
const CROSS_OCEAN_SPAN = CROSS_OCEAN_END - CROSS_OCEAN_START;

/** 0-1 progress local to the cross-ocean window, clamped outside it. Every checkpoint in this file
 *  is expressed on this 0-1 scale, matching the spec's own "test at local 0%, 10%, ... 100%". */
export function crossOceanLocal(progress: number): number {
  return clamp01((progress - CROSS_OCEAN_START) / CROSS_OCEAN_SPAN);
}

/** the overall scroll progress a given local fraction of the cross-ocean window falls at */
function atLocal(local: number): number {
  return CROSS_OCEAN_START + local * CROSS_OCEAN_SPAN;
}

/** a country-scale point for the "United States" arrival marker/rotation target — not a specific
 *  city (the real Rivermont pin, and the real "United States" chapter intro, take over once the
 *  transition ends); reuses USA_PRESET's own already-tuned regional center, never a new coordinate. */
const ROTATION_DESTINATION = { lat: USA_PRESET.center[1], lon: USA_PRESET.center[0] };

// --- projection ownership -------------------------------------------------------------------

/** globe forms well before the rotation is visually complete ("0.15-0.30 switch/form into globe
 *  projection... do NOT immediately spin away") and flattens back to mercator once the U.S. framing
 *  has mostly zoomed in, well before the U.S. intro text appears. */
const GLOBE_ON_AT = atLocal(0.15);
const GLOBE_OFF_AT = atLocal(0.92);

/**
 * The one function that decides globe vs. mercator for the ENTIRE journey — extends the previous
 * simple "mercator from hanoi-approach onward" rule with exactly one carved-out window: this
 * transition's own globe beat. Everything before/after that window keeps its old behavior
 * unchanged (Hanoi, the U.S. chapter, Today all stay flat mercator; Earth/Vietnam-approach stay
 * globe), so there's still exactly one canonical projection owner, just a smarter rule.
 */
export function computeCrossOceanProjectionMode(progress: number): "globe" | "mercator" {
  if (progress >= GLOBE_ON_AT && progress < GLOBE_OFF_AT) return "globe";
  return progress < HANOI_APPROACH.start ? "globe" : "mercator";
}

// --- camera ----------------------------------------------------------------------------------

const ROTATION_START = atLocal(0.3);
const ROTATION_END = atLocal(0.86);

/** apparent globe size held constant through the whole rotation so the transition reads as one
 *  continuous spin, not a zoom pulse — diameterPx = 512*2^zoom/pi is a fixed pixel value (same
 *  convention EARTH_PRESET/PACIFIC_CROSSING_PRESET already use), tuned so the sphere's true
 *  silhouette lands around ~68-78vh on a typical desktop viewport. Reuses PACIFIC_CROSSING_PRESET's
 *  own already-tuned value. */
const GLOBE_TRAVEL_ZOOM = 2.1;

const ENTRY_TARGET: JourneyCameraPreset = { center: [FLIGHT_ORIGIN.lon, FLIGHT_ORIGIN.lat], zoom: GLOBE_TRAVEL_ZOOM };
const APPROACH_FROM: JourneyCameraPreset = { center: USA_PRESET.center, zoom: GLOBE_TRAVEL_ZOOM };

/** fraction of the USA_PRESET->RIVERMONT_PRESET distance rivermont-approach's own formula expects
 *  to already have covered by the time it starts (see journeyMapCamera.ts's identical constant) —
 *  duplicated as a plain number, not imported, to avoid a circular import between the two modules;
 *  keep both in sync if either changes. */
const US_APPROACH_EARLY_SPLIT = 0.3;

function lerpPresetLocal(a: JourneyCameraPreset, b: JourneyCameraPreset, t: number): JourneyCameraState {
  const { lat, lon } = slerpLatLon({ lat: a.center[1], lon: a.center[0] }, { lat: b.center[1], lon: b.center[0] }, t);
  return { center: [lon, lat], zoom: lerp(a.zoom, b.zoom, t), pitch: 0, bearing: 0 };
}

/** The exact camera state rivermont-approach's own (untouched) formula already expects to inherit
 *  at its own start — computed once so this transition's final frame and rivermont-approach's first
 *  frame are identical, never a snap at that boundary. */
const CROSS_OCEAN_END_STATE = lerpPresetLocal(USA_PRESET, RIVERMONT_PRESET, US_APPROACH_EARLY_SPLIT);

/** discrete reduced-motion snapshots — reused by journeyMapCamera's own reduced-motion holds so
 *  those stay geographically consistent with this module's globe geometry instead of the old
 *  flat-mercator presets. */
export const CROSS_OCEAN_ENTRY_HOLD: JourneyCameraState = { ...ENTRY_TARGET, pitch: 0, bearing: 0 };
export const CROSS_OCEAN_MIDPOINT_HOLD: JourneyCameraState = (() => {
  const { lat, lon } = slerpLatLon(FLIGHT_ORIGIN, ROTATION_DESTINATION, 0.5);
  return { center: [lon, lat], zoom: GLOBE_TRAVEL_ZOOM, pitch: 0, bearing: 0 };
})();

/**
 * The approach's own settle point — continental U.S. facing the camera, still reasonably wide
 * ("regional overview," not city-level clutter). Mercator resumes partway through the settle (see
 * GLOBE_OFF_AT below, ~zoom 3.4) landing very close to this same framing, so the flatten itself
 * barely changes what's on screen. The bigger zoom-in toward Rivermont's own direction only begins
 * AFTER this settle completes — see APPROACH_ZOOM_IN_START below — so the U.S. intro text (which
 * enters right at that same point, see US_INTRO_TEXT_ENTER_WIDTH) always starts against this clean
 * backdrop, never the already-cluttered city/road density further along the zoom-in.
 */
const APPROACH_SETTLE_END = atLocal(0.94);

/**
 * Continuous camera for the whole cross-ocean window: Vietnam (flat) -> pull back into a globe
 * centered on Hanoi -> dateline-safe great-circle rotation toward the U.S. -> settle at a clean
 * regional U.S. framing -> zoom in toward the exact frame rivermont-approach already expects. Never
 * a raw longitude lerp (see slerpLatLon) — the rotation always goes the short way, Vietnam -> Pacific
 * -> North America.
 */
export function computeCrossOceanCameraState(progress: number): JourneyCameraState {
  if (progress < ROTATION_START) {
    const t = smoothstep(clamp01((progress - CROSS_OCEAN_START) / (ROTATION_START - CROSS_OCEAN_START)));
    return lerpPresetLocal(VIETNAM_PRESET, ENTRY_TARGET, t);
  }
  if (progress < ROTATION_END) {
    const t = smoothstep(clamp01((progress - ROTATION_START) / (ROTATION_END - ROTATION_START)));
    const { lat, lon } = slerpLatLon(FLIGHT_ORIGIN, ROTATION_DESTINATION, t);
    return { center: [lon, lat], zoom: GLOBE_TRAVEL_ZOOM, pitch: 0, bearing: 0 };
  }
  if (progress < APPROACH_SETTLE_END) {
    const t = smoothstep(clamp01((progress - ROTATION_END) / (APPROACH_SETTLE_END - ROTATION_END)));
    return lerpPresetLocal(APPROACH_FROM, USA_PRESET, t);
  }
  const t = smoothstep(clamp01((progress - APPROACH_SETTLE_END) / (CROSS_OCEAN_END - APPROACH_SETTLE_END)));
  return lerpPresetLocal(USA_PRESET, CROSS_OCEAN_END_STATE, t);
}

// --- route reveal + moving travel point -------------------------------------------------------

const ROUTE_VISIBILITY_FADE = CROSS_OCEAN_SPAN * 0.05;

/** 0 while the globe isn't active yet/anymore, ramping in with the globe projection itself and
 *  back out before mercator resumes — the route is only ever on screen while the globe is. */
export function computeCrossOceanRouteVisibility(progress: number): number {
  return Math.min(rampUpFrom(progress, GLOBE_ON_AT, ROUTE_VISIBILITY_FADE), rampDownTo(progress, GLOBE_OFF_AT, ROUTE_VISIBILITY_FADE));
}

/** 0 before the rotation starts, eased across it, 1 once arrived — the single value driving both
 *  the route's progressive reveal and the travel point's position, so they can never drift apart
 *  from the camera's own rotation (see computeCrossOceanCameraState). */
export function computeCrossOceanRouteProgress(progress: number): number {
  if (progress <= ROTATION_START) return 0;
  if (progress >= ROTATION_END) return 1;
  return smoothstep((progress - ROTATION_START) / (ROTATION_END - ROTATION_START));
}

const travelInterpolate = geoInterpolate([FLIGHT_ORIGIN.lon, FLIGHT_ORIGIN.lat], [FLIGHT_DESTINATION.lon, FLIGHT_DESTINATION.lat]);

/** the travel point's live geographic position — same great-circle geometry the route itself is
 *  drawn from (journeyGeoData's transpacificRouteGeoJSON), never independently guessed. */
export function computeTravelPointCoordinate(progress: number): [number, number] {
  return travelInterpolate(computeCrossOceanRouteProgress(progress)) as [number, number];
}

// --- "clean globe" suppression: numbered pins + generic basemap labels ------------------------

/**
 * 0 outside the transition, 1 through nearly all of it — the single weight that hides the five
 * (otherwise pixel-overlapping, at this zoom) Hanoi pins, both U.S. pins, and generic basemap
 * labels, leaving only the dedicated departure/arrival anchor markers below. Reaches full
 * suppression BEFORE the Hanoi anchor label starts appearing, and only starts releasing again
 * AFTER the U.S. anchor label has fully faded out (see the two anchor weights below) — otherwise
 * the generic "Hà Nội" basemap label and this module's own "Hanoi" anchor label briefly render on
 * top of each other during the handoff, exactly the label-collision bug this module exists to fix.
 */
export function computeCrossOceanCleanWeight(progress: number): number {
  return stageWeight(crossOceanLocal(progress), 0.04, 0.94, 0.03);
}

// --- departure / arrival anchor markers ---------------------------------------------------------

/** "Hanoi" — visible only near departure, gone well before the globe reaches mid-Pacific. Ramp-in
 *  starts exactly at 0.04, the instant computeCrossOceanCleanWeight above is already fully at 1 —
 *  never stacked with the real Hanoi pins/generic city label that weight just hid. */
export function computeHanoiAnchorCrossOceanWeight(progress: number): number {
  return stageWeight(crossOceanLocal(progress), 0.08, 0.35, 0.04);
}

/** "United States" — fades in as North America comes around the globe, fully gone by 0.94 (the
 *  exact instant computeCrossOceanCleanWeight above starts releasing again), before the real
 *  Rivermont/Gainesville pins reappear. */
export function computeUsAnchorWeight(progress: number): number {
  return stageWeight(crossOceanLocal(progress), 0.68, 0.88, 0.06);
}

// --- interlude text timing (the "Cross the Ocean" beat overlaps this transition's own entry) ---

/** the "now" panel's own copy needs to be long gone before the globe starts rotating in earnest —
 *  entrance unchanged from before, exit now finishes by local 0.42 instead of riding the old
 *  hanoi-interlude-now stage boundary all the way out. */
export function computeInterludeNowTextWeight(progress: number): number {
  const local = crossOceanLocal(progress);
  return Math.min(rampUpFrom(local, 0.02, 0.02), rampDownTo(local, 0.42, 0.08));
}

/** tiny "Across the Pacific" mono label — the only copy allowed near arrival, gone before the real
 *  U.S. intro text takes over. */
export function computeAcrossPacificLabelWeight(progress: number): number {
  return stageWeight(crossOceanLocal(progress), 0.74, 0.88, 0.05);
}

// --- U.S. intro hand-off ----------------------------------------------------------------------

/** the U.S. intro text (and the camera padding reserved for it) must not appear until the globe has
 *  actually flattened AND the camera has settled at the clean regional U.S. framing (see
 *  APPROACH_SETTLE_END) — never while the zoom-in toward Rivermont has already made the map busy
 *  with city/road detail. Entrance finishes exactly at CROSS_OCEAN_END so both this module and
 *  JourneyUsIntroPanel/journeyMapPadding share one number. */
export const US_INTRO_TEXT_ENTER_WIDTH = CROSS_OCEAN_END - APPROACH_SETTLE_END;
