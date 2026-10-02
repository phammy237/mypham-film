import { hanoiJourneyPins } from "@/data/biography/hanoiJourney";
import { usJourneyPins } from "@/data/biography/usJourney";
import { chapters } from "@/data/biography/biography";

/**
 * Single source of truth for every named camera position the journey's persistent MapLibre
 * instance can be at — the "keep camera presets in a centralized config, not hard-coded all over
 * individual components" requirement. `journeyMapCamera.ts` interpolates BETWEEN these per scroll
 * stage; nothing else should hardcode a center/zoom pair.
 */
export type CameraPresetId =
  | "earth"
  | "vietnam"
  | "hanoi"
  | "hanoiPin"
  | "earthTransition"
  | "usa"
  | "rivermont"
  | "gainesville";

export type JourneyCameraPreset = {
  /** [longitude, latitude] — MapLibre's own coordinate order, not [lat, lon] */
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
};

const RIVERMONT_PIN = usJourneyPins[0];
const GAINESVILLE_PIN = usJourneyPins[1];

/** wide Asia view — the journey's starting and "zoomed back out" resting point. Editorial-atlas
 *  spec: Earth should occupy ~42-45% of viewport width, not fill the frame as a dominant hero
 *  visual — see JourneyMapPadding's own left-shift, which also nudges the visual fit toward the
 *  spec's ~62-64vw center to leave room for the chapter rail. */
export const EARTH_PRESET: JourneyCameraPreset = { center: [105, 18], zoom: 1.95 };

/** country-level Vietnam framing, on the way in from the globe */
export const VIETNAM_PRESET: JourneyCameraPreset = { center: [105.85, 17.5], zoom: 4.6 };

/** city-level Hanoi overview, framing all 5 story pins */
export const HANOI_PRESET: JourneyCameraPreset = { center: [105.803, 21.0], zoom: 11.3 };

/** wide Asia-Pacific view used as the "zoom back out toward the globe" pivot before crossing */
export const EARTH_TRANSITION_PRESET: JourneyCameraPreset = { center: [150, 25], zoom: 1.6 };

/** regional Southeast Asia framing — the interlude's mid-point between the Hanoi overview and the
 *  wide Pacific pivot (EARTH_TRANSITION_PRESET), giving "Hanoi overview → Vietnam → regional Asia"
 *  a real third beat instead of jumping straight from country-level to hemisphere-level. */
export const ASIA_REGIONAL_PRESET: JourneyCameraPreset = { center: [110, 15], zoom: 3.2 };

/** Hanoi and the first stored U.S. destination — same real coordinates transpacificCamera.ts's own
 *  FLIGHT_ORIGIN/FLIGHT_DESTINATION resolve to, recomputed here (not imported from that module) so
 *  this file never pulls in `three` — transpacificCamera.ts imports SatelliteGlobeCanvas for the
 *  old globe's own GLOBE_ZOOMED_DISTANCE, a dependency this MapLibre-only preset file has no
 *  business carrying. */
const PACIFIC_CROSSING_ORIGIN = chapters[0].globeTarget;
const PACIFIC_CROSSING_DESTINATION = usJourneyPins[0].coordinates;

/** Standard great-circle midpoint (degrees in, degrees out) — naturally resolves to the SHORTER arc
 *  between the two points, which for Hanoi/Virginia is the transpacific one (their true separation
 *  the other way, over the Atlantic, is wider), matching the dateline-safe route already drawn
 *  between them elsewhere in this codebase (see journeyGeoData.ts's transpacific route). */
function greatCircleMidpoint(a: { lat: number; lon: number }, b: { lat: number; lon: number }): [number, number] {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const lat1 = a.lat * toRad;
  const lon1 = a.lon * toRad;
  const lat2 = b.lat * toRad;
  const dLon = (b.lon - a.lon) * toRad;
  const bx = Math.cos(lat2) * Math.cos(dLon);
  const by = Math.cos(lat2) * Math.sin(dLon);
  const latMid = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2));
  const lonMid = lon1 + Math.atan2(by, Math.cos(lat1) + bx);
  return [lonMid * toDeg, latMid * toDeg];
}

/** Wide Pacific-crossing view centered on the real great-circle midpoint between Hanoi and the
 *  first U.S. destination — used as the interlude's "now" resting camera so BOTH Hanoi/East Asia
 *  and continental U.S. are visible at once (the cinematic-atlas spec's "must visually show the
 *  geographic transition," not just a regional Asia pull-back with the U.S. entirely off-screen). */
export const PACIFIC_CROSSING_PRESET: JourneyCameraPreset = {
  center: greatCircleMidpoint(PACIFIC_CROSSING_ORIGIN, PACIFIC_CROSSING_DESTINATION),
  // Hanoi and this U.S. destination sit ~87-90° from their own midpoint (their true separation is
  // just under half of Earth's circumference) — near the visible hemisphere's limb at ANY zoom on a
  // true globe projection, never comfortably "side by side" the way a flat mercator map would show
  // them. A low zoom (e.g. ~1.3, matching EARTH_TRANSITION_PRESET's own "distant globe" framing)
  // shrinks the sphere enough that both ends up reading as empty space around a small ball, not "two
  // visible landmasses" — so this stays close to EARTH_PRESET's own "dominant hero visual" zoom
  // (2.2) instead, keeping the globe large enough on screen that both sides remain legible near its
  // edges rather than lost in the surrounding void.
  zoom: 2.1,
};

/** the journey's calm resting camera for the Today ending — pulled back further than USA_PRESET so
 *  the final beat reads as "stepping back to take in the whole picture," not still zoomed into a
 *  single chapter. */
export const TODAY_PRESET: JourneyCameraPreset = { center: [-86.4, 35.6], zoom: 2.6 };

/** regional U.S. framing, centered between Rivermont and Gainesville */
export const USA_PRESET: JourneyCameraPreset = { center: [-86.4, 35.6], zoom: 3.6 };

export const RIVERMONT_PRESET: JourneyCameraPreset = {
  center: [RIVERMONT_PIN.coordinates.lon, RIVERMONT_PIN.coordinates.lat],
  zoom: 13.2,
};

export const GAINESVILLE_PRESET: JourneyCameraPreset = {
  center: [GAINESVILLE_PIN.coordinates.lon, GAINESVILLE_PIN.coordinates.lat],
  zoom: 12.6,
};

/** per-pin city-scale preset, generated (not hardcoded) from the pin's own stored coordinates */
export function hanoiPinPreset(index: number): JourneyCameraPreset {
  const pin = hanoiJourneyPins[index];
  return { center: [pin.coordinates.lon, pin.coordinates.lat], zoom: 14.2 };
}

export const CAMERA_PRESETS: Record<Exclude<CameraPresetId, "hanoiPin">, JourneyCameraPreset> = {
  earth: EARTH_PRESET,
  vietnam: VIETNAM_PRESET,
  hanoi: HANOI_PRESET,
  earthTransition: EARTH_TRANSITION_PRESET,
  usa: USA_PRESET,
  rivermont: RIVERMONT_PRESET,
  gainesville: GAINESVILLE_PRESET,
};

/** the live camera state the map is asked to jump to on every scroll tick */
export type JourneyCameraState = {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
};
