/**
 * Live public data from myOS (Career OS), via its read-only portfolio export: GET /api/portfolio/v1 with a
 * `cos_pub_…` bearer key (see docs/myos/PORTFOLIO_API.md in the job-application-tool repo). myOS only returns items
 * that are PUBLIC and approved, so anything here is already cleared for the website.
 *
 * Server-side only: the key is a bearer secret and must never reach the browser. Optional: with either env var
 * missing, or if myOS is down or slow, the chatbot just uses the static site data.
 */
const TTL_MS = 5 * 60_000;
const FAIL_TTL_MS = 60_000;
const TIMEOUT_MS = 4000;

let cache: { text: string; at: number; ttl: number } | null = null;
let inflight: Promise<string> | null = null;

const str = (v: unknown, max = 400): string => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const list = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object").slice(0, 60) : []);

function format(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as Record<string, unknown>;
  if (d.schemaVersion !== "myos.portfolio.v1") return "";
  const lines: string[] = [];

  const profile = (d.profile ?? {}) as Record<string, unknown>;
  const headline = str(profile.headline, 200);
  if (headline) lines.push(`Headline: ${headline}`);

  const projects = list(d.projects).map((p) => {
    const skills = Array.isArray(p.skills) ? p.skills.map((s) => str(s, 60)).filter(Boolean).slice(0, 12).join(", ") : "";
    const dates = [str(p.startDate, 20), str(p.endDate, 20) || (str(p.startDate, 20) ? "present" : "")].filter(Boolean).join(" to ");
    return `- ${str(p.name, 120)}${str(p.status, 20) ? ` [${str(p.status, 20).toLowerCase()}]` : ""}${dates ? ` (${dates})` : ""}. ${str(p.summary, 500)}${skills ? ` Skills: ${skills}.` : ""}`.trim();
  }).filter((l) => l.length > 3);
  if (projects.length) lines.push("Projects tracked in myOS:", ...projects);

  const skills = list(d.skills).map((s) => `${str(s.name, 60)}${str(s.level, 20) ? ` (${str(s.level, 20).toLowerCase()})` : ""}`).filter((s) => s.length > 2);
  if (skills.length) lines.push(`Skills: ${skills.join(", ")}`);

  const achievements = list(d.achievements).map((a) => `- ${str(a.title, 200)}${str(a.occurredOn, 20) ? ` (${str(a.occurredOn, 20)})` : ""}`).filter((l) => l.length > 3);
  if (achievements.length) lines.push("Achievements:", ...achievements);

  return lines.length ? lines.join("\n") : "";
}

async function load(): Promise<string> {
  const url = process.env.MYOS_PORTFOLIO_URL;
  const key = process.env.MYOS_PORTFOLIO_API_KEY;
  if (!url || !key) return "";
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`myOS portfolio export returned ${res.status}`);
      return "";
    }
    return format(await res.json());
  } catch (error) {
    console.error("myOS portfolio export failed:", error instanceof Error ? error.name : "unknown");
    return "";
  }
}

/** formatted myOS section for the chatbot's knowledge ("" when not configured or unavailable) */
export async function getMyosKnowledge(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.at < cache.ttl) return cache.text;
  inflight ??= load()
    .then((text) => {
      const prev = cache?.text ?? "";
      // a failed refresh keeps serving the last good copy for a minute instead of dropping the section
      const next = text || prev;
      cache = { text: next, at: Date.now(), ttl: text ? TTL_MS : FAIL_TTL_MS };
      return next;
    })
    .finally(() => { inflight = null; });
  return inflight;
}
