"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { YouAreHere, NextStop } from "@/components/layout/Wayfinding";
import { ModalShell } from "@/components/ui/ModalShell";
import { HeroNavDots } from "@/components/ui/HeroNavDots";
import { useRotatingIndex } from "@/lib/hooks/useRotatingIndex";
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

const ROTATE_MS = 6500;

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

const AWARD_BADGE: Record<string, string> = {
  "Best Finance Project": "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  "2nd Place Best Use of AWS · Best Use of Tiger Data": "bg-slate-300/20 text-slate-200 border-slate-300/40",
  "3rd Place Overall": "bg-orange-500/20 text-orange-300 border-orange-500/40",
  "Top 20": "bg-blue-500/20 text-blue-300 border-blue-500/40",
  "Outstanding Award": "bg-[#7b2cbf]/20 text-[#c77dff] border-[#7b2cbf]/40",
};

const MODAL_TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "role", label: "What I Did" },
  { key: "stack", label: "Stack" },
  { key: "media", label: "Media" },
];

/* ─── Modal ────────────────────────────────────────── */
function ProjectModal({ project, initialTab, onClose }: { project: Project; initialTab: Tab; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const hasMedia = !!(project.video || project.slides || project.paper);
  const visibleTabs = MODAL_TABS.filter((t) => t.key !== "media" || hasMedia);

  const links = [
    project.github && { label: "GitHub", href: project.github },
    project.devpost && { label: "Devpost", href: project.devpost },
    project.slides && { label: "Slides", href: project.slides },
    project.paper && { label: "Paper", href: project.paper },
    project.liveUrl && { label: "Live Demo", href: project.liveUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div className="relative h-52 md:h-60 flex items-end p-6 overflow-hidden" style={{ background: project.gradient }}>
        {project.image && <Image src={project.image} alt={project.title} fill className="object-contain opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-black/30 to-transparent" />
        <div className="relative z-10 w-full">
          <span className="font-mono text-xs text-white/50 block mb-1">{project.competition ?? project.category} · {project.month}</span>
          <h2 className="font-display text-4xl md:text-5xl text-white leading-none mb-1">{project.title}</h2>
          {isRealAward(project.award) && (
            <p className="font-mono text-xs text-yellow-400/70 mt-1.5">🏆 {project.award}</p>
          )}
          {project.tags && project.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              {project.tags.map((t) => (
                <span key={t} className="font-mono text-[10px] px-2.5 py-1 bg-white/10 border border-white/15 text-white/60 rounded-full">{t}</span>
              ))}
            </div>
          )}
          {links.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="font-mono text-xs px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition-colors">{l.label} ↗</a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-6">
        {visibleTabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`relative font-mono text-xs px-4 py-3 transition-colors ${tab === key ? "text-white" : "text-white/40 hover:text-white/70"}`}>
            {label}
            {tab === key && <motion.div layoutId="modal-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">The Problem</p>
              <p className="font-body text-white/70 leading-relaxed">{project.description}</p>
              {project.logline && (
                <p className="font-body text-sm text-white/40 italic mt-3 leading-relaxed">{project.logline}</p>
              )}
            </motion.div>
          )}

          {tab === "role" && (
            <motion.div key="role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4">What I Did</p>
              <ul className="space-y-4">
                {project.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-accent mt-1.5 flex-shrink-0 text-xs">▸</span>
                    <span className="font-body text-sm text-white/65 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {tab === "stack" && (
            <motion.div key="stack" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4">Tech Stack</p>
              {project.stack ? (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  {project.stack.map((row, i) => (
                    <div key={i} className={`flex items-start gap-4 px-4 py-3 ${i !== 0 ? "border-t border-white/10" : ""}`}>
                      <span className="font-mono text-[11px] text-white/35 w-28 flex-shrink-0 pt-0.5 uppercase tracking-wide">{row.layer}</span>
                      <span className="font-body text-sm text-white/75 leading-snug">{row.tech}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((t) => (
                    <span key={t} className="font-mono text-xs text-white/70 border border-white/15 bg-white/5 px-3 py-1.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === "media" && (
            <motion.div key="md" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-8">
              {project.video && (
                <div>
                  <p className="eyebrow text-white/40 mb-3">Demo Video</p>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe src={embedUrl(project.video)} title={`${project.title} demo`} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                </div>
              )}
              {project.slides && (
                <div>
                  <p className="eyebrow text-white/40 mb-3">Slides</p>
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black">
                    <iframe src={project.slides} className="absolute inset-0 w-full h-full" title={`${project.title} slides`} allowFullScreen />
                  </div>
                </div>
              )}
              {project.paper && (
                <div>
                  <p className="eyebrow text-white/40 mb-3">Paper</p>
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black">
                    <iframe src={project.paper} className="absolute inset-0 w-full h-full" title={`${project.title} paper`} allowFullScreen />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalShell>
  );
}

/* ─── Card ─────────────────────────────────────────── */
function WorkCard({ project, onSelect }: { project: Project; onSelect: (p: Project, t: Tab) => void }) {
  const [hovered, setHovered] = useState(false);
  const isComp = !!project.competition;
  const hasMedia = !!(project.video || project.slides || project.paper);

  const extLinks = [
    project.github  && { key: "gh",      href: project.github,   label: "GitHub",   icon: "GH" },
    project.devpost && { key: "dp",       href: project.devpost,  label: "Devpost",  icon: "DP" },
    project.video   && { key: "yt",       href: project.video,    label: "Video",    icon: "▶" },
    project.slides  && { key: "slides",   href: project.slides,   label: "Slides",   icon: "⊞" },
    project.paper   && { key: "paper",    href: project.paper,    label: "Paper",    icon: "📄" },
    project.liveUrl && { key: "live",     href: project.liveUrl,  label: "Live",     icon: "↗" },
  ].filter(Boolean) as { key: string; href: string; label: string; icon: string }[];

  return (
    <motion.div className="relative min-w-0" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div
        className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer"
        animate={{ scale: hovered ? 1.015 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={() => onSelect(project, hasMedia ? "media" : "overview")}
      >
        <div className="absolute inset-0" style={{ background: project.gradient }} />
        {project.image && <Image src={project.image} alt={project.title} fill className="object-contain opacity-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Center play/badge icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: hovered ? 1.15 : 1, opacity: hovered ? 1 : isComp ? 0.6 : 0.7 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center backdrop-blur-sm ${hovered && hasMedia ? "bg-white border-white" : "bg-white/20 border-white/60"}`}
          >
            {isComp && !hasMedia
              ? <span className="text-white text-xs">🏅</span>
              : <svg width="11" height="11" viewBox="0 0 12 12" fill={hovered && hasMedia ? "#18233F" : "white"}><polygon points="2,0 12,6 2,12" /></svg>
            }
          </motion.div>
        </div>

        {/* Top-right links + info on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute top-2 right-2 flex gap-1"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {extLinks.map((l) => (
                <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={l.label}
                  className="w-7 h-7 rounded-full bg-black/60 border border-white/25 flex items-center justify-center font-mono text-[10px] text-white/70 hover:text-white hover:bg-black/80 transition-colors">
                  {l.key === "gh" ? <GitHubIcon /> : l.key === "dp" ? <DevpostIcon /> : l.icon}
                </a>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(project, "overview"); }}
                title="More Info"
                className="w-7 h-7 rounded-full bg-black/50 border border-white/25 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-colors text-xs">
                ⓘ
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="font-display text-white text-sm leading-tight">{project.title}</p>
          {isRealAward(project.award) ? (
            <p className="font-mono text-[9px] text-yellow-400/70 mt-0.5 leading-tight">🏆 {project.award}</p>
          ) : project.competition ? (
            <p className="font-mono text-[9px] text-white/40 mt-0.5 leading-tight">
              {/\d{4}/.test(project.competition) ? project.competition : `${project.competition} · ${project.year}`}
            </p>
          ) : null}
        </div>
      </motion.div>

      {project.hook && (
        <p className="font-body text-xs text-surface/60 dark:text-white/55 leading-snug mt-2 line-clamp-2">{project.hook}</p>
      )}

      {/* Hover strip */}
      <AnimatePresence>
        {hovered && (
          <motion.div className="absolute left-0 right-0 top-full z-30 bg-white dark:bg-navy border border-gray-200 dark:border-white/10 rounded-b-xl px-3 py-2.5 shadow-xl" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <p className="font-body text-xs text-surface/60 dark:text-white/60 leading-relaxed line-clamp-2">{project.logline}</p>
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tags.slice(0, 4).map((t) => (
                  <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-black/10 dark:border-white/15 text-surface/50 dark:text-white/50">{t}</span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Grid ─────────────────────────────────────────── */
function WorkGrid({ items, onSelect }: { items: Project[]; onSelect: (p: Project, t: Tab) => void }) {
  if (items.length === 0) return null;
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-20 px-[5vw]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {items.map((p) => <WorkCard key={p.slug} project={p} onSelect={onSelect} />)}
    </motion.div>
  );
}

/* ─── Hero ──────────────────────────────────────────── */
function WorkHero({ onSelect }: { onSelect: (p: Project, t: Tab) => void }) {
  const { idx, setIdx, paused, setPaused, advance, retreat } = useRotatingIndex(selectedWork.length, ROTATE_MS);

  if (selectedWork.length === 0) return null;
  const project = selectedWork[idx];

  return (
    <div className="relative w-full h-[42vh] md:h-[52vh] overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="sync">
        <motion.div key={project.slug} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <div className="absolute inset-0" style={{ background: project.gradient }} />
          {project.image && <Image src={project.image} alt={project.title} fill className="object-contain opacity-40" priority />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--page-bg) 0%, transparent 60%)" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end px-[5vw] pb-12 md:pb-16">
        <AnimatePresence mode="wait">
          <motion.div key={project.slug + "-c"} className="max-w-xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
            {isRealAward(project.award) && (
              <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full border mb-3 ${AWARD_BADGE[project.award!] ?? "bg-white/10 text-white/60 border-white/20"}`}>
                🏆 {project.award}
              </span>
            )}
            <h2 className="font-display text-5xl md:text-7xl text-white leading-none mb-2">{project.title}</h2>
            <p className="font-mono text-xs text-white/40 mb-3">{project.competition ?? project.category} · {project.month}</p>
            <p className="font-body text-white/60 max-w-md mb-5 leading-relaxed text-sm">{project.hook ?? project.logline}</p>
            <div className="flex gap-3 flex-wrap items-center">
              {(project.video || project.slides || project.paper) && (
                <button onClick={() => onSelect(project, "media")} className="flex items-center gap-2 font-mono text-sm px-6 py-2.5 bg-white text-navy hover:bg-white/90 transition-colors rounded-full">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><polygon points="1,0 12,6 1,12" /></svg> Play
                </button>
              )}
              <button onClick={() => onSelect(project, "overview")} className="flex items-center gap-2 font-mono text-sm px-6 py-2.5 bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-colors rounded-full">ⓘ More Info</button>
              {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-sm px-4 py-2.5 bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-colors rounded-full"><GitHubIcon /> GitHub</a>}
              {project.devpost && <a href={project.devpost} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-sm px-4 py-2.5 bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-colors rounded-full"><DevpostIcon /> Devpost</a>}
            </div>
          </motion.div>
        </AnimatePresence>

        <HeroNavDots
          count={selectedWork.length}
          idx={idx}
          paused={paused}
          durationMs={ROTATE_MS}
          onPrev={() => { retreat(); setPaused(true); }}
          onNext={() => { advance(); setPaused(true); }}
          onGoTo={(i) => { setIdx(i); setPaused(true); }}
        />
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────── */
export default function WorkPage() {
  const [selected, setSelected] = useState<{ project: Project; tab: Tab } | null>(null);
  const [activeCategory, setActiveCategory] = useState<Cat>("All");
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const q = query.trim().toLowerCase();
  const items = visibleWork(activeCategory).filter((p) =>
    (!year || p.month.includes(year) || p.year === year) &&
    (!q || [p.title, p.logline, p.hook, p.competition, p.award, p.category, ...(p.tags ?? []), ...p.tools].join(" ").toLowerCase().includes(q)));

  return (
    <main className="min-h-screen bg-base dark:bg-navy">
      <Navbar />
      <div className="pt-16">
        <div className="px-[5vw] pt-4 pb-1 max-w-[1400px] mx-auto"><YouAreHere page="Work" /></div>
        <WorkHero onSelect={(p, t) => setSelected({ project: p, tab: t })} />
      </div>

      {/* Category filter — horizontally scrollable on mobile instead of wrapping into a multi-line block */}
      <div className="px-[5vw] pt-6 pb-2 max-w-[1400px] mx-auto">
        <motion.div className="flex gap-2 overflow-x-auto scrollbar-hide sm:flex-wrap sm:overflow-visible" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {ALL_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 font-mono text-xs px-4 py-2 rounded-full border transition-all duration-200 ${activeCategory === cat ? "bg-accent text-white border-accent" : "bg-black/5 dark:bg-white/5 text-surface/60 dark:text-white/50 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:text-surface dark:hover:text-white/80"}`}>
              {cat}
              {cat !== "All" && <span className="ml-1.5 opacity-50">({displayWork.filter((p) => p.category === cat).length})</span>}
            </button>
          ))}
        </motion.div>

        {/* search + year — narrows whatever category is selected */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <label className="flex-1 flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-2 focus-within:border-accent dark:focus-within:border-accent-lavender">
            <span aria-hidden className="text-surface/40 dark:text-white/40 text-sm">⌕</span>
            <span className="sr-only">Search work</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, tools, awards…"
              className="w-full bg-transparent outline-none font-body text-sm text-surface dark:text-white placeholder:text-surface/40 dark:placeholder:text-white/35" />
          </label>
          <label className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-2">
            <span className="eyebrow text-[10px] text-surface/50 dark:text-white/45">Year</span>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-transparent outline-none font-mono text-xs text-surface dark:text-white">
              <option value="">Any</option>
              {Array.from(new Set(displayWork.map((p) => p.year))).sort().reverse().map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          {(query || year) && (
            <button onClick={() => { setQuery(""); setYear(""); }} className="eyebrow text-[10px] text-accent dark:text-accent-lavender px-3">Clear</button>
          )}
        </div>
      </div>

      <div className="pb-24 pt-4">
        {items.length ? (
          <WorkGrid items={items} onSelect={(p, t) => setSelected({ project: p, tab: t })} />
        ) : (
          <p className="body-copy dark:text-white/50 text-sm px-[5vw] max-w-[1400px] mx-auto py-12">No projects match that. Try another word or clear the filters.</p>
        )}
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected.project} initialTab={selected.tab} onClose={() => setSelected(null)} />}
      </AnimatePresence>
      <NextStop from="Work" />
      <Footer />
    </main>
  );
}
