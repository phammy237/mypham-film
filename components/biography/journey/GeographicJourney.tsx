"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { journeyChapters, journeyStages, getChapterIndex, getStageAtProgress, getStageById } from "@/lib/biography/journeyStages";
import {
  computeHanoiCameraFrame,
  derivePinStatus,
  deriveActivationCursor,
  toMapPinStatus,
  deriveContinuousRouteProgress,
  computePinClickTargetProgress,
} from "@/lib/biography/hanoiCamera";
import {
  computeCrossOceanProjectionMode,
  computeCrossOceanRouteVisibility,
  computeCrossOceanRouteProgress,
  computeCrossOceanCleanWeight,
  computeHanoiAnchorCrossOceanWeight,
  computeUsAnchorWeight,
  computeTravelPointCoordinate,
} from "@/lib/biography/crossOceanCamera";
import {
  RIVERMONT_PIN_ID,
  GAINESVILLE_PIN_ID,
  deriveRivermontStatus,
  deriveGainesvilleStatus,
  toUsMapPinStatus,
  computeUsRouteProgress,
  computeRivermontClickTargetProgress,
  computeGainesvilleClickTargetProgress,
} from "@/lib/biography/usCamera";
import { computeJourneyCameraState } from "@/lib/biography/journeyMapCamera";
import { computeEarthRasterCrossfade } from "@/lib/biography/earthRasterCrossfade";
import type { JourneyChapterId } from "@/lib/biography/journeyTypes";
import { useTheme } from "@/components/layout/ThemeProvider";
import { JourneyMapStage } from "@/components/biography/journey/JourneyMapStage";
import type { JourneyMapHandle } from "@/components/biography/journey/JourneyMapCanvas";
import { JourneyStoryLayer, type JourneyStoryLayerHandle } from "@/components/biography/journey/JourneyStoryLayer";
import { JourneyProgressRail } from "@/components/biography/journey/JourneyProgressRail";
import { JourneyPinPreview, type JourneyPinPreviewData } from "@/components/biography/journey/JourneyPinPreview";
import { JourneyHeroContent, type JourneyHeroContentHandle } from "@/components/biography/journey/JourneyHeroContent";
import { JourneyHanoiIntroPanel, type JourneyHanoiIntroPanelHandle } from "@/components/biography/journey/JourneyHanoiIntroPanel";
import { JourneyUsIntroPanel, type JourneyUsIntroPanelHandle } from "@/components/biography/journey/JourneyUsIntroPanel";
import { JourneyChapterComplete, type JourneyChapterCompleteHandle } from "@/components/biography/journey/JourneyChapterComplete";
import { JourneyInterlude, type JourneyInterludeHandle } from "@/components/biography/journey/JourneyInterlude";
import { JourneyEarthGlow, type JourneyEarthGlowHandle } from "@/components/biography/journey/JourneyEarthGlow";
import { JourneyEdgeFade, type JourneyEdgeFadeHandle } from "@/components/biography/journey/JourneyEdgeFade";
import { rampDownTo, easeOutCubic, lerp, stageWeight } from "@/lib/biography/journeyMotion";
import { hanoiJourneyPins, hanoiCheckpointCopy } from "@/data/biography/hanoiJourney";
import { usJourneyPins, usCheckpointCopy } from "@/data/biography/usJourney";

const HERO_FADE_COMPLETE_AT = getStageById("hanoi-approach").start;
// Begin Journey's landing target: just inside hanoi-overview (city-wide Hanoi framing, before any
// pin has been visited) — matches scrollToStageStart's own boundary-rounding nudge.
const BEGIN_JOURNEY_TARGET_PROGRESS = getStageById("hanoi-overview").start + 1 / journeyStages.length / 4;
const HANOI_OVERVIEW_STAGE = getStageById("hanoi-overview");
const HANOI_OVERVIEW_EDGE_FADE = 0.02; // matches JourneyHanoiIntroPanel's own EDGE_FADE

// Phase 6 — chapter-complete + interlude stage boundaries, referenced by both applyProgress (to
// track "has the user ever reached this beat" for the explore-again return link) and the
// CTA-triggered scroll targets below.
const HANOI_COMPLETE_STAGE = getStageById("hanoi-complete");
const US_COMPLETE_STAGE = getStageById("us-complete");
/** the stage rail and Skip Journey button hide during these — a minimal, full-bleed cinematic beat
 *  with nothing to navigate to or skip past from inside it. */
const INTERLUDE_STAGE_IDS: ReadonlySet<string> = new Set(["hanoi-interlude-not-yet", "hanoi-interlude-now"]);
/** every stage where the right-edge story panel can be on screen — Skip Journey hides entirely
 *  during these ("should not feature ... as a prominent UI element during active story screens"). */
const PIN_PREVIEW_STAGE_IDS: ReadonlySet<string> = new Set([
  "hanoi-pin-1",
  "hanoi-pin-2",
  "hanoi-pin-3",
  "hanoi-pin-4",
  "hanoi-pin-5",
  "rivermont-story",
  "gainesville-story",
]);
/** Skip Journey's own allowlist — visible ONLY on the Earth/Hanoi/U.S. intro-overview beats, per
 *  "it can remain only on: Earth intro, Hanoi intro, U.S. intro." Hidden on every other stage
 *  (stories, chapter-complete, interlude, Today), not just the ones it used to collide with. */
const SKIP_JOURNEY_ALLOWED_STAGE_IDS: ReadonlySet<string> = new Set(["earth-intro", "hanoi-overview", "us-overview"]);

/** scroll distance dedicated to each stage while the stage is pinned, in viewport-heights */
const STAGE_VH = 90;
const TOTAL_VH = STAGE_VH * journeyStages.length;

export function GeographicJourney() {
  const rootRef = useRef<HTMLDivElement>(null);
  const todaySectionRef = useRef<HTMLDivElement>(null);
  const mapHandleRef = useRef<JourneyMapHandle | null>(null);
  const storyLayerHandleRef = useRef<JourneyStoryLayerHandle | null>(null);
  const heroHandleRef = useRef<JourneyHeroContentHandle | null>(null);
  const hanoiIntroHandleRef = useRef<JourneyHanoiIntroPanelHandle | null>(null);
  const usIntroHandleRef = useRef<JourneyUsIntroPanelHandle | null>(null);
  const hanoiCompleteHandleRef = useRef<JourneyChapterCompleteHandle | null>(null);
  const usCompleteHandleRef = useRef<JourneyChapterCompleteHandle | null>(null);
  const interludeHandleRef = useRef<JourneyInterludeHandle | null>(null);
  const earthGlowHandleRef = useRef<JourneyEarthGlowHandle | null>(null);
  const edgeFadeHandleRef = useRef<JourneyEdgeFadeHandle | null>(null);
  const isBeginningJourneyRef = useRef(false);
  // fast, re-render-free "already flipped" check for applyProgress's own scroll-tick loop — the
  // actual render-affecting value lives in the hasReachedHanoiComplete/hasReachedUsComplete state
  // declared below, set (once) from inside applyProgress by reading these.
  const hasReachedHanoiCompleteRef = useRef(false);
  const hasReachedUsCompleteRef = useRef(false);
  const gsapRef = useRef<{ gsap: typeof import("gsap").gsap; trigger: import("gsap/ScrollTrigger").ScrollTrigger } | null>(
    null
  );
  // last progress applyProgress actually ran with — replayed once the map's handle becomes ready
  // (see handleMapReady) so a page load with zero scroll doesn't leave the very first paint stuck
  // mid-setup, silently no-op'd because the map's dynamic import hadn't resolved yet.
  const lastProgressRef = useRef(0);

  const [activeStageId, setActiveStageId] = useState(journeyStages[0].id);
  const activeStageIdRef = useRef(activeStageId);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  // the full story modal is "highest-priority interface" — hides the rail/Skip Journey while open
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  // mirrors isStoryModalOpen for applyProgress's own scroll-tick loop (a ref so reading it never
  // needs to be in that callback's dependency array, which would otherwise re-register GSAP's
  // ScrollTrigger on every open/close) — see the edge-fade double-darkening fix below.
  const isStoryModalOpenRef = useRef(false);
  useEffect(() => {
    isStoryModalOpenRef.current = isStoryModalOpen;
  }, [isStoryModalOpen]);

  // Dims the site-wide chat bubble while the Today section is in view — "Today should feel calm,"
  // and the bubble's own idle glow otherwise competes with it. Same body-class pattern the story
  // modal already uses to hide the bubble entirely (see JourneyStoryModal.tsx/globals.css); this
  // only ever touches the chat bubble's own visual prominence, never its behavior.
  useEffect(() => {
    const el = todaySectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => document.body.classList.toggle("journey-today-in-view", entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.classList.remove("journey-today-in-view");
    };
  }, []);
  // "has the user ever reached this chapter's completion beat" — flips true once and never back, so
  // JourneyHanoiIntroPanel/JourneyUsIntroPanel can offer a "back to chapter summary" link only once
  // there's actually a summary to return to (a first-time visitor has nothing to go back to yet).
  // Real state (not a ref) since it's read by a conditionally-rendered prop, not an imperative style.
  const [hasReachedHanoiComplete, setHasReachedHanoiComplete] = useState(false);
  const [hasReachedUsComplete, setHasReachedUsComplete] = useState(false);

  const reducedMotion = !!useReducedMotion();
  const { theme } = useTheme();

  const applyProgress = useCallback(
    (progress: number, gsapInstance?: typeof import("gsap").gsap) => {
      void gsapInstance; // no generic per-stage DOM crossfade remains — every stage is now owned by
      // either the persistent map or the story layer, both driven imperatively below
      lastProgressRef.current = progress;
      const current = getStageAtProgress(progress);
      const previousStageId = activeStageIdRef.current;

      // Explicit projection ownership — fixes the globe's curved silhouette leaking into flat-map
      // stages, AND (see crossOceanCamera.ts) deliberately re-forms it for the redesigned
      // cross-ocean transition's own rotation window. Idempotent; only actually touches the map on
      // a real mode change.
      mapHandleRef.current?.setProjectionMode(computeCrossOceanProjectionMode(progress));

      // the persistent map's whole camera choreography — one continuous progress→state function
      // spanning Earth → Vietnam → Hanoi → back out → United States → Rivermont → Gainesville.
      mapHandleRef.current?.setCamera(computeJourneyCameraState(progress, reducedMotion), progress);
      mapHandleRef.current?.setEarthRasterCrossfade(computeEarthRasterCrossfade(progress));

      // Hanoi pins/route — one shared frame drives the route's continuous draw-in AND pin
      // activation, so "line reaches ~95%, pin activates" holds by construction instead of pin
      // status flipping the instant the stage boundary crosses (which used to let a pin activate
      // while the route was still only partway drawn).
      const hanoiFrame = computeHanoiCameraFrame(progress);
      const hanoiActivationCursor = deriveActivationCursor(hanoiFrame);
      hanoiJourneyPins.forEach((pin, i) => {
        mapHandleRef.current?.setPinStatus(pin.id, toMapPinStatus(derivePinStatus(i, hanoiActivationCursor)));
      });
      mapHandleRef.current?.setHanoiRouteProgress(deriveContinuousRouteProgress(hanoiFrame));
      // "the point is the text, not the map" — background route dims once chapter-complete takes
      // over, same as the story card's own (much faster) retraction above it.
      mapHandleRef.current?.setRouteEmphasis("hanoi", progress >= HANOI_COMPLETE_STAGE.start ? 0 : 1);

      // U.S. pins/route
      mapHandleRef.current?.setPinStatus(RIVERMONT_PIN_ID, toUsMapPinStatus(deriveRivermontStatus(progress)));
      mapHandleRef.current?.setPinStatus(GAINESVILLE_PIN_ID, toUsMapPinStatus(deriveGainesvilleStatus(progress)));
      mapHandleRef.current?.setDomesticRouteProgress(computeUsRouteProgress(progress));
      mapHandleRef.current?.setRouteEmphasis("domestic", progress >= US_COMPLETE_STAGE.start ? 0 : 1);

      // The redesigned cross-ocean transition — see crossOceanCamera.ts for the full choreography.
      // One shared visibility envelope drives the route AND its travel point together, and one
      // shared route-progress value drives both the route's progressive "comet trail" reveal and
      // the travel point's own position, so nothing here can drift apart from the globe's rotation.
      const crossOceanRouteVisibility = computeCrossOceanRouteVisibility(progress);
      mapHandleRef.current?.setTranspacificRouteOpacity(crossOceanRouteVisibility);
      mapHandleRef.current?.setTranspacificRouteProgress(computeCrossOceanRouteProgress(progress));
      mapHandleRef.current?.setTranspacificTravelPoint(computeTravelPointCoordinate(progress), crossOceanRouteVisibility);
      // "clean globe" — hides the (otherwise pixel-overlapping, at this zoom) numbered Hanoi/U.S.
      // pins and generic basemap labels for the duration of the transition.
      mapHandleRef.current?.setCrossOceanImmersion(computeCrossOceanCleanWeight(progress));
      mapHandleRef.current?.setUsAnchorGlowOpacity(computeUsAnchorWeight(progress));

      // story panels — opacity/slide-in for whichever location is currently being read
      storyLayerHandleRef.current?.update(progress);

      // Earth-hero title/CTA block, the map's own "glowing Hanoi" marker, and the decorative space
      // atmosphere all share one fade window (see JourneyHeroContent/JourneyMapCanvas/
      // JourneyEarthGlow) so they resolve together, not independently — "no hard cut" between the
      // Earth and Hanoi visual modes.
      const heroWeight = rampDownTo(progress, HERO_FADE_COMPLETE_AT, HERO_FADE_COMPLETE_AT);
      heroHandleRef.current?.update(progress);
      earthGlowHandleRef.current?.update(progress, mapHandleRef.current?.getEarthGlowGeometry() ?? null);
      edgeFadeHandleRef.current?.update(progress, isStoryModalOpenRef.current);
      // the Earth-hero "glowing Hanoi" marker and the cross-ocean transition's own departure-side
      // "Hanoi" marker share this one anchor layer (see JourneyMapCanvas) — never both visible at
      // once (their two windows don't overlap), so a plain max is enough.
      mapHandleRef.current?.setHanoiAnchorGlowOpacity(Math.max(heroWeight, computeHanoiAnchorCrossOceanWeight(progress)));
      hanoiIntroHandleRef.current?.update(progress);
      usIntroHandleRef.current?.update(progress);
      hanoiCompleteHandleRef.current?.update(progress);
      usCompleteHandleRef.current?.update(progress);
      interludeHandleRef.current?.update(progress);
      if (progress >= HANOI_COMPLETE_STAGE.start && !hasReachedHanoiCompleteRef.current) {
        hasReachedHanoiCompleteRef.current = true;
        setHasReachedHanoiComplete(true);
      }
      if (progress >= US_COMPLETE_STAGE.start && !hasReachedUsCompleteRef.current) {
        hasReachedUsCompleteRef.current = true;
        setHasReachedUsComplete(true);
      }

      // Hanoi chapter label, tied to the hanoi-overview window the intro panel itself fades over.
      // (Pin-01 used to get a separate pulsing "hint" hover here too — removed per the
      // cinematic-atlas spec's "no pulsing/expanding circles" rule; the active pin's static halo
      // already carries that job.)
      const hanoiOverviewWeight = stageWeight(progress, HANOI_OVERVIEW_STAGE.start, HANOI_OVERVIEW_STAGE.end, HANOI_OVERVIEW_EDGE_FADE);
      mapHandleRef.current?.setHanoiChapterLabelOpacity(hanoiOverviewWeight);

      if (current.id !== previousStageId) {
        activeStageIdRef.current = current.id;
        setActiveStageId(current.id);
      }
    },
    [reducedMotion]
  );

  // The map canvas loads via next/dynamic (code-split, client-only) and can resolve after GSAP's
  // own dynamic import already fired the very first applyProgress call — on a page load with no
  // scroll yet (progress stuck at 0), that first call's setCamera/setPinStatus/etc. would silently
  // no-op against a still-null handle and never get replayed. Re-running once the handle is ready
  // fixes the map's initial paint without touching the scroll-driven update path itself.
  const handleMapReady = useCallback(() => applyProgress(lastProgressRef.current), [applyProgress]);

  useEffect(() => {
    let cancelled = false;
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout>;

    (async () => {
      // Client-only: gsap/ScrollTrigger must never register or touch the DOM during SSR.
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const trigger = ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.35,
          invalidateOnRefresh: true,
          onUpdate: (self) => applyProgress(self.progress, gsap),
        });
        gsapRef.current = { gsap, trigger };
        // reflect whatever scroll position we already have (e.g. a mid-journey page refresh)
        applyProgress(trigger.progress, gsap);
      }, rootRef);

      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
      };
      window.addEventListener("resize", onResize);
      (ctx as unknown as { __onResize?: () => void }).__onResize = onResize;
    })();

    return () => {
      cancelled = true;
      const onResize = (ctx as unknown as { __onResize?: () => void } | null)?.__onResize;
      if (onResize) window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      ctx?.revert();
      gsapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const activeStage = journeyStages.find((s) => s.id === activeStageId) ?? journeyStages[0];
  const activeChapterIndex = getChapterIndex(activeStage.chapter);

  // shared by every scroll-position computation below (smooth nav, the instant Begin Journey snap)
  // so there's exactly one place that converts a target progress (0–1) into a real scrollY
  const computeScrollYForProgress = useCallback((targetProgress: number) => {
    const root = rootRef.current;
    if (!root) return null;
    const rect = root.getBoundingClientRect();
    const wrapperTop = rect.top + window.scrollY;
    const scrollableRange = root.offsetHeight - window.innerHeight;
    const clamped = Math.min(1, Math.max(0, targetProgress));
    return wrapperTop + Math.max(0, scrollableRange) * clamped;
  }, []);

  // centralized boundary-safe scroll — every programmatic navigation (chapter rail, pin clicks)
  // goes through this one helper instead of each computing its own scrollY math
  const scrollToProgress = useCallback(
    (targetProgress: number) => {
      const targetY = computeScrollYForProgress(targetProgress);
      if (targetY === null) return;
      window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [computeScrollYForProgress, reducedMotion]
  );

  const scrollToStageStart = useCallback(
    (stageId: (typeof journeyStages)[number]["id"]) => {
      const stage = journeyStages.find((s) => s.id === stageId);
      if (!stage) return;
      // nudge a hair past the exact boundary — landing precisely on stage.start can round down a
      // fraction of a pixel short and get classified as the previous (adjacent) stage instead
      scrollToProgress(stage.start + 1 / journeyStages.length / 4);
    },
    [scrollToProgress]
  );

  // Begin Journey's one cinematic, non-scroll-driven camera move — Earth pivots/zooms straight
  // into the Hanoi overview in one eased tween. It still goes through applyProgress (the same
  // single camera controller the scroll path uses) every frame, so nothing about camera/pin/rail
  // state is computed twice: this just drives *how fast progress changes* for ~1.7s, exactly like
  // an unusually fast, precisely-eased scroll. ScrollTrigger is disabled for the duration (not
  // killed) so its own scrub smoothing can't fight these direct calls, then re-enabled after the
  // real scroll position is snapped to match — scrolling forward/back afterward resumes normally,
  // no separate "CTA state" left behind.
  const beginJourneyTransition = useCallback(() => {
    if (isBeginningJourneyRef.current) return;
    isBeginningJourneyRef.current = true;

    const trigger = gsapRef.current?.trigger;
    const gsap = gsapRef.current?.gsap;
    const startProgress = lastProgressRef.current;

    // prevents the "manual interruption" scroll-fighting case: real scroll position can't drift
    // out from under the tween while ScrollTrigger isn't listening for it
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const finish = () => {
      const targetY = computeScrollYForProgress(BEGIN_JOURNEY_TARGET_PROGRESS);
      if (targetY !== null) window.scrollTo(0, targetY);
      trigger?.enable(false); // reset:false — pick up progress from the just-snapped scroll position
      document.body.style.overflow = previousOverflow;
      isBeginningJourneyRef.current = false;
    };

    trigger?.disable(false, false); // reset:false keeps current state; allowAnimation:false pauses any in-flight scrub

    const duration = reducedMotion ? 200 : 1700;
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      applyProgress(lerp(startProgress, BEGIN_JOURNEY_TARGET_PROGRESS, easeOutCubic(t)), gsap);
      if (t < 1) requestAnimationFrame(tick);
      else finish();
    };
    requestAnimationFrame(tick);
  }, [applyProgress, computeScrollYForProgress, reducedMotion]);

  // Phase 6 — Hanoi/U.S. chapter-complete + interlude navigation. Every one of these is just
  // "jump to this named stage's start," through the same scrollToStageStart helper every other
  // navigation in this page already goes through — never a direct camera/pin-state write. One
  // factory instead of a named useCallback per destination.
  const goToStage = useCallback((stageId: (typeof journeyStages)[number]["id"]) => () => scrollToStageStart(stageId), [scrollToStageStart]);
  const handleExploreUsFreely = useCallback(() => scrollToStageStart("rivermont-approach"), [scrollToStageStart]);

  const scrollToTodaySection = useCallback(() => {
    const el = todaySectionRef.current;
    if (!el) return;
    const targetY = el.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const navigateToChapter = useCallback(
    (chapterId: JourneyChapterId) => {
      if (chapterId === "today") {
        scrollToTodaySection();
        return;
      }
      const chapter = journeyChapters.find((c) => c.id === chapterId);
      if (chapter) scrollToStageStart(chapter.firstStageId);
    },
    [scrollToStageStart, scrollToTodaySection]
  );

  // arrow keys step through the chapters, like advancing a roll of film
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isStoryModalOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight" && activeChapterIndex < journeyChapters.length - 1) navigateToChapter(journeyChapters[activeChapterIndex + 1].id);
      if (e.key === "ArrowLeft" && activeChapterIndex > 0) navigateToChapter(journeyChapters[activeChapterIndex - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isStoryModalOpen, activeChapterIndex, navigateToChapter]);

  // pin clicks only ever request a scroll — the existing applyProgress engine is what actually
  // recomputes camera, route, pin statuses, and story panel visibility as it animates there. This
  // is the single source of truth the whole journey shares: scroll progress. A click never sets
  // camera or pin state directly, so there's nothing for it to conflict with once the scroll
  // settles — the guided flow just resumes from wherever the click landed.
  const scrollToPin = useCallback(
    (pinId: string) => {
      const index = hanoiJourneyPins.findIndex((p) => p.id === pinId);
      if (index === -1) return;
      scrollToProgress(computePinClickTargetProgress(index));
    },
    [scrollToProgress]
  );

  const scrollToUsPin = useCallback(
    (pinId: string) => {
      if (pinId === RIVERMONT_PIN_ID) scrollToProgress(computeRivermontClickTargetProgress());
      else if (pinId === GAINESVILLE_PIN_ID) scrollToProgress(computeGainesvilleClickTargetProgress());
    },
    [scrollToProgress]
  );

  const handlePinClick = useCallback(
    (pinId: string) => {
      if (pinId === RIVERMONT_PIN_ID || pinId === GAINESVILLE_PIN_ID) scrollToUsPin(pinId);
      else scrollToPin(pinId);
    },
    [scrollToPin, scrollToUsPin]
  );

  // Phase 6 — the U.S. intro panel's primary CTA jumps straight into Rivermont's own settled story
  // window, same shape as JourneyHanoiIntroPanel's onStart (scrollToPin(hanoiJourneyPins[0].id)).
  const handleStartUsChapter = useCallback(() => scrollToUsPin(RIVERMONT_PIN_ID), [scrollToUsPin]);

  // hover is purely a discovery/teaser affordance — it never touches scroll progress, camera, or
  // pin status, so it can never compete with the guided scroll flow (see JourneyPinPreview)
  const hoveredPin =
    hanoiJourneyPins.find((p) => p.id === hoveredPinId) ?? usJourneyPins.find((p) => p.id === hoveredPinId) ?? null;
  const hoverPreview: JourneyPinPreviewData | null = hoveredPin
    ? {
        id: hoveredPin.id,
        number: hoveredPin.number,
        title: hoveredPin.title,
        subtitle: hoveredPin.subtitle,
        description: hoveredPin.preview.description,
      }
    : null;

  return (
    <div className="relative bg-base dark:bg-navy">
      <h1 className="sr-only">My Pham&apos;s journey — from Hanoi, Vietnam to Rivermont and Gainesville, United States</h1>
      <div ref={rootRef} className="relative" style={{ height: `${TOTAL_VH}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <JourneyMapStage
            theme={theme}
            reducedMotion={reducedMotion}
            handleRef={mapHandleRef}
            onPinClick={handlePinClick}
            onPinHover={setHoveredPinId}
            onReady={handleMapReady}
          />
          <JourneyEarthGlow handleRef={earthGlowHandleRef} theme={theme} />
          <JourneyEdgeFade handleRef={edgeFadeHandleRef} theme={theme} />
          {PIN_PREVIEW_STAGE_IDS.has(activeStage.id) && !isStoryModalOpen && (
            <div className="journey-map-marginalia pointer-events-none" aria-hidden="true">
              <div className="journey-map-caption">
                <span className="mb-7 block font-mono text-[10px] tracking-[0.3em]">N<br />＋</span>
                <p className="font-display text-xl">{activeStage.chapter === "hanoi" ? "HANOI" : "UNITED STATES"}</p>
                <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.24em]">Places make<br />people</p>
              </div>
              <p className="journey-map-footnote font-mono text-[9px] uppercase leading-loose tracking-[0.2em]">
                Same places.<br />A different me.
              </p>
            </div>
          )}
          <JourneyStoryLayer
            handleRef={storyLayerHandleRef}
            reducedMotion={reducedMotion}
            onNavigatePin={handlePinClick}
            onModalOpenChange={setIsStoryModalOpen}
            onFinishHanoiChapter={goToStage("hanoi-complete")}
            onFinishUsChapter={goToStage("us-complete")}
          />
          <JourneyHeroContent handleRef={heroHandleRef} reducedMotion={reducedMotion} onBeginJourney={beginJourneyTransition} onJump={navigateToChapter} />
          <JourneyHanoiIntroPanel
            handleRef={hanoiIntroHandleRef}
            reducedMotion={reducedMotion}
            onStart={() => scrollToPin(hanoiJourneyPins[0].id)}
            onSkip={() => navigateToChapter("us")}
            showReturnLink={hasReachedHanoiComplete}
            onReturnToSummary={goToStage("hanoi-complete")}
          />
          <JourneyChapterComplete
            handleRef={hanoiCompleteHandleRef}
            stageId="hanoi-complete"
            reducedMotion={reducedMotion}
            eyebrow={hanoiCheckpointCopy.eyebrow}
            heading={hanoiCheckpointCopy.heading}
            paragraph={hanoiCheckpointCopy.paragraph}
            primaryLabel={hanoiCheckpointCopy.continueCta}
            onPrimary={goToStage("hanoi-interlude-not-yet")}
            secondaryLabel={hanoiCheckpointCopy.stayCta}
            onSecondary={goToStage("hanoi-overview")}
          />
          <JourneyInterlude handleRef={interludeHandleRef} reducedMotion={reducedMotion} onCrossOcean={goToStage("us-overview")} />
          <JourneyUsIntroPanel
            handleRef={usIntroHandleRef}
            reducedMotion={reducedMotion}
            onStartChapter={handleStartUsChapter}
            onExploreFreely={handleExploreUsFreely}
            showReturnLink={hasReachedUsComplete}
            onReturnToSummary={goToStage("us-complete")}
          />
          <JourneyChapterComplete
            handleRef={usCompleteHandleRef}
            stageId="us-complete"
            reducedMotion={reducedMotion}
            eyebrow={usCheckpointCopy.eyebrow}
            heading={usCheckpointCopy.heading}
            paragraph={usCheckpointCopy.paragraph}
            primaryLabel={usCheckpointCopy.continueCta}
            onPrimary={goToStage("today-transition")}
            secondaryLabel={usCheckpointCopy.stayCta}
            onSecondary={goToStage("us-overview")}
          />
        </div>
      </div>

      <JourneyPinPreview pin={hoverPreview} onLearnMore={handlePinClick} />

      {/* Visually-hidden keyboard path to every pin — canvas-rendered map markers can't hold DOM
          focus themselves, so this list is the accessible equivalent of clicking a pin. */}
      <nav aria-label="Jump to a journey location" className="sr-only">
        <ul>
          {hanoiJourneyPins.map((pin) => (
            <li key={pin.id}>
              <button type="button" onClick={() => handlePinClick(pin.id)}>
                {pin.title} — {pin.subtitle}
              </button>
            </li>
          ))}
          {usJourneyPins.map((pin) => (
            <li key={pin.id}>
              <button type="button" onClick={() => handlePinClick(pin.id)}>
                {pin.title} — {pin.subtitle}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* The floating preview leaves a dedicated right gutter for chapter navigation.
          Hide the rail only during the modal, interludes, and the final Today section. */}
      {activeStage.id !== "today-ahead" &&
        !isStoryModalOpen &&
        !INTERLUDE_STAGE_IDS.has(activeStage.id) && (
        <JourneyProgressRail
          chapters={journeyChapters}
          activeChapterId={activeStage.chapter}
          activeChapterIndex={activeChapterIndex}
          onNavigate={navigateToChapter}
        />
      )}

      {/* "next frame": advance to the following chapter without hunting for the rail */}
      {activeStage.id !== "today-ahead" &&
        !isStoryModalOpen &&
        !INTERLUDE_STAGE_IDS.has(activeStage.id) &&
        activeChapterIndex < journeyChapters.length - 1 && (
          <button
            type="button"
            onClick={() => navigateToChapter(journeyChapters[activeChapterIndex + 1].id)}
            className="f-mono fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-[var(--ink)] shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[var(--butter)] hover:text-[#20201E] md:flex"
          >
            next frame ▸ {journeyChapters[activeChapterIndex + 1].label}
          </button>
        )}

      {/* Extremely low priority — visible ONLY on the three intro/overview beats (Earth, Hanoi,
          U.S.); hidden everywhere else (stories, chapter-complete, interlude, Today) so it never
          competes with active journey content. Tiny plain mono text at a fixed .35 opacity — no
          pill, no border, no background, no arrow. */}
      {SKIP_JOURNEY_ALLOWED_STAGE_IDS.has(activeStage.id) && !isStoryModalOpen && (
        <button
          type="button"
          onClick={scrollToTodaySection}
          className="fixed right-4 top-[76px] z-[25] font-mono text-[10px] uppercase tracking-[0.14em] text-journey-muted transition-opacity hover:opacity-80 dark:text-journey-paper dark:opacity-[.35] md:right-8 md:top-[72px]"
        >
          Skip Journey
        </button>
      )}

      {/* A quiet final atlas page — "closing a book," not a portfolio-template hero. Solid dark
          background only: no decorative grid lines, arcs, circles, or ghosted route (all removed
          per spec — "if the existing map is difficult here, solid dark background is BETTER than
          fake decorative geometry"). Left-aligned editorial block, not centered. */}
      <section
        ref={todaySectionRef}
        aria-label="Today & Ahead"
        className="relative z-10 min-h-screen overflow-hidden bg-film-cream dark:bg-film-black"
      >
        <div className="absolute left-6 bottom-[15vh] flex w-[calc(100%-48px)] max-w-[520px] flex-col items-start gap-4 md:left-[clamp(72px,7vw,120px)] md:bottom-[16vh]">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-journey-muted dark:text-journey-glow">Today / 2026</p>
          <h2 className="font-display text-[46px] leading-[1.05] text-journey-ink dark:text-journey-paper md:text-[56px]">
            Still becoming.
          </h2>
          <p className="max-w-[470px] font-body text-[16px] leading-[1.6] text-journey-body dark:text-journey-paper">
            Hanoi, Rivermont, Gainesville — the map ends here for now. The rest is still being written.
          </p>
          <Link
            href="/connect"
            className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-journey-ink transition-colors hover:text-journey-violet dark:text-journey-paper dark:hover:text-journey-glow"
          >
            Let&apos;s Connect →
          </Link>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-journey-muted dark:text-journey-muted-dark">
            More places · More people · More to come
          </p>
        </div>
      </section>
    </div>
  );
}
