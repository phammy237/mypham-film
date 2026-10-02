import { getStageById } from "@/lib/biography/journeyStages";
import { lerp, smoothstep, localProgress } from "@/lib/biography/journeyMotion";

export type JourneyVignetteState = {
  leftOpacity: number;
  rightOpacity: number;
  topOpacity: number;
  bottomOpacity: number;
  /** the separate, stronger right-side fade behind an open story panel — independent of rightOpacity */
  panelFadeOpacity: number;
};

const ZERO: JourneyVignetteState = { leftOpacity: 0, rightOpacity: 0, topOpacity: 0, bottomOpacity: 0, panelFadeOpacity: 0 };

// "Reached" intensity once real Hanoi/U.S. geography is on screen with no panel open — moderate
// edges, crisp center, no panelFade.
const OVERVIEW_STATE: JourneyVignetteState = { leftOpacity: 0.5, rightOpacity: 0.28, topOpacity: 0.14, bottomOpacity: 0.4, panelFadeOpacity: 0 };
// A story panel is open — edges pull back to "subtle" (per spec, lighter than the overview state)
// while panelFade carries almost all of the visual weight on the story-panel side.
const STORY_STATE: JourneyVignetteState = { leftOpacity: 0.3, rightOpacity: 0.2, topOpacity: 0.1, bottomOpacity: 0.3, panelFadeOpacity: 1 };
// Phase 6 — the Today ending's calm resting state: faint, not "no dense map detail" competing with
// the section's own content, but not fully open either (this isn't the Earth hero).
const TODAY_STATE: JourneyVignetteState = { leftOpacity: 0.15, rightOpacity: 0.1, topOpacity: 0.05, bottomOpacity: 0.15, panelFadeOpacity: 0 };

function mix(a: JourneyVignetteState, b: JourneyVignetteState, t: number): JourneyVignetteState {
  const c = smoothstep(t);
  return {
    leftOpacity: lerp(a.leftOpacity, b.leftOpacity, c),
    rightOpacity: lerp(a.rightOpacity, b.rightOpacity, c),
    topOpacity: lerp(a.topOpacity, b.topOpacity, c),
    bottomOpacity: lerp(a.bottomOpacity, b.bottomOpacity, c),
    panelFadeOpacity: lerp(a.panelFadeOpacity, b.panelFadeOpacity, c),
  };
}
function scale(state: JourneyVignetteState, amount: number): JourneyVignetteState {
  return mix(ZERO, state, amount);
}

const VIETNAM_APPROACH = getStageById("vietnam-approach");
const HANOI_APPROACH = getStageById("hanoi-approach");
const HANOI_OVERVIEW = getStageById("hanoi-overview");
const HANOI_PIN_5 = getStageById("hanoi-pin-5");
const HANOI_COMPLETE = getStageById("hanoi-complete");
const HANOI_INTERLUDE_NOT_YET = getStageById("hanoi-interlude-not-yet");
const HANOI_INTERLUDE_NOW = getStageById("hanoi-interlude-now");
const TRANSPACIFIC_FLIGHT = getStageById("transpacific-flight");
const RIVERMONT_APPROACH = getStageById("rivermont-approach");
const RIVERMONT_STORY = getStageById("rivermont-story");
const RIVERMONT_DEPARTURE = getStageById("rivermont-departure");
const GAINESVILLE_APPROACH = getStageById("gainesville-approach");
const GAINESVILLE_STORY = getStageById("gainesville-story");
const US_MEMORIES = getStageById("us-memories");
const US_COMPLETE = getStageById("us-complete");
const TODAY_TRANSITION = getStageById("today-transition");

/** a short crossfade window right at a stage boundary, not an instant snap */
const BOUNDARY_FADE = 0.02;

/**
 * Single source of truth for the cinematic edge fade's intensity — stage-specific by design, so
 * "Earth = none, map stories = yes" (and everything in between ramps, never snaps). Pure function
 * of progress; JourneyEdgeFade never computes its own opacities.
 */
export function computeJourneyVignetteState(progress: number): JourneyVignetteState {
  // earth-intro: the scene stays fully open — no map vignette at all
  if (progress < VIETNAM_APPROACH.start) return ZERO;

  // vietnam-approach: 0 -> ~0.10 of the overview intensity
  if (progress < HANOI_APPROACH.start) {
    return scale(OVERVIEW_STATE, lerp(0, 0.1, smoothstep(localProgress(progress, VIETNAM_APPROACH))));
  }
  // hanoi-approach: ~0.10 -> ~0.35
  if (progress < HANOI_OVERVIEW.start) {
    return scale(OVERVIEW_STATE, lerp(0.1, 0.35, smoothstep(localProgress(progress, HANOI_APPROACH))));
  }
  // hanoi-overview: ~0.35 -> full "reached" intensity by the end of the stage
  if (progress < HANOI_OVERVIEW.end) {
    return scale(OVERVIEW_STATE, lerp(0.35, 1, smoothstep(localProgress(progress, HANOI_OVERVIEW))));
  }
  // hanoi-pin-1..5: story state, crossfading in right at entry
  if (progress < HANOI_PIN_5.end) {
    return mix(OVERVIEW_STATE, STORY_STATE, localProgress(progress, { start: HANOI_OVERVIEW.end, end: HANOI_OVERVIEW.end + BOUNDARY_FADE }));
  }
  // hanoi-complete: no active story card — back to the Hanoi overview's own moderate vignette
  // ("use the existing Hanoi map vignette," per spec) rather than inventing a new state.
  if (progress < HANOI_COMPLETE.end) {
    return mix(STORY_STATE, OVERVIEW_STATE, localProgress(progress, { start: HANOI_PIN_5.end, end: HANOI_PIN_5.end + BOUNDARY_FADE }));
  }
  // hanoi-interlude-not-yet + hanoi-interlude-now: "fade map vignette toward zero," gradually,
  // finishing by the end of the second beat — "restore globe atmosphere late in the sequence."
  if (progress < HANOI_INTERLUDE_NOT_YET.end) {
    return scale(OVERVIEW_STATE, 1 - smoothstep(localProgress(progress, HANOI_INTERLUDE_NOT_YET)) * 0.5);
  }
  if (progress < HANOI_INTERLUDE_NOW.end) {
    return scale(OVERVIEW_STATE, lerp(0.5, 0, smoothstep(localProgress(progress, HANOI_INTERLUDE_NOW))));
  }
  // hanoi-departure + transpacific-flight: already at 0 from the interlude — the Pacific/globe
  // crossing itself stays fully open, matching the Earth hero's own "no vignette" treatment.
  if (progress < TRANSPACIFIC_FLIGHT.end) {
    return ZERO;
  }
  // us-overview + rivermont-approach: ramp back up to "moderate"
  if (progress < RIVERMONT_APPROACH.end) {
    const t = localProgress(progress, { start: TRANSPACIFIC_FLIGHT.end, end: RIVERMONT_APPROACH.end });
    return mix(ZERO, OVERVIEW_STATE, t);
  }
  // rivermont-story: story state
  if (progress < RIVERMONT_STORY.end) {
    return mix(OVERVIEW_STATE, STORY_STATE, localProgress(progress, { start: RIVERMONT_APPROACH.end, end: RIVERMONT_APPROACH.end + BOUNDARY_FADE }));
  }
  // rivermont-departure + florida-flight + gainesville-approach: back to moderate (domestic hop,
  // not the ocean crossing — spec only asks the Pacific leg to return to 0)
  if (progress < GAINESVILLE_APPROACH.end) {
    const t = localProgress(progress, { start: RIVERMONT_DEPARTURE.start, end: GAINESVILLE_APPROACH.end });
    return mix(STORY_STATE, OVERVIEW_STATE, t);
  }
  // gainesville-story: story state
  if (progress < GAINESVILLE_STORY.end) {
    return mix(OVERVIEW_STATE, STORY_STATE, localProgress(progress, { start: GAINESVILLE_APPROACH.end, end: GAINESVILLE_APPROACH.end + BOUNDARY_FADE }));
  }
  // us-memories + us-complete: no active story card — back to the moderate overview state,
  // mirroring hanoi-complete's own "use the existing vignette" treatment.
  if (progress < US_MEMORIES.end) {
    return mix(STORY_STATE, OVERVIEW_STATE, localProgress(progress, { start: GAINESVILLE_STORY.end, end: GAINESVILLE_STORY.end + BOUNDARY_FADE }));
  }
  if (progress < US_COMPLETE.end) return OVERVIEW_STATE;
  // today-transition: fades toward the Today ending's own faint resting state
  if (progress < TODAY_TRANSITION.end) {
    return mix(OVERVIEW_STATE, TODAY_STATE, smoothstep(localProgress(progress, TODAY_TRANSITION)));
  }
  // today-ahead: holds at the calm, faint resting state for the rest of the journey
  return TODAY_STATE;
}
