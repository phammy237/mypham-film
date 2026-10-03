"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { allWork, type Project } from "@/data/projects";
import { education, hobbies, leadership, skills } from "@/data/cv";
import { CURRENTLY, FEATURED, LATELY, MORE, PHOTOS, type FrameRef, type GridFilter } from "@/data/film";
import { FlipPhoto } from "@/components/film/FlipPhoto";
import { NowPlaying } from "@/components/ui/NowPlaying";
import s from "./film.module.css";

/* ── frames: a photo or a project, resolved to one shape ── */
type Frame = { key: string; src: string | null; alt: string; caption: string; project?: Project; pos?: string; portrait?: boolean };
const bySlug = (slug: string) => allWork.find((p) => p.slug === slug);
function resolve(ref: FrameRef): Frame | null {
  if ("photo" in ref) { const p = PHOTOS[ref.photo]; return { key: ref.photo, src: p.src, alt: p.alt, caption: p.caption, pos: "pos" in p ? p.pos : undefined, portrait: "portrait" in p ? p.portrait : undefined }; }
  const project = bySlug(ref.project);
  return project ? { key: project.slug, src: project.image ?? null, alt: project.title, caption: project.title, project } : null;
}
const frameNo = (n: number) => `MY ${String(n).padStart(3, "0")}A`;
const shortOrg = (o: string) => o.replace(/ — .*/, "").replace("UF Data Science & Informatics", "DSI").replace("Vietnamese International Student Association", "VISA");
const CONTACT = { email: "phamlehamy2307@gmail.com", linkedin: "https://linkedin.com/in/mypham237", github: "https://github.com/phammy237" };

function Photo({ src, alt, n, sizes, className = "", priority = false }: { src: string; alt: string; n?: number; sizes: string; className?: string; priority?: boolean }) {
  return (
    <span className={`${s.photo} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
      {n !== undefined && <span className={s.fno}>{frameNo(n)}</span>}
    </span>
  );
}

/* ── the rotating "currently:" note ── */
function timeLine(): string {
  const h = new Date().getHours();
  if (h < 5) return "still up, still building";
  if (h < 12) return "drinking matcha (it's morning)";
  if (h < 17) return "somewhere between Figma and FastAPI";
  if (h < 22) return "probably building something I don't need";
  return "late-night debugging, send snacks";
}

function Currently() {
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<string[]>(CURRENTLY);
  const [i, setI] = useState(0);
  // after mount, lead with a line that fits the visitor's local time of day
  useEffect(() => { const t = timeLine(); setLines([t, ...CURRENTLY.filter((l) => l !== t)]); setI(0); }, []);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % lines.length), 3800);
    return () => clearInterval(t);
  }, [reduce, lines.length]);
  return <span className={s.noteLine} aria-live="polite">{lines[i % lines.length]}</span>;
}

/* ── frame viewer: a bottom sheet, with arrow-key paging and a shareable link ── */
function FrameSheet({ list, i, onNav, onClose }: { list: Frame[]; i: number; onNav: (d: number) => void; onClose: () => void }) {
  const frame = list[i];
  const n = i + 1;
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
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
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}?frame=${frame.key}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard can be blocked */ }
  };
  const p = frame.project;
  return (
    <>
      <motion.div className={s.sheetBack} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div role="dialog" aria-modal="true" aria-label={p ? p.title : frame.caption} className={s.sheet}
        initial={{ y: "100%", x: "-50%" }} animate={{ y: 0, x: "-50%" }} exit={{ y: "100%", x: "-50%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
        <div className={s.grab} />
        <button ref={closeRef} className={s.sheetClose} onClick={onClose} aria-label="Close">✕</button>
        {frame.src && (
          <div style={frame.portrait ? { maxWidth: 380, margin: "0 auto" } : undefined}>
            <FlipPhoto key={frame.key} src={frame.src} alt={frame.alt} n={n} sizes="640px" aspect={frame.portrait ? "4 / 5" : "3 / 2"} pos={frame.pos} note={p ? (p.hook ?? p.logline) : frame.caption} />
          </div>
        )}
        <div className={s.sheetNav}>
          <button type="button" className={s.btn} onClick={() => onNav(-1)} disabled={list.length < 2} aria-label="Previous frame">← prev</button>
          <span className={`${s.mono} ${s.muted}`}>frame {String(n).padStart(3, "0")}A · {n} of {list.length}</span>
          <button type="button" className={s.btn} onClick={() => onNav(1)} disabled={list.length < 2} aria-label="Next frame">next →</button>
        </div>
        <h3>{p ? p.title : frame.caption}</h3>
        {p && (
          <>
            <p className={s.muted}>{p.hook ?? p.logline}</p>
            <div className={s.meta}>
              <div><span>date</span>{p.month}</div>
              {p.competition && <div><span>event</span>{p.competition}</div>}
              <div><span>type</span>{p.category}</div>
              {p.award && p.award !== "Participant" && <div><span>result</span>🏆 {p.award}</div>}
            </div>
          </>
        )}
        <p style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {p && <Link className={`${s.btn} ${s.btnButter}`} href={`/projects/${p.slug}`}>view project →</Link>}
          <button type="button" className={s.btn} onClick={copy}>{copied ? "link copied ✓" : "copy link to this frame"}</button>
        </p>
      </motion.div>
    </>
  );
}

/* ── draggable film strip ── */
function FilmStrip({ frames, onOpen, onPosition }: { frames: Frame[]; onOpen: (f: Frame, n: number) => void; onPosition: (n: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x0: 0, s0: 0, moved: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const move = (e: PointerEvent) => {
      const d = drag.current; if (!d.down) return;
      const dx = e.clientX - d.x0; d.moved = Math.max(d.moved, Math.abs(dx));
      if (d.moved > 4) setDragging(true);
      el.scrollLeft = d.s0 - dx;
    };
    const up = () => { drag.current.down = false; setDragging(false); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  const step = (dir: number) => ref.current?.scrollBy({ left: dir * 314, behavior: "smooth" });
  return (
    <div className={s.tiltClip}>
      <div className={s.tilt}>
        <div ref={ref} tabIndex={0} role="region" aria-label="Film strip: drag, swipe, or use the arrow keys"
          className={`${s.strip} ${s.reticle} ${dragging ? s.dragging : ""}`}
          onPointerDown={(e) => { if (e.pointerType !== "mouse") return; drag.current = { down: true, x0: e.clientX, s0: ref.current!.scrollLeft, moved: 0 }; }}
          onClickCapture={(e) => { if (drag.current.moved > 6) { e.preventDefault(); e.stopPropagation(); drag.current.moved = 0; } }}
          onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); step(1); } if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); } }}
          onScroll={(e) => onPosition(Math.min(frames.length, Math.round(e.currentTarget.scrollLeft / 314) + 1))}>
          <div className={s.rail}>
            {frames.map((f, i) => (
              <button key={f.key + i} type="button" data-cursor-photo className={s.frame} onClick={() => onOpen(f, i + 1)}>
                <span className={s.photo} style={{ aspectRatio: "3 / 2" }}>
                  {f.src && <Image src={f.src} alt={f.alt} fill sizes="300px" draggable={false} style={f.pos ? { objectPosition: f.pos } : undefined} />}
                  <span className={s.fno}>{frameNo(i + 1)}</span>
                  <span className={s.view}>view frame ↗</span>
                </span>
                <span className={s.edge}><span>{String(i + 1).padStart(2, "0")}A ▸</span><span>{f.caption}</span></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* soft shutter click, synthesized (no audio file) — only plays when the visitor turns sound on */
function shutterClick(ctx: AudioContext) {
  const len = Math.floor(ctx.sampleRate * 0.05);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass"; f.frequency.value = 2400; f.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.value = 0.25;
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  src.start();
}

/* ── page ── */
export function FilmHome() {
  const [open, setOpen] = useState<{ list: Frame[]; i: number } | null>(null);
  const dragMoved = useRef(false);
  const [filter, setFilter] = useState<"all" | GridFilter>("all");
  const [at, setAt] = useState(1);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const lastAt = useRef(1);
  const onPosition = useCallback((n: number) => {
    setAt(n);
    if (n !== lastAt.current) {
      lastAt.current = n;
      if (sound && audio.current) shutterClick(audio.current);
    }
  }, [sound]);
  const toggleSound = () => {
    if (!audio.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audio.current = new AC();
    }
    void audio.current.resume();
    setSound((v) => { if (!v && audio.current) shutterClick(audio.current); return !v; });
  };
  const close = useCallback(() => setOpen(null), []);
  const nav = useCallback((d: number) => setOpen((o) => (o ? { ...o, i: (o.i + d + o.list.length) % o.list.length } : o)), []);
  const lately = LATELY.map(resolve).filter((f): f is Frame => !!f && !!f.src);
  const more = MORE.map((m) => ({ m, f: resolve(m) })).filter((x): x is { m: (typeof MORE)[number]; f: Frame } => !!x.f && !!x.f.src);
  const visible = more.filter(({ m }) => filter === "all" || m.filter === filter);
  // a shared link (?frame=…) opens straight onto that frame
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("frame");
    if (!key) return;
    const inLately = lately.findIndex((f) => f.key === key);
    if (inLately >= 0) { setOpen({ list: lately, i: inLately }); return; }
    const all = more.map((x) => x.f);
    const inMore = all.findIndex((f) => f.key === key);
    if (inMore >= 0) setOpen({ list: all, i: inMore });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const featured = FEATURED.map(bySlug).filter((p): p is Project => !!p);
  const roles = leadership.slice(0, 3);
  const ed = education[0];
  const languages = skills.Languages.map((l) => l.split(" ")[0]).join(" / ").replace("Russian", "Russian-ish");

  return (
    <div className={s.root}>
      {/* hero */}
      <section className={s.hero}>
        <div data-cursor-photo data-cursor-label="view frame ↗" className={`${s.heroBg} ${s.reticle}`} onClick={() => setOpen({ list: [{ key: "nyc", ...PHOTOS.nyc }], i: 0 })}>
          <Photo src={PHOTOS.nyc.src} alt={PHOTOS.nyc.alt} sizes="100vw" priority className="" />
        </div>
        <div className={`${s.wrap} ${s.heroCopy}`}>
          <h1 className={s.serif}>
            My Pham
            <button type="button" className={s.starBtn} aria-label="Celebrate with confetti" data-cursor-hover onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              window.dispatchEvent(new CustomEvent("film-confetti", { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }));
            }}>
              <svg className={s.star} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 1 2.6 7.4L22 9l-6 4.8L18.2 22 12 17.6 5.8 22 8 13.8 2 9l7.4-.6Z" /></svg>
            </button>
          </h1>
          <p className={s.lede}>I make things and collect stories along the way.</p>
          <div className={s.acts}>
            <Link className={`${s.btn} ${s.btnButter}`} href="/projects">view my work →</Link>
            <a className={s.btn} href="#about">about me</a>
          </div>
        </div>
        <p className={`${s.roles} ${s.hand}`} aria-hidden="true">product<br />data<br />people<br />(and many more ideas…)</p>
        <nav className={s.places} aria-label="Places">
          <Link href="/biography/journey">HANOI →</Link><Link href="/biography/journey">GAINESVILLE →</Link><span>… ?</span>
        </nav>
        <aside className={`${s.note} ${s.hand}`} aria-label="Currently">currently:<br /><Currently /><br />:)</aside>
      </section>

      {/* lately, on film */}
      <div className={`${s.wrap} ${s.latelyHead}`}>
        <h2 className={s.serif}>lately, on film →</h2>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span className={`${s.mono} ${s.muted}`}>a mix of places, people, projects, and everything in between.</span>
          <span key={at} className={s.count}>{String(at).padStart(2, "0")} / {String(lately.length).padStart(2, "0")}</span>
        </div>
      </div>
      <FilmStrip frames={lately} onOpen={(_frame, n) => setOpen({ list: lately, i: n - 1 })} onPosition={onPosition} />
      <p className={`${s.wrap} ${s.mono} ${s.muted} ${s.hint}`}>drag, swipe, or use ← → · tap a frame to view it<button type="button" onClick={toggleSound} aria-pressed={sound} className={s.soundBtn}>shutter sound: {sound ? "on" : "off"} ♪</button></p>

      {/* featured + communities */}
      <section className={`${s.wrap} ${s.feat}`}>
        <div>
          <h2 className={`${s.serif} ${s.featTitle}`}>featured projects</h2> <span className={s.serif} style={{ fontSize: 32 }}>→</span>
          <div className={s.cards}>
            {featured.map((p, i) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className={s.pcard}>
                <div className={s.pcardTop}><span>0{i + 1}</span><span className={s.tag}>{p.competition ? "hackathon" : "personal"}</span></div>
                {p.image && <Photo src={p.image} alt={p.title} sizes="(max-width: 900px) 100vw, 280px" />}
                <h3>{p.title}</h3>
                <p>{p.hook ?? p.logline}</p>
                <div className={s.pcardFoot}><div className={s.chips}>{p.tools.slice(0, 3).map((t) => <span key={t}>{t}</span>)}</div><span aria-hidden="true">→</span></div>
              </Link>
            ))}
          </div>
        </div>
        <aside className={s.side}>
          <p className={`${s.hand} ${s.sideNote}`}>sometimes I build software.<br />sometimes I build communities. ✦</p>
          <div className={s.polas}>
            {(["dsiTower", "tet", "ps"] as const).map((k) => <div key={k} className={s.pola}><Photo src={PHOTOS[k].src} alt={PHOTOS[k].alt} sizes="90px" /></div>)}
          </div>
          <ul className={s.rolesList}>
            {roles.map((r, i) => (
              <li key={r.company}><span className={s.ic} aria-hidden="true">{["◎", "✦", "☺"][i]}</span><span><b>{shortOrg(r.company)}</b><span>{r.role}</span></span></li>
            ))}
          </ul>
          <p style={{ marginTop: 16 }}><Link href="/involvements" className={s.type} style={{ color: "var(--blue)" }}>all involvements →</Link></p>
        </aside>
      </section>

      {/* more on film */}
      <section className={s.more}>
        <div className={s.wrap}>
          <div className={s.moreHead}>
            <div>
              <h2 className={s.serif}>more on film →</h2>
              <div className={s.filters} role="tablist" aria-label="Filter photos">
                {(["all", "projects", "leadership", "travel", "friends", "random"] as const).map((f) => (
                  <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
            </div>
            <p className={`${s.hand} ${s.moreNote}`}>good people,<br />good problems &lt;3</p>
          </div>
          <div className={`${s.grid} ${s.reticle}`}>
            {visible.map(({ m, f }, i) => (
              <button key={f.key + i} type="button" data-cursor-photo className={`${s.photo} ${s.tile} ${m.tall ? s.tall : ""}`} onClick={() => setOpen({ list: visible.map((v) => v.f), i })}>
                <Image src={f.src!} alt={f.alt} fill sizes="(max-width: 600px) 50vw, 180px" style={f.pos ? { objectPosition: f.pos } : undefined} />
                <span className={s.view}>view frame ↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* about */}
      <section className={`${s.wrap} ${s.about}`} id="about">
        <div>
          <h2 className={s.serif}>about me</h2>
          <div className={s.portrait}>
            <Photo src={PHOTOS.glow.src} alt={PHOTOS.glow.alt} sizes="(max-width: 900px) 100vw, 360px" />
            <span className={`${s.hand} ${s.portraitNote}`}>a little bit about me</span>
          </div>
        </div>
        <div>
          <p className={s.bio}>I&apos;m My — a Data Science student at the {ed.school} who likes turning ideas into real things. I work across product, operations, and decision systems.</p>
          <p className={s.factsHead}>quick facts:</p>
          <ul className={s.facts}>
            {[["⌖", "Hanoi, Vietnam → Gainesville, FL"], ["✎", `Data Science @ UF (${ed.period.replace("Expected ", "")})`], ["◌", languages], ["☕", "matcha > coffee"],
              ["♪", hobbies.slice(0, 4).map((h) => h.split(" (")[0].toLowerCase()).join(", ")]].map(([i, t]) => (
              <li key={t}><span className={s.ic} aria-hidden="true">{i}</span>{t}</li>
            ))}
          </ul>
          <p style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className={s.btn} href="/biography/journey">the full journey →</Link>
            <Link className={s.btn} href="/cv">resume</Link>
          </p>
        </div>
        <div>
          <div className={s.stack}>
            {(["beach", "matcha", "mirror"] as const).map((k, i) => (
              <motion.div key={k} className={s.pola} drag dragMomentum={false} dragElastic={0.12}
                dragConstraints={{ left: -140, right: 140, top: -80, bottom: 160 }}
                style={{ rotate: [-4, 5, -1][i] }} whileDrag={{ scale: 1.06, rotate: 0, zIndex: 20 }}
                onDragStart={() => { dragMoved.current = true; }}
                onDragEnd={() => { setTimeout(() => { dragMoved.current = false; }, 0); }}
                onClickCapture={(e) => { if (dragMoved.current) { e.stopPropagation(); e.preventDefault(); } }}>
                <FlipPhoto src={PHOTOS[k].src} alt={PHOTOS[k].alt} n={i + 1} sizes="240px" note={PHOTOS[k].caption} />
              </motion.div>
            ))}
          </div>
          <p className={`${s.hand} ${s.stackNote}`}>places that made me :) <br />(drag them around, flip them over)</p>
          <div className={s.connect}>
            <p className={s.serif}>let&apos;s connect ✈</p>
            <div className={s.icons}>
              <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
              <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">gh</a>
              <a href={`mailto:${CONTACT.email}`} aria-label="Email">@</a>
            </div>
          </div>
        </div>
      </section>

      <footer className={s.end}>
        <span className={s.hand} style={{ fontSize: 24 }}>mypham.space</span>
        <span className={s.type} style={{ fontSize: 13 }}>built with lots of matcha and questionable decisions ♡</span>
        <NowPlaying className={s.muted} />
      </footer>

      <AnimatePresence>{open && <FrameSheet list={open.list} i={open.i} onNav={nav} onClose={close} />}</AnimatePresence>
    </div>
  );
}
