"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { JourneyMediaPlaceholder } from "@/components/biography/journey/JourneyMediaPlaceholder";

/** One block of the Overview tab — an optional short mono/purple section label (e.g. a Rivermont/
 *  Gainesville storySection's own heading) followed by its paragraphs. `label: null` for content
 *  with no natural sub-heading (a Hanoi pin's plain backstory). */
export type JourneyStoryOverviewSection = { label: string | null; paragraphs: string[] };

export type JourneyStoryModalData = {
  /** used only to reset internal tab/media-index state when the underlying location changes */
  id: string;
  number: number;
  title: string;
  theme: string;
  metaLabel: string;
  gallery: string[];
  /** shown in the media area instead, only when `gallery` is empty — see JourneyMediaPlaceholder */
  mediaPlaceholder?: { eyebrow: string; description: string } | null;
  overviewSections: JourneyStoryOverviewSection[];
  index: number;
  total: number;
};

// fade-in duration lives only in the literal "duration-[220ms]" Tailwind class below (Tailwind's
// JIT scanner needs the literal text, not an interpolated constant) — this one still needs a real
// JS value since it drives the setTimeout before swapping content.
const CONTENT_FADE_OUT_MS = 160;

/**
 * The full story — a completely separate popup layer from JourneyPinPreviewCard, never a
 * resized/morphed version of it. Two-column editorial layout on desktop (persistent media carousel
 * left, tabbed Overview/Media story content right); a single full-screen stacked view on mobile.
 * One shared instance for the whole page (Hanoi and U.S. alike) — JourneyStoryLayer normalizes
 * whichever location is active into `data` and toggles `open`; this component owns none of the
 * journey's scroll/camera/pin state, only its own internal tab, carousel-image selection, and the
 * content-swap crossfade below.
 *
 * Previous/Next Story page directly between neighboring locations' full stories WITHOUT closing —
 * "a storybook/slideshow," never a flash back to the compact preview card. The modal shell/backdrop
 * stay mounted the whole time; only the inner media + story content crossfade when `data.id`
 * changes while `open` stays true. The map camera/route/active-pin move in the background through
 * the same onNavigatePin path every other navigation in this page already uses — JourneyStoryLayer
 * owns that synchronization, this component only reacts to whatever `data` it's given.
 */
export function JourneyStoryModal({
  data,
  open,
  reducedMotion,
  onClose,
  onPrevStory,
  onNextStory,
  onFinishChapter,
}: {
  data: JourneyStoryModalData | null;
  open: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  /** disabled (not called) when data.index === 0 — no wraparound across chapters */
  onPrevStory: () => void;
  /** disabled (not called) when data is the last of its own chapter — see onFinishChapter instead */
  onNextStory: () => void;
  /** the last location in a chapter replaces "Next Story" with "Finish Chapter" — closes the modal
   *  and advances to that chapter's completion state, never wraps back to that chapter's first pin */
  onFinishChapter: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "media">("overview");
  const [mediaIndex, setMediaIndex] = useState(0);
  const [contentPhase, setContentPhase] = useState<"visible" | "fading">("visible");
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const prevIdRef = useRef<string | undefined>(undefined);

  // Reset to a clean state whenever the underlying location changes. Two cases: (a) the modal was
  // already open and this is a Previous/Next Story page — crossfade the content out, swap, fade
  // back in, matching the "storybook" pacing from the spec; (b) a fresh open (or the very first
  // render) — no fade, just land in the correct state immediately.
  useEffect(() => {
    if (!data) return;
    const isInPlaceSwap = open && prevIdRef.current !== undefined && prevIdRef.current !== data.id;
    prevIdRef.current = data.id;

    const reset = () => {
      setTab("overview");
      setMediaIndex(0);
      scrollAreaRef.current?.scrollTo({ top: 0, behavior: "auto" });
    };

    if (!isInPlaceSwap || reducedMotion) {
      reset();
      setContentPhase("visible");
      return;
    }

    setContentPhase("fading");
    const fadeOutTimer = setTimeout(() => {
      reset();
      setContentPhase("visible");
    }, CONTENT_FADE_OUT_MS);
    return () => clearTimeout(fadeOutTimer);
    // intentionally keyed on data?.id (the semantic "did the location change" signal), not the
    // whole `data` object — modalDataForActiveIndex builds a fresh object every render, and keying
    // on the object itself would re-fire this reset/fade effect on every render, not just real
    // location changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, open, reducedMotion]);

  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // the site-wide chat bubble (components/ui/ChatBot.tsx) lives outside this component's tree
    // (mounted once in the root layout) — a body class is the simplest way to hide it without
    // prop-drilling modal state across an unrelated part of the app; see globals.css
    document.body.classList.add("journey-story-modal-open");
    const focusTimer = setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("journey-story-modal-open");
      lastFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!data || typeof document === "undefined") return null;
  const gallery = data.gallery;
  const hasGallery = gallery.length > 0;
  const activeMedia = gallery[mediaIndex] ?? gallery[0];
  const isFirst = data.index === 0;
  const isLast = data.index === data.total - 1;
  // literal class strings, not interpolated — Tailwind's JIT scanner needs to see the exact
  // "duration-[160ms]"/"duration-[220ms]" text statically to generate the matching CSS
  const contentFadeClass = reducedMotion
    ? ""
    : contentPhase === "fading"
      ? "opacity-0 transition-opacity duration-[160ms]"
      : "opacity-100 transition-opacity duration-[220ms]";

  return createPortal(
    <div
      ref={(node) => { if (node) node.inert = !open; }}
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(14,14,12,0.62)] backdrop-blur-[8px] dark:bg-[rgba(14,14,12,0.62)]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
        className={`relative flex h-full w-full flex-col overflow-hidden border-[rgba(244,218,123,0.16)] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.48)] transition-all dark:bg-[rgba(24,24,21,0.97)] md:h-[min(780px,81vh)] md:w-[min(940px,78vw)] md:flex-row md:rounded-[28px] md:border ${
          reducedMotion
            ? open
              ? "opacity-100"
              : "opacity-0"
            : open
              ? "translate-y-0 scale-100 opacity-100 duration-[260ms]"
              : "translate-y-2 scale-[0.985] opacity-0 duration-150"
        }`}
      >
        {/* 44px hit target, deliberately larger than the 38px visible circle inside it — obvious to
            click without competing visually with the story title. */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close story"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center md:right-4 md:top-4"
        >
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.2)] text-white/90 transition-colors hover:bg-white/10 md:border-black/10 md:text-muted md:hover:bg-black/5 md:dark:border-[rgba(255,255,255,0.2)] md:dark:text-white/60 md:dark:hover:bg-white/10">
            <span aria-hidden="true" className="text-[17px] leading-none">
              ✕
            </span>
          </span>
        </button>
        {/* mobile-only header: "Back to Map" collapses the story and returns to the same pin's preview */}
        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-white backdrop-blur-sm md:hidden"
        >
          <span aria-hidden="true">←</span> Back to Map
        </button>

        {/* LEFT: persistent media carousel */}
        <div className={`relative flex h-[44vh] w-full shrink-0 flex-col bg-black/5 dark:bg-black/30 md:h-auto md:w-[55%] ${contentFadeClass}`}>
          <div className="relative min-h-0 flex-1">
            {hasGallery ? (
              <>
                {activeMedia && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={activeMedia}
                    src={activeMedia}
                    alt={data.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMediaIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaIndex((i) => (i + 1) % gallery.length)}
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    >
                      →
                    </button>
                    <div className="absolute bottom-4 right-4 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-sm">
                      {String(mediaIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
                    </div>
                  </>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/72 to-transparent" />
                {/* right padding reserves room for the counter badge so long theme/metaLabel text
                    truncates instead of colliding with it, most visible at full-width mobile media */}
                <div className="absolute bottom-4 left-4 right-20 flex items-center gap-2 md:right-24">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[10px] text-white">
                    {String(data.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/90">
                    {data.theme} · {data.metaLabel}
                  </span>
                </div>
              </>
            ) : data.mediaPlaceholder ? (
              <JourneyMediaPlaceholder
                number={data.number}
                title={data.title}
                eyebrow={data.mediaPlaceholder.eyebrow}
                description={data.mediaPlaceholder.description}
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent-light/40 font-mono text-xs uppercase tracking-wider text-muted dark:bg-white/[0.04] dark:text-white/30">
                No photos yet
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="journey-scrollbar hidden shrink-0 items-center gap-2 overflow-x-auto p-2 md:flex">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setMediaIndex(i)}
                  className={`h-[52px] w-[74px] shrink-0 overflow-hidden rounded-md transition-opacity ${
                    i === mediaIndex ? "opacity-100 ring-2 ring-journey-glow" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.closest("button")?.remove();
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: story content — ~55ch max on paragraphs keeps line length editorial regardless of
            exact modal width. */}
        <div className={`flex min-h-0 flex-1 flex-col ${contentFadeClass}`}>
          <div className="shrink-0 px-[30px] pt-[36px] md:px-[32px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted dark:text-white/50">
              {String(data.index + 1).padStart(2, "0")} / {String(data.total).padStart(2, "0")} · {data.metaLabel}
            </p>
            <h2 className="heading mt-2 max-w-[420px] text-[34px] leading-[1.05]">{data.title}</h2>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent dark:text-journey-glow">{data.theme}</p>
            <div className="mt-5 flex gap-5 border-b border-border dark:border-white/10">
              {(["overview", "media"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`pb-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                    tab === t
                      ? "border-b-2 border-journey-glow text-journey-glow"
                      : "border-b-2 border-transparent text-muted/70 hover:text-surface dark:text-white/45 dark:hover:text-white/70"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollAreaRef} className="journey-scrollbar min-h-0 flex-1 overflow-y-auto px-[30px] py-6 md:px-[32px]">
            {tab === "overview" ? (
              <div className="flex max-w-[54ch] flex-col gap-[26px]">
                {data.overviewSections.map((section, i) => (
                  <div key={i} className="flex flex-col gap-[20px]">
                    {section.label && (
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent dark:text-journey-glow">
                        {section.label}
                      </p>
                    )}
                    {section.paragraphs.map((p, j) => (
                      <p key={j} className="body-copy text-[17px] leading-[1.65] dark:text-[rgba(247,244,235,0.80)]">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : hasGallery ? (
              <div className="grid grid-cols-2 gap-[11px]">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      setMediaIndex(i);
                      setTab("overview");
                    }}
                    className={`aspect-[4/3] overflow-hidden rounded-[13px] transition-opacity ${
                      i === mediaIndex ? "ring-2 ring-journey-glow" : "opacity-85 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.closest("button")?.remove();
                      }}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="body-copy text-sm dark:text-white/40">
                {data.mediaPlaceholder ? "Photos for this chapter are coming soon." : "No photos yet."}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border px-[30px] py-4 dark:border-white/10 md:px-[32px]">
            <button
              type="button"
              onClick={onPrevStory}
              disabled={isFirst}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent disabled:opacity-30 disabled:hover:text-muted dark:text-white/50 dark:hover:text-journey-glow dark:disabled:hover:text-white/50"
            >
              ← Previous Story
            </button>
            <span className="font-mono text-[10px] text-muted dark:text-white/40">
              {data.index + 1} / {data.total}
            </span>
            {isLast ? (
              <button
                type="button"
                onClick={onFinishChapter}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-colors hover:text-accent/80 dark:text-journey-glow dark:hover:text-[#F4DA7B]"
              >
                Finish Chapter →
              </button>
            ) : (
              <button
                type="button"
                onClick={onNextStory}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent dark:text-white/50 dark:hover:text-journey-glow"
              >
                Next Story →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
