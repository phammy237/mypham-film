"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TOOL_CATEGORIES, experience, skills } from "@/data/cv";
import s from "./film.module.css";

/* Home page "tools" (a shelf of film canisters; pick one and its tools pull out as a strip)
   and "experience" (a reel timeline: one frame per role, click to open). */
const CAN_COLORS = ["#F4D35E", "#8DBCE0", "#FBE7A1", "#E8DDC7", "#F6C9C2", "#C6D9E8", "#BCD7A8", "#F4D35E", "#8DBCE0", "#F6C9C2"];

function pop(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.classList.remove("chip-pop");
  void el.offsetWidth;
  el.classList.add("chip-pop");
}

function Canister({ color, count }: { color: string; count: number }) {
  return (
    <svg className={s.canSvg} viewBox="0 0 46 58" aria-hidden="true">
      <rect x="9" y="3" width="28" height="6" rx="3" fill="#161615" />
      <rect x="5" y="8" width="36" height="44" rx="5" fill={color} stroke="#20201E" strokeWidth="2" />
      <rect x="5" y="8" width="7" height="44" fill="#161615" opacity=".85" />
      <rect x="34" y="8" width="7" height="44" fill="#161615" opacity=".85" />
      <text x="23" y="36" textAnchor="middle" fontFamily="Courier New, monospace" fontWeight="700" fontSize="14" fill="#20201E">{count}</text>
    </svg>
  );
}

export function ToolsShelf() {
  const reduce = useReducedMotion();
  const [pick, setPick] = useState<(typeof TOOL_CATEGORIES)[number]>(TOOL_CATEGORIES[0]);
  return (
    <section className={`${s.wrap} ${s.tools}`} id="tools">
      <div className={s.secHead}>
        <h2 className={s.serif}>tools</h2>
        <span className={`${s.mono} ${s.muted}`}>pick a canister, pull out the film</span>
      </div>
      <ul className={s.shelf}>
        {TOOL_CATEGORIES.map((c, i) => (
          <li key={c}>
            <button type="button" className={s.can} aria-pressed={pick === c} onClick={() => setPick(c)}>
              <Canister color={CAN_COLORS[i]} count={skills[c].length} />
              <span>{c}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className={s.pull}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={pick} initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} exit={reduce ? { opacity: 0 } : { opacity: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}>
            <p className={`${s.hand} ${s.pullTitle}`}>{pick}</p>
            <div className={`${s.chips} ${s.pullChips}`}>
              {skills[pick].map((t) => <span key={t} className="chip-hit" onClick={pop}>{t}</span>)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <p style={{ marginTop: 18 }}><Link href="/cv" className={s.type} style={{ color: "var(--blue)" }}>everything else on the resume →</Link></p>
    </section>
  );
}

export function ExperienceReel() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className={`${s.wrap} ${s.exp}`} id="experience">
      <div className={s.secHead}>
        <h2 className={s.serif}>experience</h2>
        <span className={`${s.hand} ${s.muted}`} style={{ fontSize: 22 }}>where I&apos;ve been working</span>
      </div>
      <ol className={s.reel}>
        {experience.map((e, i) => {
          const isOpen = open === i;
          return (
            <li key={e.role + e.company}>
              <button type="button" className={s.reelFrame} data-n={`${String(i + 1).padStart(2, "0")}A`} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                <span className={`${s.mono} ${s.muted}`}>{e.period}</span>
                <span className={s.reelRole}><b>{e.role}</b> <span>· {e.company}</span></span>
                {isOpen && <span className={s.reelMore}>{e.description}</span>}
              </button>
            </li>
          );
        })}
      </ol>
      <p style={{ marginTop: 18 }}><Link href="/cv" className={s.type} style={{ color: "var(--blue)" }}>the full story on my resume →</Link></p>
    </section>
  );
}
