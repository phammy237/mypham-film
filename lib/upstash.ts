/* Tiny Upstash Redis REST helper (same env vars the contact form's rate limiter already uses). */
export function hasRedis(): boolean {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
}

export async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash is not configured.");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Upstash request failed (${res.status}).`);
  const payload = await res.json();
  if (payload.error) throw new Error(String(payload.error));
  return payload.result as T;
}

/** atomic "N per window" limiter: returns 0 when allowed, otherwise the seconds to wait */
const LIMIT_SCRIPT = `
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count >= tonumber(ARGV[1]) then return math.max(1, redis.call('TTL', KEYS[1])) end
count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2])) end
return 0
`;

export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<number> {
  const wait = await redis<number>(["EVAL", LIMIT_SCRIPT, 1, key, max, windowSeconds]);
  return Number(wait) || 0;
}
