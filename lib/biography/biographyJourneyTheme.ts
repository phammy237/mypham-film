/**
 * Single colour source for the journey's dark and light modes: map style, route/pin/anchor layers
 * (MapLibre paint), Earth atmosphere and edge vignette. Values are exact film tokens or alpha
 * variants of them (role table: lib/biography/journeyPalette.ts). Dark is the site default.
 * DOM text/panels use Tailwind tokens instead; only values baked into MapLibre/canvas live here.
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
    background: "#22345C", // soft: land sits a step above the ocean so continents read against it
    water: "#0A1326", // navy-deep
    park: "#22345C", // same as land on purpose: invisible in dark
    waterway: "rgba(141,188,222,0.40)",
    waterLabel: "rgba(141,188,222,0.85)",
    boundaryCountry: "rgba(244,239,227,0.28)",
    boundaryState: "rgba(244,239,227,0.10)",
    roadMinor: "#2A3E6B",
    roadMedium: "#314677",
    roadMajor: "#3C5489",
    cityLabel: "rgba(244,239,227,0.78)",
    majorGeoLabel: "#F4EFE3",
    labelHalo: "#22345C",
    // Darker than the sphere on purpose: the globe edge must stay visible against the void.
    skyColor: "#080F1E", // film
    horizonColor: "#8DBCE0", // sky
    curatedLabel: "rgba(244,211,94,0.92)",
  },
  route: {
    core: { completed: "rgba(244,211,94,0.55)", current: "rgba(244,211,94,1)", future: "rgba(244,211,94,0.40)" },
    glow: { completed: "rgba(141,188,222,0.08)", current: "rgba(141,188,222,0.26)", future: "rgba(141,188,222,0)" },
  },
  transpacific: {
    core: { current: "rgba(244,211,94,0.85)", transparent: "rgba(244,211,94,0)" },
    glow: { current: "rgba(141,188,222,0.16)", transparent: "rgba(141,188,222,0)" },
  },
  pin: {
    activeFill: "#F4D35E",
    activeStroke: "rgba(244,239,227,0.95)",
    activeHalo: "rgba(244,211,94,0.25)",
    activeNumberText: "#20201E",
    inactiveFill: "#19284A",
    inactiveStroke: "rgba(244,211,94,0.80)",
    inactiveNumberText: "#F4EFE3",
    titleText: "#F4EFE3",
    subtitleText: "rgba(244,239,227,0.80)",
    labelHalo: "#0F1B33",
  },
  anchor: { glow: "#8DBCE0", ring: "#F4D35E", dot: "#F4EFE3" },
  travelPoint: { dot: "#F4D35E", glow: "rgba(244,211,94,0.40)" },
  atmosphere: { inner: "rgba(244,239,227,0.42)", outer: "rgba(244,211,94,0.24)", outerFade: "rgba(244,211,94,0)" },
  edgeFade: {
    radial: "radial-gradient(ellipse at center, rgba(8,15,30,0) 30%, rgba(8,15,30,0.38) 55%, rgba(8,15,30,0.78) 78%, rgba(8,15,30,0.97) 100%)",
    side: "linear-gradient(to right, rgba(8,15,30,0.85) 0%, rgba(8,15,30,0.35) 12%, transparent 28%, transparent 72%, rgba(8,15,30,0.35) 88%, rgba(8,15,30,0.85) 100%)",
  },
};

const light: BiographyJourneyTheme = {
  map: {
    background: "#FAF7EF", // paper
    water: "#C3D7E2", // sky @ 50% over paper: ocean reads clearly against the cream land
    park: "#F1EBDB", // soft @ 50% over paper
    waterway: "rgba(65,103,136,0.50)",
    waterLabel: "#416788",
    boundaryCountry: "rgba(32,32,30,0.45)",
    boundaryState: "rgba(32,32,30,0.14)",
    // Ink alpha tiers (white roads vanish on cream paper).
    roadMinor: "#EEE8D8",
    roadMedium: "#E3DBC6",
    roadMajor: "#D5CBB0",
    cityLabel: "#4D4A43", // muted pulled toward ink for map legibility
    majorGeoLabel: "#20201E",
    labelHalo: "#FAF7EF",
    skyColor: "#FAF7EF", // page background: the void behind the sphere
    horizonColor: "#416788",
    curatedLabel: "#416788",
  },
  route: {
    core: { completed: "rgba(65,103,136,0.60)", current: "rgba(65,103,136,1)", future: "rgba(65,103,136,0.42)" },
    glow: { completed: "rgba(65,103,136,0.08)", current: "rgba(65,103,136,0.22)", future: "rgba(65,103,136,0)" },
  },
  transpacific: {
    core: { current: "rgba(65,103,136,0.90)", transparent: "rgba(65,103,136,0)" },
    glow: { current: "rgba(65,103,136,0.18)", transparent: "rgba(65,103,136,0)" },
  },
  pin: {
    activeFill: "#416788",
    activeStroke: "#FAF7EF",
    activeHalo: "rgba(65,103,136,0.22)",
    activeNumberText: "#FAF7EF",
    inactiveFill: "#FFFDF8", // card
    inactiveStroke: "#416788",
    inactiveNumberText: "#416788",
    titleText: "#20201E",
    subtitleText: "#4D4A43",
    labelHalo: "#FAF7EF",
  },
  anchor: { glow: "#416788", ring: "#F4D35E", dot: "#20201E" },
  travelPoint: { dot: "#416788", glow: "rgba(65,103,136,0.35)" },
  // Cream haze at the rim, never a dark vignette.
  atmosphere: { inner: "rgba(250,247,239,0.55)", outer: "rgba(141,188,222,0.30)", outerFade: "rgba(141,188,222,0)" },
  edgeFade: {
    radial: "radial-gradient(ellipse at center, rgba(250,247,239,0) 40%, rgba(250,247,239,0.5) 68%, rgba(250,247,239,0.9) 100%)",
    side: "linear-gradient(to right, rgba(250,247,239,0.75) 0%, rgba(250,247,239,0.3) 10%, transparent 24%, transparent 76%, rgba(250,247,239,0.3) 90%, rgba(250,247,239,0.75) 100%)",
  },
};

export const biographyJourneyTheme: Record<BiographyJourneyThemeMode, BiographyJourneyTheme> = { dark, light };

export function getBiographyJourneyTheme(mode: BiographyJourneyThemeMode): BiographyJourneyTheme {
  return biographyJourneyTheme[mode];
}
