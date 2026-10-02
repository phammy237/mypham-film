"use client";
import { Component, type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { JourneyMapCanvasProps } from "@/components/biography/journey/JourneyMapCanvas";
import { JourneyMapFallback } from "@/components/biography/journey/JourneyMapFallback";

// Isolated + code-split: maplibre-gl never ships in the initial server-rendered biography bundle,
// and never runs during SSR (it touches `window` at import time) — mirrors GlobeHero.tsx's exact
// pattern for SatelliteGlobeCanvas.
const JourneyMapCanvas = dynamic(
  () => import("@/components/biography/journey/JourneyMapCanvas").then((m) => m.JourneyMapCanvas),
  { ssr: false }
);

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

class MapErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Journey map failed to render — falling back to the static itinerary.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The persistent map's WebGL-feature-detect + error-boundary + fallback wrapper — the same
 * three-part pattern GlobeHero.tsx already establishes for the old Three.js globe, applied here to
 * the new MapLibre canvas.
 */
export function JourneyMapStage(props: JourneyMapCanvasProps) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  if (webglOk === false) {
    return <JourneyMapFallback />;
  }

  return (
    <MapErrorBoundary fallback={<JourneyMapFallback />}>
      <JourneyMapCanvas {...props} />
    </MapErrorBoundary>
  );
}
