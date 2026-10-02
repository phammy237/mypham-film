"use client";
import { motion, useReducedMotion } from "framer-motion";
import { notYetInterludeCopy } from "@/data/biography/hanoiJourney";

/** A handful of faint arcs that curve outward and stop short — repeated attempts that didn't land. */
function AttemptArcs({ reducedMotion }: { reducedMotion: boolean }) {
  const arcs = [
    { d: "M 60 120 Q 220 40, 380 90", length: 0.55, delay: 0 },
    { d: "M 60 150 Q 240 110, 430 150", length: 0.7, delay: 0.3 },
    { d: "M 60 180 Q 230 190, 470 210", length: 0.85, delay: 0.6 },
  ];
  return (
    <svg viewBox="0 0 520 260" className="h-full w-full" aria-hidden="true">
      {/* five small dots: the completed Hanoi chapter, now shrunk in the distance */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={40 + i * 6} cy={140 + (i % 2 === 0 ? -8 : 8)} r={3} className="fill-accent/50" />
      ))}
      {arcs.map((arc, i) => (
        <motion.path
          key={i}
          d={arc.d}
          fill="none"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray="1 6"
          className="stroke-accent/40"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: arc.length, opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.6, delay: arc.delay, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

export function NotYetInterlude({ onCrossOcean }: { onCrossOcean: () => void }) {
  const reducedMotion = !!useReducedMotion();

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border bg-[#FEFDFB] px-6 py-16 shadow-sm dark:border-white/10 dark:bg-navy-deep sm:px-10 md:py-24"
      aria-label="Interlude: the years before leaving Hanoi"
    >
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-0 blur-3xl dark:opacity-100"
        style={{ background: "radial-gradient(circle, rgba(65,103,136,0.22), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full opacity-40 blur-3xl dark:opacity-60"
        style={{ background: "radial-gradient(circle, rgba(167,163,153,0.25), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-2xl">
        <div className="h-48 w-full max-w-[420px] opacity-80 sm:h-56">
          <AttemptArcs reducedMotion={reducedMotion} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Interlude</p>
          <h2 className="heading mt-3 text-3xl leading-tight md:text-4xl">
            {notYetInterludeCopy.heading}
          </h2>
          <p className="body-copy mt-4 max-w-xl text-base leading-relaxed dark:text-white/60">
            {notYetInterludeCopy.paragraph}
          </p>
        </motion.div>

        {/* spacer so the resolution genuinely requires a bit of scroll to reach */}
        <div className="h-[70vh] min-h-[420px]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.55 }}
        >
          <p className="heading text-2xl italic md:text-3xl">
            {notYetInterludeCopy.resolution}
          </p>
          <button
            onClick={onCrossOcean}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-accent/90"
          >
            {notYetInterludeCopy.cta}
            <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
