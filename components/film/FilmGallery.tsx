"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { COLLAGE, FIRST_FRAMES, ROLLS, photosOf, type GalleryPhoto } from "@/data/gallery";
import { FilmMark } from "@/components/layout/FilmMark";

/* The Film page: a few frames up front, a "see more" button, and then the rest, either sorted into rolls (each a film
   canister that unrolls its strip) or dropped on the table as a collage. */
const hash = (s: string) => s.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const tilt = (src: string, range: number) => ((hash(src) % 1000) / 1000 - 0.5) * 2 * range;
const frameNo = (n: number) => `MY ${String(n).padStart(3, "0")}A`;
const SHEET_H = 210; // height of a frame on an unrolled strip

type Open = { list: GalleryPhoto[]; i: number };

function Lightbox({ list, i, onNav, onClose }: { list: GalleryPhoto[]; i: number; onNav: (d: number) => void; onClose: () => void }) {
  const p = list[i];
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose, onNav]);
  return (
    <motion.div className="fg-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={p.caption} className="fg-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="fg-stage">
          <Image key={p.src} src={p.src} alt={p.alt} fill sizes="92vw" className="fg-full" priority />
        </div>
        <div className="fg-bar">
          <button type="button" className="f-btn" onClick={() => onNav(-1)} disabled={list.length < 2} aria-label="Previous photo">← prev</button>
          <p className="fg-cap"><span className="f-hand">{p.caption}</span><span className="f-mono">{frameNo(i + 1)} · {i + 1} of {list.length}</span></p>
          <button type="button" className="f-btn" onClick={() => onNav(1)} disabled={list.length < 2} aria-label="Next photo">next →</button>
        </div>
        <button ref={closeRef} type="button" className="fg-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </motion.div>
  );
}

function Pola({ p, n, onOpen, className = "", style, sizes }: { p: GalleryPhoto; n: number; onOpen: () => void; className?: string; style?: React.CSSProperties; sizes: string }) {
  return (
    <button type="button" onClick={onOpen} data-cursor-photo data-cursor-label="view frame ↗" aria-label={`Open: ${p.caption}`} className={`fg-pola f-pola f-hoverable ${className}`} style={style}>
      <span className="f-photo" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
        <Image src={p.src} alt={p.alt} fill sizes={sizes} style={p.pos ? { objectPosition: p.pos } : undefined} />
        <span className="f-fno">{frameNo(n)}</span>
        <span className="f-view">view frame ↗</span>
      </span>
      <span className="f-hand fg-label">{p.caption}</span>
    </button>
  );
}

export function FilmGallery() {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<"rolls" | "collage">("rolls");
  const [rollId, setRollId] = useState<string | null>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const roll = ROLLS.find((r) => r.id === rollId) ?? null;
  const rollPhotos = roll ? photosOf(roll) : [];

  const nav = useCallback((d: number) => setOpen((o) => (o ? { ...o, i: (o.i + d + o.list.length) % o.list.length } : o)), []);
  const close = useCallback(() => setOpen(null), []);

  const more = () => {
    setExpanded(true);
    // let it mount, then ease down to it
    setTimeout(() => moreRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 120);
  };

  return (
    <div className="pb-24">
      {/* a few to start */}
      <section aria-label="A few frames" className="f-wrap">
        <ul className="fg-first">
          {FIRST_FRAMES.map((p, i) => (
            <li key={p.src}>
              <Pola p={p} n={i + 1} sizes="(max-width: 700px) 70vw, 320px" onOpen={() => setOpen({ list: FIRST_FRAMES, i })}
                style={{ ["--h" as string]: "clamp(210px, 26vw, 300px)", ["--ar" as string]: String(p.w / p.h), transform: `rotate(${tilt(p.src, 3)}deg)` }} />
            </li>
          ))}
        </ul>
      </section>

      <div className="f-wrap mt-12 flex flex-col items-center gap-3">
        {!expanded ? (
          <>
            <button type="button" onClick={more} className="f-btn f-btn-butter !px-7 !py-3 text-base" data-cursor-hover>see more →</button>
            <p className="f-mono text-[var(--muted)]">{COLLAGE.length} more frames, in {ROLLS.length} rolls</p>
          </>
        ) : (
          <button type="button" onClick={() => { setExpanded(false); setRollId(null); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }} className="f-btn">show fewer ↑</button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.section ref={moreRef} aria-label="More frames" className="f-wrap mt-14 scroll-mt-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="f-h2"><span className="f-mark">{view === "rolls" ? "the rolls" : "the rest of the roll"}</span></h2>
                <p className="f-hand mt-1 text-2xl" style={{ transform: "rotate(-1.5deg)", transformOrigin: "left" }}>{view === "rolls" ? "tap a canister to unroll it" : "everything else on the table :)"}</p>
              </div>
              <div role="group" aria-label="View as" className="flex gap-1">
                {(["rolls", "collage"] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className="f-tab">{v}</button>
                ))}
              </div>
            </div>

            {view === "rolls" ? (
              <ul className="fg-rolls">
                {ROLLS.map((r) => {
                  const isOpen = rollId === r.id;
                  return (
                    <li key={r.id} className={isOpen ? "fg-row-open" : undefined}>
                      <div className={isOpen ? "fg-row" : undefined}>
                        <button type="button" className="fg-roll" aria-expanded={isOpen} onClick={() => setRollId(isOpen ? null : r.id)}
                          data-cursor-photo data-cursor-label={isOpen ? "roll it back" : "unroll"}>
                          <FilmMark className="fg-can" body={r.color} speed={r.speed} />
                          <span className="f-hand fg-roll-title">{r.title}</span>
                          <span className="f-mono text-[var(--muted)]">{r.srcs.length} frames · ISO {r.speed}</span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div className="fg-extend" aria-label={`${r.title} roll`}
                              initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }}
                              exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}>
                              <p className="f-mono mb-1 text-[var(--muted)]">{r.blurb}</p>
                              <div className="f-strip" tabIndex={0} role="region" aria-label={`${r.title}: scroll sideways`}>
                                <div className="f-rail">
                                  {rollPhotos.map((p, i) => (
                                    <button key={p.src} type="button" className="fg-frame f-hoverable" data-cursor-photo data-cursor-label="view frame ↗" aria-label={`Open: ${p.caption}`} onClick={() => setOpen({ list: rollPhotos, i })}>
                                      <span className="f-photo" style={{ width: Math.round((SHEET_H * p.w) / p.h), height: SHEET_H }}>
                                        <Image src={p.src} alt={p.alt} fill sizes="320px" style={p.pos ? { objectPosition: p.pos } : undefined} />
                                        <span className="f-fno">{frameNo(i + 1)}</span>
                                        <span className="f-view">view frame ↗</span>
                                      </span>
                                      <span className="f-edge"><span>{String(i + 1).padStart(2, "0")}A ▸</span><span>{p.caption}</span></span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="fg-collage">
                {COLLAGE.map((p, i) => {
                  const n = FIRST_FRAMES.length + i + 1;
                  const rot = tilt(p.src, 4);
                  return (
                    <motion.li key={p.src} className="fg-item"
                      initial={reduce ? false : { opacity: 0, y: 60, scale: 0.9, rotate: rot * 3 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotate: rot }}
                      transition={{ type: "spring", stiffness: 140, damping: 16, delay: Math.min(i, 12) * 0.05 }}>
                      {hash(p.src) % 3 === 0 && <span className="fg-tape" aria-hidden="true" />}
                      <Pola p={p} n={n} sizes="(max-width: 640px) 46vw, (max-width: 1024px) 32vw, 270px" onOpen={() => setOpen({ list: [...FIRST_FRAMES, ...COLLAGE], i: FIRST_FRAMES.length + i })} />
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && open.list[open.i] && <Lightbox list={open.list} i={open.i} onNav={nav} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}
