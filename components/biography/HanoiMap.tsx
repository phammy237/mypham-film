"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, type PinStatus } from "@/components/biography/MapPin";
import { RoutePath } from "@/components/biography/RoutePath";
import { PinLabel } from "@/components/biography/PinLabel";

export const HANOI_MAP_WIDTH = 1200;
export const HANOI_MAP_HEIGHT = 980;

const MIN_SCALE = 1;
const MAX_SCALE = 3;

/** Minimal shape HanoiMap needs — any chapter's pin type structurally satisfies this. */
export type ProjectedPin = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  x: number;
  y: number;
};

function clampPan(value: number, scale: number) {
  const maxOffset = ((scale - 1) / 2) * 100;
  return Math.max(-maxOffset, Math.min(maxOffset, value));
}

export function HanoiMap({
  pins,
  activePinId,
  statusFor,
  onSelectPin,
  riverPathD,
  lakePathD,
  roadsPathD,
  reducedMotion,
  progressOverride,
  settled = false,
  pinsInteractive = true,
  isPinInteractive,
}: {
  pins: ProjectedPin[];
  activePinId: string;
  statusFor: (id: string) => PinStatus;
  onSelectPin: (id: string) => void;
  riverPathD?: string;
  lakePathD?: string;
  roadsPathD?: string;
  reducedMotion: boolean;
  /** force the route to a specific completion fraction (0-1), e.g. fully lit at the end of the chapter */
  progressOverride?: number;
  /** true once the journey is complete: pulls the map back slightly and settles the route */
  settled?: boolean;
  /** false neutralizes pin/label buttons (disabled, no click) without hiding or redesigning them —
   *  for contexts like the scroll-driven journey where pin selection isn't wired up yet. Ignored
   *  for any pin covered by `isPinInteractive` below. */
  pinsInteractive?: boolean;
  /** optional per-pin override — when provided, takes precedence over `pinsInteractive` for that
   *  pin id; additive and backward compatible: omitting it preserves the existing all-or-nothing
   *  behavior exactly (every existing caller — /biography's two chapters, the Hanoi journey stage —
   *  keeps working unchanged). Lets a caller with more than one real pin (e.g. the U.S. journey's
   *  Rivermont + Gainesville) enable specific pins without an all-or-nothing toggle, with no DOM
   *  interception or CSS pointer-events hacks. */
  isPinInteractive?: (id: string) => boolean;
}) {
  const activeIndex = pins.findIndex((p) => p.id === activePinId);
  const progress = progressOverride ?? (pins.length > 1 ? activeIndex / (pins.length - 1) : 1);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; pan: { x: number; y: number } } | null>(null);

  const setClampedScale = (next: number) => {
    const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    setScale(s);
    setPan((p) => ({ x: clampPan(p.x, s), y: clampPan(p.y, s) }));
  };

  // native, non-passive wheel listener so we can preventDefault (stop page scroll while zooming the map)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (settled) return;
      e.preventDefault();
      setClampedScale(scale - e.deltaY * 0.0015);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, settled]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (settled) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, pan };
    setDragging(true);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dyPct = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    setPan({
      x: clampPan(dragStart.current.pan.x + dxPct, scale),
      y: clampPan(dragStart.current.pan.y + dyPct, scale),
    });
  };
  const endDrag = () => {
    dragStart.current = null;
    setDragging(false);
  };

  const zoomButtonClass = `flex h-8 w-8 items-center justify-center text-surface/70 hover:bg-accent-light hover:text-accent transition-colors dark:text-journey-paper dark:hover:bg-accent/25 dark:hover:text-journey-paper ${settled ? "pointer-events-none" : "pointer-events-auto"}`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-base dark:border-journey-paper/30 dark:bg-navy ${
        settled ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{ aspectRatio: `${HANOI_MAP_WIDTH} / ${HANOI_MAP_HEIGHT}` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <div
        className={`absolute inset-0 ${dragging ? "" : "transition-transform duration-200 ease-out"}`}
        style={{ transform: `translate(${pan.x}%, ${pan.y}%) scale(${scale})` }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-0 blur-3xl dark:opacity-100"
          style={{ background: "radial-gradient(circle, rgba(65,103,136,0.2), transparent 70%)" }}
        />

        {/* faint dot-grid texture so the surface reads as a map even away from the water */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="hanoi-map-grid" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" className="fill-accent-light dark:fill-journey-paper/10" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hanoi-map-grid)" />
        </svg>

        {/* real street network + water: sourced from OpenStreetMap, styled muted/editorial */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${HANOI_MAP_WIDTH} ${HANOI_MAP_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {roadsPathD && (
            <path d={roadsPathD} fill="none" strokeWidth={1} strokeLinecap="round" className="stroke-accent-light dark:stroke-journey-paper/10" />
          )}
          {lakePathD && (
            <path d={lakePathD} className="fill-film-butter/40 stroke-film-butter dark:fill-navy-mid dark:stroke-journey-violet" strokeWidth={1.2} />
          )}
          {riverPathD && (
            <path d={riverPathD} fill="none" strokeWidth={16} strokeLinecap="round" className="stroke-film-butter/40 dark:stroke-navy-mid" />
          )}
        </svg>

        <RoutePath
          points={pins.map((p) => ({ x: p.x, y: p.y }))}
          width={HANOI_MAP_WIDTH}
          height={HANOI_MAP_HEIGHT}
          progress={progress}
          reducedMotion={reducedMotion}
        />

        {pins.map((pin) => {
          const side = pin.x > 45 ? "left" : "right";
          const status = statusFor(pin.id);
          const interactive = isPinInteractive ? isPinInteractive(pin.id) : pinsInteractive;
          return (
            <div key={pin.id}>
              <PinLabel
                title={pin.title}
                subtitle={pin.subtitle}
                x={pin.x}
                y={pin.y}
                side={side}
                active={pin.id === activePinId}
                onClick={() => onSelectPin(pin.id)}
                disabled={!interactive}
              />
              <MapPin
                number={pin.number}
                x={pin.x}
                y={pin.y}
                status={status}
                label={`Stop ${pin.number}: ${pin.title}`}
                onClick={() => onSelectPin(pin.id)}
                reducedMotion={reducedMotion}
                disabled={!interactive}
              />
            </div>
          );
        })}
      </div>

      <div
        className={`pointer-events-none absolute bottom-4 right-4 z-30 flex flex-col overflow-hidden rounded-full border border-accent/60 bg-card/90 shadow-sm backdrop-blur transition-opacity duration-300 dark:border-journey-paper/30 dark:bg-navy-mid/90 ${
          settled ? "opacity-0" : "opacity-100"
        }`}
      >
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setClampedScale(scale + 0.4)}
          className={zoomButtonClass}
        >
          +
        </button>
        <div className="h-px bg-border dark:bg-journey-paper/10" />
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setClampedScale(scale - 0.4)}
          className={zoomButtonClass}
        >
          −
        </button>
        <div className="h-px bg-border dark:bg-journey-paper/10" />
        <button
          type="button"
          aria-label="Reset view"
          onClick={() => {
            setScale(1);
            setPan({ x: 0, y: 0 });
          }}
          className={zoomButtonClass}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
