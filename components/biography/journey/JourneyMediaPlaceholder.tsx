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
      className={`flex flex-col items-center justify-center gap-2 border border-dashed border-[rgba(115,111,100,0.20)] bg-[#FBF9F5] px-6 text-center dark:border-[rgba(244,218,123,0.22)] dark:bg-[rgba(143,139,127,0.08)] ${className}`}
    >
      <span className="font-mono text-[11px] text-accent/60 dark:text-journey-glow/60">{String(number).padStart(2, "0")}</span>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent/70 dark:text-journey-glow/70">{eyebrow}</p>
      <p className="font-display text-base leading-tight text-surface/85 dark:text-white/80">{title}</p>
      {description && (
        <p className="max-w-[240px] font-body text-xs leading-relaxed text-muted/70 dark:text-white/40">{description}</p>
      )}
    </div>
  );
}
