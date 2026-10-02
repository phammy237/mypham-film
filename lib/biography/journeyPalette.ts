/**
 * Single source of truth for the journey page's exact design-system colors (dark mode only — this
 * palette is specific to the cinematic map redesign, not the site's shared light/dark tokens used
 * elsewhere). Map-paint code (plain JS/TS) imports these directly; DOM/CSS code uses the same hex
 * values as Tailwind arbitrary-value classes (`text-[#FAF8F2]` etc.) since Tailwind can't consume
 * JS constants for static class generation — keep both in sync with this file by eye.
 */
export const journeyPalette = {
  pageBackground: "#161513",
  mapLand: "#2B2A26",
  mapSecondaryLand: "#31302B",
  mapWater: "#201F1B",
  primaryPurple: "#90BBDA",
  brightPurple: "#F4DA7B",
  lavender: "#F4DA7B",
  mainText: "#FAF8F2",
  bodyText: "rgba(247,244,235,0.80)",
  mutedText: "rgba(215,214,210,0.46)",
  subtleBorder: "rgba(244,218,123,0.16)",
  panelBackground: "rgba(29,29,26,0.88)",
  minorRoad: "rgba(206,204,199,0.12)",
  majorRoad: "rgba(244,218,123,0.28)",
  districtBoundary: "rgba(190,187,180,0.13)",
} as const;
