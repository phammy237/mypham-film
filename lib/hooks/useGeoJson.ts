"use client";
import { useEffect, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";

export function useGeoJson(url: string | undefined) {
  const [data, setData] = useState<FeatureCollection<Geometry> | null>(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }
    let cancelled = false;
    fetch(url)
      .then((res) => res.json())
      .then((json: FeatureCollection<Geometry>) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

  return data;
}
