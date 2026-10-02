"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { computeHanoiCameraFrame, deriveStoryWeights } from "@/lib/biography/hanoiCamera";
import { deriveRivermontStoryWeight, deriveGainesvilleStoryWeight, deriveUsMemoriesWeight } from "@/lib/biography/usCamera";
import { hanoiJourneyPins } from "@/data/biography/hanoiJourney";
import { usJourneyPins, usMemoryMarkers } from "@/data/biography/usJourney";
import { JourneyPinStoryPanel } from "@/components/biography/journey/JourneyPinStoryPanel";
import { JourneyUsStoryPanel } from "@/components/biography/journey/JourneyUsStoryPanel";
import { JourneyUsMemoriesPanel } from "@/components/biography/journey/JourneyUsMemoriesPanel";
import { JourneyStoryModal, type JourneyStoryModalData } from "@/components/biography/journey/JourneyStoryModal";
import { isVideo } from "@/components/biography/StoryMedia";

export type JourneyStoryLayerHandle = {
  /** ref-driven, safe to call every scroll tick — no React state involved */
  update: (progress: number) => void;
};

/** restrained entrance slide for the story panels — skipped entirely under reduced motion */
const STORY_SLIDE_PX = 24;
/** only the active location ± this many neighbors actually load real media — matches the existing
 *  "don't eagerly load every image" rule from the Hanoi panel's own original design */
const LOAD_MEDIA_NEIGHBOR_RADIUS = 1;

/** combined index across the 7 numbered locations: Hanoi pins 0-4, Rivermont 5, Gainesville 6 */
const RIVERMONT_INDEX = 5;
const GAINESVILLE_INDEX = 6;

const RIVERMONT_PIN_DATA = usJourneyPins[0];
const GAINESVILLE_PIN_DATA = usJourneyPins[1];

/** The story modal's carousel/thumbnail strip only ever renders `<img>` tags — a handful of pins'
 *  `gallery` arrays (see data/hanoiJourney.ts) mix in real .mp4 clips alongside photos, which is
 *  fine for a future video-aware viewer but renders as a broken-image icon through a plain <img>
 *  today. Filtering out videos here (reusing StoryMedia's own isVideo check, not a second/inverse
 *  extension list that could drift out of sync with it) keeps the modal only ever showing "actual
 *  valid media entries," per the polish pass's own rule. */
function onlyImages(paths: string[]): string[] {
  return paths.filter((p) => !isVideo(p));
}

function hanoiPinToModalData(index: number): JourneyStoryModalData {
  const pin = hanoiJourneyPins[index];
  const gallery = onlyImages(pin.gallery && pin.gallery.length > 0 ? pin.gallery : pin.image ? [pin.image] : []);
  // the plain backstory is one unlabeled block; Pin 5's own subsections (Building/Leading/Serving/
  // Connecting) become their own labeled blocks after it — the same "subtle inline section label"
  // treatment the U.S. pins' storySections get below, applied wherever the data already has real
  // sub-headings rather than inventing new ones for the other four pins.
  const overviewSections: JourneyStoryModalData["overviewSections"] = [{ label: null, paragraphs: pin.backstory }];
  if (pin.subsections) {
    pin.subsections.forEach((s) => overviewSections.push({ label: s.title, paragraphs: [s.description] }));
  }
  return {
    id: pin.id,
    number: pin.number,
    title: pin.preview.title,
    theme: pin.subtitle,
    metaLabel: `Hanoi · Ages ${pin.ageRange}`,
    gallery,
    mediaPlaceholder: pin.mediaPlaceholder ?? null,
    overviewSections,
    index,
    total: hanoiJourneyPins.length,
  };
}

function usPinToModalData(index: 0 | 1): JourneyStoryModalData {
  const pin = index === 0 ? RIVERMONT_PIN_DATA : GAINESVILLE_PIN_DATA;
  const gallery = onlyImages(pin.gallery && pin.gallery.length > 0 ? pin.gallery : pin.image ? [pin.image] : []);
  // each storySection's own heading becomes a real section label (mono/purple in the modal) rather
  // than an uppercased lead-in paragraph — "subtle inline section labels," no nested cards
  const overviewSections: JourneyStoryModalData["overviewSections"] =
    pin.storySections.length > 0
      ? pin.storySections.map((s) => ({ label: s.heading, paragraphs: s.body }))
      : [{ label: null, paragraphs: [pin.preview.description] }];
  return {
    id: pin.id,
    number: pin.number,
    title: pin.preview.title,
    theme: pin.subtitle,
    metaLabel: `${pin.subtitle} · ${pin.yearRange}`,
    gallery,
    overviewSections,
    index,
    total: 2,
  };
}

function modalDataForActiveIndex(activeIndex: number): JourneyStoryModalData | null {
  if (activeIndex >= 0 && activeIndex <= 4) return hanoiPinToModalData(activeIndex);
  if (activeIndex === RIVERMONT_INDEX) return usPinToModalData(0);
  if (activeIndex === GAINESVILLE_INDEX) return usPinToModalData(1);
  return null;
}

/**
 * Owns every location's compact preview panel (5 Hanoi + Rivermont + Gainesville + the us-memories
 * beat) and their scroll-driven opacity/slide-in, plus the single shared JourneyStoryModal — the
 * full story, a completely separate popup layer that "Learn More" opens, never an in-place resize
 * of the preview card. GeographicJourney calls handleRef.current.update(progress) once per scroll
 * tick, alongside its other single-source-of-truth updates (camera, pin status, route progress) —
 * this introduces no new scroll listener.
 *
 * Reuses the exact same story-weight math (deriveStoryWeights/deriveRivermontStoryWeight/etc.)
 * those old components already called — none of that renderer-agnostic logic changed, only where
 * its output gets applied.
 */
export function JourneyStoryLayer({
  handleRef,
  reducedMotion,
  onNavigatePin,
  onModalOpenChange,
  onFinishHanoiChapter,
  onFinishUsChapter,
}: {
  handleRef: React.MutableRefObject<JourneyStoryLayerHandle | null>;
  reducedMotion: boolean;
  /** prev/next in the preview card's footer and the story modal's footer — a scroll request only,
   *  the same single source of truth every other pin navigation (map click, keyboard list) already
   *  goes through. */
  onNavigatePin: (pinId: string) => void;
  /** fires whenever the story modal opens/closes — GeographicJourney uses this to hide the stage
   *  rail and Skip Journey while it's open ("modal should be highest-priority interface"). Only a
   *  boolean signal crosses this boundary; the full preview/modal state machine stays local here. */
  onModalOpenChange: (open: boolean) => void;
  /** the modal's "Finish Chapter" button at Pin 5 / Gainesville — scrolls straight to that
   *  chapter's completion stage (GeographicJourney's own scrollToStageStart("hanoi-complete"/
   *  "us-complete")), never wraps back to that chapter's first pin. */
  onFinishHanoiChapter: () => void;
  onFinishUsChapter: () => void;
}) {
  const hanoiRefs = useRef<Array<HTMLDivElement | null>>([null, null, null, null, null]);
  const rivermontRef = useRef<HTMLDivElement | null>(null);
  const gainesvilleRef = useRef<HTMLDivElement | null>(null);
  const memoriesRef = useRef<HTMLDivElement | null>(null);

  // which locations currently load real media (active ± 1) — real React state, since it decides
  // whether <img>/<video> tags exist at all, unlike the purely-imperative opacity/transform below
  const [loadMediaIndex, setLoadMediaIndex] = useState<number>(-1);
  const loadMediaIndexRef = useRef(loadMediaIndex);
  loadMediaIndexRef.current = loadMediaIndex;

  // Preview card vs. the separate story modal — ephemeral, UI-only, and deliberately a SINGLE value
  // (not per-pin): "a location becoming active does not mean the visitor wants to read the entire
  // story." Reset to "preview" every time the active location itself changes — EXCEPT when that
  // change was requested from inside the modal itself (Previous/Next Story), which pages directly
  // to the neighboring story without ever dropping back to the preview card. See isModalPagingRef.
  const [storyMode, setStoryMode] = useState<"preview" | "modal">("preview");
  // One-shot flag: set immediately before a modal-internal Previous/Next Story navigation, consumed
  // (cleared) the moment the resulting activeIndex change is observed below. Every OTHER path that
  // changes the active location (map click, keyboard list, organic scroll, prev/next on the compact
  // preview card) leaves this false, so it still resets to preview exactly as before.
  const isModalPagingRef = useRef(false);

  useEffect(() => {
    const applyStoryWeight = (panelEl: HTMLDivElement | null, weight: number) => {
      if (!panelEl) return;
      const visible = weight > 0.5;
      // Only one readable card at a time, even when scrolling stops mid-transition.
      panelEl.style.opacity = visible ? "1" : "0";
      panelEl.style.transform = reducedMotion ? "none" : `translateY(${(1 - weight) * STORY_SLIDE_PX}px)`;
      panelEl.style.pointerEvents = visible ? "auto" : "none";
      panelEl.setAttribute("aria-hidden", visible ? "false" : "true");
      // DOM property, not a JSX prop — React 18 doesn't recognize `inert` as boolean-attribute-able
      panelEl.inert = !visible;
    };

    handleRef.current = {
      update: (progress) => {
        const frame = computeHanoiCameraFrame(progress);
        const weights = deriveStoryWeights(frame);
        weights.forEach((w, i) => applyStoryWeight(hanoiRefs.current[i], w));

        const rivermontWeight = deriveRivermontStoryWeight(progress);
        const gainesvilleWeight = deriveGainesvilleStoryWeight(progress);
        applyStoryWeight(rivermontRef.current, rivermontWeight);
        applyStoryWeight(gainesvilleRef.current, gainesvilleWeight);
        applyStoryWeight(memoriesRef.current, deriveUsMemoriesWeight(progress));

        let activeIndex = -1;
        if (frame.pinCursor >= 0 && frame.pinCursor <= 4) activeIndex = frame.pinCursor;
        else if (rivermontWeight > 0.5) activeIndex = RIVERMONT_INDEX;
        else if (gainesvilleWeight > 0.5) activeIndex = GAINESVILLE_INDEX;
        if (activeIndex !== loadMediaIndexRef.current) {
          loadMediaIndexRef.current = activeIndex;
          setLoadMediaIndex(activeIndex);
          if (isModalPagingRef.current) {
            // this change was requested from inside the modal (Previous/Next Story) — the modal
            // stays open and its own data swap follows loadMediaIndex, per the "storybook paging"
            // behavior; consume the flag so the NEXT location change (however it happens) goes back
            // to the normal preview-reset rule.
            isModalPagingRef.current = false;
          } else {
            // any other reason the active location changed — always land on preview, never carry
            // the modal over from whichever location was previously active
            setStoryMode("preview");
          }
        }
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, reducedMotion]);

  const shouldLoad = useCallback(
    (index: number) => loadMediaIndex >= 0 && Math.abs(index - loadMediaIndex) <= LOAD_MEDIA_NEIGHBOR_RADIUS,
    [loadMediaIndex]
  );

  useEffect(() => {
    onModalOpenChange(storyMode === "modal");
  }, [storyMode, onModalOpenChange]);

  // Compact preview card's own prev/next: reset to preview immediately, not waiting for the
  // resulting scroll to actually land — "closing" (there's no modal open here to page within)
  // straight to the next location's own preview, never auto-opening its modal.
  const handleNavigate = useCallback(
    (pinId: string) => {
      setStoryMode("preview");
      onNavigatePin(pinId);
    },
    [onNavigatePin]
  );

  // Modal's own Previous/Next Story: pages directly between neighboring full stories WITHOUT
  // closing — sets the one-shot flag first so the activeIndex-change handler above keeps storyMode
  // at "modal" instead of resetting to preview, then requests the same scroll navigation every
  // other pin change goes through (the map camera/route/pin-status move in the background).
  const handleModalPageTo = useCallback(
    (pinId: string) => {
      isModalPagingRef.current = true;
      onNavigatePin(pinId);
    },
    [onNavigatePin]
  );

  // rebuilds gallery/overviewSections arrays each call — only worth doing when the active location
  // actually changes, not on every re-render this component gets from unrelated parent state
  // (hoveredPinId, activeStageId, isStoryModalOpen, ...)
  const modalData = useMemo(() => modalDataForActiveIndex(loadMediaIndex), [loadMediaIndex]);

  return (
    <>
      {hanoiJourneyPins.map((pin, i) => (
        <JourneyPinStoryPanel
          key={pin.id}
          ref={(el) => {
            hanoiRefs.current[i] = el;
          }}
          pin={pin}
          loadMedia={shouldLoad(i)}
          hidden={storyMode === "modal"}
          index={i}
          total={hanoiJourneyPins.length}
          onLearnMore={() => setStoryMode("modal")}
          onPrev={() => {
            if (i > 0) handleNavigate(hanoiJourneyPins[i - 1].id);
          }}
          onNext={() => {
            if (i < hanoiJourneyPins.length - 1) handleNavigate(hanoiJourneyPins[i + 1].id);
          }}
        />
      ))}
      <JourneyUsStoryPanel
        ref={rivermontRef}
        pin={RIVERMONT_PIN_DATA}
        loadMedia={shouldLoad(RIVERMONT_INDEX)}
        hidden={storyMode === "modal"}
        index={0}
        total={2}
        onLearnMore={() => setStoryMode("modal")}
        onPrev={() => {}}
        onNext={() => handleNavigate(GAINESVILLE_PIN_DATA.id)}
      />
      <JourneyUsStoryPanel
        ref={gainesvilleRef}
        pin={GAINESVILLE_PIN_DATA}
        loadMedia={shouldLoad(GAINESVILLE_INDEX)}
        hidden={storyMode === "modal"}
        index={1}
        total={2}
        onLearnMore={() => setStoryMode("modal")}
        onPrev={() => handleNavigate(RIVERMONT_PIN_DATA.id)}
        onNext={() => {}}
      />
      <JourneyUsMemoriesPanel ref={memoriesRef} markers={usMemoryMarkers} loadMedia={shouldLoad(GAINESVILLE_INDEX)} />

      <JourneyStoryModal
        data={modalData}
        open={storyMode === "modal"}
        reducedMotion={reducedMotion}
        onClose={() => setStoryMode("preview")}
        onPrevStory={() => {
          if (loadMediaIndex > 0 && loadMediaIndex <= 4) handleModalPageTo(hanoiJourneyPins[loadMediaIndex - 1].id);
          else if (loadMediaIndex === GAINESVILLE_INDEX) handleModalPageTo(RIVERMONT_PIN_DATA.id);
        }}
        onNextStory={() => {
          if (loadMediaIndex >= 0 && loadMediaIndex < 4) handleModalPageTo(hanoiJourneyPins[loadMediaIndex + 1].id);
          else if (loadMediaIndex === RIVERMONT_INDEX) handleModalPageTo(GAINESVILLE_PIN_DATA.id);
        }}
        onFinishChapter={() => {
          setStoryMode("preview");
          if (loadMediaIndex === 4) onFinishHanoiChapter();
          else if (loadMediaIndex === GAINESVILLE_INDEX) onFinishUsChapter();
        }}
      />
    </>
  );
}
