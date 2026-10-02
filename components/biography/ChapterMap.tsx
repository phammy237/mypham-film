"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry, Point } from "geojson";
import type { Chapter, StoryPin } from "@/data/biography/biography";
import { MapPin, type PinStatus } from "@/components/biography/MapPin";
import { RoutePath } from "@/components/biography/RoutePath";
import { MapBackdrop } from "@/components/biography/MapBackdrop";
import { useGeoJson } from "@/lib/hooks/useGeoJson";

const MAP_WIDTH = 640;
const MAP_HEIGHT = 560;
const MARGIN = 56;

/**
 * Frames the projection on the pins themselves (not the full river extent) so
 * the stops spread naturally across the map; the river is projected through
 * that same transform and simply crosses whatever portion of the frame it
 * geographically does — same as how a real map would show it at this zoom.
 */
function useProjectedGeo(chapter: Chapter, backdrop: FeatureCollection<Geometry> | null) {
  return useMemo(() => {
    const geoPins = chapter.pins.filter((p): p is StoryPin & { geo: NonNullable<StoryPin["geo"]> } => !!p.geo);
    if (geoPins.length === 0) return null;

    const pinFeatureCollection: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: geoPins.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: { type: "Point", coordinates: [p.geo.lon, p.geo.lat] },
      })),
    };

    const projection = geoMercator().fitExtent(
      [
        [MARGIN, MARGIN],
        [MAP_WIDTH - MARGIN, MAP_HEIGHT - MARGIN],
      ],
      pinFeatureCollection
    );

    const riverPathD = backdrop ? geoPath(projection)(backdrop.features[0]) : undefined;

    const pinPositions = new Map<string, { x: number; y: number }>();
    for (const p of geoPins) {
      const projected = projection([p.geo.lon, p.geo.lat]);
      if (projected) {
        pinPositions.set(p.id, { x: (projected[0] / MAP_WIDTH) * 100, y: (projected[1] / MAP_HEIGHT) * 100 });
      }
    }

    return { riverPathD, pinPositions };
  }, [chapter, backdrop]);
}

export function ChapterMap({
  chapter,
  completedPinIds,
  activePinId,
  onSelectPin,
}: {
  chapter: Chapter;
  completedPinIds: string[];
  activePinId: string | null;
  onSelectPin: (pinId: string) => void;
}) {
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const backdropData = useGeoJson(chapter.mapBackdropData);
  const projected = useProjectedGeo(chapter, backdropData);

  const statusFor = (pinId: string): PinStatus => {
    if (completedPinIds.includes(pinId)) return "completed";
    if (pinId === activePinId || pinId === hoveredPinId) return "active";
    return "unvisited";
  };

  const pinPosition = (pin: StoryPin) => projected?.pinPositions.get(pin.id) ?? { x: pin.x, y: pin.y };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-base dark:border-white/10 dark:bg-navy" style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}>
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-0 blur-3xl dark:opacity-100" style={{ background: "radial-gradient(circle, rgba(65,103,136,0.22), transparent 70%)" }} />
      <MapBackdrop width={MAP_WIDTH} height={MAP_HEIGHT} riverPathD={projected?.riverPathD} />
      <div className="absolute left-6 top-6 md:left-8 md:top-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted dark:text-white/40">{chapter.mapEyebrow}</p>
        <h2 className="heading mt-1 text-xl">{chapter.mapLabel}</h2>
      </div>

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <RoutePath points={chapter.pins.map((p) => pinPosition(p))} width={MAP_WIDTH} height={MAP_HEIGHT} />
        {chapter.pins.map((pin) => {
          const pos = pinPosition(pin);
          return (
            <div
              key={pin.id}
              onMouseEnter={() => setHoveredPinId(pin.id)}
              onMouseLeave={() => setHoveredPinId(null)}
              className="contents"
            >
              <MapPin
                number={pin.number}
                x={pos.x}
                y={pos.y}
                status={statusFor(pin.id)}
                label={`Stop ${pin.number}: ${pin.title}`}
                onClick={() => onSelectPin(pin.id)}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
