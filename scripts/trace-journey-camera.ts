/**
 * Analytical camera-tuning trace — not part of the shipped site. Prints the computed camera
 * state at fine-grained scroll progress steps so the pacing (zoom deltas, resting periods,
 * transition smoothness) can be checked numerically without depending on visual rendering.
 * Run with: npx tsx scripts/trace-journey-camera.ts
 */
import { journeyStages } from "@/lib/biography/journeyStages";
import { computeJourneyCameraState } from "@/lib/biography/journeyMapCamera";

const STEPS = 400;

let prev = computeJourneyCameraState(0, false);
let maxZoomJumpPerStep = 0;
let maxCenterJumpPerStep = 0;

for (let i = 0; i <= STEPS; i++) {
  const progress = i / STEPS;
  const state = computeJourneyCameraState(progress, false);
  const zoomDelta = Math.abs(state.zoom - prev.zoom);
  const centerDelta = Math.hypot(state.center[0] - prev.center[0], state.center[1] - prev.center[1]);
  if (zoomDelta > maxZoomJumpPerStep) maxZoomJumpPerStep = zoomDelta;
  if (centerDelta > maxCenterJumpPerStep) maxCenterJumpPerStep = centerDelta;
  prev = state;
}

console.log(`Sampled ${STEPS} steps across the full journey (progress 0..1).`);
console.log(`Max per-step zoom delta: ${maxZoomJumpPerStep.toFixed(4)} (step size = ${(1 / STEPS).toFixed(5)} progress)`);
console.log(`Max per-step center delta (deg): ${maxCenterJumpPerStep.toFixed(4)}`);
console.log("");

console.log("Camera state at every stage boundary (checking for snaps — adjacent values should match):");
for (const stage of journeyStages) {
  const atStart = computeJourneyCameraState(stage.start + 1e-6, false);
  const justBefore = computeJourneyCameraState(Math.max(0, stage.start - 1e-6), false);
  const snapZoom = Math.abs(atStart.zoom - justBefore.zoom);
  const snapCenter = Math.hypot(atStart.center[0] - justBefore.center[0], atStart.center[1] - justBefore.center[1]);
  const flag = snapZoom > 0.05 || snapCenter > 0.05 ? "  <-- POSSIBLE SNAP" : "";
  console.log(
    `${stage.id.padEnd(22)} start=${stage.start.toFixed(4)}  zoom ${justBefore.zoom.toFixed(2)} -> ${atStart.zoom.toFixed(2)}  center-delta=${snapCenter.toFixed(4)}${flag}`
  );
}

console.log("");
console.log("Full per-stage camera trajectory (start / mid / end):");
for (const stage of journeyStages) {
  const s = computeJourneyCameraState(stage.start + 1e-6, false);
  const m = computeJourneyCameraState((stage.start + stage.end) / 2, false);
  const e = computeJourneyCameraState(stage.end - 1e-6, false);
  console.log(
    `${stage.id.padEnd(22)} zoom [${s.zoom.toFixed(2)} -> ${m.zoom.toFixed(2)} -> ${e.zoom.toFixed(2)}]  center-start=(${s.center[0].toFixed(2)},${s.center[1].toFixed(2)}) center-end=(${e.center[0].toFixed(2)},${e.center[1].toFixed(2)})`
  );
}
