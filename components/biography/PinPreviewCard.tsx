"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlaceholder } from "@/components/biography/ImagePlaceholder";

/** Minimal shape PinPreviewCard needs — any chapter's pin type structurally satisfies this. */
export type PreviewPin = {
  id: string;
  number: number;
  /** omit until a real photo exists; the card falls back to a placeholder block */
  image?: string;
  preview: {
    title: string;
    description: string;
  };
};

export function PinPreviewCard({
  pin,
  metaLabel,
  index,
  total,
  onLearnMore,
  onPrev,
  onNext,
  canPrev,
  canNext,
  className = "",
}: {
  pin: PreviewPin;
  /** small caption under the title, e.g. "Hanoi · Ages 6–8" or "United States · 2019" */
  metaLabel: string;
  index: number;
  total: number;
  onLearnMore: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-white/95 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-navy-mid/95 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pin.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm font-medium text-white">
              {String(pin.number).padStart(2, "0")}
            </span>
            <div>
              <h3 className="heading text-lg leading-tight">{pin.preview.title}</h3>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">{metaLabel}</p>
            </div>
          </div>
          <p className="body-copy mt-2 text-sm dark:text-white/60">{pin.preview.description}</p>

          <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-accent-light dark:bg-white/5">
            {pin.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pin.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlaceholder bare className="h-full w-full" />
            )}
          </div>

          <button
            onClick={onLearnMore}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-accent/90"
          >
            Learn more
            <span aria-hidden="true">→</span>
          </button>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 dark:border-white/10">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-accent disabled:opacity-30 disabled:hover:text-muted dark:text-white/50 dark:disabled:hover:text-white/50"
        >
          <span aria-hidden="true">←</span> Previous
        </button>
        <span className="font-mono text-xs text-surface dark:text-white/70">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-accent disabled:opacity-30 disabled:hover:text-muted dark:text-white/50 dark:disabled:hover:text-white/50"
        >
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
