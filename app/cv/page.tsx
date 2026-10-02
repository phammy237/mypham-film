"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { YouAreHere, NextStop } from "@/components/layout/Wayfinding";
import { SITE_EMAIL } from "@/lib/site";
import {
  experience,
  leadership,
  education,
  skills,
  earlyCareerPrograms,
  highSchoolEducation,
  highSchoolExperience,
  hobbies,
} from "@/data/cv";

type Era = "university" | "highschool";

export default function CVPage() {
  const [era, setEra] = useState<Era>("university");

  return (
    <main className="min-h-screen bg-base dark:bg-navy">
      <Navbar />

      <div className="px-[5vw] pt-28 pb-24 max-w-[900px] mx-auto">
        <div className="mb-5"><YouAreHere page="CV" /></div>
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <motion.h1
              className="heading text-5xl mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              My Pham
            </motion.h1>
            <motion.div
              className="flex flex-wrap gap-3 font-mono text-sm text-muted dark:text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <a href={`mailto:${SITE_EMAIL}`} className="hover:text-accent transition-colors">
                {SITE_EMAIL}
              </a>
              <span>·</span>
              <a href="tel:3527454868" className="hover:text-accent transition-colors">
                352-745-4868
              </a>
              <span>·</span>
              <a
                href="https://linkedin.com/in/mypham237"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                linkedin.com/in/mypham237 ↗
              </a>
            </motion.div>
          </div>
          <motion.a
            href="/cv.pdf"
            download
            className="font-mono text-xs text-accent border border-accent/30 px-4 py-2 hover:bg-accent hover:text-white transition-colors duration-200 self-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Download PDF ↓
          </motion.a>
        </div>

        {/* Era toggle */}
        <motion.div
          className="flex gap-1 mb-12 border border-border dark:border-white/10 rounded-full p-1 w-fit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {([["university", "University (UF)"], ["highschool", "High School"]] as [Era, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setEra(key)}
              className={`font-mono text-xs px-5 py-2 rounded-full transition-all duration-200 ${
                era === key
                  ? "bg-accent text-white"
                  : "text-muted dark:text-white/40 hover:text-surface dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* ── UNIVERSITY ERA ── */}
        {era === "university" && (
          <motion.div
            key="university"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Education */}
            <Section title="Education">
              {education.map((edu, i) => (
                <div key={i} className="mb-4">
                  <div className="flex items-baseline justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-body font-semibold text-surface dark:text-white text-lg">{edu.school}</p>
                      <p className="font-body text-surface/80 dark:text-white/60">{edu.degree} · GPA {edu.gpa}</p>
                      <p className="font-mono text-xs text-muted dark:text-white/40 mt-1">{edu.location}</p>
                    </div>
                    <span className="font-mono text-xs text-muted dark:text-white/40 whitespace-nowrap">{edu.period}</span>
                  </div>
                  {edu.details.map((d, di) => (
                    <p key={di} className="body-copy text-sm mt-2 leading-relaxed">{d}</p>
                  ))}
                  {edu.honors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="font-mono text-xs text-surface/50 dark:text-white/30 mr-1">Honors:</span>
                      {edu.honors.map((h) => (
                        <span key={h} className="font-mono text-xs text-accent border border-accent/20 bg-accent-light dark:bg-accent/10 px-2 py-0.5 rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Section>

            {/* Experience */}
            <Section title="Experience">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border dark:bg-white/10" />
                {experience.map((exp, i) => (
                  <motion.div
                    key={i}
                    className="pl-6 pb-8 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                  >
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full -translate-x-[3px] bg-accent" />
                    <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
                      <div>
                        <span className="font-body font-semibold text-surface dark:text-white">{exp.role}</span>
                        <span className="body-copy dark:text-white/50"> · {exp.company}</span>
                      </div>
                      <span className="font-mono text-xs text-muted dark:text-white/40 whitespace-nowrap">{exp.period}</span>
                    </div>
                    {"description" in exp && exp.description && (
                      <p className="font-body text-sm text-muted/80 dark:text-white/35 italic mt-1.5 mb-2 leading-relaxed">{exp.description as string}</p>
                    )}
                    <ul className="space-y-1.5 mt-2">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2">
                          <span className="text-accent mt-1 flex-shrink-0 text-xs">▸</span>
                          <span className="body-copy text-sm dark:text-white/50 leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Leadership */}
            <Section title="Leadership">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border dark:bg-white/10" />
                {leadership.map((lead, i) => (
                  <motion.div
                    key={i}
                    className="pl-6 pb-8 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                  >
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full -translate-x-[3px] bg-accent" />
                    <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
                      <div>
                        <span className="font-body font-semibold text-surface dark:text-white">{lead.role}</span>
                        <span className="body-copy dark:text-white/50"> · {lead.company}</span>
                      </div>
                      <span className="font-mono text-xs text-muted dark:text-white/40 whitespace-nowrap">{lead.period}</span>
                    </div>
                    <p className="font-body text-sm text-muted/80 dark:text-white/35 italic mt-1.5 mb-2 leading-relaxed">{lead.description}</p>
                    <ul className="space-y-1.5 mt-2">
                      {lead.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2">
                          <span className="text-accent mt-1 flex-shrink-0 text-xs">▸</span>
                          <span className="body-copy text-sm dark:text-white/50 leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Skills */}
            <Section title="Skills">
              <div className="space-y-4">
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category}>
                    <p className="eyebrow text-muted dark:text-white/40 mb-2">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <span key={skill} className="font-mono text-xs text-surface/70 dark:text-white/50 border border-border dark:border-white/10 bg-card dark:bg-white/5 px-3 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Early Career Programs */}
            <Section title="Selected Early Career Programs">
              <div className="flex flex-wrap gap-2">
                {earlyCareerPrograms.map((p) => (
                  <span key={p} className="font-mono text-xs text-accent border border-accent/20 bg-accent-light dark:bg-accent/10 px-3 py-1.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {/* ── HIGH SCHOOL ERA ── */}
        {era === "highschool" && (
          <motion.div
            key="highschool"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* HS Education */}
            <Section title="Education">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border dark:bg-white/10" />
                {highSchoolEducation.map((edu, i) => (
                  <motion.div
                    key={i}
                    className="pl-6 pb-8 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                  >
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full -translate-x-[3px] bg-accent-gold" />
                    <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
                      <div>
                        <p className="font-body font-semibold text-surface dark:text-white">{edu.school}</p>
                        <p className="font-mono text-xs text-muted dark:text-white/40 mt-0.5">{edu.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs text-muted whitespace-nowrap block">{edu.period}</span>
                        <span className="font-mono text-xs text-accent whitespace-nowrap block mt-0.5">GPA {edu.gpa}</span>
                      </div>
                    </div>
                    {edu.details.map((d, di) => (
                      <p key={di} className="body-copy text-sm mt-1.5 leading-relaxed">{d}</p>
                    ))}
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* HS Experience by category */}
            {highSchoolExperience.map((group) => (
              <Section key={group.category} title={group.category}>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border dark:bg-white/10" />
                  {group.entries.map((entry, ei) => (
                    <motion.div
                      key={ei}
                      className="pl-6 pb-8 relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: ei * 0.07, type: "spring", stiffness: 100 }}
                    >
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full -translate-x-[3px] bg-accent" />
                      <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
                        <div>
                          <span className="font-body font-semibold text-surface dark:text-white">{entry.role}</span>
                          <span className="body-copy dark:text-white/50"> · {entry.org}</span>
                        </div>
                        <span className="font-mono text-xs text-muted dark:text-white/40 whitespace-nowrap">{entry.period}</span>
                      </div>
                      {"description" in entry && entry.description && (
                        <p className="font-body text-sm text-muted/70 dark:text-white/30 italic mt-1 mb-2">{entry.description as string}</p>
                      )}
                      <ul className="space-y-1.5 mt-2">
                        {entry.bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-2">
                            <span className="text-accent mt-1 flex-shrink-0 text-xs">▸</span>
                            <span className="body-copy text-sm dark:text-white/50 leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </Section>
            ))}

            {/* Hobbies */}
            <Section title="Interests & Hobbies">
              <div className="flex flex-wrap gap-2">
                {hobbies.map((h) => (
                  <span key={h} className="font-mono text-xs text-surface/70 dark:text-white/50 border border-border dark:border-white/10 bg-card dark:bg-white/5 px-3 py-1.5 rounded-full">
                    {h}
                  </span>
                ))}
              </div>
            </Section>
          </motion.div>
        )}
      </div>

      <NextStop from="CV" />
      <Footer />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <h2 className="eyebrow text-muted dark:text-white/40 whitespace-nowrap">
          {title}
        </h2>
        <div className="h-px bg-border dark:bg-white/10 flex-1" />
      </div>
      {children}
    </motion.div>
  );
}
