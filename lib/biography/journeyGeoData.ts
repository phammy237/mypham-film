import { geoInterpolate } from "d3-geo";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { hanoiJourneyPins } from "@/data/biography/hanoiJourney";
import { usJourneyPins } from "@/data/biography/usJourney";
import { chapters } from "@/data/biography/biography";
import { DOMESTIC_ROUTE_WAYPOINTS } from "@/lib/biography/usCamera";
import { FLIGHT_ORIGIN, FLIGHT_DESTINATION } from "@/lib/biography/transpacificCamera";
import { HANOI_PRESET } from "@/lib/biography/mapCameraPresets";

export type JourneyPinProperties = {
  id: string;
  number: number;
  numberLabel: string;
  title: string;
  subtitle: string;
  group: "hanoi" | "us";
};

/** module-load-computed from the already-real lat/lon in data/hanoiJourney.ts and data/usJourney.ts
 *  — no data-file changes needed, this just reshapes existing coordinates into GeoJSON features.
 *
 *  The top-level `id` is the per-collection ARRAY INDEX, not `pin.id` — MapLibre's GeoJSON
 *  feature-state only works with numeric ids (a non-numeric string id like "home-early-childhood"
 *  silently fails to register, so `setFeatureState`/`getFeatureState` never match anything and
 *  every pin permanently renders its default/fallback paint case). This was the actual root cause
 *  of the "pins never show their active/completed styling" bug (every pin looked like an empty
 *  outline pin, active or not). `properties.id` keeps the real string id for click/hover callbacks
 *  and everywhere else in the app that already expects that string. */
export const hanoiPinsGeoJSON: FeatureCollection<Point, JourneyPinProperties> = {
  type: "FeatureCollection",
  features: hanoiJourneyPins.map((pin, index) => ({
    type: "Feature",
    id: index,
    properties: {
      id: pin.id,
      number: pin.number,
      numberLabel: String(pin.number).padStart(2, "0"),
      title: pin.title,
      subtitle: pin.subtitle,
      group: "hanoi",
    },
    geometry: { type: "Point", coordinates: [pin.coordinates.lon, pin.coordinates.lat] },
  })),
};

export const usPinsGeoJSON: FeatureCollection<Point, JourneyPinProperties> = {
  type: "FeatureCollection",
  features: usJourneyPins.map((pin, index) => ({
    type: "Feature",
    id: index,
    properties: {
      id: pin.id,
      number: pin.number,
      numberLabel: String(pin.number).padStart(2, "0"),
      title: pin.title,
      subtitle: pin.subtitle,
      group: "us",
    },
    geometry: { type: "Point", coordinates: [pin.coordinates.lon, pin.coordinates.lat] },
  })),
};

/** single-point marker at the real Home pin's coordinate, used only for the Earth-hero-stage
 *  "glowing Hanoi" emphasis — not a new/fake location, just an earlier, simplified representation
 *  of the same real Hanoi data before the full pin set comes into view. */
export const hanoiAnchorGeoJSON: Feature<Point, { title: string }> = {
  type: "Feature",
  properties: { title: "Hanoi" },
  geometry: {
    type: "Point",
    coordinates: [hanoiJourneyPins[0].coordinates.lon, hanoiJourneyPins[0].coordinates.lat],
  },
};

/** understated "HANOI" chapter label shown near the center of the hanoi-overview framing —
 *  HANOI_PRESET.center is the same real coordinate the overview camera itself frames around, not a
 *  new/independent point. */
export const hanoiChapterLabelGeoJSON: Feature<Point, { title: string }> = {
  type: "Feature",
  properties: { title: "Hanoi" },
  geometry: { type: "Point", coordinates: HANOI_PRESET.center },
};

/** the cross-ocean transition's single "United States" arrival marker — a country-scale point
 *  (the same regional center USA_PRESET already frames around, via chapters[1].globeTarget), not a
 *  specific city; the real Rivermont pin takes over once the transition ends. */
export const usAnchorGeoJSON: Feature<Point, { title: string }> = {
  type: "Feature",
  properties: { title: "United States" },
  geometry: { type: "Point", coordinates: [chapters[1].globeTarget.lon, chapters[1].globeTarget.lat] },
};

/** the cross-ocean route's live travel point — its coordinates are overwritten every scroll tick
 *  (see JourneyMapCanvas's setTranspacificTravelPoint) from the exact same great-circle geometry as
 *  transpacificRouteGeoJSON below; this is just the initial seed position (Hanoi, progress 0). */
export const transpacificTravelPointGeoJSON: Feature<Point> = {
  type: "Feature",
  properties: {},
  geometry: { type: "Point", coordinates: [FLIGHT_ORIGIN.lon, FLIGHT_ORIGIN.lat] },
};

/** the 5 Hanoi pins in order — a narrative connection, not a real street route */
export const hanoiRouteGeoJSON: Feature<LineString> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: hanoiJourneyPins.map((pin) => [pin.coordinates.lon, pin.coordinates.lat]),
  },
};

/** Rivermont -> Gainesville — reuses the already-computed great-circle waypoints from usCamera.ts
 *  verbatim (no new geometry computed here) */
export const domesticRouteGeoJSON: Feature<LineString> = {
  type: "Feature",
  properties: {},
  geometry: { type: "LineString", coordinates: DOMESTIC_ROUTE_WAYPOINTS },
};

const TRANSPACIFIC_ROUTE_SEGMENTS = 64;

/** Vietnam -> Rivermont great-circle — reuses the same FLIGHT_ORIGIN/FLIGHT_DESTINATION endpoints
 *  transpacificCamera.ts's globe crossing already flies between, so the map's route matches the
 *  camera's own path instead of an independently-guessed line. */
export const transpacificRouteGeoJSON: Feature<LineString> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: (() => {
      const interpolate = geoInterpolate(
        [FLIGHT_ORIGIN.lon, FLIGHT_ORIGIN.lat],
        [FLIGHT_DESTINATION.lon, FLIGHT_DESTINATION.lat]
      );
      const points: [number, number][] = [];
      for (let i = 0; i <= TRANSPACIFIC_ROUTE_SEGMENTS; i++) points.push(interpolate(i / TRANSPACIFIC_ROUTE_SEGMENTS));
      return points;
    })(),
  },
};
