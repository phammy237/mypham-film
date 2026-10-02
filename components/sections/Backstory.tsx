"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SocialLinks } from "@/components/ui/SocialLinks";

const principles = [
  {
    label: "Problem First",
    icon: "◎",
    short: "Start with the problem, not the feature",
    detail:
      "Before thinking about solutions, I ask what the actual problem is — who has it, how often, and why it matters. The feature comes after.",
    practice: "I map pain points, user needs, and operational constraints before proposing solutions.",
  },
  {
    label: "User Behavior",
    icon: "◈",
    short: "Understand friction and decision points",
    detail:
      "I map how people actually move through a system, where they get stuck, and what drives their choices. Behavior reveals what requirements documents miss.",
    practice: "I trace user flows step by step to find where friction and drop-off actually happen.",
  },
  {
    label: "Tradeoffs",
    icon: "⌥",
    short: "Balance user needs, business goals, and constraints",
    detail:
      "Good decisions require holding multiple competing pressures at once. I try to make those tensions explicit rather than pretending they don't exist.",
    practice: "I lay out the competing constraints explicitly before recommending a direction.",
  },
  {
    label: "Clarity First",
    icon: "⊡",
    short: "Clarity, prioritization, and execution",
    detail:
      "Most problems are solvable if you're ruthlessly clear about what matters and what doesn't. Vagueness is usually where projects go wrong.",
    practice: "I define what's in scope, what's out, and what success looks like before starting.",
  },
  {
    label: "Signal → Action",
    icon: "→",
    short: "Turn messy information into actionable direction",
    detail:
      "I enjoy synthesizing noisy, incomplete information into a clear next step. That translation — from data to decision — is where I think I add the most value.",
    practice: "I turn scattered data points into one clear, actionable recommendation.",
  },
];


const photos = [
  { src: "/images/headshot.jpg",    caption: "UF Data Science · Class of 2028" },
  { src: "/images/IMG_3794.JPG",   caption: "" },
  { src: "/images/IMG_4610.JPG",   caption: "" },
  { src: "/images/IMG_7605.JPG",   caption: "" },
  { src: "/images/IMG_7729.JPG",   caption: "" },
  { src: "/images/IMG_9501.JPG",   caption: "" },
];

function PhotoSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const [errorSet, setErrorSet] = useState<Set<number>>(new Set());

  const visible = photos.filter((_, i) => !errorSet.has(i));
  const current = visible[index] ?? visible[0];
  const currentOrigIdx = current ? photos.indexOf(current) : 0;

  function go(delta: number) {
    setDirection(delta);
    setIndex((prev) => (prev + delta + visible.length) % visible.length);
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="w-full max-w-[380px] mx-auto md:mx-0">
      {/* Slide frame */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-xl shadow-accent/5">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentOrigIdx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {!errorSet.has(currentOrigIdx) ? (
              <Image
                src={current?.src ?? "/headshot.JPG"}
                alt="My Pham"
                fill
                className={`object-cover transition-opacity duration-500 ${loadedSet.has(currentOrigIdx) ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setLoadedSet((s) => new Set(s).add(currentOrigIdx))}
                onError={() => setErrorSet((s) => new Set(s).add(currentOrigIdx))}
                priority={currentOrigIdx === 0}
              />
            ) : null}

            {/* Gradient + caption */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/80 to-transparent pointer-events-none" />
            {current?.caption && (
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-white text-lg">My Pham</p>
                <p className="font-mono text-xs text-white/50">{current.caption}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Arrows — only show when more than 1 visible photo */}
        {visible.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-accent/70"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-accent/70"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {visible.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {visible.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-accent" : "w-1.5 bg-muted/40 dark:bg-white/20"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HowIThink() {
  const [active, setActive] = useState(0);
  const current = principles[active];

  return (
    <motion.div
      className="mt-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
    >
      <p className="eyebrow text-muted dark:text-white/40 mb-2">
        How I Think
      </p>
      <p className="body-copy text-sm dark:text-white/40 mb-8">
        The principles that shape how I approach products and problems.
      </p>

      <div className="grid gap-4 md:grid-cols-[300px_1fr] md:items-start">
        {/* Principle list */}
        <div className="flex flex-col gap-2">
          {principles.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setActive(i)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 ${
                active === i
                  ? "border-accent bg-accent/10"
                  : "border-border dark:border-white/10 hover:border-accent/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs ${
                    active === i ? "bg-accent/20 text-accent" : "bg-black/5 text-muted dark:bg-white/10 dark:text-white/40"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`font-body text-sm font-medium ${active === i ? "text-accent" : "text-surface dark:text-white/80"}`}>
                  {p.label}
                </span>
              </span>
              <span className={`text-sm ${active === i ? "text-accent" : "text-muted dark:text-white/30"}`}>
                {active === i ? "→" : p.icon}
              </span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border p-6 dark:border-white/10 md:p-8"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-lg text-accent">
              {current.icon}
            </span>
            <h3 className="heading mb-3 text-xl md:text-2xl">{current.short}</h3>
            <p className="body-copy text-sm leading-relaxed dark:text-white/60">{current.detail}</p>

            <div className="my-5 border-t border-dashed border-border dark:border-white/15" />

            <div className="flex items-start gap-3 rounded-xl border border-accent/10 bg-accent/5 px-4 py-3.5">
              <span className="mt-0.5 text-accent">✦</span>
              <p className="body-copy text-xs leading-relaxed dark:text-white/50">
                <span className="font-medium text-surface dark:text-white/70">In practice: </span>
                {current.practice}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function Backstory() {
  return (
    <section id="about" className="bg-sand dark:bg-navy px-[5vw] pt-16 pb-28 md:pt-24 md:pb-40">
      <div className="max-w-[1200px] mx-auto">
        {/* Section label */}
        <motion.p
          className="eyebrow text-muted dark:text-white/40 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          About Me
        </motion.p>

        <div className="grid md:grid-cols-[auto_1fr] gap-12 md:gap-16 items-start mb-16">
          {/* Headshot */}
          <motion.div
            className="w-full md:w-[380px]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          >
            <PhotoSlider />
            <div className="mt-4">
              <SocialLinks iconClass="text-muted dark:text-white/45 hover:text-accent transition" />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
          >
            <h2 className="heading text-7xl md:text-8xl leading-tight">
              Hi, I&apos;m My.
            </h2>

            <p className="body-copy text-xl dark:text-white/60 leading-relaxed">
              I&apos;m My Pham, a Data Science student at the University of Florida interested in
              product, data, and operations.
            </p>
            <p className="body-copy text-xl dark:text-white/60 leading-relaxed">
              I like turning messy, ambiguous problems into workflows, tools, and product systems
              that people can actually use. I&apos;m currently a Product Management Intern at
              Lattera, an F&amp;B startup, and previously worked in Risk Advisory at Deloitte. My
              work spans product strategy, analytics, sustainability, ESG, and decision modeling.
            </p>
            <p className="body-copy text-xl dark:text-white/60 leading-relaxed">
              At UF, I&apos;ve served as External Vice President of Data Science &amp; Informatics
              for two years, previously served as Treasurer for the Vietnamese International Student
              Association, and will be Head of Operations for WingHacks. Outside of work, I&apos;m
              usually planning a trip, exploring a city, taking photos, drinking matcha, or making
              food.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-1">
              {["Product Strategy", "Data Science", "Consulting", "AI/ML", "Research", "Builder"].map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs text-accent border border-accent/30 bg-accent-light px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Arrow links */}
            <div className="flex flex-wrap gap-6 mt-3">
              <Link href="/biography/journey" className="font-mono text-sm text-muted dark:text-white/50 hover:text-surface dark:hover:text-white transition-colors duration-200">
                wanna learn more → biography
              </Link>
              <Link href="/connect" className="font-mono text-sm text-muted dark:text-white/50 hover:text-surface dark:hover:text-white transition-colors duration-200">
                wanna hang out → contact
              </Link>
            </div>

          </motion.div>
        </div>

        {/* Cards row */}
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {/* Education card */}
            <div className="bg-card dark:bg-white/5 border border-border dark:border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-body font-semibold text-surface dark:text-white">University of Florida</p>
                  <p className="font-mono text-xs text-muted dark:text-white/40 mt-1">Gainesville, FL</p>
                </div>
                <span className="font-mono text-xs text-accent bg-accent-light px-2 py-1 rounded">
                  Expected May 2028
                </span>
              </div>
              <p className="font-body text-sm text-surface/80 dark:text-white/70 mb-2">B.S. Data Science · GPA 3.83</p>
              <p className="font-mono text-xs text-muted dark:text-white/40">
                Certificate in AI Fundamentals and Applications
              </p>
            </div>

            {/* Early career programs */}
            <div className="bg-card dark:bg-white/5 border border-border dark:border-white/10 rounded-xl p-6">
              <p className="eyebrow text-muted dark:text-white/40 mb-3">
                Selected Early Career Programs
              </p>
              <div className="flex flex-wrap gap-2">
                {["BCG Launch", "McKinsey Forward", "Forte Career Ready", "JPMorgan Spring Insights", "Morgan Stanley Early Insights"].map((p) => (
                  <span key={p} className="font-mono text-xs text-surface/70 dark:text-white/50 border border-border dark:border-white/10 px-2 py-1 rounded">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* How I Think */}
        <HowIThink />
      </div>
    </section>
  );
}
