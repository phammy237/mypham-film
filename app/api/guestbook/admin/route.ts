import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { hasRedis, rateLimit, redis } from "@/lib/upstash";
import { GOLD_DEFAULT, clean, parseNote, type Gold, type Note } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

const KEY = "guestbook:notes";
const PENDING = "guestbook:pending";
const GOLD = "guestbook:gold";
const KEEP = 100;

/* Owner-only: approve or reject new locks, remove old ones, set the gold lock's message.
   Guarded by GUESTBOOK_ADMIN_TOKEN, sent as the x-admin-token header by /admin/locks. */
async function authorize(req: Request): Promise<NextResponse | null> {
  const token = process.env.GUESTBOOK_ADMIN_TOKEN;
  if (!token || !hasRedis()) return NextResponse.json({ error: "Admin isn't set up yet." }, { status: 503 });
  const sent = req.headers.get("x-admin-token") ?? "";
  const a = createHash("sha256").update(sent).digest();
  const b = createHash("sha256").update(token).digest();
  if (timingSafeEqual(a, b)) return null;
  // slow down guessing
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    const who = createHash("sha256").update(ip).digest("hex").slice(0, 24);
    const wait = await rateLimit(`guestbook:admin-fail:${who}`, 10, 900);
    if (wait > 0) return NextResponse.json({ error: "Too many tries. Wait a bit." }, { status: 429, headers: { "Retry-After": String(wait) } });
  } catch { /* limiter down: still refuse */ }
  return NextResponse.json({ error: "Wrong token." }, { status: 401 });
}

export async function GET(req: Request) {
  const denied = await authorize(req);
  if (denied) return denied;
  try {
    const [pending, approved, goldRaw] = await Promise.all([
      redis<string[]>(["LRANGE", PENDING, 0, 199]),
      redis<string[]>(["LRANGE", KEY, 0, KEEP - 1]),
      redis<string | null>(["GET", GOLD]),
    ]);
    let gold: Gold = GOLD_DEFAULT;
    if (goldRaw) { try { const g = JSON.parse(goldRaw) as Gold; if (g?.text) gold = g; } catch { /* default */ } }
    return NextResponse.json({
      pending: pending.map(parseNote).filter((n): n is Note => !!n),
      approved: approved.map(parseNote).filter((n): n is Note => !!n),
      gold,
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the database." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const denied = await authorize(req);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(await req.text());
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bad");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const action = body.action;
  const id = typeof body.id === "string" ? body.id : "";

  try {
    if (action === "gold") {
      const text = clean(body.text, 300);
      if (!text) { await redis(["DEL", GOLD]); return NextResponse.json({ ok: true, gold: GOLD_DEFAULT }); }
      const gold: Gold = { name: clean(body.name, 30) || "My", text };
      await redis(["SET", GOLD, JSON.stringify(gold)]);
      return NextResponse.json({ ok: true, gold });
    }
    if (action === "approve" || action === "reject") {
      const raws = await redis<string[]>(["LRANGE", PENDING, 0, 199]);
      const raw = raws.find((r) => parseNote(r)?.id === id);
      if (!raw) return NextResponse.json({ error: "That lock isn't waiting any more." }, { status: 404 });
      await redis(["LREM", PENDING, 1, raw]);
      if (action === "approve") { await redis(["LPUSH", KEY, raw]); await redis(["LTRIM", KEY, 0, KEEP - 1]); }
      return NextResponse.json({ ok: true });
    }
    if (action === "remove") {
      const raws = await redis<string[]>(["LRANGE", KEY, 0, KEEP - 1]);
      const raw = raws.find((r) => parseNote(r)?.id === id);
      if (!raw) return NextResponse.json({ error: "Lock not found." }, { status: 404 });
      await redis(["LREM", KEY, 1, raw]);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Couldn't do that just now." }, { status: 503 });
  }
}
