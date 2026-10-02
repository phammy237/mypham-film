"use client";
import { useCallback, useReducer } from "react";
import { chapters } from "@/data/biography/biography";

export type StoryStage =
  | "globe"
  | "region"
  | "map"
  | "story"
  | "checkpoint"
  | "transition"
  | "final";

type StoryState = {
  stage: StoryStage;
  chapterIndex: number;
  activePinId: string | null;
  openStoryPinId: string | null;
  visitedPinIds: string[];
  completedPinIds: string[];
};

type StoryAction =
  | { type: "BEGIN_JOURNEY" }
  | { type: "ENTER_MAP" }
  | { type: "SELECT_PIN"; pinId: string | null }
  | { type: "OPEN_STORY"; pinId: string }
  | { type: "CLOSE_STORY" }
  | { type: "REACH_CHECKPOINT" }
  | { type: "STAY_EXPLORING" }
  | { type: "CONTINUE_NEXT_CHAPTER" }
  | { type: "ARRIVE_AT_DESTINATION" }
  | { type: "GO_TO_FINAL" }
  | { type: "REVISIT_CHAPTER"; chapterIndex: number }
  | { type: "BACK" }
  | { type: "RESTART" };

const initialState: StoryState = {
  stage: "globe",
  chapterIndex: 0,
  activePinId: null,
  openStoryPinId: null,
  visitedPinIds: [],
  completedPinIds: [],
};

function reducer(state: StoryState, action: StoryAction): StoryState {
  switch (action.type) {
    case "BEGIN_JOURNEY":
      return { ...state, stage: "region" };
    case "ENTER_MAP":
      return { ...state, stage: "map" };
    case "SELECT_PIN":
      return { ...state, activePinId: action.pinId };
    case "OPEN_STORY":
      return {
        ...state,
        stage: "story",
        openStoryPinId: action.pinId,
        visitedPinIds: state.visitedPinIds.includes(action.pinId)
          ? state.visitedPinIds
          : [...state.visitedPinIds, action.pinId],
      };
    case "CLOSE_STORY": {
      const completed = state.openStoryPinId && !state.completedPinIds.includes(state.openStoryPinId)
        ? [...state.completedPinIds, state.openStoryPinId]
        : state.completedPinIds;
      return { ...state, stage: "map", openStoryPinId: null, activePinId: null, completedPinIds: completed };
    }
    case "REACH_CHECKPOINT":
      return { ...state, stage: "checkpoint" };
    case "STAY_EXPLORING":
      return { ...state, stage: "map" };
    case "CONTINUE_NEXT_CHAPTER": {
      const nextIndex = state.chapterIndex + 1;
      if (nextIndex >= chapters.length) return { ...state, stage: "final" };
      // chapterIndex advances immediately so the transition stage can read the real
      // destination chapter (globe target, region label, etc.) while it animates toward it.
      return { ...state, stage: "transition", chapterIndex: nextIndex, activePinId: null };
    }
    case "ARRIVE_AT_DESTINATION":
      return { ...state, stage: "region" };
    case "GO_TO_FINAL":
      return { ...state, stage: "final" };
    case "REVISIT_CHAPTER":
      return { ...state, stage: "map", chapterIndex: action.chapterIndex, activePinId: null };
    case "BACK": {
      if (state.stage === "map") return { ...state, stage: "region", activePinId: null };
      if (state.stage === "region") return { ...state, stage: "globe" };
      return state;
    }
    case "RESTART":
      return initialState;
    default:
      return state;
  }
}

export function useStoryState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const chapter = chapters[state.chapterIndex];
  const hasNextChapter = state.chapterIndex + 1 < chapters.length;

  const beginJourney = useCallback(() => dispatch({ type: "BEGIN_JOURNEY" }), []);
  const enterMap = useCallback(() => dispatch({ type: "ENTER_MAP" }), []);
  const selectPin = useCallback((pinId: string | null) => dispatch({ type: "SELECT_PIN", pinId }), []);
  const openStory = useCallback((pinId: string) => dispatch({ type: "OPEN_STORY", pinId }), []);
  const closeStory = useCallback(() => dispatch({ type: "CLOSE_STORY" }), []);
  const reachCheckpoint = useCallback(() => dispatch({ type: "REACH_CHECKPOINT" }), []);
  const stayExploring = useCallback(() => dispatch({ type: "STAY_EXPLORING" }), []);
  const continueNextChapter = useCallback(() => dispatch({ type: "CONTINUE_NEXT_CHAPTER" }), []);
  const arriveAtDestination = useCallback(() => dispatch({ type: "ARRIVE_AT_DESTINATION" }), []);
  const goToFinal = useCallback(() => dispatch({ type: "GO_TO_FINAL" }), []);
  const revisitChapter = useCallback((chapterIndex: number) => dispatch({ type: "REVISIT_CHAPTER", chapterIndex }), []);
  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const restart = useCallback(() => dispatch({ type: "RESTART" }), []);

  return {
    ...state,
    chapter,
    hasNextChapter,
    beginJourney,
    enterMap,
    selectPin,
    openStory,
    closeStory,
    reachCheckpoint,
    stayExploring,
    continueNextChapter,
    arriveAtDestination,
    goToFinal,
    revisitChapter,
    back,
    restart,
  };
}
