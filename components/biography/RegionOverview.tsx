"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import type { Chapter } from "@/data/biography/biography";
import { findCountry } from "@/lib/hooks/useWorldTopology";

export function RegionOverview({
  chapter,
  countries,
  onExplore,
  onSkip,
}: {
  chapter: Chapter;
  countries: FeatureCollection<Geometry> | null;
  onExplore: () => void;
  onSkip?: () => void;
}) {
  const width = 640;
  const height = 560;

  const countryFeature = useMemo(() => findCountry(countries, chapter.countryId), [countries, chapter.countryId]);

  const { path, markerPoint } = useMemo(() => {
    if (!countryFeature) return { path: null, markerPoint: null };
    const projection = geoMercator().fitExtent(
      [
        [48, 48],
        [width - 48, height - 48],
      ],
      countryFeature as never
    );
    const gen = geoPath(projection);
    const point = projection([chapter.globeTarget.lon, chapter.globeTarget.lat]);
    return { path: gen(countryFeature as never), markerPoint: point };
  }, [countryFeature, chapter.globeTarget]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-base dark:border-white/10 dark:bg-navy" style={{ minHeight: height }}>
      <div
        className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full opacity-0 blur-3xl dark:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(65,103,136,0.2), transparent 70%)" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Map of ${chapter.regionLabel}`}>
          {path && (
            <motion.path
              d={path}
              strokeWidth={1.4}
              className="fill-accent-light stroke-accent dark:fill-[#3D3B35] dark:stroke-accent-lavender"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "center" }}
            />
          )}
          {markerPoint && (
            <g transform={`translate(${markerPoint[0]}, ${markerPoint[1]})`}>
              <motion.circle
                r={16}
                fill="#416788"
                opacity={0.25}
                animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <circle r={6} fill="#416788" strokeWidth={2} className="stroke-white dark:stroke-navy dark:[filter:drop-shadow(0_0_5px_rgba(65,103,136,0.8))]" />
            </g>
          )}
        </svg>
      </div>

      <p className="absolute right-6 top-8 font-mono text-xs uppercase tracking-[0.35em] text-accent md:right-10 md:top-10">
        {chapter.regionLabel}
      </p>

      <motion.div
        className="absolute left-4 top-6 w-[calc(100%-2rem)] max-w-[360px] rounded-2xl border border-border bg-white/95 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-navy-mid/90 md:left-8 md:top-8"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted dark:text-white/40">{chapter.eyebrow}</p>
        <h2 className="heading mt-2 text-2xl">{chapter.title}</h2>
        {chapter.tagline && (
          <p className="mt-2 font-body text-sm italic leading-relaxed text-surface/80 dark:text-white/70">{chapter.tagline}</p>
        )}
        <p className="body-copy mt-3 text-sm leading-relaxed dark:text-white/60">{chapter.intro}</p>
        {chapter.transitionLine && (
          <p className="mt-3 font-mono text-xs uppercase tracking-wider text-accent">{chapter.transitionLine}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-accent/90"
          >
            {chapter.exploreCta}
            <span aria-hidden="true">→</span>
          </button>
          {chapter.skipCta && onSkip && (
            <button
              onClick={onSkip}
              className="font-mono text-xs uppercase tracking-wider text-muted underline-offset-4 transition-colors hover:text-accent hover:underline dark:text-white/40"
            >
              {chapter.skipCta}
            </button>
          )}
        </div>

        {chapter.instruction && (
          <p className="mt-4 font-mono text-[11px] text-muted/70 dark:text-white/35">{chapter.instruction}</p>
        )}
      </motion.div>
    </div>
  );
}
