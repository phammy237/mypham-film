/**
 * Single source of truth for the journey page's exact design-system colors (dark mode only — this
 * palette is specific to the cinematic map redesign, not the site's shared light/dark tokens used
 * elsewhere). Map-paint code (plain JS/TS) imports these directly; DOM/CSS code uses the same hex
 * values as Tailwind arbitrary-value classes (`text-[#F4F1FB]` etc.) since Tailwind can't consume
 * JS constants for static class generation — keep both in sync with this file by eye.
 */
export const journeyPalette = {
  pageBackground: "#080D1C",
  mapLand: "#151D36",
  mapSecondaryLand: "#18213D",
  mapWater: "#0B142B",
  primaryPurple: "#8E6BFF",
  brightPurple: "#A98CFF",
  lavender: "#C7BAFF",
  mainText: "#F4F1FB",
  bodyText: "rgba(238,236,246,0.80)",
  mutedText: "rgba(205,200,225,0.46)",
  subtleBorder: "rgba(180,160,255,0.16)",
  panelBackground: "rgba(12,17,38,0.88)",
  minorRoad: "rgba(190,185,220,0.12)",
  majorRoad: "rgba(200,190,230,0.28)",
  districtBoundary: "rgba(170,160,210,0.13)",
} as const;
