"use client";
import { useEffect, useRef } from "react";
import { computeJourneyVignetteState } from "@/lib/biography/journeyVignette";
import { getBiographyJourneyTheme, type BiographyJourneyThemeMode } from "@/lib/biography/biographyJourneyTheme";

export type JourneyEdgeFadeHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved. `modalOpen` dampens the
   *  edges while the story modal's own backdrop is already dimming the screen —
   *  computeJourneyVignetteState itself is untouched, this only changes how much of its output
   *  actually reaches the DOM. */
  update: (progress: number, modalOpen?: boolean) => void;
};

// bottomOpacity's own known max across every stage (OVERVIEW_STATE) — used to normalize the
// existing, already-tuned per-stage intensity curve down to a single 0-1 driver for this one layer.
const INTENSITY_NORMALIZER = 0.4;

/**
 * Editorial-atlas edge fade — a single gentle falloff, stage-specific, never a permanent full-screen
 * darkening. Opacity driven by computeJourneyVignetteState(progress) (locked, reused as-is — only
 * how its output is consumed here has changed). At the Earth stage the value is 0, so the hero
 * scene renders completely open; the edge only appears once real map geography is on screen. Sits
 * above the MapLibre canvas and below every text/UI layer (z-[8]) so it only ever visually affects
 * the map, never the hero copy, story panel, navbar, or rail.
 *
 * Colors are theme-aware (see biographyJourneyTheme.edgeFade) — dark mode keeps its original
 * near-black falloff, light mode uses a cool gray/violet falloff instead; a black vignette pasted
 * onto the light theme's pale map would read as a dirty smudge, not an edge frame.
 */
export function JourneyEdgeFade({
  handleRef,
  theme,
}: {
  handleRef: React.MutableRefObject<JourneyEdgeFadeHandle | null>;
  theme: BiographyJourneyThemeMode;
}) {
  const edgeRef = useRef<HTMLDivElement | null>(null);
  const sideRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    handleRef.current = {
      update: (progress, modalOpen) => {
        const state = computeJourneyVignetteState(progress);
        const dampen = modalOpen ? 0.35 : 1;
        const intensity = Math.min(1, state.bottomOpacity / INTENSITY_NORMALIZER);
        const opacity = String(intensity * dampen);
        const c = getBiographyJourneyTheme(themeRef.current).edgeFade;
        if (edgeRef.current) {
          edgeRef.current.style.background = c.radial;
          edgeRef.current.style.opacity = opacity;
        }
        if (sideRef.current) {
          sideRef.current.style.background = c.side;
          sideRef.current.style.opacity = opacity;
        }
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[8]">
      <div ref={edgeRef} className="absolute inset-0" style={{ opacity: 0 }} />
      <div ref={sideRef} className="absolute inset-0" style={{ opacity: 0 }} />
    </div>
  );
}
