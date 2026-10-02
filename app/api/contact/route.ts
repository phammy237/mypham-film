import { NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE_EMAIL, CONTACT_FROM_EMAIL } from "@/lib/site";
import { reserveContactSend } from "@/lib/contact-rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function readPayload(req: Request): Promise<Record<string, unknown>> {
  // Enforce the actual streamed size; Content-Length is optional and untrusted.
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Missing body");
  let size = 0;
  let text = "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32768) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      text += decoder.decode(value, { stream: true });
    }
    const payload: unknown = JSON.parse(text + decoder.decode());
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid body");
    return payload as Record<string, unknown>;
  } finally {
    reader.releaseLock();
  }
}

function field(value: unknown, max: number, optional = false): string {
  if (optional && value === undefined) return "";
  if (typeof value !== "string" || value.length > max) throw new Error("Invalid field");
  const trimmed = value.trim();
  if (!optional && !trimmed) throw new Error("Missing field");
  return trimmed;
}

export async function POST(req: Request) {
  let name: string, contact: string, subject: string, message: string, website: string;
  try {
    const payload = await readPayload(req);
    name = field(payload.name, 100);
    contact = field(payload.contact, 254);
    subject = field(payload.subject, 200, true);
    message = field(payload.message, 5000);
    website = field(payload.website, 200, true);
    if (/[\r\n\x00]/.test(name + contact + subject)) throw new Error("Invalid header field");
  } catch {
    return NextResponse.json({ error: "Invalid contact form fields." }, { status: 400 });
  }

  // Silently discard submissions that filled the hidden bot trap.
  if (website) return NextResponse.json({ ok: true });

  if (!resend) {
    console.error("Contact form submission failed: RESEND_API_KEY is not configured.");
    return NextResponse.json({ error: "Email service is not configured." }, { status: 500 });
  }

  const replyTo = EMAIL_RE.test(contact) ? contact : undefined;

  try {
    const retryAfter = await reserveContactSend();
    if (retryAfter > 0) {
      return NextResponse.json({ error: "Too many messages. Please try again later." }, {
        status: 429, headers: { "Retry-After": String(retryAfter) },
      });
    }
  } catch {
    console.error("Contact rate limiter unavailable; email was not sent.");
    return NextResponse.json({ error: "Contact form is temporarily unavailable." }, { status: 503 });
  }

  try {
    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: SITE_EMAIL,
      replyTo,
      subject: subject || `New message from ${name}`,
      text: `From: ${name}\nContact: ${contact}\n\n${message}`,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json({ error: "Failed to send message." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
