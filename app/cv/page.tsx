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
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />

      <div className="px-[5vw] pt-28 pb-24 max-w-[900px] mx-auto">
        <div className="mb-5"><YouAreHere page="CV" /></div>
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="f-hand text-3xl text-[var(--blue)]" style={{ transform: "rotate(-2deg)", transformOrigin: "left" }}>the paper version</p>
            <motion.h1
              className="f-h1 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="f-mark">resume</span>
            </motion.h1>
            <motion.div
              className="f-type flex flex-wrap gap-3 text-sm text-[var(--muted)]"
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
            className="f-btn f-btn-butter self-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Download PDF ↓
          </motion.a>
        </div>

        {/* Era toggle */}
        <motion.div
          className="f-card mb-12 flex w-fit gap-1 rounded-full p-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {([["university", "University (UF)"], ["highschool", "High School"]] as [Era, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setEra(key)}
              className={`f-type text-sm px-5 py-2 rounded-full transition-all duration-200 ${
                era === key
                  ? "bg-[var(--butter)] text-[#20201E]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
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
                      <p className="f-type text-lg font-bold">{edu.school}</p>
                      <p className="text-[var(--ink)]/80">{edu.degree} · GPA {edu.gpa}</p>
                      <p className="f-mono text-[var(--muted)] mt-1">{edu.location}</p>
                    </div>
                    <span className="f-mono text-[var(--muted)] whitespace-nowrap">{edu.period}</span>
                  </div>
                  {edu.details.map((d, di) => (
                    <p key={di} className="text-sm mt-2 leading-relaxed text-[var(--muted)]">{d}</p>
                  ))}
                  {edu.honors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="f-mono text-[var(--muted)] mr-1">Honors:</span>
                      {edu.honors.map((h) => (
                        <span key={h} className="f-chip border-transparent bg-[var(--butter)] text-[#20201E]">
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
                <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--line)]" />
                {experience.map((exp, i) => (
                  <motion.div
                    key={i}
                    className="pl-6 pb-8 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                  >
                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-[4px] bg-[var(--butter)] ring-1 ring-[var(--ink)]/40" />
                    <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
                      <div>
                        <span className="f-type font-bold">{exp.role}</span>
                        <span className="text-[var(--muted)]"> · {exp.company}</span>
                      </div>
                      <span className="f-mono text-[var(--muted)] whitespace-nowrap">{exp.period}</span>
                    </div>
                    {"description" in exp && exp.description && (
                      <p className="f-type text-sm text-[var(--muted)] italic mt-1.5 mb-2 leading-relaxed">{exp.description as string}</p>
                    )}
                    <ul className="space-y-1.5 mt-2">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2">
                          <span className="mt-1 flex-shrink-0 text-xs text-[var(--blue)]">▸</span>
                          <span className="text-sm leading-relaxed">{b}</span>
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
                <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--line)]" />
                {leadership.map((lead, i) => (
                  <motion.div
                    key={i}
                    className="pl-6 pb-8 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                  >
                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-[4px] bg-[var(--butter)] ring-1 ring-[var(--ink)]/40" />
                    <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
                      <div>
                        <span className="f-type font-bold">{lead.role}</span>
                        <span className="text-[var(--muted)]"> · {lead.company}</span>
                      </div>
                      <span className="f-mono text-[var(--muted)] whitespace-nowrap">{lead.period}</span>
                    </div>
                    <p className="f-type text-sm text-[var(--muted)] italic mt-1.5 mb-2 leading-relaxed">{lead.description}</p>
                    <ul className="space-y-1.5 mt-2">
                      {lead.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2">
                          <span className="mt-1 flex-shrink-0 text-xs text-[var(--blue)]">▸</span>
                          <span className="text-sm leading-relaxed">{b}</span>
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
                    <p className="f-hand mb-2 text-2xl">{category.toLowerCase()}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <span key={skill} className="f-chip !px-3 !py-1 !text-[11px]">
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
                  <span key={p} className="f-chip border-transparent bg-[var(--butter)] text-[#20201E] !px-3 !py-1.5">
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
                <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--line)]" />
                {highSchoolEducation.map((edu, i) => (
                  <motion.div
                    key={i}
                    className="pl-6 pb-8 relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                  >
                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-[4px] bg-[var(--sky)] ring-1 ring-[var(--ink)]/40" />
                    <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
                      <div>
                        <p className="f-type font-bold">{edu.school}</p>
                        <p className="f-mono text-[var(--muted)] mt-0.5">{edu.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="f-mono text-[var(--muted)] whitespace-nowrap block">{edu.period}</span>
                        <span className="f-mono text-[var(--blue)] whitespace-nowrap block mt-0.5">GPA {edu.gpa}</span>
                      </div>
                    </div>
                    {edu.details.map((d, di) => (
                      <p key={di} className="text-sm mt-1.5 leading-relaxed text-[var(--muted)]">{d}</p>
                    ))}
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* HS Experience by category */}
            {highSchoolExperience.map((group) => (
              <Section key={group.category} title={group.category}>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--line)]" />
                  {group.entries.map((entry, ei) => (
                    <motion.div
                      key={ei}
                      className="pl-6 pb-8 relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: ei * 0.07, type: "spring", stiffness: 100 }}
                    >
                      <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full -translate-x-[4px] bg-[var(--butter)] ring-1 ring-[var(--ink)]/40" />
                      <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
                        <div>
                          <span className="f-type font-bold">{entry.role}</span>
                          <span className="text-[var(--muted)]"> · {entry.org}</span>
                        </div>
                        <span className="f-mono text-[var(--muted)] whitespace-nowrap">{entry.period}</span>
                      </div>
                      {"description" in entry && entry.description && (
                        <p className="f-type text-sm text-[var(--muted)] italic mt-1 mb-2">{entry.description as string}</p>
                      )}
                      <ul className="space-y-1.5 mt-2">
                        {entry.bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-2">
                            <span className="mt-1 flex-shrink-0 text-xs text-[var(--blue)]">▸</span>
                            <span className="text-sm leading-relaxed">{b}</span>
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
                  <span key={h} className="f-chip !px-3 !py-1.5 !text-[11px]">
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
        <h2 className="f-h2 whitespace-nowrap">
          <span className="f-mark">{title.toLowerCase()}</span>
        </h2>
        <div className="h-px bg-[var(--line)] flex-1" />
      </div>
      {children}
    </motion.div>
  );
}
