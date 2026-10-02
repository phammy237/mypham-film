/**
 * Data-preservation check for the biography journey.
 *
 * Snapshots every existing Hanoi/US pin's id, order, and coordinates and asserts they still
 * match exactly. Run before AND after any change to the globe/map renderer to prove no
 * biography content was altered in the process. Fails loudly (throws) on any mismatch —
 * it never silently "fixes" the source data.
 *
 * Usage: npm run verify:biography-data
 */
import assert from "node:assert/strict";
import { hanoiJourneyPins } from "../data/biography/hanoiJourney";
import { usJourneyPins } from "../data/biography/usJourney";
import { chapters, routeArc } from "../data/biography/biography";

type Snapshot = { id: string; number: number; lat: number; lon: number };

const EXPECTED_HANOI: Snapshot[] = [
  // Deliberately rounded to neighborhood-level precision (Phase 5 privacy pass) — was
  // { lat: 21.0107, lon: 105.8182 }, street-level precise enough to identify a specific residence.
  { id: "home-early-childhood", number: 1, lat: 21.01, lon: 105.82 },
  { id: "nam-thanh-cong", number: 2, lat: 21.0168, lon: 105.8112 },
  { id: "ngoi-sao-ha-noi", number: 3, lat: 21.0098, lon: 105.8003 },
  { id: "cau-giay-secondary", number: 4, lat: 21.03, lon: 105.798 },
  { id: "nguyen-hue-gifted", number: 5, lat: 20.9637, lon: 105.7658 },
];

const EXPECTED_US: Snapshot[] = [
  // Real coordinates for 1821 Sunset Dr, Bettendorf, IA (Rivermont Collegiate), looked up and
  // confirmed — no longer the earlier placeholder guess.
  { id: "rivermont", number: 1, lat: 41.5293, lon: -90.5081 },
  { id: "gainesville", number: 2, lat: 29.6516, lon: -82.3248 },
];

function toSnapshot(p: { id: string; number: number; coordinates: { lat: number; lon: number } }): Snapshot {
  return { id: p.id, number: p.number, lat: p.coordinates.lat, lon: p.coordinates.lon };
}

function checkChapter(label: string, actual: Snapshot[], expected: Snapshot[]) {
  assert.equal(actual.length, expected.length, `${label}: pin count changed (expected ${expected.length}, got ${actual.length})`);

  const ids = actual.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, `${label}: duplicate pin IDs found`);

  const numbers = actual.map((p) => p.number);
  assert.equal(new Set(numbers).size, numbers.length, `${label}: duplicate pin numbers found`);

  actual.forEach((pin, i) => {
    const exp = expected[i];
    assert.ok(exp, `${label}: unexpected extra pin "${pin.id}" at index ${i} (not in snapshot)`);
    assert.equal(pin.id, exp.id, `${label}: pin order changed at index ${i} (expected "${exp.id}", got "${pin.id}")`);
    assert.equal(pin.number, exp.number, `${label}: pin "${pin.id}" number changed (expected ${exp.number}, got ${pin.number})`);
    assert.equal(pin.lat, exp.lat, `${label}: pin "${pin.id}" latitude changed (expected ${exp.lat}, got ${pin.lat})`);
    assert.equal(pin.lon, exp.lon, `${label}: pin "${pin.id}" longitude changed (expected ${exp.lon}, got ${pin.lon})`);
    assert.ok(pin.lat >= -90 && pin.lat <= 90, `${label}: pin "${pin.id}" latitude ${pin.lat} out of range`);
    assert.ok(pin.lon >= -180 && pin.lon <= 180, `${label}: pin "${pin.id}" longitude ${pin.lon} out of range`);
  });
}

function checkChapterTargets() {
  assert.equal(chapters.length, 2, `expected 2 chapters, found ${chapters.length}`);
  assert.equal(chapters[0].id, "vietnam");
  assert.equal(chapters[1].id, "united-states");
  assert.deepEqual(chapters[0].globeTarget, { lat: 21.0285, lon: 105.8542 }, "vietnam globeTarget changed");
  assert.deepEqual(chapters[1].globeTarget, { lat: 39.5, lon: -98.35 }, "united-states globeTarget changed");
  assert.deepEqual(routeArc.from, chapters[0].globeTarget, "routeArc.from no longer matches vietnam globeTarget");
  assert.deepEqual(routeArc.to, chapters[1].globeTarget, "routeArc.to no longer matches united-states globeTarget");
}

function checkMissingContent() {
  for (const pin of hanoiJourneyPins) {
    assert.ok(pin.title, `Hanoi pin "${pin.id}" missing a title`);
    assert.ok(pin.backstory && pin.backstory.length > 0, `Hanoi pin "${pin.id}" missing backstory`);
    // `image`/`gallery` are intentionally optional — a pin with no real photo yet (e.g. Cầu Giấy)
    // must omit them rather than fall back to a generic stock path. Not asserted here on purpose.
  }
  for (const pin of usJourneyPins) {
    assert.ok(pin.title, `US pin "${pin.id}" missing a title`);
    assert.ok(pin.storySections && pin.storySections.length > 0, `US pin "${pin.id}" missing story sections`);
  }
}

function main() {
  checkChapter("Hanoi", hanoiJourneyPins.map(toSnapshot), EXPECTED_HANOI);
  checkChapter("United States", usJourneyPins.map(toSnapshot), EXPECTED_US);
  checkChapterTargets();
  checkMissingContent();

  console.log("✓ Biography data preserved exactly:");
  console.log(`  Hanoi: ${hanoiJourneyPins.length} pins (ids/coords/order unchanged)`);
  console.log(`  United States: ${usJourneyPins.length} pins (ids/coords/order unchanged)`);
  console.log(`  Note: "rivermont" coordinate (${EXPECTED_US[0].lat}, ${EXPECTED_US[0].lon}) is the real, looked-up address — no longer a placeholder.`);
}

main();
