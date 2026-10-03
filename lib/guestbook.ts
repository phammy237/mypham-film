/* Shared by the lock wall (client) and its API routes (server): types and small pure helpers only. */
export type Note = { id: string; name: string; text: string; color: number; shape: number; city?: string; at: number };
export type Gold = { name: string; text: string };
export type Stats = { locks: number; cities: number };

/** shown on the big gold lock until a different message is set from the admin page */
export const GOLD_DEFAULT: Gold = {
  name: "My",
  text: "Thank you for stopping by! Snap a lock on the fence: a hello, a tip, a favourite place. I read every one.",
};

/** strip control and zero-width characters, collapse whitespace; React escapes the rest on render */
export function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    const bad = c < 32 || c === 127 || (c >= 0x200b && c <= 0x200f) || (c >= 0x2028 && c <= 0x202e);
    out += bad ? " " : value[i];
  }
  return out.replace(/\s+/g, " ").trim().slice(0, max);
}

/** a whole number within [0, max], else a random one (the visitor picks the lock's colour and shape) */
export function pick(value: unknown, max: number): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max ? value : Math.floor(Math.random() * (max + 1));
}

export function parseNote(raw: string): Note | null {
  try {
    const n = JSON.parse(raw) as Note;
    return n && typeof n.id === "string" && typeof n.text === "string" ? n : null;
  } catch {
    return null;
  }
}

export function statsOf(notes: Note[]): Stats {
  const cities = new Set(notes.map((n) => (n.city ?? "").trim().toLowerCase()).filter(Boolean));
  return { locks: notes.length, cities: cities.size };
}

export type Season = "spring" | "summer" | "autumn" | "winter";
export function seasonOf(d: Date): Season {
  const m = d.getMonth(); // 0 = January
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}
