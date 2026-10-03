"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { YouAreHere, NextStop } from "@/components/layout/Wayfinding";
import { Guestbook } from "@/components/ui/Guestbook";
import { socials } from "@/components/ui/SocialLinks";

const MODES = [
  { key: "In person", desc: "Same city? Let's meet." },
  { key: "Remote", desc: "Different city? We have WiFi." },
] as const;

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

export default function ConnectPage() {
  const [mode, setMode] = useState<(typeof MODES)[number]["key"]>("In person");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, website, subject: "Let's Connect — My Pham", message: `${mode}\n\n${message}` }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName("");
      setContact("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />

      <div className="mx-auto max-w-[1000px] px-[5vw] pb-24 pt-28">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5"><YouAreHere page="Connect" /></div>
          <p className="f-hand mb-1 text-3xl text-[var(--blue)]" style={{ transform: "rotate(-2deg)", transformOrigin: "left" }}>let&apos;s hang</p>
          <h1 className="f-h1 mb-6"><span className="f-mark">connect</span></h1>
          <div className="mb-10 flex gap-3">
            <SparkleIcon className="mt-1 shrink-0 text-[var(--butter)] drop-shadow-[0_0_1px_rgba(32,32,30,.6)]" />
            <div className="f-type text-lg leading-relaxed">
              <p>I genuinely love meeting people.</p>
              <p>Same city? Let&apos;s meet. Different city? We have WiFi.</p>
            </div>
          </div>
        </motion.div>

        {/* the ticket: details on the left, the tear-off stub with send + socials on the right */}
        <motion.form onSubmit={handleSend} className="ct-ticket" initial={{ opacity: 0, y: 24, rotate: -1.5 }} animate={{ opacity: 1, y: 0, rotate: -0.6 }} transition={{ delay: 0.1, type: "spring", stiffness: 120, damping: 16 }}>
          <div className="ct-main">
            <p className="ct-kicker">admit one · now showing in Gainesville, FL</p>
            <h2 className="ct-title">Let&apos;s hang</h2>

            <div role="radiogroup" aria-label="How should we meet?" className="ct-modes">
              {MODES.map((m) => (
                <button key={m.key} type="button" role="radio" aria-checked={mode === m.key} className="ct-mode" onClick={() => setMode(m.key)}>
                  <span className="ct-mode-name">{m.key}</span>
                  <span className="ct-mode-desc">{m.desc}</span>
                </button>
              ))}
            </div>

            <div className="hidden" aria-hidden="true">
              <label>Website<input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
            </div>
            <div className="ct-fields">
              <label className="ct-label">Your name
                <input className="ct-field" type="text" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Who's coming?" />
              </label>
              <label className="ct-label">Email or phone
                <input className="ct-field" type="text" required maxLength={254} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Where can I reach you?" />
              </label>
            </div>
            <label className="ct-label">Message
              <textarea className="ct-field ct-area" required rows={3} maxLength={4800} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell me a bit about what you have in mind…" />
            </label>
          </div>

          <div className="ct-stub">
            <div>
              <p className="ct-kicker">seat</p>
              <p className="f-hand ct-seat">{mode === "In person" ? "front row" : "on the line"}</p>
            </div>
            <div className="ct-bars" aria-hidden="true" />
            <div className="grid gap-2">
              <button type="submit" disabled={status === "sending"} className="ct-send">
                {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Tear & send →"}
              </button>
              <p className="ct-status" role="status">{status === "error" ? "Something went wrong. Try again or email me." : status === "sent" ? "Got it. Talk soon!" : "Goes straight to my inbox."}</p>
            </div>
            <div>
              <p className="ct-kicker">or find me</p>
              <ul className="ct-socials">
                {socials.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" aria-label={label} title={label}><Icon /></a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.form>

        <motion.div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[var(--sky)] px-6 py-5 text-[#20201E] sm:flex-row sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center gap-3">
            <SparkleIcon className="shrink-0" />
            <p className="f-type">If our paths cross, I&apos;d love to connect.</p>
          </div>
          <p className="f-hand text-2xl">good people &gt; everything.</p>
        </motion.div>
      </div>

      <Guestbook />

      <NextStop from="Connect" />
      <Footer />
    </main>
  );
}
