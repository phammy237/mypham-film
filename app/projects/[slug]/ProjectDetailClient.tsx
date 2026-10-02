"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/data/projects";

type Tab = "overview" | "media";

export function ProjectDetailClient({
  project,
  nextProject,
}: {
  project: Project;
  nextProject: Project;
}) {
  const hasMedia = !!(project.video || project.slides || project.paper || project.liveUrl);
  const [tab, setTab] = useState<Tab>("overview");

  const links = [
    project.github && { label: "GitHub", href: project.github, style: "border" },
    project.devpost && { label: "Devpost", href: project.devpost, style: "border" },
    project.slides && { label: "Slides", href: project.slides, style: "border" },
    project.paper && { label: "Paper", href: project.paper, style: "border" },
    project.liveUrl && { label: "Live Demo", href: project.liveUrl, style: "solid" },
  ].filter(Boolean) as { label: string; href: string; style: string }[];

  return (
    <>
      {/* Hero */}
      <div
        className="min-h-[60vh] flex items-end px-[5vw] pb-16 pt-28 relative overflow-hidden"
        style={{ background: project.gradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 max-w-[900px] w-full">
          <motion.span
            className="font-mono text-sm text-white/50 block mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {project.category} · {project.month}
          </motion.span>
          <motion.h1
            className="font-display text-6xl md:text-8xl text-white leading-none mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
          >
            {project.title}
          </motion.h1>
          <motion.p
            className="font-body text-xl text-white/70 max-w-2xl mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {project.logline}
          </motion.p>

          {links.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    link.style === "solid"
                      ? "font-mono text-sm px-5 py-2.5 bg-white text-navy hover:bg-white/90 transition-colors duration-200"
                      : "font-mono text-sm px-5 py-2.5 bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-colors duration-200"
                  }
                >
                  {link.label} ↗
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-base border-b border-border">
        <div className="px-[5vw] max-w-[900px] mx-auto flex">
          {(["overview", ...(hasMedia ? ["media"] : [])] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative font-mono text-sm px-6 py-4 capitalize transition-colors duration-200 ${
                tab === t ? "text-accent" : "text-muted hover:text-surface"
              }`}
            >
              {t === "media" ? "Media & Demo" : "Overview"}
              {tab === t && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <section className="bg-base px-[5vw] py-20">
        <div className="max-w-[900px] mx-auto">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {/* Meta */}
                <div className="grid sm:grid-cols-3 gap-8 mb-16 pb-16 border-b border-border">
                  <div>
                    <span className="eyebrow text-muted block mb-2">Category</span>
                    <p className="font-body text-surface">{project.category}</p>
                  </div>
                  <div>
                    <span className="eyebrow text-muted block mb-2">Date</span>
                    <p className="font-body text-surface">{project.month}</p>
                  </div>
                  <div>
                    <span className="eyebrow text-muted block mb-2">Tools</span>
                    <p className="font-body text-surface">{project.tools.join(", ")}</p>
                  </div>
                </div>

                <p className="body-copy text-xl leading-relaxed mb-10">
                  {project.description}
                </p>

                {project.bullets.length > 0 && (
                  <ul className="space-y-4 mb-12">
                    {project.bullets.map((bullet, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                      >
                        <span className="text-accent mt-1.5 flex-shrink-0">▸</span>
                        <span className="body-copy text-lg leading-relaxed">{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}

              </motion.div>
            )}

            {tab === "media" && (
              <motion.div
                key="media"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-12"
              >
                {project.video && (
                  <div>
                    <p className="eyebrow text-muted mb-5">Demo Video</p>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-surface/5">
                      <iframe
                        src={project.video.replace("watch?v=", "embed/")}
                        title={`${project.title} demo`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {project.slides && (
                  <div>
                    <p className="eyebrow text-muted mb-5">Slides</p>
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-border bg-surface/5">
                      <iframe
                        src={project.slides}
                        className="absolute inset-0 w-full h-full"
                        title={`${project.title} slides`}
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {project.paper && (
                  <div>
                    <p className="eyebrow text-muted mb-5">Paper</p>
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-border bg-surface/5">
                      <iframe
                        src={project.paper}
                        className="absolute inset-0 w-full h-full"
                        title={`${project.title} paper`}
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {links.length > 0 && (
                  <div>
                    <p className="eyebrow text-muted mb-5">Links</p>
                    <div className="flex flex-wrap gap-3">
                      {links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm px-5 py-3 bg-card border border-border text-surface hover:border-accent hover:text-accent transition-colors duration-200 rounded-lg"
                        >
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {!project.video && !project.slides && !project.paper && (
                  <div className="py-20 text-center">
                    <p className="font-mono text-sm text-muted">Media coming soon.</p>
                    <p className="font-mono text-xs text-muted/50 mt-2">
                      Add <code className="bg-border px-1.5 py-0.5 rounded">video</code> or{" "}
                      <code className="bg-border px-1.5 py-0.5 rounded">slides</code> to this project in data/projects.ts
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Next Project */}
      <section className="bg-base px-[5vw] py-16 border-t border-border">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/projects" className="font-mono text-sm text-muted hover:text-accent transition-colors">
            ← All Work
          </Link>
          <Link
            href={`/projects/${nextProject.slug}`}
            className="group flex items-center gap-4 hover:text-accent transition-colors duration-200"
          >
            <span className="font-display text-3xl md:text-5xl text-surface group-hover:text-accent transition-colors duration-200">
              {nextProject.title}
            </span>
            <span className="font-mono text-2xl text-muted group-hover:text-accent transition-colors duration-200">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
