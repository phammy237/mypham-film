"use client";

/**
 * A designed stand-in for a location with no real photo yet — never a borrowed photo from another
 * story, and never a broken-image icon. Renders in the exact same slot real media would (preview
 * card image, modal carousel area), so callers control sizing/aspect ratio/radius via `className`;
 * this component only owns its own internal content and background/border treatment.
 */
export function JourneyMediaPlaceholder({
  number,
  title,
  eyebrow,
  description,
  className = "",
}: {
  number: number;
  title: string;
  eyebrow: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 border border-dashed border-journey-ink/40 bg-card px-6 text-center dark:border-journey-glow/40 dark:bg-journey-paper/10 ${className}`}
    >
      <span className="font-mono text-[11px] text-accent dark:text-journey-glow/60">{String(number).padStart(2, "0")}</span>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent dark:text-journey-glow/70">{eyebrow}</p>
      <p className="font-display text-base leading-tight text-surface/85 dark:text-journey-paper">{title}</p>
      {description && (
        <p className="max-w-[240px] font-body text-xs leading-relaxed text-muted dark:text-journey-muted-dark">{description}</p>
      )}
    </div>
  );
}
