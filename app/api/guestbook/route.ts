import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { hasRedis, rateLimit, redis } from "@/lib/upstash";
import { GOLD_DEFAULT, clean, parseNote, pick, statsOf, type Gold, type Note } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

const KEY = "guestbook:notes";       // approved locks, newest first
const PENDING = "guestbook:pending"; // waiting for approval, never shown publicly
const GOLD = "guestbook:gold";       // the owner's pinned message
const SHOW = 60;  // approved locks shown on the wall

export async function GET() {
  const empty = { configured: false, notes: [] as Note[], gold: GOLD_DEFAULT, stats: { locks: 0, cities: 0 } };
  if (!hasRedis()) return NextResponse.json(empty);
  try {
    const [raw, goldRaw] = await Promise.all([
      redis<string[]>(["LRANGE", KEY, 0, SHOW - 1]),
      redis<string | null>(["GET", GOLD]),
    ]);
    const notes = raw.map(parseNote).filter((n): n is Note => !!n);
    let gold: Gold = GOLD_DEFAULT;
    if (goldRaw) { try { const g = JSON.parse(goldRaw) as Gold; if (g?.text) gold = g; } catch { /* keep default */ } }
    return NextResponse.json({ configured: true, notes, gold, stats: statsOf(notes) });
  } catch {
    return NextResponse.json({ ...empty, configured: true, error: "Couldn't load the wall just now." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!hasRedis()) return NextResponse.json({ error: "The lock wall isn't switched on yet." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > 4096) throw new Error("too large");
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bad body");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "That note didn't look right." }, { status: 400 });
  }

  // hidden field real people never fill in
  if (clean(body.website, 100)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 30) || "a friend";
  const city = clean(body.city, 40);
  const text = clean(body.text, 200);
  if (text.length < 2) return NextResponse.json({ error: "Write at least a few words." }, { status: 400 });
  if (/https?:\/\/|www\./i.test(`${text} ${name} ${city}`)) return NextResponse.json({ error: "Please leave links out of the notes." }, { status: 400 });

  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    const who = createHash("sha256").update(ip).digest("hex").slice(0, 24);
    const [perPerson, overall] = await Promise.all([
      rateLimit(`guestbook:ip:${who}`, 3, 3600),
      rateLimit("guestbook:all", 60, 3600),
    ]);
    const wait = Math.max(perPerson, overall);
    if (wait > 0) return NextResponse.json({ error: "That's plenty for now. Try again a little later." }, { status: 429, headers: { "Retry-After": String(wait) } });

    const note: Note = { id: randomUUID(), name, text, color: pick(body.color, 3), shape: pick(body.shape, 1), ...(city ? { city } : {}), at: Date.now() };
    // goes to the approval queue; it only appears on the wall once approved from /admin/locks
    await redis(["LPUSH", PENDING, JSON.stringify(note)]);
    await redis(["LTRIM", PENDING, 0, 199]);
    return NextResponse.json({ ok: true, pending: true, note });
  } catch {
    return NextResponse.json({ error: "Couldn't save that just now. Try again in a moment." }, { status: 503 });
  }
}
