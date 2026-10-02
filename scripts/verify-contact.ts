import assert from "node:assert/strict";

async function main() {
  process.env.RESEND_API_KEY = "re_test_only";
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test";
  let quota = 0;
  let sends = 0;
  let unavailable = false;
  let sentBody: Record<string, unknown> = {};
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (String(input) === "https://redis.test") {
      if (unavailable) throw new Error("Unavailable");
      return Response.json({ result: quota++ < 20 ? 0 : 3600 });
    }
    assert.match(String(input), /^https:\/\/api\.resend\.com\/emails$/);
    sends++;
    sentBody = JSON.parse(String(init?.body));
    return Response.json({ id: "test-email" });
  };
  try {
    const { POST } = await import("../app/api/contact/route");
    const valid = { name: "  Test  ", contact: "  test@example.com  ", message: "  Hello  " };
    const send = (body: unknown) => POST(new Request("http://localhost/api/contact", {
      method: "POST", body: JSON.stringify(body),
    }));
    for (const body of [null, [], 5, {}, { ...valid, name: " " }, { ...valid, contact: 12 },
      { ...valid, message: [] }, { ...valid, subject: null }, { ...valid, name: "a".repeat(101) },
      { ...valid, message: "a".repeat(5001) }, { ...valid, contact: "a\nb" },
      { ...valid, message: "a".repeat(33000) }]) {
      assert.equal((await send(body)).status, 400);
    }
    assert.equal((await POST(new Request("http://localhost/api/contact", { method: "POST", body: "{" }))).status, 400);
    assert.equal((await send({ ...valid, website: "spam.example" })).status, 200);
    assert.equal(sends, 0);
    assert.equal(quota, 0);
    assert.equal((await send(valid)).status, 200);
    assert.equal(sentBody.subject, "New message from Test");
    assert.equal(sentBody.reply_to, "test@example.com");
    assert.equal(sentBody.text, "From: Test\nContact: test@example.com\n\nHello");
    const responses = await Promise.all(Array.from({ length: 24 }, () => send(valid)));
    assert.equal(sends, 20);
    assert.equal(responses.filter((r) => r.status === 429).length, 5);
    assert.equal(responses.find((r) => r.status === 429)?.headers.get("Retry-After"), "3600");
    unavailable = true;
    assert.equal((await send(valid)).status, 503);
    assert.equal(sends, 20);
    console.log("Contact validation, honeypot, trimming, concurrent quota, and fail-closed checks passed.");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
