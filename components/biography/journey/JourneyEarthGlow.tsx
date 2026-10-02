"use client";
import { useEffect, useRef } from "react";
import { getStageById } from "@/lib/biography/journeyStages";
import { rampDownTo } from "@/lib/biography/journeyMotion";
import { getBiographyJourneyTheme, type BiographyJourneyThemeMode } from "@/lib/biography/biographyJourneyTheme";

export type EarthGlowGeometry = { xPx: number; yPx: number; diameterPx: number };

export type JourneyEarthGlowHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved. `geometry` is the
   *  globe's actual current on-screen center/radius (JourneyMapCanvas's getEarthGlowGeometry) —
   *  null falls back to the original static estimate (e.g. before the map has reported ready). */
  update: (progress: number, geometry: EarthGlowGeometry | null) => void;
};

// Same window the Earth hero text and the "glowing Hanoi" anchor marker already fade out over
// (see GeographicJourney's HERO_FADE_COMPLETE_AT) — every Earth-only decoration resolves together.
const FADE_COMPLETE_AT = getStageById("hanoi-approach").start;

// Fallback only — used for the handful of frames before the map reports its first real geometry.
// Matches EARTH_PRESET/journeyMapPadding's own composition (center ~63vw/50vh, ~43vw diameter).
const FALLBACK_LEFT_VW = 63;
const FALLBACK_TOP_VH = 50;
const FALLBACK_DIAMETER_VW = 43;

// How far the atmosphere extends beyond the globe's own true edge, in px each side. A box-shadow
// on a large circle reads as a crisp, fully-visible RING all the way around (the actual root cause
// of the earlier "giant circle" bug) — a radial-gradient with stops anchored to the real edge
// fraction gives genuine soft falloff instead, "extend only roughly 20-35px beyond Earth."
const GLOW_EXTENT_PX = 30;

/**
 * Editorial-cartography Earth atmosphere — a single restrained glow that hugs the globe's own
 * silhouette, nothing else. "Use only: Earth, atmosphere, small Hanoi marker, optionally subtle
 * geographic label(s)." No orbit ring, no decorative ring paths, no floating dots, no star field,
 * no haze pockets, no large CSS disc behind the planet — those were all removed. Position/size
 * tracked every tick from the SAME center/radius the map camera itself just rendered with
 * (JourneyMapCanvas's getEarthGlowGeometry), not a hardcoded viewport position, so the glow never
 * detaches from the globe as the camera moves.
 */
export function JourneyEarthGlow({
  handleRef,
  theme,
}: {
  handleRef: React.MutableRefObject<JourneyEarthGlowHandle | null>;
  theme: BiographyJourneyThemeMode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rimRef = useRef<HTMLDivElement | null>(null);
  // read at update-time (every scroll tick) rather than closed over, so a theme toggle mid-journey
  // is reflected on the very next tick — no stale dark-tuned glow left showing after switching to
  // light (or vice versa).
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    handleRef.current = {
      update: (progress, geometry) => {
        const el = rootRef.current;
        if (!el) return;
        el.style.opacity = String(rampDownTo(progress, FADE_COMPLETE_AT, FADE_COMPLETE_AT));

        const xPx = geometry?.xPx ?? window.innerWidth * (FALLBACK_LEFT_VW / 100);
        const yPx = geometry?.yPx ?? window.innerHeight * (FALLBACK_TOP_VH / 100);
        const diameterPx = geometry?.diameterPx ?? window.innerWidth * (FALLBACK_DIAMETER_VW / 100);

        const layerEl = rimRef.current;
        if (!layerEl) return;
        // Outer box is the globe's own diameter plus the glow's extent on each side; the gradient
        // stops below are computed as a FRACTION of that outer radius, so the bright edge always
        // lands exactly on the globe's true silhouette regardless of its current on-screen size.
        const outerDiameterPx = diameterPx + GLOW_EXTENT_PX * 2;
        const outerRadiusPx = outerDiameterPx / 2;
        const edgeFraction = (diameterPx / 2 / outerRadiusPx) * 100;
        const c = getBiographyJourneyTheme(themeRef.current).atmosphere;
        layerEl.style.left = `${xPx}px`;
        layerEl.style.top = `${yPx}px`;
        layerEl.style.width = `${outerDiameterPx}px`;
        layerEl.style.height = `${outerDiameterPx}px`;
        layerEl.style.background = [
          "radial-gradient(circle,",
          "transparent 0%,",
          `transparent ${edgeFraction.toFixed(2)}%,`,
          `${c.inner} ${edgeFraction.toFixed(2)}%,`,
          `${c.outer} ${(edgeFraction + (100 - edgeFraction) * 0.35).toFixed(2)}%,`,
          `${c.outerFade} 100%)`,
        ].join(" ");
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    // z-[5]: above the map canvas (z-auto) so the semi-transparent glow actually composites over
    // the rendered globe instead of being fully hidden behind its opaque background fill — still
    // well below the z-20 text/story overlays. Visible in BOTH themes now — the atmosphere is part
    // of the globe itself, not a dark-mode-only decoration; only its color tokens change (see
    // biographyJourneyTheme.atmosphere).
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      <div ref={rimRef} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full" />
    </div>
  );
}
