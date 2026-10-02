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
    background: "#080D1B",
    water: "#0A1020",
    // Same as `background` on purpose — the park layer is a new addition and must stay invisible
    // in dark mode so dark mode's rendered output is pixel-identical to before it existed.
    park: "#080D1B",
    waterway: "rgba(170,175,200,0.12)",
    waterLabel: "rgba(190,190,210,0.24)",
    boundaryCountry: "rgba(160,160,180,0.10)",
    boundaryState: "rgba(160,160,180,0.08)",
    roadMinor: "rgba(170,170,195,0.10)",
    roadMedium: "rgba(190,188,210,0.15)",
    roadMajor: "rgba(210,205,225,0.23)",
    cityLabel: "rgba(225,220,235,0.32)",
    majorGeoLabel: "rgba(235,230,242,0.48)",
    labelHalo: "#080D1B",
    // Deliberately darker than `background` — the globe's sphere and the void around it (MapLibre's
    // "sky" in globe projection) must never share a color, or the sphere's edge disappears.
    skyColor: "#03050D",
    horizonColor: "#9480D8",
    curatedLabel: "rgba(199,186,255,0.52)",
  },
  route: {
    core: { completed: "rgba(176,157,242,0.26)", current: "rgba(176,157,242,0.92)", future: "rgba(176,157,242,0.10)" },
    glow: { completed: "rgba(142,115,230,0.05)", current: "rgba(142,115,230,0.20)", future: "rgba(142,115,230,0)" },
  },
  transpacific: {
    core: { current: "rgba(176,157,242,0.72)", transparent: "rgba(176,157,242,0)" },
    glow: { current: "rgba(142,115,230,0.12)", transparent: "rgba(142,115,230,0)" },
  },
  pin: {
    activeFill: "#9A82E8",
    activeStroke: "rgba(235,228,255,0.88)",
    activeHalo: "rgba(154,130,232,0.18)",
    activeNumberText: "#FFFFFF",
    inactiveFill: "#1B2340",
    inactiveStroke: "rgba(180,165,225,0.56)",
    inactiveNumberText: "rgba(235,230,245,0.76)",
    titleText: "#F4F1FB",
    subtitleText: "rgba(205,200,225,0.7)",
    labelHalo: "#121A33",
  },
  anchor: { glow: "#8E6BFF", ring: "#A98CFF", dot: "#F4F1FB" },
  travelPoint: { dot: "#C3B2FF", glow: "rgba(163,138,255,0.40)" },
  atmosphere: { inner: "rgba(210,225,255,0.42)", outer: "rgba(175,160,235,0.24)", outerFade: "rgba(135,110,225,0)" },
  edgeFade: {
    radial: "radial-gradient(ellipse at center, rgba(4,7,18,0) 50%, rgba(4,7,18,0.10) 66%, rgba(4,7,18,0.30) 82%, rgba(3,5,14,0.58) 100%)",
    side: "linear-gradient(to right, rgba(3,5,14,0.20) 0%, transparent 13%, transparent 87%, rgba(3,5,14,0.26) 100%)",
  },
};

const light: BiographyJourneyTheme = {
  map: {
    background: "#F1EFF7", // land tint
    water: "#DCE6FA",
    park: "#E5EEDF",
    waterway: "rgba(90,120,170,0.35)",
    waterLabel: "rgba(62,90,130,0.60)",
    boundaryCountry: "rgba(38,49,91,0.18)", // "stronger UI border" token, reused for country lines
    boundaryState: "rgba(38,49,91,0.12)", // "subtle border" token
    // Delicate white/pale-gray road network, per spec — visible against the land tint without
    // reading as a road ATLAS; opacity (not hue) is what separates the three tiers.
    roadMinor: "rgba(255,255,255,0.55)",
    roadMedium: "rgba(255,255,255,0.75)",
    roadMajor: "rgba(255,255,255,0.95)",
    cityLabel: "#5E678D", // map labels
    majorGeoLabel: "#3A446B", // large city labels
    labelHalo: "#F1EFF7",
    skyColor: "#F4F2F8", // page background tone — the void behind the sphere
    horizonColor: "#B7AEF6", // secondary lavender line — the rim's only accent color
    curatedLabel: "rgba(94,103,141,0.80)",
  },
  route: {
    // Primary lavender at real opacity for completed/active; future/inactive drops to the secondary
    // lavender line color at low opacity — still lavender-family (per reference), just quiet.
    core: { completed: "rgba(124,106,242,0.35)", current: "rgba(124,106,242,0.95)", future: "rgba(183,174,246,0.20)" },
    glow: { completed: "rgba(124,106,242,0.08)", current: "rgba(124,106,242,0.22)", future: "rgba(183,174,246,0)" },
  },
  transpacific: {
    core: { current: "rgba(124,106,242,0.85)", transparent: "rgba(124,106,242,0)" },
    glow: { current: "rgba(124,106,242,0.18)", transparent: "rgba(124,106,242,0)" },
  },
  pin: {
    activeFill: "#7C6AF2",
    activeStroke: "rgba(255,255,255,0.95)",
    activeHalo: "rgba(124,106,242,0.18)", // exact "soft lavender glow" token
    activeNumberText: "#FFFFFF",
    inactiveFill: "#FBFAFD", // elevated panel tone — pale, still visible against the land tint
    inactiveStroke: "#B7AEF6", // secondary lavender line
    inactiveNumberText: "#7C6AF2",
    titleText: "#1D2340",
    subtitleText: "rgba(79,87,120,0.85)",
    labelHalo: "#F1EFF7",
  },
  anchor: { glow: "#7C6AF2", ring: "#B7AEF6", dot: "#1D2340" },
  travelPoint: { dot: "#7C6AF2", glow: "rgba(124,106,242,0.35)" },
  // Soft diffused white-lavender mist, never a hard ring — the inner stop is the spec's own
  // "soft haze/mist overlay" white, fading through the secondary lavender line color to transparent.
  atmosphere: { inner: "rgba(255,255,255,0.55)", outer: "rgba(183,174,246,0.20)", outerFade: "rgba(183,174,246,0)" },
  // White-lavender haze at the frame's edges — mist/fog, not a dark or neutral-gray vignette.
  edgeFade: {
    radial: "radial-gradient(ellipse at center, rgba(244,242,248,0) 50%, rgba(244,242,248,0.45) 78%, rgba(244,242,248,0.75) 100%)",
    side: "linear-gradient(to right, rgba(244,242,248,0.30) 0%, transparent 15%, transparent 85%, rgba(244,242,248,0.35) 100%)",
  },
};

export const biographyJourneyTheme: Record<BiographyJourneyThemeMode, BiographyJourneyTheme> = { dark, light };

export function getBiographyJourneyTheme(mode: BiographyJourneyThemeMode): BiographyJourneyTheme {
  return biographyJourneyTheme[mode];
}
