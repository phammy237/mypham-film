"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { projects, SELECTED_WORK_SLUGS } from "@/data/projects";

const featured = SELECTED_WORK_SLUGS.map((s) => projects.find((p) => p.slug === s)).filter(Boolean) as typeof projects;

export function FeaturedProjects() {
  return (
    <section id="work" className="bg-sand dark:bg-navy px-[5vw] py-24">
      <div className="max-w-[1200px] mx-auto">

        {/* Header row */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <p className="font-mono text-[10px] text-muted dark:text-white/30 tracking-[0.25em] uppercase mb-2">
              Portfolio
            </p>
            <h2 className="heading text-4xl">Selected Work</h2>
          </div>
          <div className="flex flex-col md:items-end gap-3">
            <p className="font-mono text-xs text-muted dark:text-white/35 max-w-xs leading-relaxed text-left md:text-right">
              Projects in data, product, and operations — tools, models, and
              interfaces built to solve real problems.
            </p>
            <Link
              href="/projects"
              className="eyebrow text-accent hover:text-accent/70 transition-colors duration-200 self-start md:self-end"
            >
              View All Work →
            </Link>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:overflow-visible snap-x snap-mandatory">
          {featured.map((project, i) => (
            <motion.div
              key={project.slug}
              className="flex-shrink-0 w-[76vw] sm:w-72 md:w-auto snap-start rounded-xl overflow-hidden relative group cursor-pointer"
              style={{ background: project.gradient, minHeight: 280 }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

              <Link href="/projects" className="absolute inset-0 z-10 p-5 flex flex-col justify-end">
                {/* Category + award */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="font-mono text-[9px] text-white/45 uppercase tracking-widest">
                    {project.category}
                  </span>
                  {project.award && (
                    <span className="font-mono text-[9px] bg-accent/20 text-accent border border-accent/30 rounded-full px-2 py-[2px]">
                      {project.award}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl text-white mb-1.5 group-hover:text-accent/90 transition-colors duration-200">
                  {project.title}
                </h3>

                {/* Logline */}
                <p className="font-body text-xs text-white/50 leading-snug line-clamp-2 mb-3">
                  {project.logline}
                </p>

                {/* Stack chips */}
                <div className="flex flex-wrap gap-1">
                  {project.tools.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[9px] text-white/30 border border-white/10 rounded px-1.5 py-[2px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>

              {/* Year badge top right */}
              <div className="absolute top-4 right-4 z-10">
                <span className="font-mono text-[9px] text-white/30 tracking-widest">
                  {project.year}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
