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
      className="group f-mono inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-3 py-1.5 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
      aria-label={`You are here: ${place}, ${page}. Open the journey map`}
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--butter)] ring-1 ring-[var(--ink)]/30" />
      <span>{place} · {page}</span>
      <span className="text-[var(--blue)] opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0">map →</span>
    </Link>
  );
}

/** bottom-of-page "next frame": a strip of film with the next stop on it */
export function NextStop({ from }: { from: Stop }) {
  const i = ROUTE.findIndex((s) => s.name === from);
  const next = ROUTE[(i + 1) % ROUTE.length];
  return (
    <div className="f-wrap pb-16 pt-6">
      <Link
        href={next.href}
        data-cursor-label="next frame →"
        data-cursor-photo
        className="group relative flex items-center justify-between gap-6 overflow-hidden rounded-sm bg-[var(--film)] px-8 py-9 text-[#FAF7EF] md:px-14 md:py-12"
      >
        <span aria-hidden className="absolute inset-x-0 top-2 h-2.5 bg-[repeating-linear-gradient(90deg,transparent_0_9px,#FAF7EF_9px_21px,transparent_21px_30px)] opacity-80" />
        <span aria-hidden className="absolute inset-x-0 bottom-2 h-2.5 bg-[repeating-linear-gradient(90deg,transparent_0_9px,#FAF7EF_9px_21px,transparent_21px_30px)] opacity-80" />
        <div>
          <p className="f-mono text-[#F4D35E]">next frame ▸ {String(((i + 1) % ROUTE.length) + 1).padStart(2, "0")}A</p>
          <p className="f-serif mt-2 text-4xl md:text-6xl">{next.name}</p>
          <p className="f-type mt-2 max-w-md text-sm text-[#FAF7EF]/65">{next.pitch}</p>
        </div>
        <span aria-hidden className="hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-[#F4D35E] text-xl text-[#20201E] transition-transform group-hover:translate-x-1 sm:grid">→</span>
      </Link>
    </div>
  );
}
