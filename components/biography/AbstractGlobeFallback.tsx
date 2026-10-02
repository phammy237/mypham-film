"use client";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { useReducedMotion } from "framer-motion";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeoPoint } from "@/data/biography/biography";
import { clamp01, smoothstep } from "@/lib/biography/journeyMotion";
// type-only: erased at compile time, so this never pulls the three.js/@react-three WebGL bundle
// into this fallback's chunk (GlobeHero already relies on the same type-only import pattern)
import type { GlobeViewState, SatelliteGlobeHandle } from "@/components/biography/SatelliteGlobeCanvas";

function rotationFor(target: GeoPoint): [number, number, number] {
  return [-target.lon, -target.lat, 0];
}

const ROUTE_SEGMENTS = 48;
/** mirrors SatelliteGlobeCanvas's own FLIGHT_FADE_WINDOW — duplicated rather than imported to
 *  avoid coupling this generic fallback to a journey-specific module (same reasoning as the WebGL
 *  component's own comment on why it keeps its own copy) */
const FLIGHT_FADE_WINDOW = 0.08;

/**
 * The original hand-drawn SVG/d3-geo globe. Kept as the graceful fallback for browsers/devices
 * where WebGL is unavailable — GlobeHero renders this instead of the photorealistic
 * SatelliteGlobeCanvas when a WebGL context can't be created (or the 3D globe throws at runtime).
 */
export function AbstractGlobeFallback({
  countries,
  highlightCountryIds = [],
  initialTarget,
  interactive = true,
  ambient = true,
  size = 560,
  className = "",
  ariaLabel = "Interactive globe",
  arc = null,
  viewState,
  handleRef,
}: {
  countries: FeatureCollection<Geometry> | null;
  highlightCountryIds?: string[];
  initialTarget?: GeoPoint;
  interactive?: boolean;
  ambient?: boolean;
  size?: number;
  className?: string;
  ariaLabel?: string;
  /** restrained travel route, e.g. Hanoi → United States — drawn as a great-circle line that
   *  progressively reveals with `routeProgress`, same data shape the WebGL globe's `arc` takes */
  arc?: { from: GeoPoint; to: GeoPoint } | null;
  /** only `routeProgress` is consulted here — this fallback deliberately never tracks the WebGL
   *  globe's live lat/lon/distance camera, per the "don't fake a detailed globe camera" rule */
  viewState?: GlobeViewState;
  /** populated with an imperative handle so the journey's scroll loop can drive route reveal the
   *  same way it drives the WebGL globe, without this component re-rendering on every scroll tick */
  handleRef?: React.MutableRefObject<SatelliteGlobeHandle | null>;
}) {
  const [rotation, setRotation] = useState<[number, number, number]>(
    initialTarget ? rotationFor(initialTarget) : [-105, -15, 0]
  );
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const reducedMotion = useReducedMotion();
  const dragStart = useRef<{ x: number; y: number; rotation: [number, number, number] } | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const routeLineRef = useRef<SVGPathElement | null>(null);
  const routeGroupRef = useRef<SVGGElement | null>(null);
  const planeRef = useRef<SVGGElement | null>(null);
  const routeProgressRef = useRef(viewState?.routeProgress ?? 0);

  useEffect(() => {
    if (!ambient || reducedMotion || dragging || !interactive) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // low-priority: a purely decorative animation must never starve real interactions
      // (e.g. nav-link transitions) competing for React's scheduler
      startTransition(() => {
        setRotation((r) => [r[0] - dt * 0.006, r[1], r[2]]);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ambient, reducedMotion, dragging, interactive]);

  const baseScale = size / 2.6;
  const projection = useMemo(() => {
    return geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(baseScale * scale)
      .rotate(rotation)
      .clipAngle(90);
  }, [size, baseScale, scale, rotation]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  // great-circle waypoints (lon/lat), independent of rotation/scale — computed once per arc
  const routeWaypoints = useMemo(() => {
    if (!arc) return null;
    const interpolate = geoInterpolate([arc.from.lon, arc.from.lat], [arc.to.lon, arc.to.lat]);
    const points: [number, number][] = [];
    for (let i = 0; i <= ROUTE_SEGMENTS; i++) points.push(interpolate(i / ROUTE_SEGMENTS));
    return points;
  }, [arc]);

  // re-projected whenever rotation/scale change (drag or the one-off ambient spin) — the same
  // cadence country boundaries already re-render at, not a per-scroll-tick cost
  const { routePathD, projectedRoutePoints } = useMemo(() => {
    if (!routeWaypoints) return { routePathD: null as string | null, projectedRoutePoints: [] as Array<[number, number] | null> };
    const projected = routeWaypoints.map((pt) => projection(pt) as [number, number] | null);
    let d = "";
    let penDown = false;
    for (const p of projected) {
      if (!p) {
        penDown = false;
        continue;
      }
      d += `${penDown ? "L" : "M"}${p[0]},${p[1]} `;
      penDown = true;
    }
    return { routePathD: d || null, projectedRoutePoints: projected };
  }, [routeWaypoints, projection]);

  /** imperative, ref-driven — safe to call on every scroll tick without touching React state.
   *  Reveal uses the path's own normalized `pathLength` (see the <path> below), so it stays
   *  correct even across the rare re-projection above without re-measuring anything. */
  const applyRouteProgress = useCallback(
    (t: number) => {
      const clamped = clamp01(t);
      routeProgressRef.current = clamped;
      if (routeLineRef.current) routeLineRef.current.style.strokeDashoffset = String(1 - clamped);

      const fadeIn = smoothstep(clamped / FLIGHT_FADE_WINDOW);
      const fadeOut = 1 - smoothstep((clamped - (1 - FLIGHT_FADE_WINDOW)) / FLIGHT_FADE_WINDOW);
      if (routeGroupRef.current) routeGroupRef.current.style.opacity = String(Math.min(fadeIn, fadeOut));

      const pts = projectedRoutePoints;
      if (planeRef.current && pts.length > 1) {
        const idx = clamped * (pts.length - 1);
        const i0 = Math.min(pts.length - 2, Math.floor(idx));
        const a = pts[i0];
        const b = pts[i0 + 1];
        if (a && b) {
          const localT = idx - i0;
          const x = a[0] + (b[0] - a[0]) * localT;
          const y = a[1] + (b[1] - a[1]) * localT;
          const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
          // SVG's own `transform` attribute, not CSS `style.transform` — avoids relying on
          // CSS-Transforms-on-SVG support/origin quirks for a plain translate+rotate
          planeRef.current.setAttribute("transform", `translate(${x} ${y}) rotate(${angle})`);
          planeRef.current.style.visibility = "visible";
        } else {
          planeRef.current.style.visibility = "hidden";
        }
      }
    },
    [projectedRoutePoints]
  );

  // re-apply the current progress whenever the route re-projects (drag/ambient rotation) so the
  // reveal/plane position never lags one frame behind a rotation change
  useEffect(() => {
    applyRouteProgress(routeProgressRef.current);
  }, [applyRouteProgress]);

  useEffect(() => {
    if (!handleRef) return;
    handleRef.current = {
      // only routeProgress is honored here — see the `viewState` prop doc above
      setViewState: (next) => {
        if (next.routeProgress !== undefined) applyRouteProgress(next.routeProgress);
      },
      resetView: () => {
        setScale(1);
        setRotation(initialTarget ? rotationFor(initialTarget) : [-105, -15, 0]);
      },
      zoomBy: (delta) => setScale((s) => Math.max(0.6, Math.min(2, s - delta))),
    };
    return () => {
      if (handleRef.current) handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleRef, applyRouteProgress]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, rotation };
    setDragging(true);
  };
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const [y0, p0, r0] = dragStart.current.rotation;
    const nextPitch = Math.max(-80, Math.min(80, p0 - dy * 0.3));
    setRotation([y0 + dx * 0.3, nextPitch, r0]);
  };
  const endDrag = () => {
    dragStart.current = null;
    setDragging(false);
  };

  const highlightSet = useMemo(() => new Set(highlightCountryIds), [highlightCountryIds]);

  return (
    <div className={`relative select-none ${className}`} style={{ width: size, height: size }}>
      {/* wide soft halo */}
      <div
        className="pointer-events-none absolute -inset-10 opacity-0 blur-3xl dark:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(155,139,181,0.5), rgba(91,58,142,0.22) 45%, transparent 70%)" }}
      />
      {/* tighter bright rim glow, close to the sphere's edge */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 blur-xl dark:opacity-90"
        style={{ background: "radial-gradient(circle, transparent 58%, rgba(197,184,224,0.4) 68%, transparent 78%)" }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel}
        className={interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <defs>
          <radialGradient id="globe-sphere-lit" cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#454A82" />
            <stop offset="55%" stopColor="#262B54" />
            <stop offset="100%" stopColor="#141B33" />
          </radialGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={(baseScale * scale)} className="fill-[#F1EAF7] dark:fill-[url(#globe-sphere-lit)]" />
        {countries?.features.map((f, i) => {
          const id = String((f as { id?: string | number }).id ?? "");
          const isHighlighted = highlightSet.has(id);
          const d = pathGen(f) ?? undefined;
          return (
            <path
              key={`${id}-${i}`}
              d={d}
              strokeWidth={isHighlighted ? 1.2 : 0.6}
              className={
                isHighlighted
                  ? "fill-accent stroke-[#4A2F74] dark:fill-accent dark:stroke-accent-lavender dark:[filter:drop-shadow(0_0_6px_rgba(91, 58, 142,0.65))]"
                  : "fill-accent-light stroke-[#C9BAD9] dark:fill-[#2B2347] dark:stroke-[#3D3560]"
              }
            />
          );
        })}
        {routePathD && (
          <g ref={routeGroupRef} style={{ opacity: 0 }} aria-hidden="true">
            <path
              ref={routeLineRef}
              d={routePathD}
              fill="none"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeDasharray={1}
              strokeDashoffset={1}
              pathLength={1}
              className="stroke-[#8A6FB0] dark:stroke-[#C9BAD9]"
            />
            <g ref={planeRef} style={{ visibility: "hidden" }}>
              <circle r={3.5} className="fill-accent dark:fill-[#F1EAF7]" />
            </g>
          </g>
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={baseScale * scale}
          fill="none"
          strokeWidth={1}
          opacity={0.5}
          className="stroke-[#C9BAD9] dark:stroke-white/10"
        />
      </svg>

      {interactive && (
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-full border border-accent/25 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-navy-mid/90">
          <button
            aria-label="Zoom in"
            onClick={() => setScale((s) => Math.min(2, s + 0.15))}
            className="flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            +
          </button>
          <div className="h-px bg-border dark:bg-white/10" />
          <button
            aria-label="Zoom out"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
            className="flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            −
          </button>
          <div className="h-px bg-border dark:bg-white/10" />
          <button
            aria-label="Reset view"
            onClick={() => {
              setScale(1);
              setRotation(initialTarget ? rotationFor(initialTarget) : [-105, -15, 0]);
            }}
            className="flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-white/60 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
