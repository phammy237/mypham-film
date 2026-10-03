/**
 * Biography colour roles -> film tokens (app/globals.css "Film design system", tailwind.config.ts).
 * Dark is the site default. Map paint (JS) reads biographyJourneyTheme.ts; DOM uses Tailwind tokens.
 *
 *  role               dark                          light
 *  page / land        paper  #20201E                paper  #FAF7EF
 *  water / sky        navy-deep #171715 / film #0F0F0E   tint of sky over paper / paper
 *  panel              card   #2A2A27                card   #FFFDF8
 *  heading + body     cream  #F4EFE3 (journey-paper) ink   #20201E (journey-ink/-body)
 *  muted / labels     #ABA597 (journey-muted-dark)  #6E6A60 (journey-muted)
 *  border             cream @ .30                   ink @ .50
 *  active accent      butter #F4D35E (journey-glow) film blue #416788 (journey-violet)
 *  hover / ring       sky    #8DBCE0 (journey-lilac) film blue #416788
 *  route / pin fill   butter (dark)                 film blue (light)
 *  pin number         ink on butter                 paper on blue
 */
export const journeyPalette = {
  pageBackground: "#20201E",
  mapLand: "#33322E",
  mapSecondaryLand: "#2A2A27",
  mapWater: "#171715",
  primaryBlue: "#8DBCE0",
  accent: "#F4D35E",
  mainText: "#F4EFE3",
  bodyText: "#F4EFE3",
  mutedText: "#ABA597",
  subtleBorder: "rgba(244,239,227,0.30)",
  panelBackground: "#2A2A27",
  minorRoad: "rgba(244,239,227,0.16)",
  majorRoad: "rgba(244,211,94,0.45)",
  districtBoundary: "rgba(244,239,227,0.28)",
} as const;
