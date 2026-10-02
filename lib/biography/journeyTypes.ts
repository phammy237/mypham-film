export type JourneyStageId =
  | "earth-intro"
  | "vietnam-approach"
  | "hanoi-approach"
  | "hanoi-overview"
  | "hanoi-pin-1"
  | "hanoi-pin-2"
  | "hanoi-pin-3"
  | "hanoi-pin-4"
  | "hanoi-pin-5"
  | "hanoi-complete"
  | "hanoi-interlude-not-yet"
  | "hanoi-interlude-now"
  | "hanoi-departure"
  | "transpacific-flight"
  | "us-overview"
  | "rivermont-approach"
  | "rivermont-story"
  | "rivermont-departure"
  | "florida-flight"
  | "gainesville-approach"
  | "gainesville-story"
  | "us-memories"
  | "us-complete"
  | "today-transition"
  | "today-ahead";

export type JourneyChapterId = "earth" | "hanoi" | "us" | "today";

export type JourneyStageConfig = {
  id: JourneyStageId;
  label: string;
  chapter: JourneyChapterId;
  /** normalized position within the overall scroll track, 0–1 */
  start: number;
  end: number;
};

export type JourneyChapterConfig = {
  id: JourneyChapterId;
  label: string;
  /** the first stage in this chapter — chapter-rail navigation scrolls here */
  firstStageId: JourneyStageId;
};
