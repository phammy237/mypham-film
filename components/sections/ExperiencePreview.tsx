"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { experience } from "@/data/cv";

const META: { tags: string[]; color: string }[] = [
  { tags: ["Product Strategy", "GTM", "KPI Design"],        color: "#8B5CF6" },
  { tags: ["ESG", "Data Governance", "Dashboards"],          color: "#10B981" },
  { tags: ["Digital Transformation", "ROI Modeling"],        color: "#3B82F6" },
  { tags: ["Sustainability", "Battery Lifecycle", "Python"], color: "#06B6D4" },
  { tags: ["Qualitative Coding", "Research Design"],         color: "#F59E0B" },
];

const experiences = experience.map((exp, i) => ({
  role: exp.role,
  company: exp.company.split(" (")[0],
  period: exp.period,
  tags: META[i]?.tags ?? [],
  color: META[i]?.color ?? "#8B5CF6",
  accent: i === 0,
}));

export function ExperiencePreview() {
  return (
    <section id="experience" className="bg-sand dark:bg-navy px-[5vw] py-24">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-[10px] text-muted dark:text-white/30 tracking-[0.25em] uppercase mb-2">
              Experience
            </p>
            <h2 className="heading text-4xl">Where I&apos;ve Worked</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/cv"
              className="eyebrow text-accent hover:text-accent/70 transition-colors duration-200"
            >
              Full CV →
            </Link>
          </motion.div>
        </div>

        <div className="flex flex-col divide-y divide-border dark:divide-white/[0.07]">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              className="group py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              {/* Colored company indicator */}
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${exp.color}18`, border: `1px solid ${exp.color}35` }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: exp.color }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-body font-medium text-base transition-colors duration-200 group-hover:text-surface dark:group-hover:text-white ${exp.accent ? "text-surface dark:text-white" : "text-surface/70 dark:text-white/75"}`}>
                  {exp.role}
                </p>
                <p className="font-mono text-xs text-muted dark:text-white/35 mt-0.5">{exp.company}</p>
              </div>

              <div className="hidden md:flex flex-wrap gap-1.5 flex-shrink-0 max-w-xs">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[9px] border rounded px-2 py-0.5"
                    style={{ color: `${exp.color}99`, borderColor: `${exp.color}35` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="font-mono text-[10px] text-muted/60 dark:text-white/25 flex-shrink-0 text-right min-w-[140px]">
                {exp.period}
              </p>

              {exp.accent && (
                <div className="flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: exp.color }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
