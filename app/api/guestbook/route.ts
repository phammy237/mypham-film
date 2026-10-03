import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { hasRedis, rateLimit, redis } from "@/lib/upstash";

export const dynamic = "force-dynamic";

const KEY = "guestbook:notes";
const KEEP = 100; // newest notes kept
const SHOW = 60;  // notes shown on the wall

type Note = { id: string; name: string; text: string; color: number; shape: number; at: number };

/** a whole number within [0, max], else a random one (the visitor picks the lock's colour and shape) */
function pick(value: unknown, max: number): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max ? value : Math.floor(Math.random() * (max + 1));
}

/** strip control characters / zero-width tricks and collapse whitespace; React escapes the rest on render */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    const bad = c < 32 || c === 127 || (c >= 0x200b && c <= 0x200f) || (c >= 0x2028 && c <= 0x202e);
    out += bad ? " " : value[i];
  }
  return out.replace(/\s+/g, " ").trim().slice(0, max);
}
export async function GET() {
  if (!hasRedis()) return NextResponse.json({ configured: false, notes: [] });
  try {
    const raw = await redis<string[]>(["LRANGE", KEY, 0, SHOW - 1]);
    const notes = raw.map((r) => { try { return JSON.parse(r) as Note; } catch { return null; } }).filter((n): n is Note => !!n);
    return NextResponse.json({ configured: true, notes });
  } catch {
    return NextResponse.json({ configured: true, notes: [], error: "Couldn't load the wall just now." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!hasRedis()) return NextResponse.json({ error: "The guestbook isn't switched on yet." }, { status: 503 });

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
  const text = clean(body.text, 200);
  if (text.length < 2) return NextResponse.json({ error: "Write at least a few words." }, { status: 400 });
  if (/https?:\/\/|www\./i.test(text + " " + name)) return NextResponse.json({ error: "Please leave links out of the notes." }, { status: 400 });

  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    const who = createHash("sha256").update(ip).digest("hex").slice(0, 24);
    const [perPerson, overall] = await Promise.all([
      rateLimit(`guestbook:ip:${who}`, 3, 3600),
      rateLimit("guestbook:all", 60, 3600),
    ]);
    const wait = Math.max(perPerson, overall);
    if (wait > 0) return NextResponse.json({ error: "That's plenty for now. Try again a little later." }, { status: 429, headers: { "Retry-After": String(wait) } });

    const note: Note = { id: randomUUID(), name, text, color: pick(body.color, 3), shape: pick(body.shape, 1), at: Date.now() };
    await redis(["LPUSH", KEY, JSON.stringify(note)]);
    await redis(["LTRIM", KEY, 0, KEEP - 1]);
    return NextResponse.json({ ok: true, note });
  } catch {
    return NextResponse.json({ error: "Couldn't save that just now. Try again in a moment." }, { status: 503 });
  }
}
