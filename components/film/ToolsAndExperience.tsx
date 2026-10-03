"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { experience, skillGroups, skills } from "@/data/cv";
import s from "./film.module.css";

/* Home page "tools" (a box of index cards, one tab per group)
   and "experience" (a reel timeline: one frame per role, click to open). */
function pop(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.classList.remove("chip-pop");
  void el.offsetWidth;
  el.classList.add("chip-pop");
}

export function ToolsShelf() {
  const reduce = useReducedMotion();
  const [pick, setPick] = useState<(typeof skillGroups)[number]>(skillGroups[0]);
  return (
    <section className={`${s.wrap} ${s.tools}`} id="tools">
      <div className={s.secHead}>
        <h2 className={s.serif}>tools</h2>
        <span className={`${s.mono} ${s.muted}`}>flip through the index cards</span>
      </div>
      <div className={s.cardBox}>
        <div className={s.cardTabs} role="tablist" aria-label="Tool groups">
          {skillGroups.map((c) => (
            <button key={c} type="button" role="tab" id={`tab-${c}`} aria-selected={pick === c} aria-controls="tools-card" className={s.cardTab} onClick={() => setPick(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className={s.indexCard} role="tabpanel" id="tools-card" aria-labelledby={`tab-${pick}`}>
          <motion.div key={pick} initial={reduce ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}>
            <p className={`${s.hand} ${s.cardTitle}`}>{pick}</p>
            <ul className={s.cardList}>
              {skills[pick].map((t) => <li key={t} onClick={pop}>{t}</li>)}
            </ul>
          </motion.div>
        </div>
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
