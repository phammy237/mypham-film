"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import type { Project } from "@/data/projects";
import { ProjectArt } from "@/components/film/ui";

type Tab = "overview" | "media";

/** YouTube refuses to be framed from watch/short links — only /embed/ URLs load inside an iframe */
function embedUrl(url: string) {
  const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

export function ProjectDetailClient({
  project,
  nextProject,
}: {
  project: Project;
  nextProject: Project;
}) {
  const hasMedia = !!(project.video || project.slides || project.paper || project.liveUrl);
  const [tab, setTab] = useState<Tab>("overview");
  // the cover slowly pushes in as you scroll, like a film push-in
  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 600], [0, 50]);
  const coverScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const realAward = !!project.award && project.award !== "Participant";

  const links = [
    project.github && { label: "GitHub", href: project.github, solid: false },
    project.devpost && { label: "Devpost", href: project.devpost, solid: false },
    project.slides && { label: "Slides", href: project.slides, solid: false },
    project.paper && { label: "Paper", href: project.paper, solid: false },
    project.liveUrl && { label: "Live demo", href: project.liveUrl, solid: true },
  ].filter(Boolean) as { label: string; href: string; solid: boolean }[];

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      {/* Hero: title on the left, the cover as a framed photo on the right */}
      <section className="f-wrap grid items-center gap-10 pb-12 pt-28 md:grid-cols-[1.1fr_1fr] md:pt-32">
        <div>
          <Link href="/projects" className="f-mono text-[var(--muted)] hover:text-[var(--ink)]">← all work</Link>
          <motion.p className="f-hand mt-5 text-2xl text-[var(--blue)]" style={{ transform: "rotate(-2deg)", transformOrigin: "left" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {project.competition ?? project.category} · {project.month}
          </motion.p>
          <motion.h1 className="f-h1 mt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 20 }}>
            <span className="f-mark">{project.title}</span>
          </motion.h1>
          <motion.p className="f-type mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {project.logline}
          </motion.p>
          {realAward && <p className="f-type mt-4 text-sm"><span className="f-mark">🏆 {project.award}</span></p>}
          {links.length > 0 && (
            <motion.div className="mt-7 flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={`f-btn ${l.solid ? "f-btn-butter" : ""}`}>{l.label} ↗</a>
              ))}
            </motion.div>
          )}
        </div>
        <motion.div style={{ y: coverY, scale: coverScale }}>
        <motion.div initial={{ opacity: 0, rotate: 3, y: 20 }} animate={{ opacity: 1, rotate: 1.5, y: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 90, damping: 18 }} className="f-pola">
          <ProjectArt project={project} n={1} sizes="(max-width: 768px) 100vw, 480px" className="aspect-[4/3]" priority />
          <p className="f-hand mt-3 text-center text-xl text-[#20201E]">{project.hook ?? project.title}</p>
        </motion.div>
        </motion.div>
      </section>

      {/* meta strip, like the data on the edge of a roll */}
      <div className="f-wrap">
        <dl className="grid grid-cols-2 gap-6 border-y border-[var(--line)] py-6 sm:grid-cols-4">
          {[["date", project.month], ["type", project.category], ["event", project.competition ?? "personal"], ["tools", project.tools.slice(0, 4).join(", ")]].map(([k, v]) => (
            <div key={k}>
              <dt className="f-mono text-[var(--muted)]">{k}</dt>
              <dd className="f-type mt-1 text-sm">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Tabs */}
      <div className="sticky top-[56px] z-20 mt-2 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-sm">
        <div role="tablist" className="f-wrap flex">
          {(["overview", ...(hasMedia ? ["media"] : [])] as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`f-type relative px-5 py-4 text-[15px] transition-colors ${tab === t ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>
              {t === "media" ? "media & demo" : "overview"}
              {tab === t && <motion.div layoutId="tab-underline" className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[var(--butter)]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <section className="f-wrap py-14">
        <div className="mx-auto max-w-[820px]">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                <p className="f-serif text-2xl leading-snug md:text-3xl">{project.description}</p>

                {project.bullets.length > 0 && (
                  <>
                    <h2 className="f-h2 mt-14"><span className="f-mark">what I did</span></h2>
                    <ol className="mt-8 space-y-6">
                      {project.bullets.map((bullet, i) => (
                        <motion.li key={i} className="grid grid-cols-[44px_1fr] items-start gap-3" initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: 0.04 }}>
                          <span className="f-fno" style={{ position: "static", color: "var(--blue)", textShadow: "none" }}>{String(i + 1).padStart(2, "0")}A</span>
                          <span className="text-[16px] leading-relaxed">{bullet}</span>
                        </motion.li>
                      ))}
                    </ol>
                  </>
                )}

                {project.tools.length > 0 && (
                  <>
                    <h2 className="f-h2 mt-14">built with</h2>
                    <div className="mt-5 flex flex-wrap gap-1.5">{project.tools.map((t) => <span key={t} className="f-chip">{t}</span>)}</div>
                  </>
                )}
              </motion.div>
            )}

            {tab === "media" && (
              <motion.div key="media" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="flex flex-col gap-12">
                {([["Demo video", project.video && embedUrl(project.video), "demo"], ["Slides", project.slides, "slides"], ["Paper", project.paper, "paper"]] as const).map(([label, src, t]) =>
                  src ? (
                    <div key={label}>
                      <p className="f-mono mb-4 text-[var(--muted)]">{label}</p>
                      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[var(--film)]">
                        <iframe src={src} title={`${project.title} ${t}`} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    </div>
                  ) : null)}

                {links.length > 0 && (
                  <div>
                    <p className="f-mono mb-4 text-[var(--muted)]">Links</p>
                    <div className="flex flex-wrap gap-2">
                      {links.map((l) => <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="f-btn">{l.label} ↗</a>)}
                    </div>
                  </div>
                )}

                {!project.video && !project.slides && !project.paper && links.length === 0 && (
                  <p className="f-type py-20 text-center text-sm text-[var(--muted)]">media coming soon.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Next frame */}
      <section className="f-wrap pb-16 pt-4">
        <Link href={`/projects/${nextProject.slug}`} data-cursor-photo data-cursor-label="next frame →"
          className="group relative flex items-center justify-between gap-6 overflow-hidden rounded-sm bg-[var(--film)] px-8 py-9 text-[#FAF7EF] md:px-14 md:py-12">
          <span aria-hidden className="absolute inset-x-0 top-2 h-2.5 bg-[repeating-linear-gradient(90deg,transparent_0_9px,#FAF7EF_9px_21px,transparent_21px_30px)] opacity-80" />
          <span aria-hidden className="absolute inset-x-0 bottom-2 h-2.5 bg-[repeating-linear-gradient(90deg,transparent_0_9px,#FAF7EF_9px_21px,transparent_21px_30px)] opacity-80" />
          <div>
            <p className="f-mono text-[#F4D35E]">next project ▸</p>
            <p className="f-serif mt-2 text-4xl md:text-6xl">{nextProject.title}</p>
          </div>
          <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#F4D35E] text-xl text-[#20201E] transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </section>
    </div>
  );
}
