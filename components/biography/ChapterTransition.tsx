"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { FeatureCollection, Geometry } from "geojson";
import { GlobeHero } from "@/components/biography/GlobeHero";
import { chapters, routeArc } from "@/data/biography/biography";

const FROM = chapters[0]; // vietnam
const TO = chapters[1]; // united-states

/**
 * The connecting beat between chapters: pull back from Vietnam, arc across the Pacific,
 * and settle on the United States before handing off to that chapter's region intro.
 * Never traps the reader — always reachable via Skip, and reduced-motion jumps straight there.
 */
export function ChapterTransition({
  countries,
  onArrive,
}: {
  countries: FeatureCollection<Geometry> | null;
  onArrive: () => void;
}) {
  const [arcing, setArcing] = useState(false);
  const reducedMotion = !!useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      onArrive();
      return;
    }
    const startArc = setTimeout(() => setArcing(true), 500);
    return () => clearTimeout(startArc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <motion.section
      key="transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center gap-6 text-center"
      aria-label="Traveling from Vietnam to the United States"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Next chapter</p>
      <h2 className="heading text-3xl md:text-4xl">Across the Pacific</h2>
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted dark:text-journey-muted-dark">
        <span className={arcing ? "" : "text-accent"}>{FROM.regionLabel}</span>
        <span aria-hidden="true">→</span>
        <span className={arcing ? "text-accent" : ""}>{TO.regionLabel}</span>
      </div>

      <GlobeHero
        countries={countries}
        highlightCountryIds={arcing ? [TO.countryId] : [FROM.countryId]}
        initialTarget={FROM.globeTarget}
        focusTarget={arcing ? TO.globeTarget : null}
        markers={[
          { id: "from", position: FROM.globeTarget, label: FROM.regionLabel },
          { id: "to", position: TO.globeTarget, label: TO.regionLabel },
        ]}
        arc={routeArc}
        interactive={false}
        ambient={false}
        onFocusComplete={() => setTimeout(onArrive, 500)}
        size={440}
        ariaLabel="Globe animating from Vietnam to the United States"
      />

      <button
        type="button"
        onClick={onArrive}
        className="font-mono text-xs uppercase tracking-wider text-muted underline-offset-4 transition-colors hover:text-accent hover:underline dark:text-journey-muted-dark"
      >
        Skip →
      </button>
    </motion.section>
  );
}
