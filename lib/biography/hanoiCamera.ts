import { hanoiJourneyPins } from "@/data/biography/hanoiJourney";
import { getStageAtProgress, getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, localProgress, smoothstep } from "@/lib/biography/journeyMotion";
import { HANOI_COMPLETE_SETTLE_FRACTION } from "@/lib/biography/journeyMapCamera";
import type { JourneyStageId } from "@/lib/biography/journeyTypes";
import type { PinStatus } from "@/components/biography/MapPin";

/**
 * Externally controlled Hanoi map viewport — the map-layer analog of the globe's `GlobeViewState`.
 * `zoom` is a plain multiplier (matching HanoiMap's own internal `scale`, not a log-scale "map
 * zoom level"), since that's the representation the existing d3/CSS-transform architecture
 * already understands.
 */
export type HanoiMapViewport = {
  center: [longitude: number, latitude: number];
  zoom: number;
};

export type HanoiCameraTargetId = "overview" | "pin-1" | "pin-2" | "pin-3" | "pin-4" | "pin-5";

export const HANOI_PIN_STAGE_IDS: JourneyStageId[] = [
  "hanoi-pin-1",
  "hanoi-pin-2",
  "hanoi-pin-3",
  "hanoi-pin-4",
  "hanoi-pin-5",
];

/** every stage this phase absorbs into the persistent map (hanoi-overview already lives in
 *  journeyCamera's APPROACH_STAGE_IDS from Phase 4; this covers the five new pin stages) */
export const HANOI_PIN_STAGE_IDS_SET: ReadonlySet<string> = new Set(HANOI_PIN_STAGE_IDS);

const HANOI_PIN_1 = getStageById("hanoi-pin-1");
export const HANOI_PIN_5 = getStageById("hanoi-pin-5");
const HANOI_COMPLETE = getStageById("hanoi-complete");
// Cinematic-atlas fix: the story card used to retract over the SAME (large, 0.45) window the
// camera takes to settle back to overview — fine for a continuous scroll, but "Finish Chapter"
// (and any other direct goToStage jump) lands at hanoi-complete's very start, where that window's
// own local progress is ~0, so the card was still showing at near-full opacity right as the
// completion heading (its own much narrower ~0.006 EDGE_FADE) reached full opacity — the exact
// "too many competing layers" bug this spec calls out. The card's own retraction now runs over a
// short, independent window instead — gone well before the heading finishes fading in, on both a
// scroll AND a jump. The camera's own pull-back keeps using the original, larger, purely visual
// HANOI_COMPLETE_SETTLE_FRACTION timing below — nothing about that motion changes.
const STORY_RETRACT_FRACTION = 0.05;

/** presentation-only values — where none of the geography comes from */
const PIN_ZOOM = 1.7;
/** slightly left/above center on desktop, reserving the right side for Phase 6's story panel */
const PIN_DESKTOP_FOCUS = { x: 0.4, y: 0.46 };
/** shifted toward the upper third on mobile, reserving the lower portion for Phase 6's bottom sheet */
const PIN_MOBILE_FOCUS = { x: 0.5, y: 0.36 };

type HanoiCameraTarget = {
  id: HanoiCameraTargetId;
  /** null for "overview", which doesn't correspond to a single pin */
  pinId: string | null;
  viewport: HanoiMapViewport;
  desktopFocus: { x: number; y: number };
  mobileFocus: { x: number; y: number };
};

function pinTarget(index: number): HanoiCameraTarget {
  // derived straight from hanoiJourneyPins — no coordinate literal is duplicated here
  const pin = hanoiJourneyPins[index];
  return {
    id: `pin-${index + 1}` as HanoiCameraTargetId,
    pinId: pin.id,
    viewport: { center: [pin.coordinates.lon, pin.coordinates.lat], zoom: PIN_ZOOM },
    desktopFocus: PIN_DESKTOP_FOCUS,
    mobileFocus: PIN_MOBILE_FOCUS,
  };
}

/**
 * Centralized named viewport keyframes. "overview" is intentionally absent here — it doesn't
 * derive from a single pin's coordinate, and it must reproduce the exact framing HanoiMap already
 * renders by default (the same one Phase 4's globe-to-map handoff was verified against), so it's
 * handled as a literal identity transform in resolveHanoiComposition below rather than as a
 * resolved geographic point.
 */
export const HANOI_CAMERA_TARGETS: Record<Exclude<HanoiCameraTargetId, "overview">, HanoiCameraTarget> = {
  "pin-1": pinTarget(0),
  "pin-2": pinTarget(1),
  "pin-3": pinTarget(2),
  "pin-4": pinTarget(3),
  "pin-5": pinTarget(4),
};

/**
 * Camera reaches its target by this fraction of the stage's local progress, then holds steady for
 * the remainder — giving a stable, readable composition once arrived. This same `t` also drives
 * route-drawing and pin activation (see deriveContinuousRouteProgress/deriveActivationCursor
 * below), so it needs to span nearly the FULL local stage, not settle early: with the route+
 * activation threshold at 0.95, an early settle (the original 0.32, or even 0.7) makes the
 * destination pin activate well before the checkpoints a scroll-through would expect at its own
 * 75-95% mark. At 0.9, the 0.95 activation threshold is crossed at local progress ≈0.78 (still
 * mid/late "approaching," not "arrived") and full settle lands at local 0.9, leaving a real
 * 0.9-1.0 hold window before the next stage begins.
 */
const SETTLE_FRACTION = 0.9;

export type HanoiCameraFrame = {
  fromId: HanoiCameraTargetId;
  toId: HanoiCameraTargetId;
  /** eased local blend from fromId to toId, 0–1 — drives the CAMERA pull-back only */
  t: number;
  /** eased local blend for the Pin-5 STORY CARD's own retraction only, 0–1 — deliberately a much
   *  faster ramp than `t` (see STORY_RETRACT_FRACTION) so the card is fully gone well before the
   *  chapter-complete heading finishes fading in, on both a scroll and a direct stage jump. Equal
   *  to `t` everywhere except the pinCursor>=5 tail, where the two diverge on purpose. */
  storyT: number;
  /** -1 = before pin-1 (overview/approach), 0–4 = at that pin, 5 = past pin-5 */
  pinCursor: number;
};

/** -1 before pin-1, 0–4 while at that pin stage, 5 once past pin-5 — a pure function of progress */
export function derivePinCursor(progress: number): number {
  if (progress < HANOI_PIN_1.start) return -1;
  if (progress >= HANOI_PIN_5.end) return 5;
  const stageId = getStageAtProgress(progress).id;
  const idx = HANOI_PIN_STAGE_IDS.indexOf(stageId);
  return idx === -1 ? -1 : idx;
}

/** Continuous camera frame for any overall scroll progress — pure, deterministic, and matching
 *  at every stage boundary (t=1 on one side, t=0 on the other) so there's never a visible snap. */
export function computeHanoiCameraFrame(progress: number): HanoiCameraFrame {
  const pinCursor = derivePinCursor(progress);
  if (pinCursor <= -1) return { fromId: "overview", toId: "overview", t: 1, storyT: 1, pinCursor: -1 };
  if (pinCursor >= 5) {
    // Once past Pin 5: the CAMERA pulls back to overview over HANOI_COMPLETE_SETTLE_FRACTION (a
    // deliberately gradual, purely visual move), but the STORY CARD retracts over the much shorter
    // STORY_RETRACT_FRACTION — see that constant's own comment for why these can't share one value.
    const local = localProgress(progress, HANOI_COMPLETE);
    const t = smoothstep(clamp01(local / HANOI_COMPLETE_SETTLE_FRACTION));
    const storyT = smoothstep(clamp01(local / STORY_RETRACT_FRACTION));
    return { fromId: "pin-5", toId: "overview", t, storyT, pinCursor: 5 };
  }
  const toId = `pin-${pinCursor + 1}` as HanoiCameraTargetId;
  const fromId = pinCursor === 0 ? "overview" : (`pin-${pinCursor}` as HanoiCameraTargetId);
  const stage = getStageById(HANOI_PIN_STAGE_IDS[pinCursor]);
  const raw = localProgress(progress, stage);
  const t = smoothstep(clamp01(raw / SETTLE_FRACTION));
  return { fromId, toId, t, storyT: t, pinCursor };
}

type ProjectedPinLike = { id: string; x: number; y: number };
type ContainerSize = { width: number; height: number };
type Composition = { dx: number; dy: number; scale: number };

const IDENTITY: Composition = { dx: 0, dy: 0, scale: 1 };

/**
 * Resolves a named target to a pixel-space translate+scale for a wrapper placed around the
 * whole (untouched) HanoiMap render — i.e. HanoiMap keeps rendering its normal fitted view, and
 * this is a camera looking at it, not a change to the map's own projection. "overview" is always
 * the identity transform (HanoiMap's own default framing); each pin target is resolved from the
 * already-projected pin position HanoiMap itself renders from (useHanoiMapProjection), not a
 * second projection.
 */
export function resolveHanoiComposition(
  targetId: HanoiCameraTargetId,
  projectedPins: ProjectedPinLike[],
  size: ContainerSize,
  isMobile: boolean
): Composition {
  if (targetId === "overview") return IDENTITY;
  const target = HANOI_CAMERA_TARGETS[targetId];
  const pin = projectedPins.find((p) => p.id === target.pinId);
  if (!pin || size.width <= 0 || size.height <= 0) return IDENTITY;
  const focus = isMobile ? target.mobileFocus : target.desktopFocus;
  const scale = target.viewport.zoom;
  const dx = size.width * (focus.x - 0.5 - scale * (pin.x / 100 - 0.5));
  const dy = size.height * (focus.y - 0.5 - scale * (pin.y / 100 - 0.5));
  return { dx, dy, scale };
}

export function lerpComposition(a: Composition, b: Composition, t: number): Composition {
  return { dx: lerp(a.dx, b.dx, t), dy: lerp(a.dy, b.dy, t), scale: lerp(a.scale, b.scale, t) };
}

function pinIndexOfTarget(id: HanoiCameraTargetId): number {
  return id === "overview" ? -1 : Number(id.split("-")[1]) - 1;
}

/**
 * Per-pin story opacity (index 0–4, for pin-1..pin-5), derived from the exact same camera frame
 * that drives the map — not a separate index. While transitioning into pin N, its story weight
 * rises with the same eased `t` the camera arrives with; while transitioning out (into pin N+1),
 * it falls by the complementary `1 - storyT`, producing a natural crossfade between adjacent
 * stories without ever having two panels reach full opacity at once. The one story with no "next
 * pin" to crossfade against — pin-5 — retracts via that same `storyT`, which past Pin 5 is a much
 * faster ramp than the camera's own `t` (see STORY_RETRACT_FRACTION) so the card is fully gone
 * well before the chapter-complete heading finishes fading in.
 */
export function deriveStoryWeights(frame: HanoiCameraFrame): number[] {
  const weights = [0, 0, 0, 0, 0];
  const fromIdx = pinIndexOfTarget(frame.fromId);
  const toIdx = pinIndexOfTarget(frame.toId);
  if (fromIdx === toIdx) {
    if (toIdx >= 0) weights[toIdx] = 1;
    return weights;
  }
  if (toIdx >= 0) weights[toIdx] = frame.t;
  // storyT === t everywhere except the pinCursor>=5 tail (pin-5 retracting with no "next pin" to
  // crossfade against), where storyT ramps to 1 much faster than the camera's own pull-back
  if (fromIdx >= 0) weights[fromIdx] = 1 - frame.storyT;
  return weights;
}

/**
 * Local progress (within a pin's own stage) a pin-click scroll targets — inside the camera's own
 * post-settle hold window (settle point 0.9), so a click always lands on a fully-arrived, fully-
 * active pin rather than mid-transition.
 */
const PIN_CLICK_TARGET_LOCAL = 0.95;

/** Absolute scroll progress a click on pin `pinIndex` (0–4) should land on — inside that pin's
 *  stable reading window, never on its boundary. */
export function computePinClickTargetProgress(pinIndex: number): number {
  const stage = getStageById(HANOI_PIN_STAGE_IDS[pinIndex]);
  return stage.start + (stage.end - stage.start) * PIN_CLICK_TARGET_LOCAL;
}

/** — pin visual state — */

export type JourneyPinStatus = "upcoming" | "active" | "completed";

export function derivePinStatus(pinIndex: number, activeCursor: number): JourneyPinStatus {
  if (pinIndex < activeCursor) return "completed";
  if (pinIndex === activeCursor) return "active";
  return "upcoming";
}

/** HanoiMap/MapPin only know the pre-existing PinStatus union — "upcoming" maps to its
 *  "unvisited" value, which already renders the restrained neutral treatment this phase wants. */
export function toMapPinStatus(status: JourneyPinStatus): PinStatus {
  return status === "upcoming" ? "unvisited" : status;
}

/** How far into its own arrival (frame.t) the route must have drawn before the destination pin is
 *  allowed to read as "active" — "do not activate the next pin while the line is only partway
 *  there." The previous pin stays "active" (and the destination stays "upcoming") below this. */
const PIN_ACTIVATION_THRESHOLD = 0.95;

/** The activation cursor pin-status derives from — lags behind frame.pinCursor until the route has
 *  nearly finished drawing to it (PIN_ACTIVATION_THRESHOLD). Pure function of the same frame every
 *  other per-tick consumer already uses, so it naturally reverses on backward scroll (no separate
 *  "has this pin been activated yet" flag to get out of sync): "02 should deactivate before the
 *  line fully retracts" falls out of this for free. */
export function deriveActivationCursor(frame: HanoiCameraFrame): number {
  if (frame.pinCursor <= -1) return -1;
  if (frame.pinCursor >= 5) return 5;
  return frame.t >= PIN_ACTIVATION_THRESHOLD ? frame.pinCursor : frame.pinCursor - 1;
}

/** Route "traveled" fraction (0-1 across all 5 pins) — continuously follows scroll progress
 *  WITHIN each pin-to-pin transition via the same frame.t the camera itself arrives on (never a
 *  discrete per-stage jump), so route-drawing and camera motion are synchronized by construction:
 *  "camera should move WITH the route." Reversible for the same reason deriveActivationCursor is —
 *  a pure function of (pinCursor, t), not accumulated/stateful. */
export function deriveContinuousRouteProgress(frame: HanoiCameraFrame): number {
  if (frame.pinCursor <= 0) return 0;
  if (frame.pinCursor >= 5) return 1;
  return (frame.pinCursor - 1 + frame.t) / 4;
}

export type HanoiMapStageHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  updateCamera: (progress: number) => void;
};
