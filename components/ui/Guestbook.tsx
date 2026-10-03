"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Note = { id: string; name: string; text: string; color: number; at: number };

const COLORS = ["#FBE7A1", "#F4D35E", "#BFD9EC", "#E8DDC7"];
const TILT = [-3, 2, -1.5, 3.5, -2.5, 1.5];

const ago = (at: number) => {
  const s = Math.max(1, Math.round((Date.now() - at) / 1000));
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

/** a wall of sticky notes visitors can add to */
export function Guestbook() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/guestbook").then((r) => r.json()).then((j: { configured?: boolean; notes?: Note[] }) => {
      setConfigured(j.configured !== false);
      setNotes(j.notes ?? []);
    }).catch(() => setConfigured(false)).finally(() => setLoaded(true));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending"); setMessage("");
    try {
      const res = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, text, website }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Couldn't add your note.");
      if (j.note) setNotes((n) => [j.note as Note, ...n]);
      setText(""); setStatus("sent"); setMessage("Pinned to the wall. Thank you!");
      setTimeout(() => setStatus("idle"), 3500);
    } catch (err) {
      setStatus("error"); setMessage(err instanceof Error ? err.message : "Couldn't add your note.");
    }
  }

  return (
    <section className="f-wrap pb-20" aria-labelledby="guestbook-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="guestbook-title" className="f-h2"><span className="f-mark">guestbook wall</span></h2>
        <p className="f-hand text-2xl" style={{ transform: "rotate(-2deg)" }}>leave a note, any note :)</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* write a note */}
        <form onSubmit={submit} className="f-note !rounded-sm !p-5 lg:sticky lg:top-24 lg:self-start" style={{ background: "#FBE7A1", transform: "rotate(-1.5deg)" }}>
          <div className="hidden" aria-hidden="true">
            <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
          </div>
          <label className="f-hand block text-2xl" htmlFor="gb-text">dear My,</label>
          <textarea id="gb-text" required value={text} maxLength={200} rows={4} onChange={(e) => setText(e.target.value)} placeholder="say hi, share a tip, tell me a favourite place…"
            className="f-type mt-1 w-full resize-none border-0 bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-[#20201E]/45" />
          <div className="flex items-center justify-between gap-3 border-t border-[#20201E]/20 pt-3">
            <label className="f-hand text-xl" htmlFor="gb-name">from</label>
            <input id="gb-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="your name"
              className="f-type w-full min-w-0 border-0 bg-transparent text-right text-[15px] outline-none placeholder:text-[#20201E]/45" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="f-mono text-[#20201E]/60">{text.length}/200</span>
            <button type="submit" disabled={status === "sending" || !configured} className="f-btn f-btn-butter !bg-[#20201E] !text-[#FAF7EF] disabled:opacity-50">
              {status === "sending" ? "pinning…" : "pin it →"}
            </button>
          </div>
          {!configured && loaded && <p className="f-type mt-3 text-xs text-[#20201E]/70">The wall opens soon. Check back in a bit!</p>}
          {message && <p role="status" className="f-type mt-3 text-xs">{message}</p>}
        </form>

        {/* the wall */}
        <div>
          {loaded && notes.length === 0 ? (
            <p className="f-type text-[var(--muted)]">{configured ? "No notes yet. Be the first to pin one." : "The wall is empty for now."}</p>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {notes.map((n, i) => (
                  <motion.li key={n.id} layout initial={{ opacity: 0, y: -24, rotate: 0 }} animate={{ opacity: 1, y: 0, rotate: TILT[i % TILT.length] }} transition={{ type: "spring", stiffness: 160, damping: 18 }}
                    whileHover={{ rotate: 0, scale: 1.03, zIndex: 5 }}
                    className="f-note !p-4" style={{ background: COLORS[n.color % COLORS.length], minHeight: 120 }}>
                    <p className="f-type break-words text-[15px] leading-relaxed">{n.text}</p>
                    <p className="f-hand mt-3 text-xl">— {n.name} <span className="f-mono ml-1 opacity-60">{ago(n.at)}</span></p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
