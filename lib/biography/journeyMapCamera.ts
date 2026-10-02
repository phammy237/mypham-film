import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, localProgress, smoothstep } from "@/lib/biography/journeyMotion";
import { slerpLatLon } from "@/lib/three/latLon";
import {
  EARTH_PRESET,
  VIETNAM_PRESET,
  HANOI_PRESET,
  USA_PRESET,
  RIVERMONT_PRESET,
  GAINESVILLE_PRESET,
  TODAY_PRESET,
  hanoiPinPreset,
  type JourneyCameraPreset,
  type JourneyCameraState,
} from "@/lib/biography/mapCameraPresets";
import {
  computeCrossOceanCameraState,
  CROSS_OCEAN_ENTRY_HOLD,
  CROSS_OCEAN_MIDPOINT_HOLD,
} from "@/lib/biography/crossOceanCamera";

/**
 * Continuous progress(0–1) → MapLibre camera state for the whole journey, replacing the
 * renderer-coupled halves of journeyCamera.ts/hanoiCamera.ts/transpacificCamera.ts/usCamera.ts.
 * Every stage boundary hands off at the exact same preset both functions agree on, so there's
 * never a visible snap — the same invariant the old per-renderer camera modules maintained.
 */

const VIETNAM_APPROACH = getStageById("vietnam-approach");
const HANOI_APPROACH = getStageById("hanoi-approach");
const HANOI_OVERVIEW = getStageById("hanoi-overview");
const HANOI_PIN_STAGE_IDS = ["hanoi-pin-1", "hanoi-pin-2", "hanoi-pin-3", "hanoi-pin-4", "hanoi-pin-5"] as const;
const HANOI_PIN_STAGES = HANOI_PIN_STAGE_IDS.map((id) => getStageById(id));
const HANOI_COMPLETE = getStageById("hanoi-complete");
const HANOI_INTERLUDE_NOT_YET = getStageById("hanoi-interlude-not-yet");
const HANOI_INTERLUDE_NOW = getStageById("hanoi-interlude-now");
const HANOI_DEPARTURE = getStageById("hanoi-departure");
const US_OVERVIEW = getStageById("us-overview");
const RIVERMONT_APPROACH = getStageById("rivermont-approach");
const RIVERMONT_STORY = getStageById("rivermont-story");
const RIVERMONT_DEPARTURE = getStageById("rivermont-departure");
const FLORIDA_FLIGHT = getStageById("florida-flight");
const GAINESVILLE_APPROACH = getStageById("gainesville-approach");
const US_MEMORIES = getStageById("us-memories");
const US_COMPLETE = getStageById("us-complete");
const TODAY_TRANSITION = getStageById("today-transition");

/** the fraction of a hanoi-pin-N stage's own window spent panning in — the rest holds on target.
 *  Kept short: adjacent Hanoi pins are only blocks apart, so the pan itself should read as a quick,
 *  subtle nudge with a long resting/readable tail, not a deliberate "flight." */
const HANOI_PIN_SETTLE_FRACTION = 0.45;

/**
 * Symmetric fix for the same issue on the U.S. side: usa->rivermont was the second-largest
 * per-stage zoom change, compressed into rivermont-approach alone — notably more abrupt than the
 * Hanoi equivalent (vietnam->hanoi), which gets its own full dedicated stage. crossOceanCamera.ts's
 * own cross-ocean camera already lands exactly on this fraction of the usa->rivermont distance by
 * the time rivermont-approach begins (see its CROSS_OCEAN_END_STATE) — this constant must stay in
 * sync with that module's own identical (deliberately duplicated, not imported — see there) copy.
 */
const US_APPROACH_EARLY_SPLIT = 0.3; // fraction of the usa->rivermont distance covered before rivermont-approach begins

/** Phase 6 — fraction of hanoi-complete's own window spent easing the camera back from the last
 *  pin to the Hanoi overview; the remainder holds there so the chapter-complete overlay has a
 *  stable, readable backdrop (the same "settle, then hold" shape as HANOI_PIN_SETTLE_FRACTION).
 *  Exported: hanoiCamera.ts's own Pin-5 story-panel retract timing mirrors this exact fraction so
 *  the panel finishes closing right as the camera settles, not before or after it — a single
 *  shared constant instead of two independently-declared copies. */
export const HANOI_COMPLETE_SETTLE_FRACTION = 0.45;
/** mirrors HANOI_COMPLETE_SETTLE_FRACTION for us-complete's own Gainesville -> USA_PRESET ease */
const US_COMPLETE_SETTLE_FRACTION = 0.45;
/** fraction of today-transition's own window spent pulling back to TODAY_PRESET — kept long so the
 *  final "pull out slightly" reads as slow and deliberate, never a snap; the remainder holds, so
 *  today-ahead itself never has to move the camera again. */
const TODAY_TRANSITION_SETTLE_FRACTION = 0.7;

function holdPreset(preset: JourneyCameraPreset): JourneyCameraState {
  return { center: preset.center, zoom: preset.zoom, pitch: preset.pitch ?? 0, bearing: preset.bearing ?? 0 };
}

function lerpPreset(a: JourneyCameraPreset, b: JourneyCameraPreset, t: number): JourneyCameraState {
  // always great-circle slerp for center, never a raw lon lerp — safe for both short hops (reduces
  // to the same short path) and the Pacific crossing (never the "wrong way" through Europe/Africa)
  const { lat, lon } = slerpLatLon({ lat: a.center[1], lon: a.center[0] }, { lat: b.center[1], lon: b.center[0] }, t);
  return {
    center: [lon, lat],
    zoom: lerp(a.zoom, b.zoom, t),
    pitch: lerp(a.pitch ?? 0, b.pitch ?? 0, t),
    bearing: lerp(a.bearing ?? 0, b.bearing ?? 0, t),
  };
}

export function computeJourneyCameraState(progress: number, reducedMotion: boolean): JourneyCameraState {
  if (reducedMotion) return computeReducedJourneyCameraState(progress);

  if (progress < VIETNAM_APPROACH.start) return holdPreset(EARTH_PRESET);
  if (progress < VIETNAM_APPROACH.end) {
    return lerpPreset(EARTH_PRESET, VIETNAM_PRESET, smoothstep(localProgress(progress, VIETNAM_APPROACH)));
  }
  if (progress < HANOI_APPROACH.end) {
    return lerpPreset(VIETNAM_PRESET, HANOI_PRESET, smoothstep(localProgress(progress, HANOI_APPROACH)));
  }
  if (progress < HANOI_OVERVIEW.end) return holdPreset(HANOI_PRESET);

  for (let i = 0; i < HANOI_PIN_STAGES.length; i++) {
    const stage = HANOI_PIN_STAGES[i];
    if (progress < stage.end) {
      const from = i === 0 ? HANOI_PRESET : hanoiPinPreset(i - 1);
      const to = hanoiPinPreset(i);
      const t = smoothstep(clamp01(localProgress(progress, stage) / HANOI_PIN_SETTLE_FRACTION));
      return lerpPreset(from, to, t);
    }
  }

  const lastHanoiPin = hanoiPinPreset(HANOI_PIN_STAGES.length - 1);

  // Phase 6 — chapter-complete + between-chapters interlude, inserted between the last pin and the
  // existing departure/flight sequence below. The camera settles back to the Hanoi overview (no
  // active pin framing left), then drifts progressively wider — overview -> Vietnam -> regional Asia
  // — across the two interlude beats, so "leaving" reads as a real, deliberate widening rather than
  // an abrupt cut once the user clicks Cross the Ocean.
  if (progress < HANOI_COMPLETE.end) {
    const t = smoothstep(clamp01(localProgress(progress, HANOI_COMPLETE) / HANOI_COMPLETE_SETTLE_FRACTION));
    return lerpPreset(lastHanoiPin, HANOI_PRESET, t);
  }
  if (progress < HANOI_INTERLUDE_NOT_YET.end) {
    return lerpPreset(HANOI_PRESET, VIETNAM_PRESET, smoothstep(localProgress(progress, HANOI_INTERLUDE_NOT_YET)));
  }
  // hanoi-interlude-now through us-overview: the redesigned cross-ocean transition — "flat map
  // curves into a globe, globe rotates eastward across the Pacific, North America comes around,
  // camera descends, globe flattens into the U.S. map." See crossOceanCamera.ts for the full
  // choreography; its own final frame is constructed to exactly match rivermont-approach's own
  // US_APPROACH_EARLY_SPLIT hand-off below, so there's no snap at that boundary either.
  if (progress < US_OVERVIEW.end) {
    return computeCrossOceanCameraState(progress);
  }
  if (progress < RIVERMONT_APPROACH.end) {
    const t = US_APPROACH_EARLY_SPLIT + smoothstep(localProgress(progress, RIVERMONT_APPROACH)) * (1 - US_APPROACH_EARLY_SPLIT);
    return lerpPreset(USA_PRESET, RIVERMONT_PRESET, t);
  }
  if (progress < RIVERMONT_STORY.end) return holdPreset(RIVERMONT_PRESET);
  // rivermont-departure: camera holds — the actual departure motion lives in florida-flight's own
  // window below, mirroring the old system's own precedent for this exact stage
  if (progress < RIVERMONT_DEPARTURE.end) return holdPreset(RIVERMONT_PRESET);
  if (progress < FLORIDA_FLIGHT.end) {
    return lerpPreset(RIVERMONT_PRESET, GAINESVILLE_PRESET, smoothstep(localProgress(progress, FLORIDA_FLIGHT)));
  }
  if (progress < GAINESVILLE_APPROACH.end) return holdPreset(GAINESVILLE_PRESET);
  // gainesville-story + us-memories: holds at Gainesville — nothing in this range ever begins
  // leaving it (the "more to come" overlay float above the same held frame)
  if (progress < US_MEMORIES.end) return holdPreset(GAINESVILLE_PRESET);

  // Phase 6 — U.S. chapter-complete: the camera eases back out to the regional U.S. overview so
  // both pins and the full route are visible again, mirroring hanoi-complete's own "settle, then
  // hold" shape.
  if (progress < US_COMPLETE.end) {
    const t = smoothstep(clamp01(localProgress(progress, US_COMPLETE) / US_COMPLETE_SETTLE_FRACTION));
    return lerpPreset(GAINESVILLE_PRESET, USA_PRESET, t);
  }
  // today-transition: one further, slower pull-back to the journey's calm final resting camera —
  // "pull out slightly," never a hard cut into the static Today section below.
  if (progress < TODAY_TRANSITION.end) {
    const t = smoothstep(clamp01(localProgress(progress, TODAY_TRANSITION) / TODAY_TRANSITION_SETTLE_FRACTION));
    return lerpPreset(USA_PRESET, TODAY_PRESET, t);
  }
  // today-ahead: holds at the pulled-back resting camera for the rest of the journey
  return holdPreset(TODAY_PRESET);
}

/** discrete, non-animated states — skips every flyover, jumps straight to the correct map state */
function computeReducedJourneyCameraState(progress: number): JourneyCameraState {
  if (progress < VIETNAM_APPROACH.start) return holdPreset(EARTH_PRESET);
  if (progress < HANOI_APPROACH.start) return holdPreset(VIETNAM_PRESET);
  if (progress < HANOI_OVERVIEW.start) return holdPreset(HANOI_PRESET);
  for (let i = 0; i < HANOI_PIN_STAGES.length; i++) {
    if (progress < HANOI_PIN_STAGES[i].end) return holdPreset(hanoiPinPreset(i));
  }
  // hanoi-complete + hanoi-interlude-not-yet: discrete hold at the Hanoi overview
  if (progress < HANOI_INTERLUDE_NOW.start) return holdPreset(HANOI_PRESET);
  // hanoi-interlude-now: discrete hold on the globe, centered on Hanoi/East Asia
  if (progress < HANOI_DEPARTURE.start) return CROSS_OCEAN_ENTRY_HOLD;
  // hanoi-departure/transpacific-flight: discrete hold at the Pacific rotation's own midpoint
  if (progress < US_OVERVIEW.start) return CROSS_OCEAN_MIDPOINT_HOLD;
  if (progress < RIVERMONT_APPROACH.start) return holdPreset(USA_PRESET);
  if (progress < FLORIDA_FLIGHT.start) return holdPreset(RIVERMONT_PRESET);
  // gainesville-approach through us-memories: discrete hold at Gainesville
  if (progress < US_COMPLETE.start) return holdPreset(GAINESVILLE_PRESET);
  // us-complete: discrete hold back at the U.S. overview
  if (progress < TODAY_TRANSITION.start) return holdPreset(USA_PRESET);
  // today-transition + today-ahead: discrete hold at the final resting camera
  return holdPreset(TODAY_PRESET);
}
