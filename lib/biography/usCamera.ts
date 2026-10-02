import { geoInterpolate } from "d3-geo";
import { usJourneyPins } from "@/data/biography/usJourney";
import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, localProgress, rampDownTo, rampUpFrom, smoothstep } from "@/lib/biography/journeyMotion";
import { toMapPinStatus, type JourneyPinStatus } from "@/lib/biography/hanoiCamera";
import { computePlaneOpacity } from "@/lib/biography/transpacificCamera";
import type { JourneyStageId } from "@/lib/biography/journeyTypes";
import type { PinStatus } from "@/components/biography/MapPin";

/**
 * Externally controlled U.S. map viewport — the persistent-map analog of HanoiMapViewport (see
 * hanoiCamera.ts). Phase 9 extends Phase 8's two named targets (`overview`/`rivermont`) with the
 * domestic-flight framing and Gainesville.
 */
export type UsMapViewport = {
  center: [longitude: number, latitude: number];
  zoom: number;
};

export type UsCameraTargetId = "overview" | "rivermont" | "flight-overview" | "gainesville";

/** Rivermont/Gainesville — usJourneyPins[0]/[1], confirmed by inspection: ids "rivermont"/
 *  "gainesville", stored coordinates reused verbatim, never re-guessed or duplicated. */
const RIVERMONT_PIN = usJourneyPins[0];
const GAINESVILLE_PIN = usJourneyPins[1];
export const RIVERMONT_PIN_ID = RIVERMONT_PIN.id;
export const GAINESVILLE_PIN_ID = GAINESVILLE_PIN.id;

export const RIVERMONT_APPROACH = getStageById("rivermont-approach");
export const RIVERMONT_STORY = getStageById("rivermont-story");
export const RIVERMONT_DEPARTURE = getStageById("rivermont-departure");
export const FLORIDA_FLIGHT = getStageById("florida-flight");
export const GAINESVILLE_APPROACH = getStageById("gainesville-approach");
export const GAINESVILLE_STORY = getStageById("gainesville-story");
export const US_MEMORIES = getStageById("us-memories");

/** every stage slot this module owns end to end — GeographicJourney excludes these from both the
 *  generic per-stage placeholder crossfade and the generic placeholder render loop, the same way
 *  transpacificCamera's TRANSPACIFIC_STAGE_IDS excludes hanoi-departure/transpacific-flight/
 *  us-overview. `rivermont-departure` IS included: the actual "leaving Rivermont" motion (camera
 *  pullback, story panel retracting) is tied to florida-flight's own early window
 *  (RIVERMONT_STORY_EXIT_AT/CAMERA_PULLBACK_AT below), so during rivermont-departure's own scroll
 *  window the camera and story already hold steady (see computeUsCameraFrame /
 *  deriveRivermontStoryWeight below) — it needs no rendered content of its own, only exclusion
 *  from the generic placeholder. `us-memories` is included for the same reason: the camera holds
 *  at Gainesville through it (see computeUsCameraFrame), and it owns its own overlay panel driven
 *  by deriveUsMemoriesWeight below instead of the generic placeholder. */
export const US_JOURNEY_STAGE_IDS: ReadonlySet<string> = new Set<JourneyStageId>([
  RIVERMONT_APPROACH.id,
  RIVERMONT_STORY.id,
  RIVERMONT_DEPARTURE.id,
  FLORIDA_FLIGHT.id,
  GAINESVILLE_APPROACH.id,
  GAINESVILLE_STORY.id,
  US_MEMORIES.id,
]);

/** presentation-only values — centralized here, not duplicated at each call site */
const RIVERMONT_ZOOM = 2.2;
const GAINESVILLE_ZOOM = 2.1;
/** much smaller than the full zoom values — reduced motion gets a restrained, near-static shift
 *  rather than a full pan/zoom (see resolveUsReducedComposition) */
const RIVERMONT_ZOOM_REDUCED = 1.15;
const GAINESVILLE_ZOOM_REDUCED = 1.15;
/** slightly left of center on desktop, reserving the right side for the story panel */
const RIVERMONT_DESKTOP_FOCUS = { x: 0.4, y: 0.46 };
const GAINESVILLE_DESKTOP_FOCUS = { x: 0.4, y: 0.46 };
/** above vertical center on mobile, reserving the lower area for the bottom sheet */
const RIVERMONT_MOBILE_FOCUS = { x: 0.5, y: 0.34 };
const GAINESVILLE_MOBILE_FOCUS = { x: 0.5, y: 0.34 };

/** camera reaches Rivermont and holds by this fraction of rivermont-approach's local progress */
const RIVERMONT_SETTLE_FRACTION = 0.35;

// --- Rivermont departure (entirely within florida-flight's own early window, per the "this stage
// includes Rivermont departure" instruction) ---
/** local fraction of florida-flight by which the Rivermont story has fully closed */
const DEPARTURE_STORY_CLOSE_FRACTION = 0.2;
/** local fraction of florida-flight by which the camera has fully pulled back off Rivermont */
const DEPARTURE_CAMERA_PULLBACK_FRACTION = 0.4;

const RIVERMONT_STORY_EXIT_AT = lerp(FLORIDA_FLIGHT.start, FLORIDA_FLIGHT.end, DEPARTURE_STORY_CLOSE_FRACTION);
const RIVERMONT_STORY_EXIT_WIDTH = (FLORIDA_FLIGHT.end - FLORIDA_FLIGHT.start) * DEPARTURE_STORY_CLOSE_FRACTION;
/** Rivermont is marked completed the instant its story finishes closing — after florida-flight has
 *  begun (i.e. after departure), never before, per "Rivermont becomes completed only after
 *  departure begins" */
const RIVERMONT_COMPLETE_AT = RIVERMONT_STORY_EXIT_AT;

const CAMERA_PULLBACK_AT = lerp(FLORIDA_FLIGHT.start, FLORIDA_FLIGHT.end, DEPARTURE_CAMERA_PULLBACK_FRACTION);

// How far the domestic route must have drawn (computeUsRouteProgress) before Gainesville is
// allowed to read as "active" — mirrors hanoiCamera.ts's own PIN_ACTIVATION_THRESHOLD.
const PIN_ACTIVATION_THRESHOLD = 0.95;

// --- domestic route: starts only once the pullback has visibly settled (never mid-camera-move,
// i.e. never reads as a snap), finishes partway into gainesville-approach ---
const ROUTE_START_BUFFER = 0.005;
const ROUTE_START_AT = CAMERA_PULLBACK_AT + ROUTE_START_BUFFER;
const ROUTE_END_FRACTION = 0.5;
const ROUTE_END_AT = lerp(GAINESVILLE_APPROACH.start, GAINESVILLE_APPROACH.end, ROUTE_END_FRACTION);

// --- Gainesville approach camera: pans across the SAME window the domestic route draws in (not
// after it finishes — "camera should move WITH the route," never camera-then-line or line-then-
// camera), settling exactly as the route completes and Gainesville activates. ---
const GAINESVILLE_CAMERA_START_AT = ROUTE_START_AT;
const GAINESVILLE_CAMERA_END_AT = ROUTE_END_AT;

export type UsCameraFrame = {
  fromId: UsCameraTargetId;
  toId: UsCameraTargetId;
  /** eased local blend from fromId to toId, 0–1 */
  t: number;
};

/**
 * Continuous camera frame for any overall scroll progress — pure, deterministic, matching at every
 * stage boundary (t=1 on one side, t=0 on the other) so there's never a visible snap. Branches are
 * checked in strictly ascending progress order and are mutually exclusive.
 */
export function computeUsCameraFrame(progress: number): UsCameraFrame {
  if (progress < RIVERMONT_APPROACH.start) {
    return { fromId: "overview", toId: "overview", t: 1 };
  }
  if (progress < RIVERMONT_APPROACH.end) {
    const raw = localProgress(progress, RIVERMONT_APPROACH);
    return { fromId: "overview", toId: "rivermont", t: smoothstep(clamp01(raw / RIVERMONT_SETTLE_FRACTION)) };
  }
  // holds at Rivermont through rivermont-story, the untouched rivermont-departure placeholder, and
  // the very start of florida-flight
  if (progress < FLORIDA_FLIGHT.start) {
    return { fromId: "rivermont", toId: "rivermont", t: 1 };
  }
  if (progress < CAMERA_PULLBACK_AT) {
    const t = smoothstep(clamp01((progress - FLORIDA_FLIGHT.start) / (CAMERA_PULLBACK_AT - FLORIDA_FLIGHT.start)));
    return { fromId: "rivermont", toId: "flight-overview", t };
  }
  // brief hold at the flight overview (just the route's own start buffer) before the pan to
  // Gainesville begins alongside the domestic route
  if (progress < GAINESVILLE_CAMERA_START_AT) {
    return { fromId: "flight-overview", toId: "flight-overview", t: 1 };
  }
  if (progress < GAINESVILLE_CAMERA_END_AT) {
    // same window as computeUsRouteProgress below (ROUTE_START_AT..ROUTE_END_AT) — camera arrives
    // exactly as the route finishes drawing, not before and not after
    const t = smoothstep(clamp01((progress - GAINESVILLE_CAMERA_START_AT) / (GAINESVILLE_CAMERA_END_AT - GAINESVILLE_CAMERA_START_AT)));
    return { fromId: "flight-overview", toId: "gainesville", t };
  }
  // holds at Gainesville forever after — through gainesville-story and every later
  // not-yet-implemented U.S. stage, since nothing in Phase 9 ever begins leaving Gainesville
  return { fromId: "gainesville", toId: "gainesville", t: 1 };
}

type ProjectedPinLike = { id: string; x: number; y: number };
type ContainerSize = { width: number; height: number };
type Composition = { dx: number; dy: number; scale: number };

const IDENTITY: Composition = { dx: 0, dy: 0, scale: 1 };

/**
 * Resolves a named target to a pixel-space translate+scale for a wrapper placed around the whole
 * (untouched) HanoiMap render. "overview" and "flight-overview" are both the identity transform —
 * the map's own default fitted view already frames both Rivermont and Gainesville (there are only
 * two U.S. pins today), so the neutral pre-departure overview and the mid-flight framing are the
 * same composition; they're kept as distinct named targets so a future phase (more pins) can tune
 * one without perturbing the other.
 */
export function resolveUsComposition(
  targetId: UsCameraTargetId,
  projectedPins: ProjectedPinLike[],
  size: ContainerSize,
  isMobile: boolean,
  zoomOverride?: number
): Composition {
  if (targetId === "overview" || targetId === "flight-overview") return IDENTITY;
  const pinId = targetId === "rivermont" ? RIVERMONT_PIN_ID : GAINESVILLE_PIN_ID;
  const pin = projectedPins.find((p) => p.id === pinId);
  if (!pin || size.width <= 0 || size.height <= 0) return IDENTITY;
  const focus =
    targetId === "rivermont"
      ? isMobile
        ? RIVERMONT_MOBILE_FOCUS
        : RIVERMONT_DESKTOP_FOCUS
      : isMobile
        ? GAINESVILLE_MOBILE_FOCUS
        : GAINESVILLE_DESKTOP_FOCUS;
  const scale = zoomOverride ?? (targetId === "rivermont" ? RIVERMONT_ZOOM : GAINESVILLE_ZOOM);
  const dx = size.width * (focus.x - 0.5 - scale * (pin.x / 100 - 0.5));
  const dy = size.height * (focus.y - 0.5 - scale * (pin.y / 100 - 0.5));
  return { dx, dy, scale };
}

export function lerpComposition(a: Composition, b: Composition, t: number): Composition {
  return { dx: lerp(a.dx, b.dx, t), dy: lerp(a.dy, b.dy, t), scale: lerp(a.scale, b.scale, t) };
}

/**
 * Reduced-motion camera: a small, fixed set of discrete (non-animated) compositions rather than a
 * continuous scroll-driven pan/zoom — "near-static", still marking each neutral → active change.
 */
export function resolveUsReducedComposition(
  progress: number,
  projectedPins: ProjectedPinLike[],
  size: ContainerSize,
  isMobile: boolean
): Composition {
  if (progress < RIVERMONT_APPROACH.start) return IDENTITY;
  if (progress < CAMERA_PULLBACK_AT) return resolveUsComposition("rivermont", projectedPins, size, isMobile, RIVERMONT_ZOOM_REDUCED);
  if (progress < GAINESVILLE_CAMERA_START_AT) return IDENTITY;
  return resolveUsComposition("gainesville", projectedPins, size, isMobile, GAINESVILLE_ZOOM_REDUCED);
}

/** — pin visual state — */

/** Rivermont: upcoming before rivermont-approach, active from rivermont-approach through the early
 *  portion of florida-flight, completed once its story has finished closing (see
 *  RIVERMONT_COMPLETE_AT) — never completed before departure actually begins. */
export function deriveRivermontStatus(progress: number): JourneyPinStatus {
  if (progress < RIVERMONT_APPROACH.start) return "upcoming";
  if (progress < RIVERMONT_COMPLETE_AT) return "active";
  return "completed";
}

/** Gainesville: upcoming until the domestic route has nearly finished drawing to it — "do not
 *  activate the next pin while the line is only partway there." Used to flip active immediately at
 *  its approach stage's start, before ROUTE_END_AT (route-drawing target, 50% into that same
 *  stage) — a real instance of the same "pin activates before the route arrives" bug this pass
 *  fixes for Hanoi, gated here on computeUsRouteProgress instead. */
export function deriveGainesvilleStatus(progress: number): JourneyPinStatus {
  if (progress < GAINESVILLE_APPROACH.start) return "upcoming";
  return computeUsRouteProgress(progress) >= PIN_ACTIVATION_THRESHOLD ? "active" : "upcoming";
}

export function toUsMapPinStatus(status: JourneyPinStatus): PinStatus {
  return toMapPinStatus(status);
}

/**
 * Rivermont story-panel opacity — enters late in rivermont-approach (well after the camera's own
 * settle point), finishes entering exactly at the rivermont-approach → rivermont-story boundary
 * (unchanged from Phase 8), then holds through rivermont-story, the untouched rivermont-departure
 * placeholder, and the very start of florida-flight, retracting only over florida-flight's own
 * early fraction — giving "the story remains readable at the start of florida-flight" before it
 * closes, per Phase 9's explicit requirement.
 */
const RIVERMONT_STORY_ENTER_AT = RIVERMONT_APPROACH.end;
const RIVERMONT_STORY_ENTER_WIDTH = (RIVERMONT_APPROACH.end - RIVERMONT_APPROACH.start) * 0.35;

export function deriveRivermontStoryWeight(progress: number): number {
  return Math.min(
    rampUpFrom(progress, RIVERMONT_STORY_ENTER_AT, RIVERMONT_STORY_ENTER_WIDTH),
    rampDownTo(progress, RIVERMONT_STORY_EXIT_AT, RIVERMONT_STORY_EXIT_WIDTH)
  );
}

/**
 * Gainesville story-panel opacity — mirrors Rivermont's entrance pattern: enters only after the
 * camera has settled on Gainesville (GAINESVILLE_CAMERA_END_AT), finishes entering exactly at the
 * gainesville-approach → gainesville-story boundary, holds through most of gainesville-story, and
 * only begins its own exit fade over the stage's final fraction — a substantial stable reading
 * window, deliberately not the Phase 5 Pin-5 mistake of becoming readable only right before exit.
 */
const GAINESVILLE_STORY_ENTER_AT = GAINESVILLE_APPROACH.end;
const GAINESVILLE_STORY_ENTER_WIDTH = GAINESVILLE_APPROACH.end - GAINESVILLE_CAMERA_END_AT;
const GAINESVILLE_STORY_EXIT_AT = GAINESVILLE_STORY.end;
const GAINESVILLE_STORY_EXIT_WIDTH = (GAINESVILLE_STORY.end - GAINESVILLE_STORY.start) * 0.2;

export function deriveGainesvilleStoryWeight(progress: number): number {
  return Math.min(
    rampUpFrom(progress, GAINESVILLE_STORY_ENTER_AT, GAINESVILLE_STORY_ENTER_WIDTH),
    rampDownTo(progress, GAINESVILLE_STORY_EXIT_AT, GAINESVILLE_STORY_EXIT_WIDTH)
  );
}

/**
 * "More to come" overlay weight for us-memories — enters a quarter into its own stage window,
 * ramps fully back down by the stage's end so today-ahead's own window is a quiet, overlay-free
 * beat over the still-held Gainesville map (mirroring Gainesville's own story exit pattern above).
 */
const US_MEMORIES_ENTER_AT = lerp(US_MEMORIES.start, US_MEMORIES.end, 0.25);
const US_MEMORIES_ENTER_WIDTH = (US_MEMORIES.end - US_MEMORIES.start) * 0.25;
const US_MEMORIES_EXIT_AT = US_MEMORIES.end;
const US_MEMORIES_EXIT_WIDTH = (US_MEMORIES.end - US_MEMORIES.start) * 0.2;

export function deriveUsMemoriesWeight(progress: number): number {
  return Math.min(
    rampUpFrom(progress, US_MEMORIES_ENTER_AT, US_MEMORIES_ENTER_WIDTH),
    rampDownTo(progress, US_MEMORIES_EXIT_AT, US_MEMORIES_EXIT_WIDTH)
  );
}

/** — domestic route geometry — */

const ROUTE_SEGMENTS = 48;

/**
 * Great-circle waypoints (lon/lat) between Rivermont and Gainesville's exact stored coordinates —
 * geography-only, independent of any map projection or container size, computed once at module
 * load (both endpoints are static data) rather than recomputed per render or per scroll tick.
 */
export const DOMESTIC_ROUTE_WAYPOINTS: [number, number][] = (() => {
  const interpolate = geoInterpolate(
    [RIVERMONT_PIN.coordinates.lon, RIVERMONT_PIN.coordinates.lat],
    [GAINESVILLE_PIN.coordinates.lon, GAINESVILLE_PIN.coordinates.lat]
  );
  const points: [number, number][] = [];
  for (let i = 0; i <= ROUTE_SEGMENTS; i++) points.push(interpolate(i / ROUTE_SEGMENTS));
  return points;
})();

/** 0 before the domestic route starts, eased across its own window, 1 once Gainesville is reached
 *  — the single value that drives both the route's stroke-dash reveal and the plane's position, so
 *  they can never drift apart. Reversing scroll reverses it along the identical curve. */
export function computeUsRouteProgress(progress: number): number {
  return smoothstep(clamp01((progress - ROUTE_START_AT) / (ROUTE_END_AT - ROUTE_START_AT)));
}

/** — one-call bundle — */

export type UsJourneyFrame = {
  fromId: UsCameraTargetId;
  toId: UsCameraTargetId;
  cameraT: number;
  routeProgress: number;
  planeOpacity: number;
  rivermontStoryWeight: number;
  gainesvilleStoryWeight: number;
  usMemoriesWeight: number;
  rivermontStatus: JourneyPinStatus;
  gainesvilleStatus: JourneyPinStatus;
};

/** Every field is derived from the same `progress` via the focused functions above — never a
 *  separate logic path, so nothing here can drift from what those functions return individually. */
export function computeUsJourneyFrame(progress: number): UsJourneyFrame {
  const camera = computeUsCameraFrame(progress);
  const routeProgress = computeUsRouteProgress(progress);
  return {
    fromId: camera.fromId,
    toId: camera.toId,
    cameraT: camera.t,
    routeProgress,
    planeOpacity: computePlaneOpacity(routeProgress),
    rivermontStoryWeight: deriveRivermontStoryWeight(progress),
    gainesvilleStoryWeight: deriveGainesvilleStoryWeight(progress),
    usMemoriesWeight: deriveUsMemoriesWeight(progress),
    rivermontStatus: deriveRivermontStatus(progress),
    gainesvilleStatus: deriveGainesvilleStatus(progress),
  };
}

/** — click/keyboard navigation targets — */

/** local position (within the destination's own story stage) a pin click lands on — matches
 *  hanoiCamera's PIN_CLICK_TARGET_LOCAL: safely past the stage's own entrance, never on a
 *  boundary. */
const PIN_CLICK_TARGET_LOCAL = 0.55;

export function computeRivermontClickTargetProgress(): number {
  return lerp(RIVERMONT_STORY.start, RIVERMONT_STORY.end, PIN_CLICK_TARGET_LOCAL);
}

export function computeGainesvilleClickTargetProgress(): number {
  return lerp(GAINESVILLE_STORY.start, GAINESVILLE_STORY.end, PIN_CLICK_TARGET_LOCAL);
}

export type UsMapStageHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  updateCamera: (progress: number) => void;
};
