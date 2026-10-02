"use client";
import { motion } from "framer-motion";

const DEFAULT_NAV_BUTTON_CLASS =
  "w-7 h-7 rounded-full bg-black/20 dark:bg-white/10 border border-black/30 dark:border-white/20 flex items-center justify-center text-white/80 hover:bg-black/40 dark:hover:bg-white/20 hover:text-white transition-colors text-xs";

export function HeroNavDots({
  count,
  idx,
  paused,
  durationMs,
  onPrev,
  onNext,
  onGoTo,
  navButtonClass = DEFAULT_NAV_BUTTON_CLASS,
}: {
  count: number;
  idx: number;
  paused: boolean;
  durationMs: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (i: number) => void;
  navButtonClass?: string;
}) {
  return (
    <>
      <div className="absolute bottom-4 right-[5vw] flex items-center gap-3">
        <button onClick={onPrev} className={navButtonClass}>‹</button>
        {Array.from({ length: count }).map((_, i) => (
          <button key={i} onClick={() => onGoTo(i)}>
            <div className={`rounded-full transition-all duration-300 ${i === idx ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`} />
          </button>
        ))}
        <button onClick={onNext} className={navButtonClass}>›</button>
      </div>

      {!paused && count > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <motion.div key={idx} className="h-full bg-accent" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: durationMs / 1000, ease: "linear" }} />
        </div>
      )}
    </>
  );
}
