import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* Spotify "now playing". Switched on by three env vars (see .env.example); until they exist this answers
   { configured: false } and the footer line simply doesn't show. */
type Payload = { configured: boolean; isPlaying?: boolean; title?: string; artist?: string; url?: string };

let cache: { at: number; body: Payload } | null = null;
const TTL = 25_000;

async function accessToken(): Promise<string> {
  const id = process.env.SPOTIFY_CLIENT_ID!, secret = process.env.SPOTIFY_CLIENT_SECRET!, refresh = process.env.SPOTIFY_REFRESH_TOKEN!;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error("token");
  return (await res.json()).access_token as string;
}

type Track = { name: string; artists: { name: string }[]; external_urls?: { spotify?: string } };
const shape = (t: Track, isPlaying: boolean): Payload => ({
  configured: true, isPlaying, title: t.name, artist: t.artists.map((a) => a.name).slice(0, 2).join(", "), url: t.external_urls?.spotify,
});

export async function GET() {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json({ configured: false } satisfies Payload);
  }
  if (cache && Date.now() - cache.at < TTL) return NextResponse.json(cache.body);
  try {
    const token = await accessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const now = await fetch("https://api.spotify.com/v1/me/player/currently-playing", { headers, cache: "no-store", signal: AbortSignal.timeout(5000) });
    let body: Payload | null = null;
    if (now.status === 200) {
      const j = await now.json();
      if (j?.item && j.currently_playing_type === "track") body = shape(j.item as Track, !!j.is_playing);
    }
    if (!body) {
      const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", { headers, cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (recent.ok) {
        const j = await recent.json();
        const t = j?.items?.[0]?.track as Track | undefined;
        if (t) body = shape(t, false);
      }
    }
    cache = { at: Date.now(), body: body ?? { configured: true } };
    return NextResponse.json(cache.body);
  } catch {
    return NextResponse.json({ configured: true } satisfies Payload);
  }
}
