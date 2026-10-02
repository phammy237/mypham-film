export function JourneyProgress({ index, total }: { index: number; total: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-4 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-navy-mid/90">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
        <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H12v18H5.5A1.5 1.5 0 0 1 4 19.5v-15Z" />
        <path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H12v18h6.5a1.5 1.5 0 0 0 1.5-1.5v-15Z" />
      </svg>
      <span className="font-mono text-xs tracking-wider text-surface dark:text-white">
        {String(index + 1).padStart(2, "0")} <span className="text-muted dark:text-white/40">/ {String(total).padStart(2, "0")} chapters</span>
      </span>
    </div>
  );
}
