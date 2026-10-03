"use client";
import { useEffect, useState } from "react";
import { ModalShell } from "@/components/ui/ModalShell";
import { ImagePlaceholder } from "@/components/biography/ImagePlaceholder";
import type { HanoiJourneyPin } from "@/data/biography/hanoiJourney";

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

function HeroSlideshow({ pin }: { pin: HanoiJourneyPin }) {
  const slides = pin.gallery && pin.gallery.length > 0 ? pin.gallery : pin.image ? [pin.image] : [];
  const [idx, setIdx] = useState(0);
  const multi = slides.length > 1;

  // reset to the first slide whenever the chapter changes (this component stays mounted across prev/next)
  useEffect(() => setIdx(0), [pin.id]);

  if (slides.length === 0) {
    return <ImagePlaceholder bare caption="No photos yet" className="h-full w-full" />;
  }

  return (
    <>
      {isVideo(slides[idx]) ? (
        <video src={slides[idx]} className="h-full w-full object-cover" controls playsInline />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={slides[idx]} alt="" className="h-full w-full object-cover" />
      )}
      {multi && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => setIdx((i) => (i + 1) % slides.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white"
          >
            ›
          </button>
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {slides.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-card/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function ChapterStoryModal({
  pin,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  pin: HanoiJourneyPin;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const hasMedia = !!pin.gallery && pin.gallery.length > 0;
  const [tab, setTab] = useState<"overview" | "media">("overview");

  // reset to Overview whenever the chapter changes (this component stays mounted across prev/next)
  useEffect(() => setTab("overview"), [pin.id]);

  return (
    <ModalShell
      onClose={onClose}
      maxWidth="max-w-2xl"
      panelClassName="bg-film-cream border border-border dark:bg-film-black dark:border-journey-paper/30"
      closeButtonClassName="bg-black/5 text-surface/70 hover:bg-black/10 hover:text-surface dark:bg-journey-paper/10 dark:text-journey-paper dark:hover:bg-white/20 dark:hover:text-journey-paper"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <HeroSlideshow pin={pin} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-sm font-medium text-white">
            {String(pin.number).padStart(2, "0")}
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/80">
            {pin.subtitle} <span className="text-white/50">· Ages {pin.ageRange}</span>
          </p>
        </div>

        {/* prev/next between chapters, top-left so it doesn't collide with ModalShell's close button */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous chapter"
            onClick={onPrev}
            disabled={!canPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:text-white/80"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next chapter"
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
          <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-muted dark:text-journey-muted-dark">
            Hanoi · Ages {pin.ageRange}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted dark:text-journey-muted-dark">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {hasMedia && (
        <div className="mt-4 flex gap-1 border-b border-border px-6 dark:border-journey-paper/30 md:px-8">
          {(["overview", "media"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                tab === t ? "border-b-2 border-accent text-accent" : "text-muted hover:text-surface dark:text-journey-muted-dark dark:hover:text-journey-paper"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {tab === "overview" && (
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4">
            {pin.backstory.map((paragraph, i) => (
              <p key={i} className="body-copy text-sm leading-relaxed dark:text-journey-paper">
                {paragraph}
              </p>
            ))}
          </div>

          {pin.subsections && (
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 dark:border-journey-paper/30 sm:grid-cols-4">
              {pin.subsections.map((s) => (
                <div key={s.title}>
                  <p className="font-mono text-xs uppercase tracking-wider text-accent">{s.title}</p>
                  <p className="body-copy mt-1 text-xs leading-relaxed dark:text-journey-muted-dark">{s.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "media" && hasMedia && (
        <div className="grid grid-cols-2 gap-2 p-6 sm:grid-cols-3 md:p-8">
          {pin.gallery!.map((src) =>
            isVideo(src) ? (
              <video key={src} src={src} className="aspect-video w-full rounded-lg object-cover" controls playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" className="aspect-video w-full rounded-lg object-cover" />
            )
          )}
        </div>
      )}
    </ModalShell>
  );
}
