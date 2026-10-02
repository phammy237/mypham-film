import { getStageById } from "@/lib/biography/journeyStages";
import { clamp01, lerp, rampDownTo, rampUpFrom, smoothstep, stageWeight } from "@/lib/biography/journeyMotion";
import { US_INTRO_TEXT_ENTER_WIDTH } from "@/lib/biography/crossOceanCamera";

export type JourneyMapPadding = { top: number; bottom: number; left: number; right: number };

const ZERO_PADDING: JourneyMapPadding = { top: 0, bottom: 0, left: 0, right: 0 };

const HANOI_APPROACH = getStageById("hanoi-approach");
const HANOI_OVERVIEW = getStageById("hanoi-overview");
const HANOI_PIN_5 = getStageById("hanoi-pin-5");
const HANOI_DEPARTURE = getStageById("hanoi-departure");
const US_OVERVIEW = getStageById("us-overview");
const RIVERMONT_APPROACH = getStageById("rivermont-approach");

/** matches JourneyHeroContent's own fade window (see GeographicJourney's HERO_FADE_COMPLETE_AT) */
const EARTH_ZONE_END = HANOI_APPROACH.start; // 0.1
/** matches JourneyHanoiIntroPanel's own EDGE_FADE */
const INTRO_EDGE_FADE = 0.02;
/** how much of hanoi-pin-1's own window the story-panel padding takes to ramp in */
const STORY_PADDING_RAMP = 0.02;

// Earth hero: reserving LEFT space (not right) shifts the globe's own fit-center rightward — the
// "globe center ~63-66vw" composition. Proportional to viewport width (not a fixed px constant) so
// the same ~64vw target holds across common desktop widths, not just whatever one screen it was
// tuned on.
const EARTH_PADDING_LEFT_FRACTION = 0.3;
const EARTH_PADDING_RIGHT = 30; // clears the right-side chapter rail (now narrow, right-30px)
const HANOI_INTRO_PADDING_LEFT = 380; // clears the left-column Hanoi intro panel (max-w-sm)
const US_INTRO_PADDING_LEFT = 380; // clears JourneyUsIntroPanel — same left-column shell as Hanoi's
// Match the floating preview's responsive width and rail gutter in globals.css.
const STORY_PANEL_MIN_WIDTH = 320;
const STORY_PANEL_PREFERRED_WIDTH = 500;
const STORY_PANEL_MAX_WIDTH_VW = 0.3;
const STORY_PADDING_LEFT = 70;
const STORY_PADDING_TOP = 90;
const STORY_PADDING_BOTTOM = 70;

/** Mirrors .journey-preview-panel's clamp(320px, 30vw, 500px). */
function computeStoryPanelWidth(viewportWidth: number): number {
  return Math.max(STORY_PANEL_MIN_WIDTH, Math.min(STORY_PANEL_PREFERRED_WIDTH, viewportWidth * STORY_PANEL_MAX_WIDTH_VW));
}

function storyPanelClearance(viewportWidth: number): number {
  // Matches .journey-preview-panel width and right inset, plus breathing room.
  return computeStoryPanelWidth(viewportWidth) + Math.min(128, Math.max(80, viewportWidth * 0.076)) + 24;
}

/**
 * Single source of truth for every screen-space reservation the persistent map's camera needs —
 * "centralize padding states rather than sprinkling magic offsets through components." Pure
 * function of (progress, isMobile, viewportWidth); callers never compute padding themselves. Each
 * zone ramps in/out using the same fade window as the DOM panel it's clearing room for, so the
 * camera shift and the panel's own fade always resolve together.
 */
export function computeJourneyMapPadding(progress: number, isMobile: boolean, viewportWidth: number): JourneyMapPadding {
  // Mobile has no persistent side column reserving space this way — panels are bottom sheets there
  // instead (see JourneyHeroContent/JourneyHanoiIntroPanel/JourneyPinStoryPanel's own md: breakpoints).
  if (isMobile) return ZERO_PADDING;

  if (progress < EARTH_ZONE_END) {
    const t = smoothstep(progress / EARTH_ZONE_END);
    return {
      ...ZERO_PADDING,
      left: lerp(viewportWidth * EARTH_PADDING_LEFT_FRACTION, 0, t),
      right: lerp(EARTH_PADDING_RIGHT, 0, t),
    };
  }

  if (progress < HANOI_OVERVIEW.start) {
    return ZERO_PADDING; // hanoi-approach: camera panning in, no panel visible yet
  }

  if (progress < HANOI_OVERVIEW.end) {
    const weight = stageWeight(progress, HANOI_OVERVIEW.start, HANOI_OVERVIEW.end, INTRO_EDGE_FADE);
    return { ...ZERO_PADDING, left: HANOI_INTRO_PADDING_LEFT * weight };
  }

  if (progress < HANOI_PIN_5.end) {
    const t = smoothstep(clamp01((progress - HANOI_OVERVIEW.end) / STORY_PADDING_RAMP));
    const storyPaddingRight = storyPanelClearance(viewportWidth);
    return {
      left: STORY_PADDING_LEFT * t,
      top: STORY_PADDING_TOP * t,
      bottom: STORY_PADDING_BOTTOM * t,
      right: storyPaddingRight * t,
    };
  }

  // hanoi-complete: no story panel remains open — ramp the reserved space back out so the
  // chapter-complete overlay (no card, full-width) gets the whole frame back.
  if (progress < HANOI_DEPARTURE.start) {
    const t = smoothstep(clamp01((progress - HANOI_PIN_5.end) / STORY_PADDING_RAMP));
    const storyPaddingRight = storyPanelClearance(viewportWidth);
    const remaining = 1 - t;
    return {
      left: STORY_PADDING_LEFT * remaining,
      top: STORY_PADDING_TOP * remaining,
      bottom: STORY_PADDING_BOTTOM * remaining,
      right: storyPaddingRight * remaining,
    };
  }

  if (progress < US_OVERVIEW.start) {
    return ZERO_PADDING; // hanoi-departure through transpacific-flight: no panel visible yet
  }

  // us-overview: clears JourneyUsIntroPanel — reservation now ramps in only over the transition's
  // own tail (see JourneyUsIntroPanel's identically-timed text fade), once the globe has actually
  // flattened into the U.S. map; through the rest of us-overview (still the cross-ocean globe
  // rotating/zooming in) the camera stays centered with no reservation, matching the "globe centered
  // ~50-55vw, no big shift" cross-ocean composition.
  if (progress < RIVERMONT_APPROACH.start) {
    const weight = Math.min(
      rampUpFrom(progress, US_OVERVIEW.end, US_INTRO_TEXT_ENTER_WIDTH),
      rampDownTo(progress, US_OVERVIEW.end + INTRO_EDGE_FADE, INTRO_EDGE_FADE)
    );
    return { ...ZERO_PADDING, left: US_INTRO_PADDING_LEFT * weight };
  }

  return ZERO_PADDING;
}
