/**
 * Single canonical color source for the biography journey's dark AND light modes — the map style,
 * route/pin/anchor layers (MapLibre paint, drawn in JS), the Earth atmosphere, and the edge
 * vignette all read from here instead of each hand-rolling its own theme branch. Dark values are
 * the existing, approved reference composition, copied verbatim from wherever they used to live
 * (mapStyle.ts, JourneyMapCanvas.tsx, JourneyEarthGlow.tsx, JourneyEdgeFade.tsx) — dark mode must
 * look effectively unchanged. Light values are new: "editorial atlas in daylight" — soft ivory/mist
 * background, cool slate map lines, lavender journey accents, never a pale/washed-out default
 * MapLibre light theme.
 *
 * React DOM text (headings, body copy, panel chrome) is NOT centralized here — those already have
 * an established canonical source of their own (tailwind.config.ts's text-surface/text-muted/
 * text-accent tokens + Tailwind's `dark:` variant), and stay that way. This file exists specifically
 * for values that have no Tailwind/CSS-class equivalent: colors baked into MapLibre paint
 * expressions and canvas-drawn pin icons, which only a plain JS object can serve.
 *
 * Light theme design direction (per the approved reference mockups): soft pearl/lavender-white
 * surface, deep navy text, lavender as the singular accent (route, active pin, active states,
 * atmosphere haze), delicate white/pale linework on the map. Land and water keep real lightness
 * contrast so the map/globe still reads as a map, not a flat disc — the haze/mist lives in the
 * atmosphere and edge-vignette layers on TOP of that, not in the map's own land/water fill.
 */

export type BiographyJourneyThemeMode = "light" | "dark";

type RouteBand = { completed: string; current: string; future: string };

type BiographyJourneyTheme = {
  map: {
    background: string;
    water: string;
    /** landuse "park" polygons — a new, subtle addition; invisible in dark mode (matches its own
     *  background exactly) so dark mode's rendered output is unaffected. */
    park: string;
    waterway: string;
    waterLabel: string;
    boundaryCountry: string;
    boundaryState: string;
    roadMinor: string;
    roadMedium: string;
    roadMajor: string;
    cityLabel: string;
    majorGeoLabel: string;
    labelHalo: string;
    skyColor: string;
    horizonColor: string;
    /** the three curated Hanoi labels (districts, West Lake, Red River) — one shared tone */
    curatedLabel: string;
  };
  route: { core: RouteBand; glow: RouteBand };
  transpacific: {
    core: { current: string; transparent: string };
    glow: { current: string; transparent: string };
  };
  pin: {
    activeFill: string;
    activeStroke: string;
    activeHalo: string;
    activeNumberText: string;
    inactiveFill: string;
    inactiveStroke: string;
    inactiveNumberText: string;
    titleText: string;
    subtitleText: string;
    /** text-halo behind the map-drawn pin title/subtitle/number — matches the map's own background */
    labelHalo: string;
  };
  anchor: { glow: string; ring: string; dot: string };
  travelPoint: { dot: string; glow: string };
  /** JourneyEarthGlow's radial atmosphere ring — inner bright edge, outer soft falloff */
  atmosphere: { inner: string; outer: string; outerFade: string };
  /** JourneyEdgeFade's two vignette layers */
  edgeFade: { radial: string; side: string };
};

const dark: BiographyJourneyTheme = {
  map: {
    background: "#151412",
    water: "#191816",
    // Same as `background` on purpose — the park layer is a new addition and must stay invisible
    // in dark mode so dark mode's rendered output is pixel-identical to before it existed.
    park: "#151412",
    waterway: "rgba(190,187,180,0.12)",
    waterLabel: "rgba(204,202,196,0.24)",
    boundaryCountry: "rgba(176,173,164,0.10)",
    boundaryState: "rgba(176,173,164,0.08)",
    roadMinor: "rgba(188,185,177,0.10)",
    roadMedium: "rgba(203,201,195,0.15)",
    roadMajor: "rgba(218,216,212,0.23)",
    cityLabel: "rgba(229,228,226,0.32)",
    majorGeoLabel: "rgba(245,240,227,0.48)",
    labelHalo: "#151412",
    // Deliberately darker than `background` — the globe's sphere and the void around it (MapLibre's
    // "sky" in globe projection) must never share a color, or the sphere's edge disappears.
    skyColor: "#0A0A09",
    horizonColor: "#83B3D6",
    curatedLabel: "rgba(244,218,123,0.52)",
  },
  route: {
    core: { completed: "rgba(244,218,123,0.26)", current: "rgba(244,218,123,0.92)", future: "rgba(244,218,123,0.10)" },
    glow: { completed: "rgba(131,179,214,0.05)", current: "rgba(131,179,214,0.20)", future: "rgba(131,179,214,0)" },
  },
  transpacific: {
    core: { current: "rgba(244,218,123,0.72)", transparent: "rgba(244,218,123,0)" },
    glow: { current: "rgba(131,179,214,0.12)", transparent: "rgba(131,179,214,0)" },
  },
  pin: {
    activeFill: "#90BBDA",
    activeStroke: "rgba(248,244,235,0.88)",
    activeHalo: "rgba(144,187,218,0.18)",
    activeNumberText: "#FFFFFF",
    inactiveFill: "#34332E",
    inactiveStroke: "rgba(244,218,123,0.56)",
    inactiveNumberText: "rgba(245,241,230,0.76)",
    titleText: "#FAF8F2",
    subtitleText: "rgba(215,214,210,0.7)",
    labelHalo: "#282723",
  },
  anchor: { glow: "#90BBDA", ring: "#F4DA7B", dot: "#FAF8F2" },
  travelPoint: { dot: "#F4DA7B", glow: "rgba(244,218,123,0.40)" },
  atmosphere: { inner: "rgba(243,237,222,0.42)", outer: "rgba(244,218,123,0.24)", outerFade: "rgba(124,175,211,0)" },
  edgeFade: {
    radial: "radial-gradient(ellipse at center, rgba(14,13,12,0) 50%, rgba(14,13,12,0.10) 66%, rgba(14,13,12,0.30) 82%, rgba(11,11,9,0.58) 100%)",
    side: "linear-gradient(to right, rgba(11,11,9,0.20) 0%, transparent 13%, transparent 87%, rgba(11,11,9,0.26) 100%)",
  },
};

const light: BiographyJourneyTheme = {
  map: {
    background: "#F8F5EE", // land tint
    water: "#F4EFE2",
    park: "#E5EEDF",
    waterway: "rgba(139,134,121,0.35)",
    waterLabel: "rgba(103,99,89,0.60)",
    boundaryCountry: "rgba(74,72,64,0.18)", // "stronger UI border" token, reused for country lines
    boundaryState: "rgba(74,72,64,0.12)", // "subtle border" token
    // Delicate white/pale-gray road network, per spec — visible against the land tint without
    // reading as a road ATLAS; opacity (not hue) is what separates the three tiers.
    roadMinor: "rgba(255,255,255,0.55)",
    roadMedium: "rgba(255,255,255,0.75)",
    roadMajor: "rgba(255,255,255,0.95)",
    cityLabel: "#7E796D", // map labels
    majorGeoLabel: "#58554D", // large city labels
    labelHalo: "#F8F5EE",
    skyColor: "#FAF7F0", // page background tone — the void behind the sphere
    horizonColor: "#F4DA7B", // secondary lavender line — the rim's only accent color
    curatedLabel: "rgba(126,121,109,0.80)",
  },
  route: {
    // Primary lavender at real opacity for completed/active; future/inactive drops to the secondary
    // lavender line color at low opacity — still lavender-family (per reference), just quiet.
    core: { completed: "rgba(134,181,215,0.35)", current: "rgba(134,181,215,0.95)", future: "rgba(244,218,123,0.20)" },
    glow: { completed: "rgba(134,181,215,0.08)", current: "rgba(134,181,215,0.22)", future: "rgba(244,218,123,0)" },
  },
  transpacific: {
    core: { current: "rgba(134,181,215,0.85)", transparent: "rgba(134,181,215,0)" },
    glow: { current: "rgba(134,181,215,0.18)", transparent: "rgba(134,181,215,0)" },
  },
  pin: {
    activeFill: "#86B5D7",
    activeStroke: "rgba(255,255,255,0.95)",
    activeHalo: "rgba(134,181,215,0.18)", // exact "soft lavender glow" token
    activeNumberText: "#FFFFFF",
    inactiveFill: "#FDFCFA", // elevated panel tone — pale, still visible against the land tint
    inactiveStroke: "#F4DA7B", // secondary lavender line
    inactiveNumberText: "#86B5D7",
    titleText: "#35342F",
    subtitleText: "rgba(106,103,93,0.85)",
    labelHalo: "#F8F5EE",
  },
  anchor: { glow: "#86B5D7", ring: "#F4DA7B", dot: "#35342F" },
  travelPoint: { dot: "#86B5D7", glow: "rgba(134,181,215,0.35)" },
  // Soft diffused white-lavender mist, never a hard ring — the inner stop is the spec's own
  // "soft haze/mist overlay" white, fading through the secondary lavender line color to transparent.
  atmosphere: { inner: "rgba(255,255,255,0.55)", outer: "rgba(244,218,123,0.20)", outerFade: "rgba(244,218,123,0)" },
  // White-lavender haze at the frame's edges — mist/fog, not a dark or neutral-gray vignette.
  edgeFade: {
    radial: "radial-gradient(ellipse at center, rgba(250,247,240,0) 50%, rgba(250,247,240,0.45) 78%, rgba(250,247,240,0.75) 100%)",
    side: "linear-gradient(to right, rgba(250,247,240,0.30) 0%, transparent 15%, transparent 85%, rgba(250,247,240,0.35) 100%)",
  },
};

export const biographyJourneyTheme: Record<BiographyJourneyThemeMode, BiographyJourneyTheme> = { dark, light };

export function getBiographyJourneyTheme(mode: BiographyJourneyThemeMode): BiographyJourneyTheme {
  return biographyJourneyTheme[mode];
}
