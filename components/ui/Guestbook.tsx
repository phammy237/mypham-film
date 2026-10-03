"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GOLD_DEFAULT, seasonOf, statsOf, type Gold, type Note, type Season, type Stats } from "@/lib/guestbook";

/* The lock wall: every note is a padlock on a chain-link fence (like the love-lock walls on Seoul's hills), each with a
   paper tag tied on, and one red string running through them in the order they were added. The fence changes with the
   season, the owner's gold lock is pinned on top, and a visitor's own lock is remembered in their browser. */
export type { Note };

const LOCK_COLORS = ["#F4D35E", "#8DBCE0", "#416788", "#E8DDC7", "#DDB63F"]; // the last one is the gold lock
const COLOR_NAMES = ["butter", "sky", "blue", "cream"];
const PAPER = ["#FBE7A1", "#DCEBF6", "#C6D9E8", "#F4EFE3", "#F7E2A2"];
const SHAPES = ["classic", "heart"];
const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
const SEASON_NOTE: Record<Season, string> = { spring: "cherry blossoms", summer: "fireflies", autumn: "falling leaves", winter: "snow and lantern light" };
const MINE_KEY = "my-lock";
const GOLD_ID = "gold";

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
export function Padlock({ color, shape, initial, open = false, className = "" }: {
  color: number; shape: number; initial: string; open?: boolean; className?: string;
}) {
  const body = LOCK_COLORS[color % LOCK_COLORS.length];
  return (
    <svg viewBox="0 0 64 88" className={`lw-padlock ${open ? "lw-open" : ""} ${className}`} aria-hidden="true">
      <g className="lw-shackle">
        <path d="M19 40V27a13 13 0 0 1 26 0v13" fill="none" stroke="#5C5850" strokeWidth="7.4" strokeLinecap="round" />
        <path d="M19 40V27a13 13 0 0 1 26 0v13" fill="none" stroke="#D9D4C7" strokeWidth="3.6" strokeLinecap="round" />
      </g>
      {shape === 1 ? (
        <path d="M32 82C5 62 5 40 20 40c6 0 10 3.6 12 7.4C34 43.6 38 40 44 40c15 0 15 22-12 42Z" fill={body} stroke="#20201E" strokeWidth="2.2" strokeLinejoin="round" />
      ) : (
        <rect x="8" y="40" width="48" height="42" rx="8" fill={body} stroke="#20201E" strokeWidth="2.2" />
      )}
      <path d="M15 51c0-3.2 2.2-5.6 5.2-5.8" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="54" r="3.3" fill="#20201E" fillOpacity=".78" />
      <path d="M30.6 55.5h2.8l1 6h-4.8Z" fill="#20201E" fillOpacity=".78" />
      <text x="32" y="75" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-courier), monospace" fill="#20201E" fillOpacity=".72">{initial}</text>
    </svg>
  );
}

/* ── an opened lock and its note ── */
export function NoteDialog({ notes, index, onNav, onClose }: { notes: (Note & { pinned?: boolean })[]; index: number; onNav: (d: number) => void; onClose: () => void }) {
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
          {n.pinned && <p className="f-mono lw-pin-label">pinned by the owner</p>}
          <p className="f-type lw-text">{n.text}</p>
          <p className="f-hand lw-from">— {n.name}{n.city ? <span className="lw-city"> · {n.city}</span> : null} {!n.pinned && <span className="f-mono">{ago(n.at)}</span>}</p>
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

/* petals / fireflies / leaves / snow: deterministic so server and browser agree */
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  x: (i * 53 + 7) % 100, del: -((i * 1.7) % 14), dur: 9 + (i % 5) * 2.2, sz: 6 + (i % 4) * 3, drift: 10 + (i % 3) * 8, y: (i * 37 + 11) % 86,
}));

/* ── the wall ── */
export function Guestbook({ initialNotes }: { initialNotes?: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes ?? []);
  const [gold, setGold] = useState<Gold>(GOLD_DEFAULT);
  const [stats, setStats] = useState<Stats>(initialNotes ? statsOf(initialNotes) : { locks: 0, cities: 0 });
  const [configured, setConfigured] = useState(true);
  const [loaded, setLoaded] = useState(!!initialNotes);
  const [season, setSeason] = useState<Season>("spring");
  const [mine, setMine] = useState<Note | null>(null);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [text, setText] = useState("");
  const [color, setColor] = useState(0);
  const [shape, setShape] = useState(1);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const fenceRef = useRef<HTMLDivElement>(null);
  const [string, setString] = useState<{ d: string; dots: [number, number][]; w: number; h: number }>({ d: "", dots: [], w: 0, h: 0 });

  // the fence follows the real season; the pills let a visitor preview the others
  useEffect(() => { setSeason(seasonOf(new Date())); }, []);

  // this visitor's own lock is remembered in their browser
  useEffect(() => {
    try { const raw = localStorage.getItem(MINE_KEY); if (raw) setMine(JSON.parse(raw) as Note); } catch { /* storage can be blocked */ }
  }, []);

  useEffect(() => {
    if (initialNotes) return;
    fetch("/api/guestbook").then((r) => r.json()).then((j: { configured?: boolean; notes?: Note[]; gold?: Gold; stats?: Stats }) => {
      setConfigured(j.configured !== false);
      setNotes(j.notes ?? []);
      if (j.gold) setGold(j.gold);
      if (j.stats) setStats(j.stats);
    }).catch(() => setConfigured(false)).finally(() => setLoaded(true));
  }, [initialNotes]);

  // my lock: on the wall once approved, otherwise shown to me alone as waiting
  const mineApproved = !!mine && notes.some((n) => n.id === mine.id);
  const mineWaiting = !!mine && !mineApproved ? mine : null;
  const goldNote = useMemo<Note & { pinned: boolean }>(() => ({ id: GOLD_ID, name: gold.name, text: gold.text, color: 4, shape: 1, at: 0, pinned: true }), [gold]);
  const wall = useMemo(() => (mineWaiting ? [mineWaiting, ...notes] : notes), [mineWaiting, notes]);
  const dialogNotes = useMemo(() => [goldNote, ...wall], [goldNote, wall]);

  // one red string, oldest lock first, starting from the gold lock
  useLayoutEffect(() => {
    const fence = fenceRef.current; if (!fence) return;
    const measure = () => {
      const box = fence.getBoundingClientRect();
      const pt = (el: Element | null): [number, number] | null => { if (!el) return null; const b = el.getBoundingClientRect(); return [b.left - box.left + b.width / 2, b.top - box.top + 16]; };
      const pts: [number, number][] = [];
      const g = pt(fence.querySelector("[data-lock='gold']")); if (g) pts.push(g);
      [...wall].sort((a, b) => a.at - b.at).forEach((n) => { const p = pt(fence.querySelector(`[data-lock='${CSS.escape(n.id)}']`)); if (p) pts.push(p); });
      let d = "";
      pts.forEach((p, i) => {
        if (!i) { d = `M${p[0]} ${p[1]}`; return; }
        const q = pts[i - 1], mx = (q[0] + p[0]) / 2, my = (q[1] + p[1]) / 2 + Math.min(54, Math.abs(q[0] - p[0]) * 0.22 + 16);
        d += ` Q${mx} ${my} ${p[0]} ${p[1]}`;
      });
      setString({ d, dots: pts, w: box.width, h: box.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(fence);
    return () => ro.disconnect();
  }, [wall, gold]);

  const nav = useCallback((d: number) => setOpenAt((i) => (i === null ? i : (i + d + dialogNotes.length) % dialogNotes.length)), [dialogNotes.length]);
  const close = useCallback(() => setOpenAt(null), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending"); setMessage("");
    try {
      const res = await fetch("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, city, text, color, shape, website }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Couldn't lock your note on.");
      if (j.note) {
        const note = j.note as Note;
        setMine(note); setJustAdded(note.id); setTimeout(() => setJustAdded(null), 1600);
        try { localStorage.setItem(MINE_KEY, JSON.stringify(note)); } catch { /* storage can be blocked */ }
      }
      lockClick();
      fenceRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setText(""); setStatus("sent"); setMessage("Locked on! It'll show up for everyone once it's been approved. You can already see it here.");
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err) {
      setStatus("error"); setMessage(err instanceof Error ? err.message : "Couldn't lock your note on.");
    }
  }

  function forgetMine() {
    setMine(null);
    try { localStorage.removeItem(MINE_KEY); } catch { /* ignore */ }
  }

  const ghosts = Math.max(0, 6 - wall.length);
  const lockCount = stats.locks;

  return (
    <section className="f-wrap pb-20" aria-labelledby="guestbook-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="guestbook-title" className="f-h2"><span className="f-mark">the lock wall</span></h2>
        <p className="f-hand text-2xl" style={{ transform: "rotate(-2deg)" }}>lock a note to the fence, leave it forever :)</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[330px_1fr]">
        {/* design + snap on your lock */}
        <div className="lg:sticky lg:top-24 lg:self-start grid gap-4">
          {mine && (
            <div className="f-card lw-mine" style={{ padding: 16 }}>
              <div className="lw-mine-lock"><Padlock color={mine.color} shape={shapeOf(mine)} initial={initialOf(mine.name)} /></div>
              <div className="min-w-0">
                <p className="f-mono text-[var(--muted)]">your lock</p>
                <p className="f-type text-sm">{mineApproved ? "It's on the wall for everyone." : "Waiting for approval. Only you can see it for now."}</p>
                <button type="button" onClick={forgetMine} className="f-mono mt-1 text-[var(--blue)] underline underline-offset-4">forget it on this device</button>
              </div>
            </div>
          )}
          <form onSubmit={submit} className="f-card" style={{ padding: 20 }}>
            <div className="hidden" aria-hidden="true">
              <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
            </div>
            <p className="f-mono text-[var(--muted)]">design your lock</p>
            <div className="lw-preview" aria-hidden="true">
              <Padlock color={color} shape={shape} initial={initialOf(name)} className="lw-big" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div role="radiogroup" aria-label="Lock colour" className="flex gap-2">
                {LOCK_COLORS.slice(0, 4).map((c, i) => (
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
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="f-mono block text-[var(--muted)]" htmlFor="gb-name">name on the lock</label>
                <input id="gb-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="your name" className="f-input f-type mt-1" />
              </div>
              <div>
                <label className="f-mono block text-[var(--muted)]" htmlFor="gb-city">city (optional)</label>
                <input id="gb-city" value={city} maxLength={40} onChange={(e) => setCity(e.target.value)} placeholder="Hanoi" className="f-input f-type mt-1" />
              </div>
            </div>
            <button type="submit" disabled={status === "sending" || !configured} className="f-btn f-btn-butter mt-5 w-full justify-center disabled:opacity-50">
              {status === "sending" ? "snapping it shut…" : "lock it on →"}
            </button>
            <p className="f-type mt-3 text-xs text-[var(--muted)]">New locks are checked before they show for everyone.</p>
            {!configured && loaded && <p className="f-type mt-2 text-xs text-[var(--muted)]">The fence opens soon. Check back in a bit!</p>}
            {message && <p role="status" className="f-type mt-2 text-xs">{message}</p>}
          </form>
        </div>

        {/* the fence */}
        <div>
          <div ref={fenceRef} className={`lw-fence lw-${season}`}>
            <div className="lw-sky" aria-hidden="true">
              {PARTICLES.map((p, i) => (
                <span key={i} className="lw-p" style={{ left: `${p.x}%`, top: season === "summer" ? `${p.y}%` : undefined, ["--del" as string]: `${p.del}s`, ["--dur" as string]: `${p.dur}s`, ["--sz" as string]: `${p.sz}px`, ["--drift" as string]: `${p.drift}px` }} />
              ))}
            </div>

            <div className="lw-clap" role="img" aria-label={`${lockCount} ${lockCount === 1 ? "lock" : "locks"} from ${stats.cities} ${stats.cities === 1 ? "city" : "cities"}`}>
              <div className="lw-clap-top" aria-hidden="true" />
              <div className="lw-clap-body" aria-hidden="true">
                <span><i>locks</i><b>{lockCount}</b></span>
                <span><i>cities</i><b>{stats.cities}</b></span>
              </div>
            </div>

            {/* the gold lock, pinned on top */}
            <div className="lw-goldrow">
              <button type="button" data-lock="gold" data-cursor-photo data-cursor-label="open the gold lock" aria-label={`Open the pinned note from ${gold.name}`} onClick={() => setOpenAt(0)} className="lw-lock lw-gold" style={{ ["--rot" as string]: "-2deg" }}>
                <Padlock color={4} shape={1} initial={initialOf(gold.name)} />
              </button>
              <span className="f-hand lw-goldtag">pinned: a note from {gold.name}</span>
            </div>

            {wall.length === 0 && loaded && (
              <p className="lw-empty f-hand">{configured ? "no locks yet. be the first to snap one on" : "the fence is still empty"}</p>
            )}
            <ul className="lw-grid">
              {wall.map((n, i) => {
                const h = hash(n.id);
                const waiting = mineWaiting?.id === n.id;
                const isMine = mine?.id === n.id;
                return (
                  <li key={n.id}>
                    <button type="button" data-lock={n.id} data-cursor-photo data-cursor-label="open the lock" aria-label={`Open the note from ${n.name}${waiting ? " (waiting for approval)" : ""}`} onClick={() => setOpenAt(i + 1)}
                      className={`lw-lock ${justAdded === n.id ? "lw-new" : ""} ${waiting ? "lw-waiting" : ""} ${isMine ? "lw-yours" : ""}`}
                      style={{ ["--rot" as string]: `${(h % 9) - 4}deg`, ["--delay" as string]: `${-(h % 50) / 10}s` }}>
                      <Padlock color={n.color} shape={shapeOf(n)} initial={initialOf(n.name)} />
                    </button>
                    <span className="lw-tag" style={{ ["--tr" as string]: `${(h % 7) - 3}deg`, ["--delay" as string]: `${-(h % 40) / 10}s` }}>
                      {waiting ? <i>waiting for approval</i> : n.text}
                    </span>
                    <span className="lw-name f-mono">{isMine && !waiting ? "yours · " : ""}{n.name.length > 11 ? n.name.slice(0, 10) + "…" : n.name}</span>
                  </li>
                );
              })}
              {Array.from({ length: ghosts }).map((_, g) => (
                <li key={`ghost-${g}`} aria-hidden="true" className="lw-ghost">
                  <svg viewBox="0 0 64 88" className="lw-padlock">
                    <path d="M19 40V27a13 13 0 0 1 26 0v13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" />
                    <rect x="8" y="40" width="48" height="42" rx="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" />
                  </svg>
                </li>
              ))}
            </ul>

            {/* the red string */}
            {string.d && (
              <svg className="lw-strings" viewBox={`0 0 ${string.w} ${string.h}`} aria-hidden="true">
                <path d={string.d} />
                {string.dots.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.6" />)}
              </svg>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="f-mono text-[var(--muted)]">tap a lock to open it · ← → to flip through them</p>
            <div role="group" aria-label="Season" className="flex items-center gap-1">
              <span className="f-mono mr-1 text-[var(--muted)]">season</span>
              {SEASONS.map((s) => (
                <button key={s} type="button" className="f-tab !px-3 !py-1 !text-[12px]" aria-pressed={season === s} title={SEASON_NOTE[s]} onClick={() => setSeason(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {openAt !== null && dialogNotes[openAt] && <NoteDialog notes={dialogNotes} index={openAt} onNav={nav} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
