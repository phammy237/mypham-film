"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { YouAreHere, NextStop } from "@/components/layout/Wayfinding";
import { ModalShell } from "@/components/ui/ModalShell";
import { ProjectArt, PageHead } from "@/components/film/ui";
import { allWork, SELECTED_WORK_SLUGS } from "@/data/projects";
import type { Project } from "@/data/projects";

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function DevpostIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.002 1.61L0 12.004 6.002 22.39h11.996L24 12.004 17.998 1.61zm1.593 4.084h4.811c3.173 0 5.765 2.592 5.765 5.765s-2.592 5.765-5.765 5.765H7.595zm2.427 2.427v6.677h2.384c1.849 0 3.338-1.489 3.338-3.338s-1.489-3.338-3.338-3.338z" />
    </svg>
  );
}

/** narrative arc: product thinking → analytical/AI work → technical implementation → competitive problem solving */
const CATEGORY_ORDER = [
  "Product & Design", "AI, Data & Modeling", "Software & Engineering", "Case Studies & Competitions",
] as const;
const ALL_CATEGORIES = ["All", ...CATEGORY_ORDER] as const;
type Cat = typeof ALL_CATEGORIES[number];

/* exclude hackathon-only entries — they're covered by their project counterpart */
const displayWork = allWork.filter((p) => p.category !== "Hackathon");

/** a small, hand-picked set of flagship projects — not a second complete browser */
const selectedWork = SELECTED_WORK_SLUGS
  .map((slug) => displayWork.find((p) => p.slug === slug))
  .filter((p): p is Project => !!p);

/** "Participant" is a neutral status, not a distinction — never render it with award/trophy styling */
function isRealAward(award?: string) {
  return !!award && award !== "Participant";
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Sep 2026" / "July 2026" → sortable number; a bare "2025" sorts after that year's dated entries */
function dateValue(p: Project) {
  const [first, second] = p.month.toLowerCase().split(" ");
  const year = Number(second ?? first) || Number(p.year);
  const month = second ? MONTHS.indexOf(first.slice(0, 3)) + 1 : 0;
  return year * 100 + month;
}

/**
 * Tiebreaker only, for projects from the same month: lead with the strongest PM-facing signal —
 * ownership + quantified outcome — ahead of participation-only or purely technical entries.
 */
const PM_PRIORITY = [
  "cartcoach", "kite", "wandr", "tiktok-redesign",
  "gatorbot", "mckinsey-case", "uaa-case", "bloomberg-bpuzzled",
  "wnba-simulator", "scudem",
  "housing-model", "savills-analysis",
  "smartprep-ai", "biaslens",
  "transpeaktation", "campus-compass", "vyspar", "artificial-reef",
];

function priority(slug: string) {
  const i = PM_PRIORITY.indexOf(slug);
  return i === -1 ? Infinity : i;
}

/** newest first */
function sortByDate(items: Project[]) {
  return [...items].sort((a, b) => dateValue(b) - dateValue(a) || priority(a.slug) - priority(b.slug));
}

/** All → every project newest first; a single category → just that list, newest first */
function visibleWork(filter: Cat) {
  return sortByDate(filter === "All" ? displayWork : displayWork.filter((p) => p.category === filter));
}

/** YouTube refuses to be framed from watch/short links — only /embed/ URLs load inside an iframe */
function embedUrl(url: string) {
  const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

type Tab = "overview" | "role" | "stack" | "media";

const MODAL_TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "role", label: "What I did" },
  { key: "stack", label: "Stack" },
  { key: "media", label: "Media" },
];

/* ─── Modal: the frame viewer ──────────────────────── */
function ProjectModal({ project, n, initialTab, onClose }: { project: Project; n: number; initialTab: Tab; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/projects?open=${project.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard can be blocked */ }
  };
  const hasMedia = !!(project.video || project.slides || project.paper);
  const visibleTabs = MODAL_TABS.filter((t) => t.key !== "media" || hasMedia);

  const links = [
    project.github && { label: "GitHub", href: project.github },
    project.devpost && { label: "Devpost", href: project.devpost },
    project.slides && { label: "Slides", href: project.slides },
    project.paper && { label: "Paper", href: project.paper },
    project.liveUrl && { label: "Live demo", href: project.liveUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <ModalShell onClose={onClose} labelledBy="project-modal-title">
      <ProjectArt project={project} n={n} sizes="768px" className="aspect-[16/8]" />
      <div className="px-6 pb-2 pt-5">
        <p className="f-mono text-[var(--muted)]">{project.competition ?? project.category} · {project.month}</p>
        <h2 id="project-modal-title" className="f-h2 mt-1">{project.title}</h2>
        {isRealAward(project.award) && <p className="f-type mt-2 text-sm"><span className="f-mark">🏆 {project.award}</span></p>}
        {project.tags && project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">{project.tags.map((t) => <span key={t} className="f-chip">{t}</span>)}</div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map((l) => <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="f-btn text-[13px]">{l.label} ↗</a>)}
          <Link href={`/projects/${project.slug}`} className="f-btn f-btn-butter text-[13px]">full story →</Link>
          <button type="button" onClick={copyLink} className="f-btn text-[13px]">{copied ? "link copied ✓" : "copy link"}</button>
        </div>
      </div>

      <div role="tablist" className="mt-3 flex gap-1 border-b border-[var(--line)] px-5">
        {visibleTabs.map(({ key, label }) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`f-type relative px-3 py-3 text-[15px] transition-colors ${tab === key ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>
            {label}
            {tab === key && <motion.div layoutId="modal-tab" className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[var(--butter)]" />}
          </button>
        ))}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="f-mono mb-2 text-[var(--muted)]">The problem</p>
              <p className="text-[15px] leading-relaxed">{project.description}</p>
              {project.logline && <p className="f-type mt-4 text-sm italic leading-relaxed text-[var(--muted)]">{project.logline}</p>}
            </motion.div>
          )}
          {tab === "role" && (
            <motion.div key="role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="f-mono mb-4 text-[var(--muted)]">What I did</p>
              <ul className="space-y-4">
                {project.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="f-mono mt-1 shrink-0 text-[var(--blue)]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[15px] leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
          {tab === "stack" && (
            <motion.div key="stack" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="f-mono mb-4 text-[var(--muted)]">Tech stack</p>
              {project.stack ? (
                <div className="f-card overflow-hidden">
                  {project.stack.map((row, i) => (
                    <div key={i} className={`flex items-start gap-4 px-4 py-3 ${i !== 0 ? "border-t border-[var(--line)]" : ""}`}>
                      <span className="f-mono w-28 shrink-0 pt-0.5 text-[var(--muted)]">{row.layer}</span>
                      <span className="f-type text-sm leading-snug">{row.tech}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">{project.tools.map((t) => <span key={t} className="f-chip">{t}</span>)}</div>
              )}
            </motion.div>
          )}
          {tab === "media" && (
            <motion.div key="md" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-8">
              {([["Demo video", project.video && embedUrl(project.video), "demo"], ["Slides", project.slides, "slides"], ["Paper", project.paper, "paper"]] as const).map(([label, src, t]) =>
                src ? (
                  <div key={label}>
                    <p className="f-mono mb-3 text-[var(--muted)]">{label}</p>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[var(--film)]">
                      <iframe src={src} title={`${project.title} ${t}`} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  </div>
                ) : null)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalShell>
  );
}

/* ─── Contact-sheet card ───────────────────────────── */
function WorkCard({ project, n, onSelect }: { project: Project; n: number; onSelect: (p: Project, t: Tab) => void }) {
  const hasMedia = !!(project.video || project.slides || project.paper);
  const extLinks = [
    project.github && { key: "gh", href: project.github, label: "GitHub" },
    project.devpost && { key: "dp", href: project.devpost, label: "Devpost" },
    project.liveUrl && { key: "live", href: project.liveUrl, label: "Live" },
  ].filter(Boolean) as { key: string; href: string; label: string }[];

  return (
    <article className="f-card f-hover-lift flex min-w-0 flex-col p-3">
      <button type="button" data-cursor-photo data-cursor-label="view frame ↗" onClick={() => onSelect(project, hasMedia ? "media" : "overview")} className="f-hoverable relative block w-full text-left" aria-label={`Open ${project.title}`}>
        <ProjectArt project={project} n={n} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px" className="aspect-[16/10] rounded-lg" />
        <span className="f-view">view frame ↗</span>
      </button>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="f-mono text-[var(--muted)]">{project.month}</span>
        {isRealAward(project.award) ? <span className="f-chip border-transparent bg-[var(--butter)] text-[#20201E]">🏆 award</span>
          : project.competition ? <span className="f-chip">hackathon</span> : null}
      </div>
      <h3 className="f-type mt-2 text-xl font-bold leading-tight">{project.title}</h3>
      {project.hook && <p className="mt-1.5 line-clamp-3 flex-1 text-[14px] leading-snug text-[var(--muted)]">{project.hook}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">{project.tools.slice(0, 3).map((t) => <span key={t} className="f-chip">{t}</span>)}</div>
        <div className="flex shrink-0 gap-1">
          {extLinks.slice(0, 2).map((l) => (
            <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" title={l.label} aria-label={l.label}
              className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-transparent hover:bg-[var(--butter)] hover:text-[#20201E]">
              {l.key === "gh" ? <GitHubIcon /> : l.key === "dp" ? <DevpostIcon /> : "↗"}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ─── "Now showing": selected work on a film strip, with a draggable scrubber ─── */
function NowShowing({ onSelect }: { onSelect: (p: Project, t: Tab) => void }) {
  const strip = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  if (selectedWork.length === 0) return null;
  const maxScroll = () => { const el = strip.current; return el ? Math.max(1, el.scrollWidth - el.clientWidth) : 1; };
  const scrubTo = (v: number) => { const el = strip.current; if (el) el.scrollLeft = (v / 1000) * maxScroll(); };
  const jumpTo = (i: number) => strip.current?.scrollTo({ left: (i / Math.max(1, selectedWork.length - 1)) * maxScroll(), behavior: "smooth" });
  return (
    <section aria-label="Selected work" className="overflow-hidden py-6">
      <div className="f-wrap mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="f-h2">now showing →</h2>
        <span className="f-mono text-[var(--muted)]">the ones I&apos;d show you first</span>
      </div>
      <div className="f-tilt" style={{ padding: "26px 0" }}>
        <div ref={strip} className="f-strip" tabIndex={0} role="region" aria-label="Selected work: scroll sideways"
          onScroll={(e) => setPos(e.currentTarget.scrollLeft / maxScroll())}>
          <div className="f-rail">
            {selectedWork.map((p, i) => (
              <button key={p.slug} type="button" data-cursor-photo data-cursor-label="view frame ↗" onClick={() => onSelect(p, "overview")} className="f-hoverable relative w-[300px] shrink-0 text-left text-[#FAF7EF] md:w-[340px]" style={{ scrollSnapAlign: "start" }}>
                <ProjectArt project={p} n={i + 1} sizes="340px" className="aspect-[3/2] rounded-[3px]" />
                <span className="f-view">view frame ↗</span>
                <span className="f-edge"><span>{String(i + 1).padStart(2, "0")}A ▸</span><span>{p.title}</span></span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="f-wrap">
        <input type="range" min={0} max={1000} value={Math.round(pos * 1000)} onChange={(e) => scrubTo(Number(e.target.value))} aria-label="Scrub through the selected work" className="f-scrub" />
        <div className="mt-1 flex justify-between">
          {selectedWork.map((p, i) => (
            <button key={p.slug} type="button" onClick={() => jumpTo(i)} className="f-mono text-[10px] text-[var(--muted)] hover:text-[var(--ink)]" aria-label={`Jump to ${p.title}`}>{String(i + 1).padStart(2, "0")}A</button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Contact sheet: every project as a tiny frame, circled in red grease pencil when it's a pick ─── */
function SheetGrid({ items, onSelect }: { items: Project[]; onSelect: (p: Project, t: Tab) => void }) {
  return (
    <motion.ul className="mt-8 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {items.map((p, i) => (
        <li key={p.slug}>
          <button type="button" data-cursor-photo data-cursor-label="pick this frame" onClick={() => onSelect(p, "overview")} className="group f-hoverable block w-full text-left" aria-label={`Open ${p.title}`}>
            <span className="relative block">
              <ProjectArt project={p} n={i + 1} sizes="200px" className="aspect-[3/2]" />
              <svg className="f-circle" data-on={isRealAward(p.award)} viewBox="0 0 100 66" preserveAspectRatio="none" aria-hidden="true">
                <ellipse cx="50" cy="33" rx="48" ry="31" pathLength={1} fill="none" stroke="#E5483B" strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" transform="rotate(-3 50 33)" />
              </svg>
            </span>
            <span className="f-mono mt-1.5 block truncate text-[10px] text-[var(--ink)]">{p.title}</span>
          </button>
        </li>
      ))}
    </motion.ul>
  );
}

/* ─── Page ─────────────────────────────────────────── */
export default function WorkPage() {
  const [selected, setSelected] = useState<{ project: Project; n: number; tab: Tab } | null>(null);
  const [activeCategory, setActiveCategory] = useState<Cat>("All");
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [view, setView] = useState<"cards" | "sheet">("cards");
  // a shared link (?open=slug) opens that project straight away
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("open");
    const p = slug ? displayWork.find((x) => x.slug === slug) : undefined;
    if (p) setSelected({ project: p, n: 1, tab: "overview" });
  }, []);
  const q = query.trim().toLowerCase();
  const items = visibleWork(activeCategory).filter((p) =>
    (!year || p.month.includes(year) || p.year === year) &&
    (!q || [p.title, p.logline, p.hook, p.competition, p.award, p.category, ...(p.tags ?? []), ...p.tools].join(" ").toLowerCase().includes(q)));
  const open = (p: Project, tab: Tab) => setSelected({ project: p, n: Math.max(1, items.findIndex((x) => x.slug === p.slug) + 1), tab });

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />
      <div className="pt-20">
        <div className="f-wrap pb-2"><YouAreHere page="Work" /></div>
        <PageHead kicker="things I've built" title="work" note={<>{items.length} frames,<br />newest first :)</>}>
          Products, models, and systems — from hackathon weekends to things I kept building after the deadline.
        </PageHead>
        <NowShowing onSelect={open} />
      </div>

      {/* filters sit on a sky band, like the home page's "more on film" */}
      <section className="f-band mt-10 pb-12 pt-10">
        <div className="f-wrap">
          <h2 className="f-h2">all of it →</h2>
          <div className="mt-4 flex gap-1 overflow-x-auto scrollbar-hide sm:flex-wrap sm:overflow-visible" role="group" aria-label="Filter by category">
            {ALL_CATEGORIES.map((cat) => (
              <button key={cat} type="button" aria-pressed={activeCategory === cat} onClick={() => setActiveCategory(cat)} className="f-tab shrink-0">
                {cat.toLowerCase()}
                {cat !== "All" && <span className="ml-1.5 opacity-50">({displayWork.filter((p) => p.category === cat).length})</span>}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-full bg-[var(--paper)] px-4 py-2 text-[var(--ink)]">
              <span aria-hidden className="text-[var(--muted)]">⌕</span>
              <span className="sr-only">Search work</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search projects, tools, awards…" className="f-type w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]" />
            </label>
            <label className="flex items-center gap-2 rounded-full bg-[var(--paper)] px-4 py-2 text-[var(--ink)]">
              <span className="f-mono text-[var(--muted)]">year</span>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="f-type bg-transparent text-sm outline-none">
                <option value="">any</option>
                {Array.from(new Set(displayWork.map((p) => p.year))).sort().reverse().map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            {(query || year) && <button type="button" onClick={() => { setQuery(""); setYear(""); }} className="f-mono px-3">clear ✕</button>}
            <div className="flex gap-1" role="group" aria-label="View as">
              {([["cards", "cards"], ["sheet", "contact sheet"]] as const).map(([v, label]) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className="f-tab shrink-0 !text-[13px]">{label}</button>
              ))}
            </div>
          </div>

          {items.length ? (view === "sheet" ? <SheetGrid items={items} onSelect={open} /> : (
            <motion.div key={activeCategory + q + year} className="mt-8 grid grid-cols-1 gap-4 text-[var(--ink)] sm:grid-cols-2 lg:grid-cols-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 20 }}>
              {items.map((p, i) => <WorkCard key={p.slug} project={p} n={i + 1} onSelect={open} />)}
            </motion.div>)
          ) : (
            <p className="f-type mt-10 text-sm">no frames match that. try another word or clear the filters.</p>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selected && <ProjectModal project={selected.project} n={selected.n} initialTab={selected.tab} onClose={() => setSelected(null)} />}
      </AnimatePresence>
      <NextStop from="Work" />
      <Footer />
    </main>
  );
}
