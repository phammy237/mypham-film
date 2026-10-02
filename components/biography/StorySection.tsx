"use client";
import { StoryMedia } from "@/components/biography/StoryMedia";
import type { StorySection as StorySectionData } from "@/data/biography/usJourney";

/**
 * One editorial "moment" inside a location's expanded story. `layoutVariant` is a pacing/emphasis
 * hint for the shared StoryMedia system (see StoryMedia.tsx) rather than a fixed image-slot count —
 * a section renders gracefully whether it has 0, 1, 2, or many images.
 */
export function StorySection({
  section,
  index,
  loadMedia = true,
}: {
  section: StorySectionData;
  index: number;
  loadMedia?: boolean;
}) {
  return (
    <div className="border-t border-border py-8 first:border-t-0 first:pt-0 dark:border-white/10 md:py-10">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-accent/60">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="heading text-xl md:text-2xl">{section.heading}</h3>
      </div>
      <div className="mt-3 flex max-w-2xl flex-col gap-3">
        {section.body.map((paragraph, i) => (
          <p key={i} className="body-copy text-sm leading-relaxed dark:text-white/60">
            {paragraph}
          </p>
        ))}
      </div>

      {section.images.length > 0 && (
        <div className="mt-6">
          <StoryMedia
            images={section.images}
            captions={section.captions}
            alt={section.heading}
            variant={section.layoutVariant}
            loadMedia={loadMedia}
          />
        </div>
      )}
    </div>
  );
}
