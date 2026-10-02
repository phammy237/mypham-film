"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function PlaneIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 16 22 8l-20-1 7 5-7 4Z" />
      <path d="m9 12 2 7 3-9" />
    </svg>
  );
}

const ticketChips = [
  { eyebrow: "Arrival", title: "Data Science",     meta: "MP 2026" },
  { eyebrow: "Arrival", title: "Product Strategy", meta: "MP 2026" },
  { eyebrow: "Arrival", title: "Operations",       meta: "MP 2026" },
  { eyebrow: "Arrival", title: "AI / ML",          meta: "MP 2026" },
  { eyebrow: "Arrival", title: "Research",         meta: "MP 2026" },
];

const barcodePattern = [2, 1, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 1, 2, 3, 1, 1, 2, 1];

const destinations = [
  {
    num: "01",
    title: "Work",
    desc: "Projects in data, product, and operations. Case studies, code, and impact.",
    href: "/projects",
    image: "/projects/cartcoach.png",
  },
  {
    num: "02",
    title: "Biography",
    desc: "My story, values, and the journey that shapes my work.",
    href: "/biography/journey",
    image: "/biography/biography-globe-preview.png",
  },
  {
    num: "03",
    title: "Involvements",
    desc: "Leadership, communities, initiatives, and causes I care about.",
    href: "/involvements",
    image: "/involvements/dsi.jpg",
  },
  {
    num: "04",
    title: "CV",
    desc: "Education, experience, leadership, and skills — the full record.",
    href: "/cv",
    image: "/cv-preview.png",
  },
];

function SideRail() {
  return (
    <motion.aside
      className="absolute left-0 top-0 hidden h-full w-[72px] border-r border-black/10 dark:border-white/10 lg:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex h-full flex-col items-center justify-between pb-10 pt-28">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-surface/45 dark:text-white/45">
          <div>MP</div>
          <div className="mt-2">00</div>
        </div>
        <div className="flex flex-1 flex-col items-center gap-5 py-8">
          <div className="h-52 w-px bg-gradient-to-b from-accent via-accent/70 to-transparent" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full bg-surface/35 dark:bg-white/35" />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-surface/35 dark:text-white/35">Scroll</span>
          <div className="h-6 w-px bg-accent" />
        </div>
      </div>
    </motion.aside>
  );
}

function BoardingPass() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[18px] border backdrop-blur-md border-accent/25 bg-sand/50 shadow-[0_20px_70px_rgba(24,35,63,0.1)] dark:border-accent/35 dark:bg-navy/85 dark:shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
      initial={{ opacity: 0, x: 34 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.38, duration: 0.65, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(91,58,142,0.07),transparent_32%),linear-gradient(135deg,rgba(24,35,63,0.03),transparent_42%)] dark:bg-transparent" />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b px-5 py-3 border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="grid h-4 w-4 place-items-center rounded-full border border-black/20 text-[10px] text-surface/40 dark:border-white/20 dark:text-white/35">M</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-surface/60 dark:text-white/55">Boarding Pass</span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-surface/40 dark:text-white/35">MP-2026</span>
      </div>

      {/* HAN → GNV */}
      <div className="relative px-5 py-4">
        <div className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface/40 dark:text-white/35">From</p>
            <p className="heading mt-1.5 text-4xl leading-none sm:text-5xl">HAN</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-surface/50 dark:text-white/45">Hanoi</p>
          </div>
          <div className="pb-6 text-accent">
            <div className="relative flex h-6 items-center">
              <span className="h-px w-full border-t border-dashed border-accent/70" />
              <motion.div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
              >
                <PlaneIcon />
              </motion.div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface/40 dark:text-white/35">To</p>
            <p className="heading mt-1.5 text-4xl leading-none sm:text-5xl">GNV</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-surface/50 dark:text-white/45">Gainesville</p>
          </div>
        </div>
      </div>

      {/* Gate / Status / Seat */}
      <div className="relative border-y px-5 py-2.5 border-black/10 dark:border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface/40 dark:text-white/35">Gate</p>
            <div className="mt-2 flex justify-between">
              {[["P","Product"],["D","Data"],["O","Ops"]].map(([letter, word]) => (
                <div key={letter} className="flex flex-col items-center gap-1">
                  <span className="heading text-xl">{letter}</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-surface/40 dark:text-white/35">{word}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-l pl-4 border-black/10 dark:border-white/10">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface/40 dark:text-white/35">Status</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="animate-pulse">In Progress</span>
            </p>
          </div>
          <div className="border-l pl-4 border-black/10 dark:border-white/10">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface/40 dark:text-white/35">Seat</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-surface/70 dark:text-white/65">Builder</p>
          </div>
        </div>
      </div>

      {/* Passenger info + barcode */}
      <div className="relative grid grid-cols-[1fr_auto] items-center gap-6 px-5 py-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface/40 dark:text-white/35">Passenger</p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-surface/80 dark:text-white/75">My Pham</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface/40 dark:text-white/35">Class</p>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-surface/80 dark:text-white/75">First Class</p>
          </div>
        </div>
        <div className="hidden flex-col items-center justify-center gap-1.5 sm:flex">
          <div className="flex h-9 items-stretch gap-[1.5px]">
            {barcodePattern.map((w, i) => (
              <span key={i} className="bg-surface dark:bg-white" style={{ width: `${w * 1.1}px` }} />
            ))}
          </div>
          <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-surface/75 dark:text-white/70">mypham.space</span>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="relative flex items-end justify-between border-t px-5 py-2.5 border-black/10 dark:border-white/10">
        <p className="max-w-[260px] font-display text-sm italic leading-snug text-surface/65 dark:text-white/55">
          I turn ambiguity into product, strategy, and data-driven solutions.
        </p>
        <div className="grid h-10 w-10 place-items-center rounded-full border border-accent/50 text-center font-mono text-[7px] uppercase leading-tight tracking-[0.14em] text-accent/75">
          Building<br />Impact
        </div>
      </div>
    </motion.div>
  );
}

function TicketChips() {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.5 }}
    >
      {ticketChips.map((ticket) => (
        <div
          key={ticket.title}
          className="relative flex min-h-[64px] flex-col rounded-lg border backdrop-blur px-4 py-2.5 border-accent/25 bg-sand/40 shadow-[0_10px_30px_rgba(24,35,63,0.06)] dark:border-accent/35 dark:bg-navy/70 dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          <div className="absolute inset-x-2 top-1 border-t border-dashed border-black/10 dark:border-white/15" />
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface/45 dark:text-white/45">{ticket.eyebrow}</p>
          <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.08em] text-accent">{ticket.title}</p>
          <div className="mt-auto flex items-center justify-between pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-surface/45 dark:text-white/45">
            <span className="whitespace-nowrap">{ticket.meta}</span>
            <span>+</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function DestinationCards() {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.88, duration: 0.55 }}
    >
      {destinations.map((destination) => (
        <Link
          key={destination.num}
          href={destination.href}
          className="group relative min-h-[150px] overflow-hidden rounded-lg border border-black/20 bg-black/[0.02] dark:border-white/25 dark:bg-white/[0.03]"
        >
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center opacity-40 transition duration-500 group-hover:scale-100 group-hover:opacity-55"
            style={{ backgroundImage: `url(${destination.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sand via-sand/60 to-sand/55 dark:from-navy dark:via-navy/80 dark:to-navy/75" />
          <div className="relative flex h-full flex-col justify-between p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-surface/75 dark:text-white/70">
              Stop <span className="heading block pt-1 text-2xl tracking-normal">{destination.num}</span>
            </p>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="heading text-2xl md:text-3xl">{destination.title}</h3>
                <p className="mt-2 line-clamp-2 max-w-[280px] font-mono text-[12px] leading-relaxed text-surface/85 dark:text-white/85">{destination.desc}</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border text-lg transition border-surface/70 text-surface group-hover:border-accent group-hover:text-accent dark:border-white/90 dark:text-white">
                &rarr;
              </span>
            </div>
          </div>
        </Link>
      ))}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-sand text-surface dark:bg-navy dark:text-white">
      <SideRail />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/images/headshot.jpg')] bg-cover bg-[center_31%] opacity-55 dark:opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_42%,rgba(91,58,142,0.08),transparent_28%),linear-gradient(90deg,rgba(243,236,223,0.12)_0%,rgba(243,236,223,0.08)_40%,rgba(243,236,223,0.03)_65%,transparent_85%)] dark:bg-[radial-gradient(circle_at_45%_42%,rgba(91,58,142,0.08),transparent_28%),linear-gradient(90deg,rgba(24,35,63,0.1)_0%,rgba(24,35,63,0.08)_36%,rgba(24,35,63,0.06)_58%,rgba(24,35,63,0.1)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t dark:from-navy dark:via-navy/88 dark:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-base to-transparent dark:hidden" />
        <div className="absolute left-[12%] top-[50%] hidden h-px w-[44%] bg-gradient-to-r from-transparent to-transparent via-surface/15 dark:via-transparent lg:block" />
        <div className="absolute left-[16%] top-[48%] hidden h-24 w-[64%] blur-xl bg-[radial-gradient(ellipse_at_center,rgba(24,35,63,0.1),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.14),transparent_60%)] lg:block" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 pb-4 pt-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1.3fr_1fr] xl:gap-10">
          <div>
            <motion.div
              className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-accent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_rgba(91,58,142,0.4)] dark:shadow-none" />
              Flight MP-2026
            </motion.div>

            <motion.h1
              className="heading text-[clamp(3.5rem,8vw,7rem)] leading-[0.82] tracking-normal"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
            >
              MY PHAM
            </motion.h1>

            <motion.p
              className="mt-4 max-w-2xl font-mono text-sm leading-7 tracking-[0.03em] text-accent dark:text-white/62 sm:text-base"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.5 }}
            >
              Data Science student building across product, operations, and decision systems.
            </motion.p>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.5 }}
            >
              <Link
                href="#about"
                className="group inline-flex w-fit items-center bg-accent text-white shadow-[0_8px_30px_rgba(91,58,142,0.55)] transition hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy"
              >
                <span className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em]">Explore My Journey</span>
                <span className="border-l border-white/30 px-4 py-2.5 text-base leading-none">&rarr;</span>
              </Link>
            </motion.div>

            <div className="mt-7">
              <TicketChips />
            </div>
          </div>

          <div className="hidden lg:block">
            <BoardingPass />
          </div>
        </div>

        <div className="-mt-1 lg:-mt-5">
          <div className="mb-1.5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-surface/75 dark:text-white">
            <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_rgba(91,58,142,0.3)] dark:shadow-none" /> Destinations
          </div>
          <DestinationCards />
        </div>
      </div>
    </section>
  );
}
