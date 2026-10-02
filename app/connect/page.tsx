"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { YouAreHere, NextStop } from "@/components/layout/Wayfinding";
import { SITE_EMAIL } from "@/lib/site";

const fieldClass = "font-mono text-sm bg-base dark:bg-white/5 border border-border dark:border-white/10 rounded-xl px-4 py-3 text-surface dark:text-white placeholder:text-muted/60 dark:placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-colors";

/* ─── Icons ────────────────────────────────────────── */
type IconProps = { className?: string };

function SparkleIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

function MailIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInBoxIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10.5v6M7.5 7.5v.01M11.5 16.5v-3.7c0-1.1.9-2 2-2s2 .9 2 2v3.7M11.5 10.5v6" />
    </svg>
  );
}

function DocumentIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}

function GlobeIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

function MapPinIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function WavyDivider() {
  return (
    <svg viewBox="0 0 320 60" className="h-10 w-full max-w-[320px] text-border dark:text-white/15" fill="none" aria-hidden="true">
      <path d="M0 40c40 0 40-25 80-25s40 25 80 25 40-25 80-25 40 25 80 25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 5" />
      <circle cx="163" cy="27" r="4" className="fill-accent" />
    </svg>
  );
}

/* ─── Content ──────────────────────────────────────── */
const meetModes = [
  { key: "in-person", title: "In Person", desc: "Let's meet up if we're in the same city." },
  { key: "remote", title: "Remote", desc: "Different city? No problem." },
] as const;

const options = [
  { emoji: "☕", title: "Coffee Chat", desc: "Wanna swap stories, talk careers, or just vibe over coffee? I'm always down.", subject: "Coffee Chat with My" },
  { emoji: "🏈", title: "Go to a Game", desc: "UF football, basketball, you name it. Swamp season is always better with company.", subject: "Let's Go to a Game!" },
  { emoji: "🚶", title: "Go on a Walk", desc: "Sometimes the best convos happen while moving. Around campus, the trails, wherever.", subject: "Let's Go on a Walk" },
  { emoji: "📋", title: "Case Study Together", desc: "Prepping for consulting recruiting? I'm always up for casing with driven people.", subject: "Case Study Session with My" },
  { emoji: "🍜", title: "Grab Food", desc: "Good food, good conversation. Always yes to trying somewhere new in Gainesville.", subject: "Let's Grab Food!" },
  { emoji: "💡", title: "Talk Product / Strategy", desc: "Working on something interesting? Want a fresh perspective? Let's think through it together.", subject: "Product / Strategy Chat with My" },
  { emoji: "🌐", title: "Just Network", desc: "Recruiter, founder, student — if you want to connect professionally, my door's always open.", subject: "Let's Connect — My Pham" },
  { emoji: "🎵", title: "Something Else", desc: "Have something else in mind? Concert, project collab, random idea? Just shoot your shot.", subject: "Hey My!" },
];

export default function ConnectPage() {
  const [meetMode, setMeetMode] = useState<(typeof meetModes)[number]["key"]>("in-person");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<string>(options[0].title);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const selectedOpt = options.find((o) => o.title === selected)!;
  const selectedMode = meetModes.find((m) => m.key === meetMode)!;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          website,
          subject: selectedOpt.subject,
          message: `${selectedOpt.title} · ${selectedMode.title}\n\n${message}`,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName("");
      setContact("");
      setMessage("");
      setTimeout(() => {
        setStatus("idle");
        setShowForm(false);
      }, 4000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-base dark:bg-navy">
      <Navbar />

      <div className="grid gap-12 px-[5vw] pb-24 pt-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 max-w-[1400px] mx-auto">
        {/* ─── Left column ─────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-5"><YouAreHere page="Connect" /></div>
          <p className="eyebrow text-accent dark:text-accent-lavender mb-3">Let&apos;s hang</p>
          <h1 className="heading text-6xl md:text-7xl mb-6">Connect</h1>

          <div className="flex gap-3">
            <SparkleIcon className="mt-1 shrink-0 text-accent/70" />
            <div className="font-body text-lg text-surface/80 dark:text-white/70 leading-relaxed">
              <p>I genuinely love meeting people.</p>
              <p>Same city? Let&apos;s meet.</p>
              <p>Different city? We have WiFi.</p>
            </div>
          </div>

          <div className="my-8 hidden sm:block">
            <WavyDivider />
          </div>

          <div className="flex flex-col gap-3 mt-8 sm:mt-0">
            <a href={`mailto:${SITE_EMAIL}`} className="group flex items-center gap-2.5 font-body text-surface dark:text-white hover:text-accent dark:hover:text-accent-lavender transition-colors w-fit">
              <MailIcon className="text-accent dark:text-accent-lavender" /> Email
              <ArrowUpRightIcon className="text-muted/50 dark:text-white/40 group-hover:text-accent dark:group-hover:text-accent-lavender transition-colors" />
            </a>
            <a href="https://linkedin.com/in/mypham237" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2.5 font-body text-surface dark:text-white hover:text-accent dark:hover:text-accent-lavender transition-colors w-fit">
              <LinkedInBoxIcon className="text-accent dark:text-accent-lavender" /> LinkedIn
              <ArrowUpRightIcon className="text-muted/50 dark:text-white/40 group-hover:text-accent dark:group-hover:text-accent-lavender transition-colors" />
            </a>
            <a href="/cv" className="group flex items-center gap-2.5 font-body text-surface dark:text-white hover:text-accent dark:hover:text-accent-lavender transition-colors w-fit">
              <DocumentIcon className="text-accent dark:text-accent-lavender" /> Resume
              <ArrowUpRightIcon className="text-muted/50 dark:text-white/40 group-hover:text-accent dark:group-hover:text-accent-lavender transition-colors" />
            </a>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 p-5 max-w-[340px]">
            <GlobeIcon className="mt-0.5 shrink-0 text-accent dark:text-accent-lavender" />
            <div>
              <p className="font-body font-medium text-surface dark:text-white">Based in Gainesville, FL</p>
              <p className="body-copy text-sm dark:text-white/45 mt-0.5">Open to connecting anywhere in the world.</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Right column ────────────────────────── */}
        <div>
          {/* 01 — How should we meet */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="eyebrow text-accent dark:text-accent-lavender mb-4">01 / How should we meet?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {meetModes.map((mode) => {
                const active = meetMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setMeetMode(mode.key)}
                    className={`text-left rounded-2xl border p-5 transition-colors duration-200 ${
                      active
                        ? "border-accent/60 bg-accent/[0.06] dark:border-accent-lavender/70 dark:bg-accent/10"
                        : "border-border dark:border-white/10 hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-display text-xl ${active ? "text-accent dark:text-accent-lavender" : "text-surface dark:text-white"}`}>{mode.title}</h3>
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                          active ? "border-accent bg-accent text-white dark:border-accent-lavender dark:bg-accent-lavender dark:text-navy" : "border-border dark:border-white/20 text-transparent"
                        }`}
                      >
                        <CheckIcon />
                      </span>
                    </div>
                    <p className="body-copy text-sm dark:text-white/50 leading-relaxed">{mode.desc}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* 02 — Where I'll be */}
          <motion.div className="mt-10 pt-10 border-t border-border dark:border-white/10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <p className="eyebrow text-accent dark:text-accent-lavender mb-4">02 / Where I&apos;ll be</p>
            <div className="flex items-center gap-3 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 px-5 py-4">
              <MapPinIcon className="text-accent dark:text-accent-lavender shrink-0" />
              <span className="font-body text-surface dark:text-white">Gainesville, FL</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent bg-accent/10 border border-accent/25 rounded-full px-2.5 py-1 dark:text-accent-lavender dark:bg-accent/20 dark:border-accent-lavender/40">
                Current
              </span>
            </div>
          </motion.div>

          {/* 03 — What sounds good */}
          <motion.div className="mt-10 pt-10 border-t border-border dark:border-white/10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
            <p className="eyebrow text-accent dark:text-accent-lavender mb-4">03 / What sounds good?</p>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex w-full items-center gap-3 rounded-xl border border-border dark:border-white/10 bg-card dark:bg-white/5 px-5 py-4 text-left hover:border-accent/30 transition-colors"
              >
                <span className="text-xl">{selectedOpt.emoji}</span>
                <span className="heading text-xl flex-1">{selectedOpt.title}</span>
                <ChevronDownIcon className={`text-muted dark:text-white/40 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 mt-2 w-full rounded-xl border border-border dark:border-white/10 bg-white dark:bg-[#1E2847] shadow-xl overflow-hidden max-h-72 overflow-y-auto"
                  >
                    {options.map((opt) => (
                      <button
                        key={opt.title}
                        type="button"
                        onClick={() => {
                          setSelected(opt.title);
                          setDropdownOpen(false);
                          setShowForm(false);
                          setStatus("idle");
                        }}
                        className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${
                          opt.title === selected ? "bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent-lavender" : "text-surface dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        <span className="font-body text-sm">{opt.title}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <p className="font-body text-surface/80 dark:text-white/60 leading-relaxed max-w-sm">{selectedOpt.desc}</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="shrink-0 inline-flex items-center gap-2 font-mono text-sm px-6 py-3 border border-accent/40 text-accent hover:bg-accent hover:text-white transition-colors duration-200 rounded-xl dark:border-accent-lavender dark:bg-accent-lavender dark:text-navy dark:hover:bg-accent-lavender/85"
              >
                Let&apos;s do it <span aria-hidden="true">→</span>
              </button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleSend} className="mt-6 flex flex-col gap-4 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 p-6">
                    <div className="hidden" aria-hidden="true">
                      <label>Website<input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        placeholder="Your name"
                        required
                        value={name}
                        maxLength={100}
                        onChange={(e) => setName(e.target.value)}
                        className={`flex-1 ${fieldClass}`}
                      />
                      <input
                        type="text"
                        placeholder="Your email or phone number"
                        required
                        value={contact}
                        maxLength={254}
                        onChange={(e) => setContact(e.target.value)}
                        className={`flex-1 ${fieldClass}`}
                      />
                    </div>
                    <textarea
                      placeholder="Tell me a bit about what you have in mind..."
                      value={message}
                      maxLength={4800}
                      required
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className={`${fieldClass} resize-none`}
                    />
                    <div className="flex items-center gap-4">
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="font-mono text-sm px-6 py-3 bg-accent text-white hover:bg-accent/90 disabled:opacity-60 transition-colors duration-200 rounded-xl dark:bg-accent-lavender dark:text-navy dark:hover:bg-accent-lavender/85"
                      >
                        {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send to My →"}
                      </button>
                      <p className="font-mono text-xs text-muted dark:text-white/30">
                        {status === "error" ? "Something went wrong — try again or email me directly." : "Sends straight to my inbox."}
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Bottom banner */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/5 px-6 py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-3">
              <SparkleIcon className="text-accent/70 shrink-0" />
              <p className="font-body text-surface dark:text-white">If our paths cross, I&apos;d love to connect.</p>
            </div>
            <p className="font-display italic text-lg text-accent dark:text-accent-lavender">Good people &gt; everything.</p>
          </motion.div>
        </div>
      </div>

      <NextStop from="Connect" />
      <Footer />
    </main>
  );
}
