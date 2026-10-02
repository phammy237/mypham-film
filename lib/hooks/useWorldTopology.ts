"use client";
import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";

const DATA_URL = "/data/countries-110m.json";

export function useWorldTopology() {
  const [countries, setCountries] = useState<FeatureCollection<Geometry> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_URL)
      .then((res) => res.json())
      .then((topology: Topology) => {
        if (cancelled) return;
        const collection = feature(
          topology,
          topology.objects.countries as GeometryCollection
        ) as unknown as FeatureCollection<Geometry>;
        setCountries(collection);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return countries;
}

export function findCountry(countries: FeatureCollection<Geometry> | null, id: string) {
  if (!countries) return null;
  return countries.features.find((f) => String((f as { id?: string | number }).id ?? "") === id) ?? null;
}
