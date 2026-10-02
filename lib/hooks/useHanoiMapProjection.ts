"use client";
import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Point } from "geojson";
import type { FeatureCollection as GeoFC, Geometry } from "geojson";
import type { ProjectedPin } from "@/components/biography/HanoiMap";
import { HANOI_MAP_WIDTH, HANOI_MAP_HEIGHT } from "@/components/biography/HanoiMap";
import { useGeoJson } from "@/lib/hooks/useGeoJson";

const MARGIN = 120;

type PinLike = { id: string; number: number; title: string; subtitle: string; coordinates: { lat: number; lon: number } };

/**
 * The Mercator projection HanoiMap's pins/river/lake/roads are drawn with — extracted from
 * HanoiJourneySection so both it and the journey's map stage compute pixel positions from the
 * exact same math instead of one of them re-deriving it.
 */
export function useHanoiMapProjection(pins: PinLike[]) {
  const riverData = useGeoJson("/data/hanoi-river.json");
  const lakeData = useGeoJson("/data/west-lake.json");
  const roadsData = useGeoJson("/data/hanoi-roads.json");

  return useMemo(() => {
    const pinFeatureCollection: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: pins.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: { type: "Point", coordinates: [p.coordinates.lon, p.coordinates.lat] },
      })),
    };

    const projection = geoMercator().fitExtent(
      [
        [MARGIN, MARGIN],
        [HANOI_MAP_WIDTH - MARGIN, HANOI_MAP_HEIGHT - MARGIN],
      ],
      pinFeatureCollection
    );
    const pathGen = geoPath(projection);

    const projectedPins: ProjectedPin[] = pins.map((p) => {
      const point = projection([p.coordinates.lon, p.coordinates.lat]);
      return {
        id: p.id,
        number: p.number,
        title: p.title,
        subtitle: p.subtitle,
        x: point ? (point[0] / HANOI_MAP_WIDTH) * 100 : 50,
        y: point ? (point[1] / HANOI_MAP_HEIGHT) * 100 : 50,
      };
    });

    const roadsPathD = roadsData
      ? (roadsData as GeoFC<Geometry>).features
          .map((f) => pathGen(f as never))
          .filter((d): d is string => !!d)
          .join(" ")
      : undefined;

    return {
      projectedPins,
      riverPathD: riverData ? (pathGen((riverData as GeoFC<Geometry>).features[0] as never) ?? undefined) : undefined,
      lakePathD: lakeData ? (pathGen((lakeData as GeoFC<Geometry>).features[0] as never) ?? undefined) : undefined,
      roadsPathD: roadsPathD || undefined,
    };
  }, [pins, riverData, lakeData, roadsData]);
}
