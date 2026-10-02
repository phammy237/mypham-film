import type { JourneyChapterConfig, JourneyStageConfig, JourneyStageId } from "@/lib/biography/journeyTypes";

/**
 * Single source of truth for the scrubbed journey: order, labels, chapter grouping, and each
 * stage's normalized [start, end) window within the overall 0–1 scroll track. Every consumer
 * (the sticky stage, the progress rail, the skip button) reads from this list instead of
 * hardcoding its own progress numbers.
 */
const STAGE_ORDER: Array<{ id: JourneyStageId; label: string; chapter: JourneyStageConfig["chapter"] }> = [
  { id: "earth-intro", label: "Earth", chapter: "earth" },
  { id: "vietnam-approach", label: "Approaching Vietnam", chapter: "earth" },
  { id: "hanoi-approach", label: "Approaching Hanoi", chapter: "hanoi" },
  { id: "hanoi-overview", label: "Hanoi Overview", chapter: "hanoi" },
  { id: "hanoi-pin-1", label: "Hanoi — Pin 1", chapter: "hanoi" },
  { id: "hanoi-pin-2", label: "Hanoi — Pin 2", chapter: "hanoi" },
  { id: "hanoi-pin-3", label: "Hanoi — Pin 3", chapter: "hanoi" },
  { id: "hanoi-pin-4", label: "Hanoi — Pin 4", chapter: "hanoi" },
  { id: "hanoi-pin-5", label: "Hanoi — Pin 5", chapter: "hanoi" },
  { id: "hanoi-complete", label: "Hanoi — Chapter Complete", chapter: "hanoi" },
  { id: "hanoi-interlude-not-yet", label: "Between Chapters — Not Yet", chapter: "hanoi" },
  { id: "hanoi-interlude-now", label: "Between Chapters — Now", chapter: "hanoi" },
  { id: "hanoi-departure", label: "Leaving Hanoi", chapter: "hanoi" },
  { id: "transpacific-flight", label: "Trans-Pacific Flight", chapter: "us" },
  { id: "us-overview", label: "United States Overview", chapter: "us" },
  { id: "rivermont-approach", label: "Approaching Rivermont", chapter: "us" },
  { id: "rivermont-story", label: "Rivermont", chapter: "us" },
  { id: "rivermont-departure", label: "Leaving Rivermont", chapter: "us" },
  { id: "florida-flight", label: "Flight to Florida", chapter: "us" },
  { id: "gainesville-approach", label: "Approaching Gainesville", chapter: "us" },
  { id: "gainesville-story", label: "Gainesville", chapter: "us" },
  { id: "us-memories", label: "U.S. Memories", chapter: "us" },
  { id: "us-complete", label: "United States — Chapter Complete", chapter: "us" },
  { id: "today-transition", label: "Toward Today", chapter: "today" },
  { id: "today-ahead", label: "Today & Ahead", chapter: "today" },
];

export const journeyStages: JourneyStageConfig[] = STAGE_ORDER.map((stage, index) => ({
  ...stage,
  start: index / STAGE_ORDER.length,
  end: (index + 1) / STAGE_ORDER.length,
}));

export const journeyChapters: JourneyChapterConfig[] = [
  { id: "earth", label: "Earth", firstStageId: "earth-intro" },
  { id: "hanoi", label: "Hanoi", firstStageId: "hanoi-approach" },
  { id: "us", label: "U.S.", firstStageId: "transpacific-flight" },
  { id: "today", label: "Today", firstStageId: "today-ahead" },
];

export function getStageById(id: JourneyStageId): JourneyStageConfig {
  const stage = journeyStages.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown journey stage id: ${id}`);
  return stage;
}

/** The active stage for a given normalized scroll progress (0–1). */
export function getStageAtProgress(progress: number): JourneyStageConfig {
  const clamped = Math.min(1, Math.max(0, progress));
  const found = journeyStages.find((stage) => clamped >= stage.start && clamped < stage.end);
  return found ?? journeyStages[journeyStages.length - 1];
}

export function getChapterIndex(chapter: JourneyStageConfig["chapter"]): number {
  return journeyChapters.findIndex((c) => c.id === chapter);
}
