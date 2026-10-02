"use client";
import { useEffect, useRef } from "react";
import { Map as MapLibreMap, AttributionControl, setWorkerUrl, type MapGeoJSONFeature, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getJourneyMapStyle } from "@/lib/biography/mapStyle";
import { EARTH_PRESET, type JourneyCameraState } from "@/lib/biography/mapCameraPresets";
import { computeJourneyMapPadding } from "@/lib/biography/journeyMapPadding";
import { FLIGHT_ORIGIN } from "@/lib/biography/transpacificCamera";
import { getBiographyJourneyTheme, type BiographyJourneyThemeMode } from "@/lib/biography/biographyJourneyTheme";
import type { EarthRasterCrossfadeState } from "@/lib/biography/earthRasterCrossfade";
import { lerp } from "@/lib/biography/journeyMotion";
import {
  hanoiPinsGeoJSON,
  usPinsGeoJSON,
  hanoiRouteGeoJSON,
  domesticRouteGeoJSON,
  transpacificRouteGeoJSON,
  hanoiAnchorGeoJSON,
  hanoiChapterLabelGeoJSON,
  usAnchorGeoJSON,
  transpacificTravelPointGeoJSON,
} from "@/lib/biography/journeyGeoData";

// MapLibre derives its worker script URL from `import.meta.url` at runtime (see
// maplibre-gl-dev.mjs's `defaultWorkerUrl()`), expecting a sibling `maplibre-gl-worker.mjs` next
// to wherever its own module ends up being served. Under Next.js's webpack bundling that module
// lives inside an app chunk with no such sibling, so the derived URL isn't a usable script — the
// worker silently never runs any real code (no parse error surfaces on `map.on("error")`), and the
// map is left permanently retrying tile loads with zero actual network requests ever going out.
// This was the actual cause of "the globe/map doesn't render" — not a style, color, or camera bug.
// Fix: point MapLibre at real, statically-served copies of the worker + its shared chunk (vendored
// into public/ from node_modules/maplibre-gl/dist — re-copy both if maplibre-gl is ever upgraded).
if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

export type JourneyPinStatus = "unvisited" | "active" | "completed";

export type JourneyMapHandle = {
  /** per-frame, no animation — the scroll-scrubbed analog of map.jumpTo(). `progress` (not derived
   *  from `state` itself) drives the centralized screen-space padding — see journeyMapPadding.ts. */
  setCamera: (state: JourneyCameraState, progress: number) => void;
  setPinStatus: (pinId: string, status: JourneyPinStatus) => void;
  setHanoiRouteProgress: (fraction: number) => void;
  setDomesticRouteProgress: (fraction: number) => void;
  /** 1 = normal, 0 = chapter-complete's dimmed "the point is the text, not the map" treatment —
   *  crossfades over ROUTE_OPACITY_TRANSITION via each layer's own built-in paint transition. */
  setRouteEmphasis: (routeId: "hanoi" | "domestic", emphasis: number) => void;
  /** overall visibility (0-1) for the cross-ocean route + its travel point — see
   *  crossOceanCamera.ts's computeCrossOceanRouteVisibility, the single source of truth for when
   *  this route is on screen at all. */
  setTranspacificRouteOpacity: (opacity: number) => void;
  /** the cross-ocean route's own progressive "comet trail" reveal (0 = not yet traveled, 1 =
   *  arrived) — see crossOceanCamera.ts's computeCrossOceanRouteProgress, the same value driving
   *  the travel point below, so the line and the point can never drift apart. */
  setTranspacificRouteProgress: (fraction: number) => void;
  /** the cross-ocean route's single moving marker — `coordinate` follows the same great-circle
   *  geometry as the route itself (crossOceanCamera.ts's computeTravelPointCoordinate); `opacity`
   *  mirrors the route's own overall visibility. */
  setTranspacificTravelPoint: (coordinate: [number, number], opacity: number) => void;
  /** 0 = normal (numbered Hanoi/U.S. pins + generic basemap labels all show as usual), 1 = the
   *  cross-ocean transition's "clean globe" — every numbered pin and generic place/water label
   *  hidden, leaving only the dedicated departure/arrival anchor markers below. See
   *  crossOceanCamera.ts's computeCrossOceanCleanWeight. */
  setCrossOceanImmersion: (weight: number) => void;
  /** the cross-ocean transition's own single "United States" arrival marker — mirrors
   *  setHanoiAnchorGlowOpacity's existing "Hanoi" marker exactly, just the departure/arrival pair. */
  setUsAnchorGlowOpacity: (opacity: number) => void;
  /** the Earth-hero-stage "glowing Hanoi" marker — fades out well before the real Hanoi pins take
   *  over, see GeographicJourney's hero-weight fade. */
  setHanoiAnchorGlowOpacity: (opacity: number) => void;
  /** the understated "Hanoi" chapter label shown during hanoi-overview, fading out once pin
   *  stories start so it never competes with the location labels. */
  setHanoiChapterLabelOpacity: (opacity: number) => void;
  /** the Earth-hero satellite raster <-> editorial vector atlas crossfade — see
   *  lib/biography/earthRasterCrossfade.ts, the single source of truth for these three numbers.
   *  Also toggles the two raster layers' own visibility off once fully faded, so they stop costing
   *  any GPU work for the rest of the journey (re-enabled automatically on scrolling back). */
  setEarthRasterCrossfade: (state: EarthRasterCrossfadeState) => void;
  /** The actual on-screen center + apparent radius of the rendered globe right now, from the same
   *  camera state driving the map itself (map.project + the standard Mercator-style
   *  radius≈worldSize/2π formula) — the single source of truth JourneyEarthGlow's decorative
   *  atmosphere layers anchor to, so they visually track the globe instead of sitting at a
   *  hardcoded CSS position that only matched its very first frame. Null once the globe projection
   *  itself is no longer active (e.g. after the Hanoi mercator handoff) or before the map is ready. */
  getEarthGlowGeometry: () => { xPx: number; yPx: number; diameterPx: number } | null;
  /** Explicit projection ownership — "globe" for the Earth-hero/approach beats AND (see
   *  crossOceanCamera.ts's computeCrossOceanProjectionMode) the cross-ocean transition's own globe
   *  rotation window; "mercator" everywhere else (Hanoi, the interlude's reflective beats, the
   *  whole U.S. chapter, Today). Root-cause fix for the globe's curved silhouette leaking into
   *  flat-map stages: the style used to set `projection: {type:"globe"}` once, statically, for the
   *  map's entire lifetime, relying on MapLibre's own automatic globe->mercator crossover — which
   *  only triggers above ~zoom 5. Several flat-map stages (US overview zoom 3.6) sit well below
   *  that, so the sphere kept rendering when it shouldn't have; conversely the cross-ocean window
   *  now deliberately FORCES globe at similarly low zoom, on purpose. Idempotent — safe to call
   *  every tick, only actually touches the map when the mode changes. */
  setProjectionMode: (mode: "globe" | "mercator") => void;
};

export type JourneyMapCanvasProps = {
  theme: "light" | "dark";
  reducedMotion: boolean;
  handleRef: React.MutableRefObject<JourneyMapHandle | null>;
  onPinClick: (pinId: string) => void;
  /** fired on pointer enter/leave of any pin — null on leave. Drives the compact hover preview;
   *  has no effect on journey/camera state (see JourneyPinPreview). */
  onPinHover: (pinId: string | null) => void;
  /** fired once handleRef.current is assigned and safe to call. GeographicJourney's own scroll
   *  effect and this component's dynamic import (next/dynamic) both load asynchronously and race —
   *  without this, a page load with zero scroll (progress stuck at 0) can call setCamera/setPinStatus/
   *  etc. before the handle exists, silently no-op the very first paint, and never get a second
   *  chance until the user's first scroll tick "self-heals" it. */
  onReady?: () => void;
  ariaLabel?: string;
};

const MOBILE_WIDTH_THRESHOLD = 768;
const PIN_LAYER_GROUPS = [
  { source: "hanoi-pins", prefix: "hanoi-pin", data: hanoiPinsGeoJSON },
  { source: "us-pins", prefix: "us-pin", data: usPinsGeoJSON },
] as const;

// setPinStatus (and the persisted-state replay after a theme swap) is called with the pin's real
// string id (e.g. "home-early-childhood") — this resolves that to the {source, numeric feature id}
// pair the GeoJSON sources actually use for feature-state (see journeyGeoData.ts's own note on why
// the feature id has to be numeric). Built once at module load, not per call/tick.
const PIN_FEATURE_REF_BY_ID = new Map<string, { source: string; id: number }>();
for (const group of PIN_LAYER_GROUPS) {
  for (const feature of group.data.features) {
    PIN_FEATURE_REF_BY_ID.set(feature.properties.id, { source: group.source, id: feature.id as number });
  }
}

// Editorial-cartography pin system — real map-pin/teardrop silhouettes (rounded circular top,
// small clean point at the bottom), not circles. Two icon images (active/inactive), each built
// once via <canvas> and registered with map.addImage — MapLibre symbol layers can't draw a
// teardrop natively, and this is far cheaper than a per-feature fill-layer polygon. "Completed"
// reuses the inactive icon at reduced opacity — same shape, never a different (hollow) look.
const STATUS = ["feature-state", "status"];
// completed reads as quietly "done" via opacity alone — never a different (hollow) shape
const PIN_OPACITY = ["case", ["==", STATUS, "completed"], 0.56, 1];
const PIN_NUMBER_SIZE = 10;

/** wraps any paint-opacity expression with the cross-ocean "clean globe" suppression multiplier —
 *  see crossOceanCamera.ts's computeCrossOceanCleanWeight. suppression=0 (the common case) is a
 *  literal no-op multiply, never a behavior change outside that one transition. */
function withPinSuppression(expression: unknown, suppression: number): unknown {
  if (suppression <= 0) return expression;
  return ["*", expression, 1 - suppression];
}

type PinIconSpec = {
  id: string;
  /** total silhouette width/height in CSS px — the circular top's diameter is `pinWidth`. */
  pinWidth: number;
  pinHeight: number;
  fill: string;
  stroke: string;
  halo?: { diameter: number; color: string; blurPx: number };
};

/** theme-aware pin icon specs — colors come from biographyJourneyTheme.pin, never a fixed dark-only
 *  palette (a pale inactive fill with a near-white stroke, tuned for a dark map, would be almost
 *  invisible on the light theme's pale map). Re-evaluated every time icons are (re-)registered. */
function pinIconSpecs(theme: BiographyJourneyThemeMode): PinIconSpec[] {
  const c = getBiographyJourneyTheme(theme).pin;
  return [
    {
      id: "journey-pin-active",
      pinWidth: 22,
      pinHeight: 28,
      fill: c.activeFill,
      stroke: c.activeStroke,
      halo: { diameter: 34, color: c.activeHalo, blurPx: 7 },
    },
    {
      id: "journey-pin-inactive",
      pinWidth: 18,
      pinHeight: 23,
      fill: c.inactiveFill,
      stroke: c.inactiveStroke,
    },
  ];
}

/** How far above its own anchor point (the tail tip, since icon-anchor is "bottom") the pin's
 *  circular top sits, in ems of PIN_NUMBER_SIZE — used as the number layer's own text-offset so it
 *  centers inside the circular part regardless of which icon (active/inactive) is showing. Kept as
 *  a plain map (not baked into the icon) since the number text is a separate symbol layer. */
const PIN_NUMBER_OFFSET_EM: Record<string, number> = {};

/**
 * Draws one teardrop pin silhouette onto a canvas: a circular top tapering to a small point at the
 * bottom (the classic map-pin shape), optionally with a soft blurred halo behind the circular part
 * only — never the tail, per spec. Returns the canvas sized so `icon-anchor:"bottom"` places the
 * tail's tip exactly on the feature's geographic point, matching how real map pins point at a
 * location instead of centering a circle over it.
 */
function drawPinIcon(spec: PinIconSpec): ImageData {
  const r = spec.pinWidth / 2;
  const haloOuterRadius = spec.halo ? spec.halo.diameter / 2 + spec.halo.blurPx * 1.5 : 0;
  const canvasWidth = Math.ceil(Math.max(spec.pinWidth, haloOuterRadius * 2));
  const canvasHeight = Math.ceil(Math.max(spec.pinHeight, spec.pinHeight - r + haloOuterRadius));

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new ImageData(canvasWidth, canvasHeight);

  const centerX = canvasWidth / 2;
  const pinTopY = canvasHeight - spec.pinHeight;
  const circleCenterY = pinTopY + r;
  const tailTipY = canvasHeight;

  if (spec.halo) {
    ctx.save();
    ctx.filter = `blur(${spec.halo.blurPx}px)`;
    ctx.beginPath();
    ctx.arc(centerX, circleCenterY, spec.halo.diameter / 2, 0, Math.PI * 2);
    ctx.fillStyle = spec.halo.color;
    ctx.fill();
    ctx.restore();
  }

  // Standard teardrop parametrization: the body tapers from two "shoulder" points (just below the
  // circle's own center) down to a single point at the tail tip, with the rounded top drawn as the
  // long way around the circle between those two shoulders (through the top), leaving the short
  // way (through the bottom) open as the gap the tail point fills.
  const shoulderDX = r * 0.55;
  const shoulderDY = r * 0.5;
  const leftShoulder = { x: centerX - shoulderDX, y: circleCenterY + shoulderDY };
  const leftAngle = Math.atan2(shoulderDY, -shoulderDX);
  const rightAngle = Math.atan2(shoulderDY, shoulderDX);

  ctx.beginPath();
  ctx.moveTo(centerX, tailTipY);
  ctx.lineTo(leftShoulder.x, leftShoulder.y);
  ctx.arc(centerX, circleCenterY, r, leftAngle, rightAngle + Math.PI * 2, false);
  ctx.lineTo(centerX, tailTipY);
  ctx.closePath();
  ctx.fillStyle = spec.fill;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = spec.stroke;
  ctx.stroke();

  PIN_NUMBER_OFFSET_EM[spec.id] = -(spec.pinHeight - r) / PIN_NUMBER_SIZE;
  return ctx.getImageData(0, 0, canvasWidth, canvasHeight);
}

/** Registers both pin icon images with the map, redrawn for the given theme — must be called again
 *  after every setStyle() theme swap, since custom images don't survive a style reload the way
 *  GeoJSON sources/layers persist. `removeImage` first because a style swap can (depending on
 *  MapLibre's own internal timing) leave the previous theme's cached image registered under the
 *  same id, which `addImage` refuses to silently overwrite. */
function registerPinIcons(map: MapLibreMap, theme: BiographyJourneyThemeMode) {
  for (const spec of pinIconSpecs(theme)) {
    if (map.hasImage(spec.id)) map.removeImage(spec.id);
    map.addImage(spec.id, drawPinIcon(spec));
  }
}

/** title: active 1, completed .45, future 0 (hover reveals it — see PIN_TITLE_OPACITY_MOBILE) */
function titleOpacityExpression(isMobile: boolean, suppression = 0) {
  if (isMobile) return withPinSuppression(["case", ["==", STATUS, "active"], 1, 0], suppression);
  return withPinSuppression(
    [
      "case",
      ["==", STATUS, "active"],
      1,
      ["==", STATUS, "completed"],
      0.45,
      ["boolean", ["feature-state", "hover"], false],
      0.85,
      0,
    ],
    suppression
  );
}

/** subtitle: active only — "Completed: title only" / "Future: hidden unless hover" */
function subtitleOpacityExpression(isMobile: boolean, suppression = 0) {
  if (isMobile) return 0;
  return withPinSuppression(["case", ["==", STATUS, "active"], 1, ["boolean", ["feature-state", "hover"], false], 0.85, 0], suppression);
}

// Three states, both for the core line AND (separately) the glow underneath it — "selective glow":
// only the CURRENT segment clearly reads purple/luminous; completed and future stay quiet. Exact
// colors/opacities come from biographyJourneyTheme.route (theme-aware — the light theme's route
// needs a more saturated core and lower glow opacity than dark to stay readable on a pale map,
// never a reused dark-tuned value that reads as washed-out).
const CURRENT_BAND_WIDTH = 0.015;

// Chapter-complete dim: "route should remain visible but faded" — half the normal core/glow
// emphasis, applied as a line-opacity multiplier on top of the gradient's own baked-in alpha.
const ROUTE_EMPHASIS_DIMMED_CORE_OPACITY = 0.5;
const ROUTE_EMPHASIS_DIMMED_GLOW_OPACITY = 0.3;
const ROUTE_OPACITY_TRANSITION = { duration: 350, delay: 0 };

/** Shared 3-state (completed/current/future) progress gradient — used for both the core line and
 *  the glow line underneath it, each with its own color triple, so the glow is exactly as
 *  segment-aware as the core ("completed route: glow opacity .05... future: no visible glow").
 *  `bandWidth` is how far back from the current point the "current" color still reads — a razor-
 *  thin band for the short pin-to-pin routes below, a wider "comet trail" for the cross-ocean route
 *  (see transpacificRouteGradient). */
function progressGradient(fraction: number, completed: string, current: string, future: string, bandWidth: number) {
  const f = Math.max(0.0001, Math.min(0.9999, fraction));
  // strictly greater than the leading "0" breakpoint below — at very small f (e.g. fraction=0,
  // the route's own initial/reset state), f - bandWidth goes negative and clamping it to exactly 0
  // collided with that first breakpoint, which MapLibre's interpolate expression rejects ("input
  // values in strictly ascending order"). Pre-existing bug, caught while verifying the Earth raster
  // crossfade's own map errors were clean — unrelated to this route's own visuals.
  const bandStart = Math.max(0.00005, f - bandWidth);
  return [
    "interpolate",
    ["linear"],
    ["line-progress"],
    0,
    completed,
    bandStart,
    completed,
    f,
    current,
    // strictly less than the trailing "1" breakpoint below — the mirror-image of bandStart's own
    // fix above: at f close to 1 (route fully/near-complete), f + 0.001 clamped to exactly 1
    // collided with that last breakpoint the same way. Only actually reachable once a route
    // finishes paging through every pin (fraction -> 1), which no earlier test happened to drive.
    Math.min(0.99995, f + 0.001),
    future,
    1,
    future,
  ];
}

function routeGradient(fraction: number, theme: BiographyJourneyThemeMode) {
  const c = getBiographyJourneyTheme(theme).route.core;
  return progressGradient(fraction, c.completed, c.current, c.future, CURRENT_BAND_WIDTH);
}
function routeGlowGradient(fraction: number, theme: BiographyJourneyThemeMode) {
  const c = getBiographyJourneyTheme(theme).route.glow;
  return progressGradient(fraction, c.completed, c.current, c.future, CURRENT_BAND_WIDTH);
}

// Cross-ocean "comet trail" route — a SHORT travel trace, never the whole Hanoi->U.S. line at full
// brightness. Hanoi and the first U.S. stop are close to antipodal, so even a "traveled so far, held
// at a constant dim opacity forever" treatment (the local pin-to-pin routes' own shape) reproduces
// the forbidden giant-arc look once enough of that near-hemispheric line has been traveled — a
// dim-but-nonzero line is still clearly visible once it spans a big enough fraction of the globe.
// Instead, both the "older" and "future" ends fade to FULLY transparent, and only a short window
// immediately behind the current point ever renders at all — its own length (not just its opacity)
// is what keeps this "a subtle path being drawn," never a dominant static arc, regardless of how far
// along the crossing is.
const TRANSPACIFIC_TRAIL_WINDOW = 0.14;

function transpacificRouteGradient(fraction: number, theme: BiographyJourneyThemeMode) {
  const c = getBiographyJourneyTheme(theme).transpacific.core;
  return progressGradient(fraction, c.transparent, c.current, c.transparent, TRANSPACIFIC_TRAIL_WINDOW);
}
function transpacificRouteGlowGradient(fraction: number, theme: BiographyJourneyThemeMode) {
  const c = getBiographyJourneyTheme(theme).transpacific.glow;
  return progressGradient(fraction, c.transparent, c.current, c.transparent, TRANSPACIFIC_TRAIL_WINDOW);
}

function applyHanoiAnchorOpacity(map: MapLibreMap, opacity: number) {
  if (!map.getLayer("hanoi-anchor-glow")) return;
  map.setPaintProperty("hanoi-anchor-glow", "circle-opacity", opacity * 0.3);
  map.setPaintProperty("hanoi-anchor-ring", "circle-stroke-opacity", opacity * 0.9);
  map.setPaintProperty("hanoi-anchor-dot", "circle-opacity", opacity);
  map.setPaintProperty("hanoi-anchor-label", "text-opacity", opacity);
}

/** the cross-ocean transition's arrival marker — identical shape/treatment to the Hanoi anchor
 *  above, just the "United States" departure-side counterpart. */
function applyUsAnchorOpacity(map: MapLibreMap, opacity: number) {
  if (!map.getLayer("us-anchor-glow")) return;
  map.setPaintProperty("us-anchor-glow", "circle-opacity", opacity * 0.3);
  map.setPaintProperty("us-anchor-ring", "circle-stroke-opacity", opacity * 0.9);
  map.setPaintProperty("us-anchor-dot", "circle-opacity", opacity);
  map.setPaintProperty("us-anchor-label", "text-opacity", opacity);
}

function applyHanoiChapterLabelOpacity(map: MapLibreMap, opacity: number) {
  if (!map.getLayer("hanoi-chapter-label")) return;
  map.setPaintProperty("hanoi-chapter-label", "text-opacity", opacity * 0.75); // spec ceiling: opacity .75
}

/** overall visibility for the cross-ocean route + travel point — the per-segment comet-trail shape
 *  itself lives in the line-gradient (see transpacificRouteGradient/setTranspacificRouteProgress);
 *  this is purely "is this route on screen at all right now." */
function applyTranspacificOpacity(map: MapLibreMap, opacity: number) {
  if (map.getLayer("transpacific-route")) map.setPaintProperty("transpacific-route", "line-opacity", opacity);
  if (map.getLayer("transpacific-route-glow")) map.setPaintProperty("transpacific-route-glow", "line-opacity", opacity);
  if (map.getLayer("transpacific-travel-dot")) map.setPaintProperty("transpacific-travel-dot", "circle-opacity", opacity);
  if (map.getLayer("transpacific-travel-glow")) map.setPaintProperty("transpacific-travel-glow", "circle-opacity", opacity);
}

/** re-applies every pin layer's opacity expression at the current suppression level — called both
 *  from the cross-ocean immersion setter (suppression itself changing) and the mobile-breakpoint
 *  resize handler (isMobile changing), so the two never fight over which one "wins." */
function applyPinSuppressionOpacities(map: MapLibreMap, isMobile: boolean, suppression: number) {
  for (const group of PIN_LAYER_GROUPS) {
    if (!map.getLayer(`${group.prefix}-label-title`)) continue;
    map.setPaintProperty(`${group.prefix}-label-title`, "text-opacity", titleOpacityExpression(isMobile, suppression) as never);
    map.setPaintProperty(`${group.prefix}-label-subtitle`, "text-opacity", subtitleOpacityExpression(isMobile, suppression) as never);
    map.setPaintProperty(`${group.prefix}-icon-active`, "icon-opacity", withPinSuppression(["case", ["==", STATUS, "active"], 1, 0], suppression) as never);
    map.setPaintProperty(
      `${group.prefix}-icon-inactive`,
      "icon-opacity",
      withPinSuppression(["case", ["!=", STATUS, "active"], PIN_OPACITY, 0], suppression) as never
    );
    map.setPaintProperty(`${group.prefix}-number-active`, "text-opacity", withPinSuppression(["case", ["==", STATUS, "active"], 1, 0], suppression) as never);
    map.setPaintProperty(
      `${group.prefix}-number-inactive`,
      "text-opacity",
      withPinSuppression(["case", ["!=", STATUS, "active"], PIN_OPACITY, 0], suppression) as never
    );
  }
}

/** the same suppression weight also hides generic basemap text (country/city + water names) AND the
 *  major-road network during the cross-ocean transition — "almost all normal labels should
 *  disappear... the globe should feel clean," and a dense visible highway mesh reads just as
 *  cluttered as text labels would at this zoom. Combined multiplicatively with the Earth-hero raster
 *  crossfade's own vectorOpacity (see applyEarthRasterCrossfade) so the two independent fades never
 *  clobber each other. */
function applyBaseLabelSuppression(map: MapLibreMap, vectorOpacity: number, suppression: number) {
  if (map.getLayer("place-label-major")) map.setPaintProperty("place-label-major", "text-opacity", vectorOpacity * (1 - suppression));
  if (map.getLayer("water-label")) map.setPaintProperty("water-label", "text-opacity", 1 - suppression);
  if (map.getLayer("road-major")) map.setPaintProperty("road-major", "line-opacity", vectorOpacity * (1 - suppression));
}

/**
 * Adds every biography-specific source/layer (routes + pins) on top of the current base style, and
 * wires pin click/hover handlers. Called once on initial load AND again after every `setStyle()`
 * theme swap — a full style swap wipes anything not part of the style JSON itself, so this must be
 * fully idempotent/re-runnable, not a one-time setup.
 */
function setupJourneyLayers(
  map: MapLibreMap,
  theme: "light" | "dark",
  isMobile: boolean,
  onPinClickRef: React.MutableRefObject<(pinId: string) => void>,
  onPinHoverRef: React.MutableRefObject<(pinId: string | null) => void>,
  hoveredPinRef: React.MutableRefObject<{ source: string; id: number } | null>,
  pinSuppression: number
) {
  registerPinIcons(map, theme);
  const anchorColors = getBiographyJourneyTheme(theme).anchor;
  const travelPointColors = getBiographyJourneyTheme(theme).travelPoint;
  const pinTextColors = getBiographyJourneyTheme(theme).pin;
  map.addSource("hanoi-route", { type: "geojson", data: hanoiRouteGeoJSON, lineMetrics: true });
  map.addSource("domestic-route", { type: "geojson", data: domesticRouteGeoJSON, lineMetrics: true });
  map.addSource("transpacific-route", { type: "geojson", data: transpacificRouteGeoJSON, lineMetrics: true });

  for (const [id, source] of [
    ["hanoi-route", "hanoi-route"],
    ["domestic-route", "domestic-route"],
  ] as const) {
    // Editorial-cartography 2-layer route system — ONE subtle glow underneath + a thin core line,
    // BOTH gradient-driven per-segment (completed/current/future) so only the CURRENT segment ever
    // clearly glows/reads purple — "selective glow," not a uniformly-lit road. Each layer's own
    // line-opacity is also given a short built-in transition so setRouteEmphasis's chapter-complete
    // dim ("route remains visible but faded") crossfades instead of snapping.
    map.addLayer({
      id: `${id}-glow`,
      type: "line",
      source,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-width": 6,
        "line-blur": 4,
        "line-gradient": routeGlowGradient(0, theme) as never,
        "line-opacity": 1,
        "line-opacity-transition": ROUTE_OPACITY_TRANSITION,
      },
    });
    map.addLayer({
      id,
      type: "line",
      source,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-width": 1.6,
        "line-gradient": routeGradient(0, theme) as never,
        "line-opacity": 1,
        "line-opacity-transition": ROUTE_OPACITY_TRANSITION,
      },
    });
  }
  // trans-Pacific: a SHORT, progressively-drawn "comet trail" (see transpacificRouteGradient) —
  // never the whole Hanoi->U.S. line at full brightness, never a giant static arc. Two layers
  // (core + glow), same shape as the local routes, but its own dimmer opacity ratios and wider
  // "current" band so it reads as "a subtle path being drawn around Earth," not an airline map.
  map.addLayer({
    id: "transpacific-route-glow",
    type: "line",
    source: "transpacific-route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-width": 4,
      "line-blur": 3,
      "line-gradient": transpacificRouteGlowGradient(0, theme) as never,
      "line-opacity": 0,
    },
  });
  map.addLayer({
    id: "transpacific-route",
    type: "line",
    source: "transpacific-route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-width": 1.4, "line-gradient": transpacificRouteGradient(0, theme) as never, "line-opacity": 0 },
  });

  // the route's single moving travel point — a soft blurred halo underneath a small solid dot, no
  // plane icon, no pulse/ring. Coordinates + opacity are both overwritten every scroll tick (see
  // setTranspacificTravelPoint); this is just the initial seed state.
  map.addSource("transpacific-travel-point", { type: "geojson", data: transpacificTravelPointGeoJSON });
  map.addLayer({
    id: "transpacific-travel-glow",
    type: "circle",
    source: "transpacific-travel-point",
    paint: { "circle-radius": 8, "circle-color": travelPointColors.glow, "circle-blur": 1, "circle-opacity": 0 },
  });
  map.addLayer({
    id: "transpacific-travel-dot",
    type: "circle",
    source: "transpacific-travel-point",
    paint: { "circle-radius": 3, "circle-color": travelPointColors.dot, "circle-opacity": 0 },
  });

  // Earth-hero-stage "glowing Hanoi" marker — visible only while zoomed out near the globe, before
  // the real Hanoi pins (below) take over. Starts fully transparent; GeographicJourney drives its
  // opacity every scroll tick via setHanoiAnchorGlowOpacity, same pattern as the routes above.
  // Raster-Earth polish: 6-8px white center, 16-18px purple ring, 28-34px halo — "only one strong
  // geographic marker on Earth hero," now sized to read clearly against the satellite surface.
  map.addSource("hanoi-anchor", { type: "geojson", data: hanoiAnchorGeoJSON });
  map.addLayer({
    id: "hanoi-anchor-glow",
    type: "circle",
    source: "hanoi-anchor",
    paint: { "circle-radius": 15, "circle-color": anchorColors.glow, "circle-blur": 1.2, "circle-opacity": 0 },
  });
  map.addLayer({
    id: "hanoi-anchor-ring",
    type: "circle",
    source: "hanoi-anchor",
    paint: {
      "circle-radius": 8,
      "circle-color": "transparent",
      "circle-stroke-color": anchorColors.ring,
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0,
    },
  });
  map.addLayer({
    id: "hanoi-anchor-dot",
    type: "circle",
    source: "hanoi-anchor",
    paint: { "circle-radius": 4, "circle-color": anchorColors.dot, "circle-opacity": 0 },
  });
  map.addLayer({
    id: "hanoi-anchor-label",
    type: "symbol",
    source: "hanoi-anchor",
    layout: {
      "text-field": ["get", "title"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 13.5,
      "text-anchor": "left",
      "text-offset": [1.1, 0],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      // "important labels such as Hanoi": rgba(235,232,244,.52) baked into the color itself, so it
      // reads correctly even before the per-tick text-opacity multiplier (applyHanoiAnchorOpacity)
      // reaches 1.
      "text-color": theme === "dark" ? "rgba(235,232,244,0.52)" : "#121A33",
      "text-halo-color": theme === "dark" ? "#0C1228" : "#F7F3FA",
      "text-halo-width": 1.4,
      "text-opacity": 0,
    },
  });

  // the cross-ocean transition's own single "United States" arrival marker — identical shape and
  // treatment to the Hanoi anchor above, just the departure/arrival pair (see
  // setUsAnchorGlowOpacity). Same reasoning: one clean geographic pin + label, never the numbered
  // Rivermont/Gainesville pins (hidden during this transition — see setCrossOceanImmersion).
  map.addSource("us-anchor", { type: "geojson", data: usAnchorGeoJSON });
  map.addLayer({
    id: "us-anchor-glow",
    type: "circle",
    source: "us-anchor",
    paint: { "circle-radius": 15, "circle-color": anchorColors.glow, "circle-blur": 1.2, "circle-opacity": 0 },
  });
  map.addLayer({
    id: "us-anchor-ring",
    type: "circle",
    source: "us-anchor",
    paint: {
      "circle-radius": 8,
      "circle-color": "transparent",
      "circle-stroke-color": anchorColors.ring,
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0,
    },
  });
  map.addLayer({
    id: "us-anchor-dot",
    type: "circle",
    source: "us-anchor",
    paint: { "circle-radius": 4, "circle-color": anchorColors.dot, "circle-opacity": 0 },
  });
  map.addLayer({
    id: "us-anchor-label",
    type: "symbol",
    source: "us-anchor",
    layout: {
      "text-field": ["get", "title"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 13.5,
      "text-anchor": "left",
      "text-offset": [1.1, 0],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": theme === "dark" ? "rgba(235,232,244,0.52)" : "#121A33",
      "text-halo-color": theme === "dark" ? "#0C1228" : "#F7F3FA",
      "text-halo-width": 1.4,
      "text-opacity": 0,
    },
  });

  // Understated "Hanoi" chapter label — visible only through the hanoi-overview stage, fading out
  // once pin stories start (see setHanoiChapterLabelOpacity). Separate from hanoi-anchor-label
  // above, which belongs to the earlier Earth-hero stage and is long gone by this point.
  map.addSource("hanoi-chapter-label", { type: "geojson", data: hanoiChapterLabelGeoJSON });
  map.addLayer({
    id: "hanoi-chapter-label",
    type: "symbol",
    source: "hanoi-chapter-label",
    layout: {
      "text-field": ["get", "title"],
      // Not a real serif — OpenFreeMap's glyph PBFs only offer a Noto Sans stack, and MapLibre
      // symbol text can't consume the page's own @font-face (DM Serif); sized up to read as a
      // heading regardless. Flagged as a known constraint, not an oversight.
      "text-font": ["Noto Sans Regular"],
      "text-size": 32,
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      // major heading, crisp near-white — not gray (global typography rule)
      "text-color": theme === "dark" ? "rgba(244,241,248,0.88)" : "rgba(18,26,51,0.75)",
      "text-halo-color": theme === "dark" ? "#0C1228" : "#F7F3FA",
      "text-halo-width": 1.6,
      "text-opacity": 0,
    },
  });

  for (const group of PIN_LAYER_GROUPS) {
    map.addSource(group.source, { type: "geojson", data: group.data });

    // Title and subtitle are separate layers (not one "format" text-field) because they need
    // independent opacity rules — completed shows title only, active shows both.
    map.addLayer({
      id: `${group.prefix}-label-title`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["get", "title"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 15,
        "text-anchor": "left",
        "text-offset": [0.9, -0.15],
        "text-justify": "left",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": pinTextColors.titleText,
        "text-halo-color": pinTextColors.labelHalo,
        "text-halo-width": 1.4,
        "text-opacity": titleOpacityExpression(isMobile, pinSuppression) as never,
      },
    });
    map.addLayer({
      id: `${group.prefix}-label-subtitle`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["get", "subtitle"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
        "text-anchor": "left",
        "text-offset": [0.9, 0.9],
        "text-justify": "left",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": pinTextColors.subtitleText,
        "text-halo-color": pinTextColors.labelHalo,
        "text-halo-width": 1.4,
        "text-opacity": subtitleOpacityExpression(isMobile, pinSuppression) as never,
      },
    });

    // The teardrop silhouette — icon-anchor "bottom" so the tail's actual point (not a circle's
    // center) sits on the feature's geographic coordinate, like a real map pin. Halo is baked into
    // the "active" icon image itself (see drawPinIcon), so it only ever appears behind the
    // circular top, never the tail. icon-image can't be a feature-state expression either (same
    // layout-vs-paint restriction as text-offset below) — split by status, same pattern.
    map.addLayer({
      id: `${group.prefix}-icon-active`,
      type: "symbol",
      source: group.source,
      layout: { "icon-image": "journey-pin-active", "icon-anchor": "bottom", "icon-allow-overlap": true, "icon-ignore-placement": true },
      paint: { "icon-opacity": withPinSuppression(["case", ["==", STATUS, "active"], 1, 0], pinSuppression) as never },
    });
    map.addLayer({
      id: `${group.prefix}-icon-inactive`,
      type: "symbol",
      source: group.source,
      layout: { "icon-image": "journey-pin-inactive", "icon-anchor": "bottom", "icon-allow-overlap": true, "icon-ignore-placement": true },
      paint: { "icon-opacity": withPinSuppression(["case", ["!=", STATUS, "active"], PIN_OPACITY, 0], pinSuppression) as never },
    });

    // Number text-offset can't be a feature-state expression (text-offset is a layout, not paint,
    // property — feature-state expressions are paint-only) — split into one layer per status
    // instead, each with its own fixed offset centering it inside that status's own icon, matching
    // title/subtitle's existing split-by-status pattern for the same underlying reason.
    map.addLayer({
      id: `${group.prefix}-number-active`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["get", "numberLabel"],
        "text-font": ["Noto Sans Regular"],
        "text-size": PIN_NUMBER_SIZE,
        "text-offset": [0, PIN_NUMBER_OFFSET_EM["journey-pin-active"] ?? -1.7],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": pinTextColors.activeNumberText,
        "text-opacity": withPinSuppression(["case", ["==", STATUS, "active"], 1, 0], pinSuppression) as never,
      },
    });
    map.addLayer({
      id: `${group.prefix}-number-inactive`,
      type: "symbol",
      source: group.source,
      layout: {
        "text-field": ["get", "numberLabel"],
        "text-font": ["Noto Sans Regular"],
        "text-size": PIN_NUMBER_SIZE,
        "text-offset": [0, PIN_NUMBER_OFFSET_EM["journey-pin-inactive"] ?? -1.4],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": pinTextColors.inactiveNumberText,
        "text-opacity": withPinSuppression(["case", ["!=", STATUS, "active"], PIN_OPACITY, 0], pinSuppression) as never,
      },
    });

    // Only one of the two icon layers is ever actually visible for a given feature at a time
    // (opacity is mutually exclusive by status), but both need the same click/hover wiring since
    // either one might be the hit-tested layer.
    const iconLayerIds = [`${group.prefix}-icon-active`, `${group.prefix}-icon-inactive`];
    map.on("click", iconLayerIds, (e) => {
      const feature = e.features?.[0] as MapGeoJSONFeature | undefined;
      const id = feature?.properties?.id as string | undefined;
      if (id) onPinClickRef.current(id);
    });
    map.on("mouseenter", iconLayerIds, (e) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = e.features?.[0] as MapGeoJSONFeature | undefined;
      const id = feature?.properties?.id as string | undefined;
      // feature-state needs the feature's own (numeric) id, not properties.id — see
      // journeyGeoData.ts's note on why a non-numeric string id silently fails to register
      const featureId = feature?.id as number | undefined;
      if (!id || featureId === undefined) return;
      if (hoveredPinRef.current) map.setFeatureState(hoveredPinRef.current, { hover: false });
      hoveredPinRef.current = { source: group.source, id: featureId };
      map.setFeatureState({ source: group.source, id: featureId }, { hover: true });
      onPinHoverRef.current(id);
    });
    map.on("mouseleave", iconLayerIds, () => {
      map.getCanvas().style.cursor = "";
      if (hoveredPinRef.current) {
        map.setFeatureState(hoveredPinRef.current, { hover: false });
        hoveredPinRef.current = null;
      }
      onPinHoverRef.current(null);
    });
  }

}

/**
 * The one persistent MapLibre instance for the whole biography journey — mounted once, for the
 * page's lifetime, full-bleed (no fixed pixel size, unlike the old globe/SVG maps it replaces).
 * GeographicJourney owns all camera/pin/route choreography and drives it imperatively via
 * handleRef.current's methods every scroll tick, the same division of responsibility the old
 * Three.js globe and SVG maps used, just collapsed into a single renderer instead of three.
 *
 * Deliberately non-interactive for camera control (no drag/scroll-zoom) — the camera is purely
 * scroll-driven, matching the "one continuous, non-slide-changing zoom" goal. Pins remain
 * clickable (see onPinClick). The old globe's own "drag to explore" affordance during the idle
 * earth-intro beat is not reproduced here; worth revisiting as a follow-up.
 */
export function JourneyMapCanvas({
  theme,
  reducedMotion,
  handleRef,
  onPinClick,
  onPinHover,
  onReady,
  ariaLabel = "Interactive map of the journey",
}: JourneyMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const constructedThemeRef = useRef(theme);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onPinClickRef = useRef(onPinClick);
  onPinClickRef.current = onPinClick;
  const onPinHoverRef = useRef(onPinHover);
  onPinHoverRef.current = onPinHover;
  const hoveredPinRef = useRef<{ source: string; id: number } | null>(null);
  const isMobileRef = useRef(typeof window !== "undefined" && window.innerWidth < MOBILE_WIDTH_THRESHOLD);
  // last-known values, re-applied after every setupJourneyLayers call (including post-theme-swap
  // re-adds, which otherwise silently reset every pin/route to its default unstyled state)
  const pinStatusesRef = useRef(new Map<string, JourneyPinStatus>());
  const hanoiRouteProgressRef = useRef(0);
  const domesticRouteProgressRef = useRef(0);
  // matches the style's own initial `projection: {type:"globe"}` — see setProjectionMode
  const projectionModeRef = useRef<"globe" | "mercator">("globe");
  const transpacificOpacityRef = useRef(0);
  const transpacificRouteProgressRef = useRef(0);
  const travelPointCoordinateRef = useRef<[number, number]>([FLIGHT_ORIGIN.lon, FLIGHT_ORIGIN.lat]);
  const hanoiAnchorOpacityRef = useRef(0);
  const usAnchorOpacityRef = useRef(0);
  const hanoiChapterLabelOpacityRef = useRef(0);
  // vectorOpacity (Earth-hero raster crossfade) and the cross-ocean "clean globe" suppression both
  // multiply the SAME basemap label layers — tracked separately so whichever setter fires last
  // combines both instead of one clobbering the other (see applyBaseLabelSuppression).
  const vectorOpacityRef = useRef(1);
  const crossOceanSuppressionRef = useRef(0);
  // starts true (matching the raster layers' own initial "visible" layout default in mapStyle.ts)
  // so the very first setEarthRasterCrossfade call, if it happens to already be fully faded (e.g. a
  // mid-journey page refresh), correctly flips visibility off instead of a no-op "already false".
  const rasterVisibleRef = useRef(true);
  // set true if the earth-day/earth-night image source ever fails to load — see the map's "error"
  // listener. Checked by setEarthRasterCrossfade to force a full-vector fallback rather than risk a
  // blank/near-empty Earth hero.
  const rasterFailedRef = useRef(false);
  // last raw (pre-fallback) crossfade state — re-applied by applyPersistedState after a theme swap
  // rebuilds the whole style (image sources included), same "persist across setStyle" pattern the
  // existing pin/route/anchor refs already use.
  const lastEarthRasterStateRef = useRef<EarthRasterCrossfadeState>({ dayOpacity: 0, nightOpacity: 0, vectorOpacity: 1 });
  // last state actually written to the map (post-fallback-resolution) — lets applyEarthRasterCrossfade
  // skip its ~8 getLayer/setPaintProperty calls once the crossfade has settled (e.g. every tick for
  // the whole Hanoi/US/Today portion of the journey, where it's always {0,0,1}), rather than paying
  // MapLibre's style-reevaluation cost on every single scroll tick regardless of whether anything
  // actually changed since the last one.
  const lastAppliedRasterRef = useRef<EarthRasterCrossfadeState | null>(null);

  // Shared by the handle's setEarthRasterCrossfade (live scroll ticks) and applyPersistedState
  // (re-applying the last known state after a theme swap rebuilds the whole style) — see those two
  // call sites below.
  const applyEarthRasterCrossfade = (map: MapLibreMap, rawState: EarthRasterCrossfadeState) => {
    lastEarthRasterStateRef.current = rawState;
    // fallback: imagery failed to load earlier — never show a blank/near-empty Earth, force the
    // original vector globe back to full strength instead of whatever the caller asked for
    const state = rasterFailedRef.current ? { dayOpacity: 0, nightOpacity: 0, vectorOpacity: 1 } : rawState;
    const last = lastAppliedRasterRef.current;
    if (last && last.dayOpacity === state.dayOpacity && last.nightOpacity === state.nightOpacity && last.vectorOpacity === state.vectorOpacity) {
      return; // identical to what's already on the map — most ticks once the crossfade has settled
    }
    lastAppliedRasterRef.current = state;
    if (map.getLayer("earth-raster-day")) map.setPaintProperty("earth-raster-day", "raster-opacity", state.dayOpacity);
    if (map.getLayer("earth-raster-night")) map.setPaintProperty("earth-raster-night", "raster-opacity", state.nightOpacity);
    // fully hides (stops rendering) the raster layers once faded out, and only then — toggling
    // visibility every tick would be wasteful, so this only fires on an actual on/off edge
    const shouldBeVisible = state.dayOpacity > 0.001 || state.nightOpacity > 0.001;
    if (shouldBeVisible !== rasterVisibleRef.current) {
      rasterVisibleRef.current = shouldBeVisible;
      const visibility = shouldBeVisible ? "visible" : "none";
      if (map.getLayer("earth-raster-day")) map.setLayoutProperty("earth-raster-day", "visibility", visibility);
      if (map.getLayer("earth-raster-night")) map.setLayoutProperty("earth-raster-night", "visibility", visibility);
    }
    const v = state.vectorOpacity;
    vectorOpacityRef.current = v;
    if (map.getLayer("water")) map.setPaintProperty("water", "fill-opacity", v);
    if (map.getLayer("waterway")) map.setPaintProperty("waterway", "line-opacity", v);
    if (map.getLayer("landuse-park")) map.setPaintProperty("landuse-park", "fill-opacity", v);
    // road-major/place-label-major/water-label all combine this raster crossfade's own vectorOpacity
    // with the cross-ocean "clean globe" suppression in one place — see applyBaseLabelSuppression.
    applyBaseLabelSuppression(map, v, crossOceanSuppressionRef.current);
    // boundary-country/state already carry their own zoom-based ramp (see mapStyle.ts's "tiny
    // outlined circles in the ocean" fix) — rebuilding the same zoom breakpoints scaled by v
    // preserves that fix while layering the raster crossfade on top, rather than one overwriting
    // the other.
    if (map.getLayer("boundary-country")) {
      map.setPaintProperty("boundary-country", "line-opacity", ["interpolate", ["linear"], ["zoom"], 2, 0, 3.5, v] as never);
    }
    if (map.getLayer("boundary-state")) {
      map.setPaintProperty("boundary-state", "line-opacity", ["interpolate", ["linear"], ["zoom"], 3, 0, 4.5, v] as never);
    }
  };

  const applyPersistedState = (map: MapLibreMap) => {
    // A full style reload (theme swap) resets projection to the style JSON's own static default
    // ("globe") regardless of where the journey actually is — re-apply unconditionally (not
    // through the handle's own guarded setProjectionMode, whose ref already thinks it's correct).
    map.setProjection({ type: projectionModeRef.current });
    for (const [pinId, status] of Array.from(pinStatusesRef.current.entries())) {
      const ref = PIN_FEATURE_REF_BY_ID.get(pinId);
      if (ref) map.setFeatureState(ref, { status });
    }
    const currentTheme = constructedThemeRef.current;
    map.setPaintProperty("hanoi-route", "line-gradient", routeGradient(hanoiRouteProgressRef.current, currentTheme) as never);
    map.setPaintProperty("hanoi-route-glow", "line-gradient", routeGlowGradient(hanoiRouteProgressRef.current, currentTheme) as never);
    map.setPaintProperty("domestic-route", "line-gradient", routeGradient(domesticRouteProgressRef.current, currentTheme) as never);
    map.setPaintProperty(
      "domestic-route-glow",
      "line-gradient",
      routeGlowGradient(domesticRouteProgressRef.current, currentTheme) as never
    );
    map.setPaintProperty("transpacific-route", "line-gradient", transpacificRouteGradient(transpacificRouteProgressRef.current, currentTheme) as never);
    map.setPaintProperty("transpacific-route-glow", "line-gradient", transpacificRouteGlowGradient(transpacificRouteProgressRef.current, currentTheme) as never);
    applyTranspacificOpacity(map, transpacificOpacityRef.current);
    if (map.getSource("transpacific-travel-point")) {
      (map.getSource("transpacific-travel-point") as GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: travelPointCoordinateRef.current },
      });
    }
    applyHanoiAnchorOpacity(map, hanoiAnchorOpacityRef.current);
    applyUsAnchorOpacity(map, usAnchorOpacityRef.current);
    applyHanoiChapterLabelOpacity(map, hanoiChapterLabelOpacityRef.current);
    applyPinSuppressionOpacities(map, isMobileRef.current, crossOceanSuppressionRef.current);
    applyEarthRasterCrossfade(map, lastEarthRasterStateRef.current);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: getJourneyMapStyle(theme),
      center: EARTH_PRESET.center,
      zoom: EARTH_PRESET.zoom,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      interactive: false,
      dragRotate: false,
      touchZoomRotate: false,
      fadeDuration: reducedMotion ? 0 : 300,
    });
    constructedThemeRef.current = theme;
    // OpenFreeMap's own TileJSON already declares its attribution string — MapLibre pulls it in
    // automatically, so no customAttribution here (adding one duplicated the same text twice).
    map.addControl(new AttributionControl({ compact: true }), "bottom-left");
    map.on("error", (e) => {
      // eslint-disable-next-line no-console
      console.error("Journey map error:", e.error);
      // Graceful fallback: if the satellite imagery itself fails to load (network hiccup, asset
      // moved, etc.), never leave the Earth hero blank — force the vector atlas back to full
      // opacity so the journey's original vector globe still renders normally. setEarthRasterCrossfade
      // checks this flag on every subsequent call, so nothing else needs to know this happened.
      const sourceId = (e as unknown as { sourceId?: string }).sourceId;
      if (sourceId === "earth-day" || sourceId === "earth-night") {
        rasterFailedRef.current = true;
      }
    });
    mapRef.current = map;

    // "style.load" (style/sources resolved) — NOT "load" (requires the currently-visible tiles to
    // have actually finished fetching/rendering first). Gating setup on "load" left every pin,
    // route, and label permanently unadded whenever tile rendering was slow or incomplete, which
    // could make the whole map appear broken even though the base style/canvas were fine. Adding
    // sources/layers only needs the style to be ready, not a fully-painted frame.
    // `.once`, not `.on` — the theme-swap effect below registers its own `.once("style.load", ...)`
    // for every later swap; a persistent listener here would double-run setup on every swap too.
    map.once("style.load", () => {
      setupJourneyLayers(map, constructedThemeRef.current, isMobileRef.current, onPinClickRef, onPinHoverRef, hoveredPinRef, crossOceanSuppressionRef.current);
      applyPersistedState(map);
    });

    handleRef.current = {
      setCamera: (state, progress) => {
        mapRef.current?.jumpTo({
          center: state.center,
          zoom: state.zoom,
          pitch: state.pitch ?? 0,
          bearing: state.bearing ?? 0,
          padding: computeJourneyMapPadding(progress, isMobileRef.current, window.innerWidth),
        });
      },
      setPinStatus: (pinId, status) => {
        pinStatusesRef.current.set(pinId, status);
        const m = mapRef.current;
        if (!m) return;
        const ref = PIN_FEATURE_REF_BY_ID.get(pinId);
        if (ref && m.getSource(ref.source)) m.setFeatureState(ref, { status });
      },
      setHanoiRouteProgress: (fraction) => {
        hanoiRouteProgressRef.current = fraction;
        const m = mapRef.current;
        if (!m || !m.getLayer("hanoi-route")) return;
        m.setPaintProperty("hanoi-route", "line-gradient", routeGradient(fraction, constructedThemeRef.current) as never);
        m.setPaintProperty("hanoi-route-glow", "line-gradient", routeGlowGradient(fraction, constructedThemeRef.current) as never);
      },
      setDomesticRouteProgress: (fraction) => {
        domesticRouteProgressRef.current = fraction;
        const m = mapRef.current;
        if (!m || !m.getLayer("domestic-route")) return;
        m.setPaintProperty("domestic-route", "line-gradient", routeGradient(fraction, constructedThemeRef.current) as never);
        m.setPaintProperty("domestic-route-glow", "line-gradient", routeGlowGradient(fraction, constructedThemeRef.current) as never);
      },
      setRouteEmphasis: (routeId, emphasis) => {
        const layerId = routeId === "hanoi" ? "hanoi-route" : "domestic-route";
        const m = mapRef.current;
        if (!m || !m.getLayer(layerId)) return;
        const e = Math.max(0, Math.min(1, emphasis));
        m.setPaintProperty(layerId, "line-opacity", lerp(ROUTE_EMPHASIS_DIMMED_CORE_OPACITY, 1, e));
        m.setPaintProperty(`${layerId}-glow`, "line-opacity", lerp(ROUTE_EMPHASIS_DIMMED_GLOW_OPACITY, 1, e));
      },
      setTranspacificRouteOpacity: (opacity) => {
        transpacificOpacityRef.current = opacity;
        const m = mapRef.current;
        if (!m || !m.getLayer("transpacific-route")) return;
        applyTranspacificOpacity(m, opacity);
      },
      setTranspacificRouteProgress: (fraction) => {
        transpacificRouteProgressRef.current = fraction;
        const m = mapRef.current;
        if (!m || !m.getLayer("transpacific-route")) return;
        m.setPaintProperty("transpacific-route", "line-gradient", transpacificRouteGradient(fraction, constructedThemeRef.current) as never);
        m.setPaintProperty("transpacific-route-glow", "line-gradient", transpacificRouteGlowGradient(fraction, constructedThemeRef.current) as never);
      },
      setTranspacificTravelPoint: (coordinate, opacity) => {
        travelPointCoordinateRef.current = coordinate;
        const m = mapRef.current;
        if (!m) return;
        const source = m.getSource("transpacific-travel-point") as GeoJSONSource | undefined;
        if (source) source.setData({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: coordinate } });
        if (m.getLayer("transpacific-travel-dot")) {
          m.setPaintProperty("transpacific-travel-dot", "circle-opacity", opacity);
          m.setPaintProperty("transpacific-travel-glow", "circle-opacity", opacity);
        }
      },
      setCrossOceanImmersion: (weight) => {
        crossOceanSuppressionRef.current = weight;
        const m = mapRef.current;
        if (!m) return;
        applyPinSuppressionOpacities(m, isMobileRef.current, weight);
        applyBaseLabelSuppression(m, vectorOpacityRef.current, weight);
      },
      setHanoiAnchorGlowOpacity: (opacity) => {
        hanoiAnchorOpacityRef.current = opacity;
        const m = mapRef.current;
        if (!m) return;
        applyHanoiAnchorOpacity(m, opacity);
      },
      setUsAnchorGlowOpacity: (opacity) => {
        usAnchorOpacityRef.current = opacity;
        const m = mapRef.current;
        if (!m) return;
        applyUsAnchorOpacity(m, opacity);
      },
      setHanoiChapterLabelOpacity: (opacity) => {
        hanoiChapterLabelOpacityRef.current = opacity;
        const m = mapRef.current;
        if (!m) return;
        applyHanoiChapterLabelOpacity(m, opacity);
      },
      setEarthRasterCrossfade: (rawState) => {
        const m = mapRef.current;
        if (!m) return;
        applyEarthRasterCrossfade(m, rawState);
      },
      getEarthGlowGeometry: () => {
        const m = mapRef.current;
        // Null once mercator has taken over — the atmosphere glow describes a sphere that, by this
        // point, is no longer what's actually rendered.
        if (!m || projectionModeRef.current !== "globe") return null;
        const centerPx = m.project(m.getCenter());
        // standard Mercator-tile-derived radius: the world's full circumference, in screen pixels
        // at the current zoom, is 512 * 2^zoom; a sphere's radius is that circumference / 2π. Same
        // formula MapLibre's own globe examples use to size a screen-space circle around the globe.
        const worldSizePx = 512 * Math.pow(2, m.getZoom());
        const radiusPx = worldSizePx / (2 * Math.PI);
        return { xPx: centerPx.x, yPx: centerPx.y, diameterPx: radiusPx * 2 };
      },
      setProjectionMode: (mode) => {
        const m = mapRef.current;
        if (!m || projectionModeRef.current === mode) return;
        // `setProjection` throws ("Style is not done loading") if called before the style has
        // finished its initial load — a real crash caught earlier via a hard refresh, where the
        // very first applyProgress replay can land before that. Deliberately does NOT update
        // projectionModeRef here, so the next scroll tick's call retries — self-healing, same
        // pattern this file already uses for the raster crossfade's own first-tick race.
        if (!m.isStyleLoaded()) return;
        projectionModeRef.current = mode;
        m.setProjection({ type: mode });
      },
    };
    onReadyRef.current?.();
    // The earth-day/earth-night `image` sources aren't queryable via getLayer() the instant
    // "style.load" fires — MapLibre only finishes registering an image-sourced layer once the
    // image itself has actually loaded, which for a multi-MB satellite photo can take noticeably
    // longer than the rest of the (tile-based) style. The very first setEarthRasterCrossfade call
    // above therefore silently no-ops for those two layers specifically (every `getLayer` check
    // returns falsy), and — since nothing else re-drives them until the next scroll tick — the
    // raster stayed invisible on a page load with zero scroll yet. "idle" (all currently required
    // resources, images included, finished loading) is the correct second replay point; `.once`
    // since this only needs to happen the first time.
    map.once("idle", () => onReadyRef.current?.());

    const onCanvasResize = () => map.resize();
    window.addEventListener("resize", onCanvasResize);

    const onMobileBreakpointResize = () => {
      const nextIsMobile = window.innerWidth < MOBILE_WIDTH_THRESHOLD;
      if (nextIsMobile === isMobileRef.current) return;
      isMobileRef.current = nextIsMobile;
      applyPinSuppressionOpacities(map, nextIsMobile, crossOceanSuppressionRef.current);
    };
    window.addEventListener("resize", onMobileBreakpointResize);

    return () => {
      window.removeEventListener("resize", onCanvasResize);
      window.removeEventListener("resize", onMobileBreakpointResize);
      handleRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme swap: full style swap for now — acceptable, but flagged as something to revisit with
  // targeted setPaintProperty swaps across the handful of hand-picked layers if it ever visibly
  // flickers on toggle. Only fires for a genuine theme change (see constructedThemeRef above). A
  // style swap wipes every manually-added source/layer, so they're fully rebuilt on style.load and
  // every pin/route's last-known state is re-applied (see applyPersistedState).
  useEffect(() => {
    if (theme === constructedThemeRef.current) return;
    constructedThemeRef.current = theme;
    const map = mapRef.current;
    if (!map) return;
    // setStyle() below rebuilds every layer from mapStyle.ts's own static defaults, so
    // applyEarthRasterCrossfade's "skip if unchanged since last applied" guard would otherwise
    // wrongly no-op the very first post-swap call whenever the crossfade's value happens to match
    // what was already cached from before the swap — the map itself was just reset underneath it.
    lastAppliedRasterRef.current = null;
    map.once("style.load", () => {
      setupJourneyLayers(map, theme, isMobileRef.current, onPinClickRef, onPinHoverRef, hoveredPinRef, crossOceanSuppressionRef.current);
      applyPersistedState(map);
      // same race as the initial mount (see the matching comment there): the rebuilt earth-day/
      // earth-night image-sourced layers aren't reliably queryable via getLayer() the instant
      // style.load fires, so applyPersistedState's own raster-crossfade re-apply above can silently
      // no-op for those two layers specifically — replay once more on "idle" once they're truly
      // ready. This is exactly what was leaving the raster invisible after a light/dark theme swap.
      map.once("idle", () => applyPersistedState(map));
    });
    map.setStyle(getJourneyMapStyle(theme));
    // applyPersistedState is intentionally not in deps — a fresh closure every render that only
    // reads current refs/mapRef, safe to call from this one-time imperative style-swap effect
    // without needing to be a dependency (it was already called here before this fix; the added
    // .once("idle", ...) replay above is what newly surfaces the same pre-existing pattern to the
    // linter).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className="absolute inset-0 h-full w-full"
    />
  );
}
