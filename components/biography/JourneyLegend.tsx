export function JourneyLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-4 rounded-full border border-border bg-white/90 px-4 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-navy-mid/90 ${className}`}>
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-surface dark:text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        Active
      </span>
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-surface dark:text-white">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Completed
      </span>
      <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted dark:text-white/50">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-accent/50" />
        Unvisited
      </span>
    </div>
  );
}
