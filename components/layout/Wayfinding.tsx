import Link from "next/link";

/**
 * Site-wide wayfinding that ties every page back to the journey: a "you are here" pin at the top of a
 * page, and a "Next stop" card at the bottom so visitors keep moving instead of bouncing to the navbar.
 */

/** the one route through the site — Journey → Work → Involvements → CV → Connect → back to the Journey */
const ROUTE = [
  { href: "/biography/journey", name: "Journey", pitch: "Hanoi → Rivermont → Gainesville, told as you scroll" },
  { href: "/projects", name: "Work", pitch: "Products, models, and systems I’ve built, newest first" },
  { href: "/involvements", name: "Involvements", pitch: "The teams and communities I lead and mentor in" },
  { href: "/cv", name: "CV", pitch: "Everything on one page, ready to print" },
  { href: "/connect", name: "Connect", pitch: "Same city? Let’s meet. Different city? We have WiFi." },
] as const;

type Stop = (typeof ROUTE)[number]["name"];

export function YouAreHere({ page, place = "Gainesville, FL" }: { page: Stop; place?: string }) {
  return (
    <Link
      href="/biography/journey"
      className="group inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/5 px-3 py-1.5 transition-colors hover:border-accent/40 dark:hover:border-accent-lavender/40"
      aria-label={`You are here: ${place}, ${page}. Open the journey map`}
    >
      <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden className="text-accent dark:text-accent-lavender">
        <path fill="currentColor" d="M5 0a5 5 0 0 0-5 5c0 3.6 5 7 5 7s5-3.4 5-7a5 5 0 0 0-5-5Zm0 6.8A1.8 1.8 0 1 1 5 3.2a1.8 1.8 0 0 1 0 3.6Z" />
      </svg>
      <span className="eyebrow text-[10px] text-surface/60 dark:text-white/55">
        {place} · {page}
      </span>
      <span className="eyebrow text-[10px] text-accent dark:text-accent-lavender opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0">
        Map →
      </span>
    </Link>
  );
}

export function NextStop({ from }: { from: Stop }) {
  const i = ROUTE.findIndex((s) => s.name === from);
  const next = ROUTE[(i + 1) % ROUTE.length];
  return (
    <div className="px-[5vw] max-w-[1400px] mx-auto pb-16">
      <Link
        href={next.href}
        className="group flex items-center justify-between gap-6 rounded-2xl bg-navy dark:bg-white/[0.06] dark:border dark:border-white/10 px-6 py-7 md:px-10 md:py-9 transition-transform hover:-translate-y-0.5"
      >
        <div>
          <p className="eyebrow text-[10px] text-white/45">Next stop</p>
          <p className="font-display text-3xl md:text-4xl text-white mt-2">{next.name}</p>
          <p className="font-body text-sm text-white/60 mt-1.5">{next.pitch}</p>
        </div>
        <span
          aria-hidden
          className="hidden sm:grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/25 text-white text-xl transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
    </div>
  );
}
