"use client";
import { ModalShell } from "@/components/ui/ModalShell";
import { ImagePlaceholder } from "@/components/biography/ImagePlaceholder";
import { StorySection } from "@/components/biography/StorySection";
import type { USJourneyPin } from "@/data/biography/usJourney";

/**
 * Multi-section expanded photo story for a U.S. location — the richer,
 * varied-layout counterpart to ChapterStoryModal's flat backstory paragraphs.
 * Kept as a separate component rather than retrofitting ChapterStoryModal,
 * since the two chapters' story shapes genuinely differ.
 */
export function ExpandedStory({
  pin,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  pin: USJourneyPin;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-3xl"
      panelClassName="bg-white border border-border dark:bg-navy dark:border-white/10"
      closeButtonClassName="bg-black/5 text-surface/70 hover:bg-black/10 hover:text-surface dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-white"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {pin.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pin.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder bare className="h-full w-full bg-accent-light/40 dark:bg-white/[0.03]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm font-medium text-white">
            {String(pin.number).padStart(2, "0")}
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80">
            {pin.subtitle} <span className="text-white/50">· {pin.yearRange}</span>
          </p>
        </div>

        {/* prev/next between locations, top-left so it doesn't collide with ModalShell's close button */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous location"
            onClick={onPrev}
            disabled={!canPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:text-white/80"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next location"
            onClick={onNext}
            disabled={!canNext}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:text-white/80"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 px-6 pt-6 md:px-8 md:pt-8">
        <div>
          <h2 className="heading text-2xl md:text-3xl">{pin.preview.title}</h2>
          <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-muted dark:text-white/40">
            United States · {pin.yearRange}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted dark:text-white/40">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div className="px-6 pb-6 md:px-8 md:pb-8">
        {pin.storySections.map((section, i) => (
          <StorySection key={section.id} section={section} index={i} />
        ))}

        <div className="mt-2 border-t border-border pt-6 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent transition-colors hover:text-accent/80"
          >
            <span aria-hidden="true">←</span> Return to U.S. map
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
