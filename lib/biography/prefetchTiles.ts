import { computeJourneyCameraState } from "@/lib/biography/journeyMapCamera";
import { OPENFREEMAP_TILEJSON_URL } from "@/lib/biography/mapStyle";

const PATH_SAMPLES = 160;
const CONCURRENCY = 4;

function lonLatToTileFloat(lon: number, lat: number, z: number): [number, number] {
  const n = 2 ** z;
  const latClamped = Math.max(-85.0511, Math.min(85.0511, lat));
  const x = ((lon + 180) / 360) * n;
  const latRad = (latClamped * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return [x, y];
}

/**
 * Warms the browser's HTTP cache with the vector tiles the scroll journey will need (walking the real
 * camera path), so the map never has to wait on the tile server mid-scroll. Low priority, a few at a
 * time, nothing is parsed or rendered here, and it quietly does nothing on data-saver / slow links or
 * if anything fails — worst case the map just loads tiles on demand exactly as before.
 */
export async function prefetchJourneyTiles(signal: AbortSignal): Promise<void> {
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? "")) return;

  const tileJson = (await fetch(OPENFREEMAP_TILEJSON_URL, { signal }).then((r) => r.json())) as { tiles?: string[]; maxzoom?: number };
  const template = tileJson.tiles?.[0];
  if (!template) return;
  const maxZoom = typeof tileJson.maxzoom === "number" ? tileJson.maxzoom : 14;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const limit = W < 768 ? 80 : 200;
  const seen = new Set<string>();
  const urls: string[] = [];
  for (let i = 0; i <= PATH_SAMPLES && urls.length < limit; i++) {
    const cam = computeJourneyCameraState(i / PATH_SAMPLES, false);
    const z = Math.min(maxZoom, Math.max(0, Math.floor(cam.zoom)));
    const n = 2 ** z;
    const tilePx = 512 * 2 ** (cam.zoom - z);
    const [cx, cy] = lonLatToTileFloat(cam.center[0], cam.center[1], z);
    const halfW = W / tilePx / 2;
    const halfH = H / tilePx / 2;
    for (let x = Math.floor(cx - halfW); x <= Math.floor(cx + halfW); x++) {
      for (let y = Math.floor(cy - halfH); y <= Math.floor(cy + halfH); y++) {
        if (y < 0 || y >= n) continue;
        const wx = ((x % n) + n) % n;
        const key = `${z}/${wx}/${y}`;
        if (seen.has(key)) continue;
        seen.add(key);
        urls.push(template.replace("{z}", String(z)).replace("{x}", String(wx)).replace("{y}", String(y)));
      }
    }
  }

  let next = 0;
  const worker = async () => {
    while (next < urls.length && !signal.aborted) {
      const url = urls[next++];
      try {
        const res = await fetch(url, { signal, priority: "low" } as RequestInit);
        await res.arrayBuffer();
      } catch {
        // a missed tile is simply fetched on demand later
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}
