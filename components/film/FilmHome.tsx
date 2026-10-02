"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { allWork, type Project } from "@/data/projects";
import { education, hobbies, leadership, skills } from "@/data/cv";
import { CURRENTLY, FEATURED, LATELY, MORE, PHOTOS, type FrameRef, type GridFilter } from "@/data/film";
import s from "./film.module.css";

/* ── frames: a photo or a project, resolved to one shape ── */
type Frame = { key: string; src: string | null; alt: string; caption: string; project?: Project };
const bySlug = (slug: string) => allWork.find((p) => p.slug === slug);
function resolve(ref: FrameRef): Frame | null {
  if ("photo" in ref) { const p = PHOTOS[ref.photo]; return { key: ref.photo, src: p.src, alt: p.alt, caption: p.caption }; }
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
function Currently() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % CURRENTLY.length), 3800);
    return () => clearInterval(t);
  }, [reduce]);
  return <span className={s.noteLine} aria-live="polite">{CURRENTLY[i]}</span>;
}

/* ── frame viewer: a bottom sheet ── */
function FrameSheet({ frame, n, onClose }: { frame: Frame; n: number; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const p = frame.project;
  return (
    <>
      <motion.div className={s.sheetBack} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div role="dialog" aria-modal="true" aria-label={p ? p.title : frame.caption} className={s.sheet}
        initial={{ y: "100%", x: "-50%" }} animate={{ y: 0, x: "-50%" }} exit={{ y: "100%", x: "-50%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
        <div className={s.grab} />
        <button ref={closeRef} className={s.sheetClose} onClick={onClose} aria-label="Close">✕</button>
        {frame.src && <Photo src={frame.src} alt={frame.alt} n={n} sizes="640px" />}
        <p className={`${s.mono} ${s.muted}`} style={{ marginTop: 14 }}>frame {String(n).padStart(3, "0")}A</p>
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
            <p style={{ marginTop: 18 }}><Link className={`${s.btn} ${s.btnButter}`} href={`/projects/${p.slug}`}>view project →</Link></p>
          </>
        )}
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
              <button key={f.key + i} type="button" className={s.frame} onClick={() => onOpen(f, i + 1)}>
                <span className={s.photo} style={{ aspectRatio: "3 / 2" }}>
                  {f.src && <Image src={f.src} alt={f.alt} fill sizes="300px" draggable={false} />}
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

/* ── page ── */
export function FilmHome() {
  const [open, setOpen] = useState<{ frame: Frame; n: number } | null>(null);
  const [filter, setFilter] = useState<"all" | GridFilter>("all");
  const [at, setAt] = useState(1);
  const close = useCallback(() => setOpen(null), []);
  const lately = LATELY.map(resolve).filter((f): f is Frame => !!f && !!f.src);
  const more = MORE.map((m) => ({ m, f: resolve(m) })).filter((x): x is { m: (typeof MORE)[number]; f: Frame } => !!x.f && !!x.f.src);
  const featured = FEATURED.map(bySlug).filter((p): p is Project => !!p);
  const roles = leadership.slice(0, 3);
  const ed = education[0];
  const languages = skills.Languages.map((l) => l.split(" ")[0]).join(" / ").replace("Russian", "Russian-ish");

  return (
    <div className={s.root}>
      {/* hero */}
      <section className={s.hero}>
        <div className={`${s.heroBg} ${s.reticle}`} onClick={() => setOpen({ frame: { key: "nyc", ...PHOTOS.nyc }, n: 1 })}>
          <Photo src={PHOTOS.nyc.src} alt={PHOTOS.nyc.alt} sizes="100vw" priority className="" />
        </div>
        <div className={`${s.wrap} ${s.heroCopy}`}>
          <h1 className={s.serif}>
            My Pham
            <svg className={s.star} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 1 2.6 7.4L22 9l-6 4.8L18.2 22 12 17.6 5.8 22 8 13.8 2 9l7.4-.6Z" /></svg>
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
          <span className={s.count}>{String(at).padStart(2, "0")} / {String(lately.length).padStart(2, "0")}</span>
        </div>
      </div>
      <FilmStrip frames={lately} onOpen={(frame, n) => setOpen({ frame, n })} onPosition={setAt} />
      <p className={`${s.wrap} ${s.mono} ${s.muted} ${s.hint}`}>drag, swipe, or use ← → · tap a frame to view it</p>

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
            {more.filter(({ m }) => filter === "all" || m.filter === filter).map(({ m, f }, i) => (
              <button key={f.key + i} type="button" className={`${s.photo} ${s.tile} ${m.tall ? s.tall : ""}`} onClick={() => setOpen({ frame: f, n: i + 1 })}>
                <Image src={f.src!} alt={f.alt} fill sizes="(max-width: 600px) 50vw, 180px" />
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
            {(["beach", "matcha", "mirror"] as const).map((k) => <div key={k} className={s.pola}><Photo src={PHOTOS[k].src} alt={PHOTOS[k].alt} sizes="240px" /></div>)}
          </div>
          <p className={`${s.hand} ${s.stackNote}`}>places that made me :)</p>
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
      </footer>

      <AnimatePresence>{open && <FrameSheet frame={open.frame} n={open.n} onClose={close} />}</AnimatePresence>
    </div>
  );
}
