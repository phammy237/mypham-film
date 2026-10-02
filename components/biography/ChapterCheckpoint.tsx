"use client";
import { motion } from "framer-motion";
import { hanoiCheckpointCopy } from "@/data/biography/hanoiJourney";

export function ChapterCheckpoint({
  onContinue,
  onStay,
  onSkip,
  className = "",
}: {
  onContinue: () => void;
  onStay: () => void;
  onSkip: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border border-border bg-white/95 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-navy-mid/95 ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4v16" />
          <path d="M4 5h13l-2.5 3.5L17 12H4" />
        </svg>
      </span>

      <h3 className="heading mt-4 text-xl leading-tight">{hanoiCheckpointCopy.heading}</h3>
      <p className="body-copy mt-2 text-sm leading-relaxed dark:text-white/60">{hanoiCheckpointCopy.paragraph}</p>

      <div className="mt-5 flex flex-col gap-2.5">
        <button
          onClick={onContinue}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-accent/90"
        >
          {hanoiCheckpointCopy.continueCta}
          <span aria-hidden="true">→</span>
        </button>
        <button
          onClick={onStay}
          className="rounded-lg border border-border px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-surface transition-colors hover:border-accent hover:text-accent dark:border-white/15 dark:text-white/80 dark:hover:border-accent"
        >
          {hanoiCheckpointCopy.stayCta}
        </button>
      </div>

      <button
        onClick={onSkip}
        className="mt-4 font-mono text-[11px] text-muted underline-offset-4 transition-colors hover:text-accent hover:underline dark:text-white/40"
      >
        {hanoiCheckpointCopy.skipCta}
      </button>
    </motion.div>
  );
}
