import type { StyleSpecification } from "maplibre-gl";
import { getBiographyJourneyTheme } from "@/lib/biography/biographyJourneyTheme";

/**
 * Free, open, no-API-key OpenStreetMap vector tiles — no signup, no billing, no rate limit stated.
 * TileJSON + source-layer schema (openmaptiles/OpenMapTiles) confirmed live against
 * tiles.openfreemap.org before wiring this in. Attribution text below matches what OpenFreeMap
 * asks for verbatim ("OpenFreeMap © OpenMapTiles · Data from OpenStreetMap").
 */
const OPENFREEMAP_TILEJSON_URL = "https://tiles.openfreemap.org/planet";
/** Corner coordinates (top-left, top-right, bottom-right, bottom-left) for a full-world
 *  equirectangular image source — see the earth-day/earth-night sources below. MapLibre's `image`
 *  source still computes an internal Mercator tile coordinate for its corners even under globe
 *  projection; exact +/-90 latitude is a singularity there (y -> Infinity, "outside of bounds"
 *  errors that silently break the whole style). 85 is the standard Web Mercator max-latitude bound
 *  (used by every other web map library for the same reason) — visually indistinguishable from 90
 *  at any zoom this imagery is ever visible at. */
const EARTH_IMAGE_COORDS: [[number, number], [number, number], [number, number], [number, number]] = [
  [-180, 85],
  [180, 85],
  [180, -85],
  [-180, -85],
];
export const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © ' +
  '<a href="https://www.openmaptiles.org" target="_blank">OpenMapTiles</a> · Data from ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

/**
 * Small, hand-picked layer set against OpenFreeMap's OpenMapTiles-schema tiles — full color
 * control instead of a pre-baked raster style. Colors come from the canonical
 * biographyJourneyTheme token file (one source for both dark and light), not a locally hand-rolled
 * palette — see that file for the design rationale of each theme.
 */
export function getJourneyMapStyle(theme: "light" | "dark"): StyleSpecification {
  const c = getBiographyJourneyTheme(theme).map;

  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    projection: { type: "globe" },
    // Without an explicit `sky`, MapLibre's globe projection leaves the space around the
    // sphere unpainted, so whatever sits behind the canvas (the page background) shows through
    // instead. If that happens to match `background` above, the sphere becomes indistinguishable
    // from its surroundings even though it's rendering correctly — this is what "the globe doesn't
    // render at all" turned out to be. `atmosphere-blend` fades the horizon glow out once zoomed
    // past the globe stage so it doesn't tint the flat Hanoi/U.S. mercator views.
    // Thin, crisp rim (low sky-horizon-blend) rather than a broad glow — "2-4px visible highlight,"
    // not a uniform neon circle.
    sky: {
      "sky-color": c.skyColor,
      "horizon-color": c.horizonColor,
      "sky-horizon-blend": 0.18,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 1, 6, 0],
    },
    sources: {
      openmaptiles: { type: "vector", url: OPENFREEMAP_TILEJSON_URL },
      // Earth-hero-only satellite imagery — NASA Blue Marble (day) and the 2012 VIIRS "Earth at
      // Night" composite (both public domain, no API key/billing). A single full-world equirect­
      // angular image draped onto the globe via MapLibre's own `image` source (not a raster tile
      // pyramid — one static asset is plenty at the zoom range this is ever visible), so it's still
      // the same persistent MapLibre instance/projection, never a second renderer. Opacity for both
      // is driven every scroll tick by JourneyMapCanvas's setEarthRasterCrossfade (see
      // lib/biography/earthRasterCrossfade.ts) — 0 by the time the journey reaches hanoi-approach's
      // end, matching "this change applies to Earth/global/Vietnam-approach, not the detailed
      // vector atlas."
      "earth-day": { type: "image", url: "/biography/earth/earth-day.jpg", coordinates: EARTH_IMAGE_COORDS },
      "earth-night": { type: "image", url: "/biography/earth/earth-night.jpg", coordinates: EARTH_IMAGE_COORDS },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": c.background } },
      // Day imagery first, night lights layered on top with additive-ish blending via opacity alone
      // (MapLibre raster layers don't expose blend modes) — kept restrained (see
      // earthRasterCrossfade's own night-opacity cap) so city lights read as a subtle accent, not a
      // second competing image. Both start fully transparent; nothing renders until the first
      // scroll-tick crossfade update fires (see JourneyMapCanvas's onReady replay), so there's no
      // flash of a flat gray quad before that.
      {
        id: "earth-raster-day",
        type: "raster",
        source: "earth-day",
        paint: { "raster-opacity": 0, "raster-fade-duration": 0 },
      },
      {
        id: "earth-raster-night",
        type: "raster",
        source: "earth-night",
        paint: { "raster-opacity": 0, "raster-fade-duration": 0 },
      },
      {
        // OpenMapTiles' dedicated "park" layer (distinct from "landuse") — new; drawn under
        // water/roads so it reads as a quiet green tint rather than competing with them. Invisible
        // in dark mode (park === background there).
        id: "landuse-park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": c.park, "fill-opacity": 1 },
      },
      {
        // fill-opacity defaults to 1 (fully vector) but is driven down to near-0 at Earth/globe
        // zoom by JourneyMapCanvas's raster crossfade, so the satellite ocean shows through cleanly
        // instead of the two coastlines competing — see earthRasterCrossfade.ts.
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": c.water, "fill-opacity": 1 },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: { "line-color": c.waterway, "line-width": 1, "line-opacity": 1 },
      },
      {
        // named water bodies (seas/lakes/bays) — the generic OpenMapTiles "water_name" layer;
        // Hanoi's own West Lake/Red River get their own brighter curated labels below, so this
        // stays capped to a low maxzoom and never competes with those.
        id: "water-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        maxzoom: 10,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Italic"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 2, 10, 8, 13],
        },
        paint: { "text-color": c.waterLabel, "text-halo-color": c.background, "text-halo-width": 1 },
      },
      {
        // admin_level=4 (state/province) boundaries. At globe/Pacific-crossing zoom, OpenMapTiles'
        // boundary polygons for small island nations/territories trace their full outline even
        // though the landmass itself is a handful of pixels — with no zoom floor, that reads as
        // stray hollow ovals scattered across open ocean. minzoom + a zoom-ramped opacity keeps this
        // layer off entirely below zoom 3 (globe/Pacific/regional-Asia range) and only lets it fade
        // in once truly at a country/regional scale, where a state border is actually legible.
        id: "boundary-state",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["==", ["get", "admin_level"], 4],
        minzoom: 3,
        paint: {
          "line-color": c.boundaryState,
          "line-width": 0.5,
          "line-dasharray": [2, 2],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0, 4.5, 1],
        },
      },
      {
        // admin_level=2 (country) boundaries — the layer chiefly responsible for the "tiny outlined
        // circles in the ocean" artifact: every micro-nation/atoll's country outline rendered at
        // full opacity regardless of zoom, most visible over the Pacific where there's nothing else
        // to compete with it. Same zoom-gated fix as boundary-state above, tuned to stay fully
        // invisible through EARTH_TRANSITION_PRESET (zoom 1.6) and ASIA_REGIONAL_PRESET's low end,
        // and fully opaque by VIETNAM_PRESET (zoom 4.6) and USA_PRESET (zoom 3.6) — never hides a
        // meaningful, already-zoomed-in coastline/country outline.
        id: "boundary-country",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["==", ["get", "admin_level"], 2],
        minzoom: 2,
        paint: {
          "line-color": c.boundaryCountry,
          "line-width": 1,
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 2, 0, 3.5, 1],
        },
      },
      {
        // Three-tier road hierarchy (cinematic-atlas spec): minor/medium/major, each its own
        // filter+minzoom+width/color tier — "deliberate road texture," not a flat two-tone split.
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "!",
          ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]]],
        ],
        minzoom: 12.5,
        paint: { "line-color": c.roadMinor, "line-width": 0.75 },
      },
      {
        id: "road-medium",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["secondary", "tertiary"]]],
        minzoom: 8,
        paint: { "line-color": c.roadMedium, "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 14, 1.25] },
      },
      {
        id: "road-major",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]],
        minzoom: 4,
        paint: {
          "line-color": c.roadMajor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.25, 14, 1.75],
          "line-opacity": 1,
        },
      },
      // Country/city labels for the globe/Vietnam-approach zooms — fades out (maxzoom) well before
      // Hanoi's own overview zoom (11.3), where the curated labels below take over instead of a
      // second, generic "Hà Nội" competing with the custom hanoi-chapter-label layer. text-opacity
      // is additionally driven by the raster crossfade — "the only strong label at Earth hero
      // should be Hanoi," so every generic country/city label stays near-invisible until vector
      // detail takes over approaching Hanoi.
      {
        id: "place-label-major",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", ["get", "class"], ["literal", ["country", "city"]]],
        maxzoom: 10,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 2, 10, 12, 14],
        },
        paint: {
          "text-color": ["case", ["==", ["get", "class"], "country"], c.majorGeoLabel, c.cityLabel],
          "text-halo-color": c.labelHalo,
          "text-halo-width": 1.2,
          "text-opacity": 1,
        },
      },
      // Curated Hanoi labels only — no generic town/POI/commercial labels at city scale. Named,
      // real OSM features (district place points + West Lake + the Red River), not fabricated
      // points; "Hanoi" itself already has its own larger, dedicated layer (hanoi-chapter-label).
      {
        id: "curated-hanoi-districts",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", ["get", "name"], ["literal", ["Ba Đình", "Cầu Giấy", "Đống Đa", "Hoàn Kiếm", "Long Biên"]]],
        minzoom: 10,
        layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 13 },
        paint: {
          "text-color": c.curatedLabel,
          "text-halo-color": c.background,
          "text-halo-width": 1.2,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 10.8, 1],
        },
      },
      {
        id: "curated-west-lake",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water",
        filter: ["==", ["get", "name"], "Hồ Tây"],
        minzoom: 10,
        layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 13 },
        paint: {
          "text-color": c.curatedLabel,
          "text-halo-color": c.background,
          "text-halo-width": 1.2,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 10.8, 1],
        },
      },
      {
        id: "curated-red-river",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "waterway",
        filter: ["==", ["get", "name"], "Sông Hồng"],
        minzoom: 10,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 13,
          "symbol-placement": "line",
        },
        paint: {
          "text-color": c.curatedLabel,
          "text-halo-color": c.background,
          "text-halo-width": 1.2,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0, 10.8, 1],
        },
      },
    ],
  } satisfies StyleSpecification;
}
