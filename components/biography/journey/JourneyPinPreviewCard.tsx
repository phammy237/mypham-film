"use client";
import { JourneyMediaPlaceholder } from "@/components/biography/journey/JourneyMediaPlaceholder";

/**
 * The compact, default state for any active location (Hanoi or U.S.) — title, one featured image,
 * 2-3 lines of dedicated preview copy, and a "Learn More" opt-in into the full expanded story.
 * Shared between Hanoi and U.S. panels since both pin data shapes carry the same
 * `preview: {title, description}` + `image` fields (see HanoiJourneyPin/USJourneyPin) — no new data
 * needed. Purely presentational: the caller owns storyMode state and the stable, ref'd wrapper this
 * renders inside (so the scroll-driven opacity/transform that decides "is this location on screen
 * at all" never remounts when preview/expanded toggles). A teaser, not a mini article — kept
 * visually light/tight on purpose.
 */
export function JourneyPinPreviewCard({
  number,
  title,
  description,
  image,
  mediaPlaceholder,
  metaLabel,
  index,
  total,
  loadMedia,
  onLearnMore,
  onPrev,
  onNext,
}: {
  number: number;
  title: string;
  description: string;
  image?: string;
  /** shown in the image slot instead, only when `image` is absent — see JourneyMediaPlaceholder */
  mediaPlaceholder?: { eyebrow: string; description: string };
  metaLabel: string;
  index: number;
  total: number;
  loadMedia: boolean;
  onLearnMore: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="journey-preview-content">
      <div className="flex items-start gap-4">
        <span className="journey-preview-number">
          {String(number).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-[#7260B6] dark:text-[#BBA6F5]">{metaLabel}</p>
          <h2 className="journey-preview-title font-display">{title}</h2>
        </div>
      </div>

      {image ? (
        loadMedia ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="journey-preview-media object-cover"
            loading="lazy"
          />
        ) : (
          <div className="journey-preview-media bg-[#F1EFF7] dark:bg-white/[0.04]" />
        )
      ) : mediaPlaceholder ? (
        <JourneyMediaPlaceholder
          number={number}
          title={title}
          eyebrow={mediaPlaceholder.eyebrow}
          description={mediaPlaceholder.description}
          className="journey-preview-media"
        />
      ) : null}

      <p className="journey-preview-description">{description}</p>

      <button
        type="button"
        onClick={onLearnMore}
        className="journey-story-link mt-6 flex w-fit items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]"
      >
        Read the story
        <span aria-hidden="true">→</span>
      </button>

      <div className="journey-preview-pagination">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous location"
          className="journey-location-arrow"
        >
          ←
        </button>
        <span className="font-mono text-[10px] tracking-[0.18em] text-[#626782] dark:text-[#D2CAE6]">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next location"
          className="journey-location-arrow"
        >
          →
        </button>
      </div>
    </div>
  );
}
