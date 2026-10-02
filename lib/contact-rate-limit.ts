// A shared, atomic quota bounds email sends even if callers rotate contact details
// or spoof forwarding headers. Never fall back to process-local state in production.
const SCRIPT = `
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count >= 20 then return math.max(1, redis.call('TTL', KEYS[1])) end
count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], 3600) end
return 0
`;

let localWindow = { count: 0, expires: 0 };

export async function reserveContactSend(): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
      throw new Error("Contact rate limiter is not configured.");
    }
    const now = Date.now();
    if (now >= localWindow.expires) localWindow = { count: 0, expires: now + 3600000 };
    if (localWindow.count >= 20) return Math.ceil((localWindow.expires - now) / 1000);
    localWindow.count++;
    return 0;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", SCRIPT, "1", "contact:{email}:hour"]),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Contact rate limiter unavailable.");
  const payload = await response.json();
  if (payload.error || !Number.isInteger(payload.result) || payload.result < 0) {
    throw new Error("Invalid contact rate limiter response.");
  }
  return payload.result;
}
