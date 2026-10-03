"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* The lock wall: every note is a padlock hanging on a chain-link fence, like the love-lock walls on Seoul's hills.
   Click a lock and the shackle pops open and the note unfolds. Visitors design a lock (colour + shape) and snap it on. */
export type Note = { id: string; name: string; text: string; color: number; shape?: number; at: number };

const LOCK_COLORS = ["#F4D35E", "#8DBCE0", "#E5675A", "#E8DDC7"];
const COLOR_NAMES = ["butter", "sky", "coral", "cream"];
const PAPER = ["#FBE7A1", "#DCEBF6", "#F6C9C2", "#F4EFE3"];
const SHAPES = ["classic", "heart"];

const hash = (s: string) => s.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const shapeOf = (n: Note) => (typeof n.shape === "number" ? n.shape : hash(n.id) % 2);
const initialOf = (name: string) => (name.trim()[0] || "·").toUpperCase();
const ago = (at: number) => {
  const s = Math.max(1, Math.round((Date.now() - at) / 1000));
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

/** a short metallic "click", synthesized, played only when the visitor snaps their own lock shut */
function lockClick() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const now = ctx.currentTime;
    for (const [freq, at, vol] of [[1900, 0, 0.18], [980, 0.07, 0.14]] as const) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "square"; o.frequency.setValueAtTime(freq, now + at); o.frequency.exponentialRampToValueAtTime(freq * 0.5, now + at + 0.06);
      g.gain.setValueAtTime(vol, now + at); g.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.08);
      o.connect(g); g.connect(ctx.destination); o.start(now + at); o.stop(now + at + 0.1);
    }
    setTimeout(() => void ctx.close(), 400);
  } catch { /* audio can be blocked */ }
}

/* ── the padlock ── */
export function Padlock({ color, shape, initial, open = false, tag = false, className = "" }: {
  color: number; shape: number; initial: string; open?: boolean; tag?: boolean; className?: string;
}) {
  const body = LOCK_COLORS[color % LOCK_COLORS.length];
  return (
    <svg viewBox="0 0 64 88" className={`lw-padlock ${open ? "lw-open" : ""} ${className}`} aria-hidden="true">
      <g className="lw-shackle">
        <path d="M19 40V27a13 13 0 0 1 26 0v13" fill="none" stroke="#5C5850" strokeWidth="7.4" strokeLinecap="round" />
        <path d="M19 40V27a13 13 0 0 1 26 0v13" fill="none" stroke="#D9D4C7" strokeWidth="3.6" strokeLinecap="round" />
      </g>
      {shape === 1 ? (
        <path d="M32 82C5 62 5 40 20 40c6 0 10 3.6 12 7.4C34 43.600 38 40 44 40c15 0 15 22-12 42Z" fill={body} stroke="#20201E" strokeWidth="2.2" strokeLinejoin="round" />
      ) : (
        <rect x="8" y="40" width="48" height="42" rx="8" fill={body} stroke="#20201E" strokeWidth="2.2" />
      )}
      <path d="M15 51c0-3.200 2.200-5.600 5.200-5.800" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="54" r="3.300" fill="#20201E" fillOpacity=".78" />
      <path d="M30.600 55.500h2.800l1 6h-4.800Z" fill="#20201E" fillOpacity=".78" />
      <text x="32" y="75" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-courier), monospace" fill="#20201E" fillOpacity=".72">{initial}</text>
      {tag && (
        <g transform="rotate(14 52 70)">
          <path d="M47 60h13v15H47Z" fill="#FBE7A1" stroke="#20201E" strokeWidth="1.1" />
          <path d="M49.500 65h8M49.500 68h8M49.500 71h5" stroke="#20201E" strokeOpacity=".4" strokeWidth=".9" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

/* ── an opened lock and its note ── */
export function NoteDialog({ notes, index, onNav, onClose }: { notes: Note[]; index: number; onNav: (d: number) => void; onClose: () => void }) {
  const n = notes[index];
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); const t = setTimeout(() => setOpen(true), 140); return () => clearTimeout(t); }, [n.id]);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav]);
  return (
    <motion.div className="lw-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Note from ${n.name}`} className="lw-dialog" onClick={(e) => e.stopPropagation()}>
        <Padlock color={n.color} shape={shapeOf(n)} initial={initialOf(n.name)} open={open} className="lw-big" />
        <motion.div key={n.id} className="lw-paper" style={{ background: PAPER[n.color % PAPER.length] }}
          initial={{ opacity: 0, scaleY: 0.2, y: -14 }} animate={{ opacity: open ? 1 : 0, scaleY: open ? 1 : 0.2, y: open ? 0 : -14 }} transition={{ type: "spring", stiffness: 190, damping: 17 }}>
          <p className="f-type lw-text">{n.text}</p>
          <p className="f-hand lw-from">— {n.name} <span className="f-mono">{ago(n.at)}</span></p>
        </motion.div>
        <div className="lw-controls">
          <button type="button" onClick={() => onNav(-1)} disabled={notes.length < 2} aria-label="Previous lock" className="f-btn">← prev</button>
          <button ref={closeRef} type="button" onClick={onClose} className="f-btn f-btn-butter">close</button>
          <button type="button" onClick={() => onNav(1)} disabled={notes.length < 2} aria-label="Next lock" className="f-btn">next →</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── the wall ── */
export function Guestbook({ initialNotes }: { initialNotes?: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes ?? []);
  const [configured, setConfigured] = useState(true);
  const [loaded, setLoaded] = useState(!!initialNotes);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [color, setColor] = useState(0);
  const [shape, setShape] = useState(1);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialNotes) return;
    fetch("/api/guestbook").then((r) => r.json()).then((j: { configured?: boolean; notes?: Note[] }) => {
      setConfigured(j.configured !== false);
      setNotes(j.notes ?? []);
    }).catch(() => setConfigured(false)).finally(() => setLoaded(true));
  }, [initialNotes]);

  const nav = useCallback((d: number) => setOpenAt((i) => (i === null ? i : (i + d + notes.length) % notes.length)), [notes.length]);
  const close = useCallback(() => setOpenAt(null), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending"); setMessage("");
    try {
      const res = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, text, color, shape, website }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Couldn't lock your note on.");
      if (j.note) { setNotes((n) => [j.note as Note, ...n]); setJustAdded((j.note as Note).id); setTimeout(() => setJustAdded(null), 1600); }
      lockClick();
      wallRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setText(""); setStatus("sent"); setMessage("Locked on. Thank you!");
      setTimeout(() => setStatus("idle"), 3500);
    } catch (err) {
      setStatus("error"); setMessage(err instanceof Error ? err.message : "Couldn't lock your note on.");
    }
  }

  const ghosts = Math.max(0, 8 - notes.length);

  return (
    <section className="f-wrap pb-20" aria-labelledby="guestbook-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="guestbook-title" className="f-h2"><span className="f-mark">the lock wall</span></h2>
        <p className="f-hand text-2xl" style={{ transform: "rotate(-2deg)" }}>lock a note to the fence, leave it forever :)</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[330px_1fr]">
        {/* design + snap on your lock */}
        <form onSubmit={submit} className="f-card lg:sticky lg:top-24 lg:self-start" style={{ padding: 20 }}>
          <div className="hidden" aria-hidden="true">
            <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
          </div>
          <p className="f-mono text-[var(--muted)]">design your lock</p>
          <div className="lw-preview" aria-hidden="true">
            <Padlock color={color} shape={shape} initial={initialOf(name)} className="lw-big" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div role="radiogroup" aria-label="Lock colour" className="flex gap-2">
              {LOCK_COLORS.map((c, i) => (
                <button key={c} type="button" role="radio" aria-checked={color === i} aria-label={COLOR_NAMES[i]} onClick={() => setColor(i)} className="lw-swatch" data-on={color === i} style={{ background: c }} />
              ))}
            </div>
            <div role="group" aria-label="Lock shape" className="flex gap-1">
              {SHAPES.map((s, i) => (
                <button key={s} type="button" onClick={() => setShape(i)} className="f-tab !px-3 !py-1 !text-[13px]" aria-pressed={shape === i}>{s}</button>
              ))}
            </div>
          </div>

          <label className="f-hand mt-5 block text-2xl" htmlFor="gb-text">your note</label>
          <textarea id="gb-text" required value={text} maxLength={200} rows={4} onChange={(e) => setText(e.target.value)} placeholder="say hi, share a tip, tell me a favourite place…" className="f-input f-type mt-1 resize-none" />
          <div className="mt-1 text-right f-mono text-[var(--muted)]">{text.length}/200</div>
          <label className="f-mono mt-2 block text-[var(--muted)]" htmlFor="gb-name">name on the lock</label>
          <input id="gb-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="your name" className="f-input f-type mt-1" />
          <button type="submit" disabled={status === "sending" || !configured} className="f-btn f-btn-butter mt-5 w-full justify-center disabled:opacity-50">
            {status === "sending" ? "snapping it shut…" : "lock it on →"}
          </button>
          {!configured && loaded && <p className="f-type mt-3 text-xs text-[var(--muted)]">The fence opens soon. Check back in a bit!</p>}
          {message && <p role="status" className="f-type mt-3 text-xs">{message}</p>}
        </form>

        {/* the fence */}
        <div ref={wallRef}>
          <div className="lw-fence">
            {notes.length === 0 && loaded && (
              <p className="lw-empty f-hand">{configured ? "no locks yet — be the first to snap one on" : "the fence is still empty"}</p>
            )}
            <ul className="lw-grid">
              {notes.map((n, i) => (
                <li key={n.id}>
                  <button type="button" data-cursor-photo data-cursor-label="open the lock" aria-label={`Open the note from ${n.name}`} onClick={() => setOpenAt(i)}
                    className={`lw-lock ${justAdded === n.id ? "lw-new" : ""}`}
                    style={{ ["--rot" as string]: `${((hash(n.id) % 9) - 4)}deg`, ["--delay" as string]: `${-(hash(n.id) % 50) / 10}s` }}>
                    <Padlock color={n.color} shape={shapeOf(n)} initial={initialOf(n.name)} tag />
                  </button>
                  <span className="lw-name f-mono">{n.name.length > 12 ? n.name.slice(0, 11) + "…" : n.name}</span>
                </li>
              ))}
              {Array.from({ length: ghosts }).map((_, g) => (
                <li key={`ghost-${g}`} aria-hidden="true" className="lw-ghost">
                  <svg viewBox="0 0 64 88" className="lw-padlock">
                    <path d="M19 40V27a13 13 0 0 1 26 0v13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" />
                    <rect x="8" y="40" width="48" height="42" rx="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
          <p className="f-mono mt-3 text-[var(--muted)]">tap a lock to open it · ← → to flip through them</p>
        </div>
      </div>

      <AnimatePresence>
        {openAt !== null && notes[openAt] && <NoteDialog notes={notes} index={openAt} onNav={nav} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
