"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/data/projects";

const GRADIENT = "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)";

/* ─── Small building blocks ─────────────────────────── */

function Equation({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card px-6 py-5 dark:border-white/10 dark:bg-white/5">
      <p className="heading whitespace-nowrap text-xl italic sm:text-2xl">{children}</p>
    </div>
  );
}

function Frac({ num, den }: { num: React.ReactNode; den: React.ReactNode }) {
  return (
    <span className="mx-1 inline-flex flex-col items-center align-middle text-base sm:text-lg">
      <span className="px-1 pb-0.5">{num}</span>
      <span className="w-full border-t border-current px-1 pt-0.5">{den}</span>
    </span>
  );
}

function GraphPlaceholder({ label, deckPage }: { label: string; deckPage: string }) {
  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-accent/35 bg-accent/5 p-6 text-center dark:border-accent/25 dark:bg-accent/10">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </span>
      <p className="font-body text-sm text-surface/70 dark:text-white/60">{label}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted dark:text-white/30">
        Swap in graphic from deck {deckPage}
      </p>
    </div>
  );
}

function Takeaway({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3.5">
      <span className="mt-0.5 flex-shrink-0 text-accent">✦</span>
      <p className="font-body text-sm leading-relaxed text-surface/80 dark:text-white/70">{children}</p>
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Model pipeline data ────────────────────────────── */

const stages = [
  {
    n: "01",
    title: "Individual Vigilance",
    equation: (
      <>
        v(N) = <Frac num="v₀" den="1 + kN" />
      </>
    ),
    body: "The first model represents how much time a single individual spends actively scanning for predators. v₀ is baseline vigilance when solitary, N is group size, and k controls how quickly vigilance decreases as the group grows — individuals can afford to scan less when surrounded by other potential watchers.",
    takeaway: "Larger groups allow individuals to reduce their own vigilance because detection responsibility is shared.",
    deckPage: "p.4 — individual vigilance vs. group size for different values of k",
  },
  {
    n: "02",
    title: "Effective Independent Watchers",
    equation: (
      <>
        N<sub>eff</sub>(N, s) = <Frac num="N" den="1 + s(N − 1)" />
      </>
    ),
    body: "Simply counting group members overestimates collective awareness, since members may scan simultaneously. The synchronization parameter s corrects for this: at s = 0, scanning is independent and every member contributes unique coverage; at s = 1, the group is fully synchronized and effectively behaves like a single watcher.",
    takeaway: "Group size alone isn't enough — the independence of individual behavior determines how much additional awareness each member actually contributes.",
    deckPage: "p.5 — independent vs. partially vs. fully synchronized scanning",
  },
  {
    n: "03",
    title: "Collective Vigilance",
    equation: (
      <>
        C(N, s) = 1 − (1 − v(N))<sup>N<sub>eff</sub>(N,s)</sup>
      </>
    ),
    body: "Combining individual vigilance with the effective number of independent watchers gives the probability that at least one member is actively scanning at a given moment. This rises quickly with group size at first, then flattens — and synchronization reduces the benefit considerably, since overlapping members repeatedly provide the same coverage.",
    takeaway: "Collective vigilance shows diminishing returns: adding individuals helps most when their behavior stays relatively independent.",
    deckPage: "p.6 — collective vigilance curves separating by synchronization level",
  },
  {
    n: "04",
    title: "Predator Detection Probability",
    equation: (
      <>
        P<sub>det</sub>(N, t, s) = 1 − e<sup>−μtC(N,s)</sup>
      </>
    ),
    body: "The final stage translates collective vigilance into the probability that an approaching predator is actually detected, modeled as a Poisson process. μ is the detection rate while vigilant and t is the observation window. Detection probability rises with collective vigilance and time, but again with diminishing returns as the group grows.",
    takeaway: "Larger groups generally improve predator detection, but the marginal benefit of each new member becomes increasingly small.",
    deckPage: "p.7 — detection probability over time",
  },
];

const findings = [
  {
    title: "Mixed groups detect predators better",
    body: "Groups benefit from additional members as long as scanning behavior isn't completely synchronized.",
  },
  {
    title: "The biggest gains happen early",
    body: "Moderate-sized groups capture much of the available improvement before the detection curve saturates.",
  },
  {
    title: "3–5 members already provide a meaningful advantage",
    body: "Relatively small groups can capture a large portion of the collective-vigilance benefit.",
  },
  {
    title: "Behavioral independence matters",
    body: "Adding more individuals becomes far less valuable once their vigilance patterns start to overlap.",
  },
];

const extendedParams = [
  { label: "Baseline vigilance", detail: "v₀,ᵢ — how vigilant an individual naturally is" },
  { label: "Relaxation rate", detail: "kᵢ — how quickly its vigilance changes as the group grows" },
  { label: "Detection ability", detail: "μᵢ — its effectiveness at detecting a predator" },
  { label: "Position & radius", detail: "xᵢ, Rᵢ — whether the predator is close enough to observe" },
  { label: "Pairwise synchronization", detail: "sᵢⱼ — how strongly its behavior correlates with another individual" },
  { label: "Communication delay", detail: "τᵢ — how long detection info takes to reach the group" },
];

/* ─── Page ────────────────────────────────────────────── */

export function ScudemDetail({ project, nextProject }: { project: Project; nextProject: Project }) {
  const links = [
    project.github && { label: "GitHub", href: project.github },
    project.slides && { label: "Full Presentation", href: project.slides },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <>
      {/* Hero */}
      <div className="relative min-h-[70vh] overflow-hidden px-[5vw] pb-16 pt-28" style={{ background: GRADIENT }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[46vh] max-w-[900px] flex-col justify-end">
          <motion.span
            className="mb-4 font-mono text-sm text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            SCUDEM X 2025 · Outstanding Award
          </motion.span>
          <motion.h1
            className="mb-4 font-display text-5xl leading-[0.95] text-white sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 20 }}
          >
            Vigilance-Based Predator Detection Model
          </motion.h1>
          <motion.p
            className="max-w-2xl font-body text-lg italic text-white/70 sm:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            A Probabilistic Framework for Mixed-Species Groups
          </motion.p>
          <motion.p
            className="mt-5 max-w-2xl font-body text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            A mathematical modeling project exploring how group size, individual vigilance, and behavioral
            synchronization influence a mixed-species group&apos;s ability to detect predators.
          </motion.p>
        </div>
        <div className="relative z-10 mx-auto mt-10 max-w-[900px]">
          <GraphPlaceholder label="Spatial simulation, hero visual" deckPage="p.11" />
        </div>
      </div>

      <div className="bg-base dark:bg-navy">
        <div className="mx-auto max-w-[900px] px-[5vw] py-20">
          {/* Tags */}
          <FadeIn>
            <div className="mb-16 flex flex-wrap gap-2">
              {["Mathematical Modeling", "Probability", "Simulation", "Poisson Processes", "Data Visualization", "Behavioral Modeling"].map((tag) => (
                <span key={tag} className="rounded-full border border-accent/30 bg-accent-light px-3 py-1 font-mono text-xs text-accent dark:border-accent/25 dark:bg-accent/10">
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>

          {/* The Question */}
          <FadeIn>
            <p className="heading mb-24 text-3xl leading-tight sm:text-4xl">
              &ldquo;Do mixed-species groups detect predators better? How does group size influence detection —
              and what behavioral factors limit the benefit of adding more members?&rdquo;
            </p>
          </FadeIn>

          {/* The Problem */}
          <FadeIn>
            <p className="eyebrow mb-2 text-muted dark:text-white/40">The Problem</p>
            <p className="body-copy mb-24 text-lg leading-relaxed dark:text-white/60">
              Animals often form groups to reduce predation risk — individuals can benefit from the vigilance of
              others, spending less time personally scanning while still maintaining collective awareness. But
              adding more individuals doesn&apos;t necessarily make a group proportionally safer: if members scan at
              the same time, their behavior becomes redundant rather than complementary.
            </p>
          </FadeIn>

          {/* Model Pipeline */}
          <FadeIn>
            <p className="eyebrow mb-3 text-accent">Model Pipeline</p>
            <h2 className="heading mb-16 text-3xl sm:text-4xl">
              Individual Vigilance → Independent Watchers → Collective Vigilance → Detection
            </h2>
          </FadeIn>

          <div className="flex flex-col gap-16">
            {stages.map((stage, i) => (
              <FadeIn key={stage.n} delay={i * 0.05}>
                <div className="grid gap-8 border-t border-border pt-10 dark:border-white/10 md:grid-cols-2 md:items-start">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 font-mono text-xs text-accent">
                        {stage.n}
                      </span>
                      <h3 className="heading text-2xl">{stage.title}</h3>
                    </div>
                    <div className="mb-4">
                      <Equation>{stage.equation}</Equation>
                    </div>
                    <p className="body-copy mb-4 text-sm leading-relaxed dark:text-white/60">{stage.body}</p>
                    <Takeaway>{stage.takeaway}</Takeaway>
                  </div>
                  <GraphPlaceholder label={stage.title} deckPage={stage.deckPage} />
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Key Findings */}
          <div className="mt-28">
            <FadeIn>
              <p className="eyebrow mb-3 text-accent">What the Model Found</p>
              <h2 className="heading mb-10 text-3xl sm:text-4xl">Key Findings</h2>
            </FadeIn>
            <div className="grid gap-4 sm:grid-cols-2">
              {findings.map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.06}>
                  <div className="h-full rounded-2xl border border-border p-6 dark:border-white/10">
                    <h3 className="heading mb-2 text-lg">{f.title}</h3>
                    <p className="body-copy text-sm leading-relaxed dark:text-white/60">{f.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Transition */}
          <FadeIn>
            <p className="heading mt-28 mb-24 text-2xl italic leading-snug sm:text-3xl">
              We realized the first model wasn&apos;t enough.
            </p>
          </FadeIn>

          {/* Extended model */}
          <FadeIn>
            <p className="eyebrow mb-3 text-accent">Taking the Model Further</p>
            <h2 className="heading mb-6 text-3xl sm:text-4xl">Extended Model</h2>
            <p className="body-copy mb-10 text-lg leading-relaxed dark:text-white/60">
              The original framework assumes identical behavioral characteristics, a constant group size, uniform
              detection ability, and no spatial or communication structure. To make it more realistic, we extended
              it so each individual carries its own parameters:
            </p>
          </FadeIn>

          <FadeIn>
            <div className="mb-10 grid gap-3 sm:grid-cols-2">
              {extendedParams.map((p) => (
                <div key={p.label} className="rounded-xl border border-border bg-card px-4 py-3.5 dark:border-white/10 dark:bg-white/5">
                  <p className="font-body text-sm font-medium text-surface dark:text-white">{p.label}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted dark:text-white/40">{p.detail}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn>
            <div className="mb-24">
              <Equation>
                P<sub>det</sub>(t) = 1 − exp(−Σᵢ μᵢ wᵢ(N) δᵢ(xₚ) t<sub>i</sub><sup>eff</sup>)
              </Equation>
              <p className="body-copy mt-4 text-sm leading-relaxed dark:text-white/60">
                Instead of assuming every member contributes equally, an individual now contributes only when it can
                realistically detect the predator — depending on its vigilance, position, detection radius,
                synchronization, and available reaction time.
              </p>
            </div>
          </FadeIn>

          {/* Extended simulation */}
          <FadeIn>
            <p className="eyebrow mb-3 text-accent">Extended Simulation</p>
            <h2 className="heading mb-8 text-3xl sm:text-4xl">Simulation Results</h2>
          </FadeIn>
          <FadeIn>
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <GraphPlaceholder label="Spatial group configuration" deckPage="p.11" />
              <GraphPlaceholder label="Low- vs. high-synchronization detection curves" deckPage="p.11" />
            </div>
          </FadeIn>
          <FadeIn>
            <p className="body-copy mb-24 text-lg leading-relaxed dark:text-white/60">
              Detection probability kept increasing with group size, but the improvements grew progressively
              smaller. More importantly, low-synchronization groups substantially outperformed high-synchronization
              groups even at similar sizes — diversity in behavior can be more valuable than simply adding more
              individuals.
            </p>
          </FadeIn>

          {/* Final Insight */}
          <FadeIn>
            <div className="mb-28 border-y border-border py-16 text-center dark:border-white/10">
              <p className="heading text-4xl leading-tight sm:text-5xl">
                More isn&apos;t always better.
                <br />
                Independence matters.
              </p>
              <p className="body-copy mx-auto mt-6 max-w-lg dark:text-white/60">
                Groups benefit not only from additional watchers, but from having watchers whose behaviors and
                information are meaningfully independent.
              </p>
            </div>
          </FadeIn>

          {/* Assumptions */}
          <FadeIn>
            <details className="group mb-4 rounded-xl border border-border dark:border-white/10">
              <summary className="cursor-pointer list-none px-5 py-4 font-mono text-sm uppercase tracking-wider text-surface dark:text-white">
                <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
                View Model Assumptions
              </summary>
              <p className="body-copy px-5 pb-5 text-sm leading-relaxed dark:text-white/60">
                The initial model assumes identical behavioral parameters across species, partially but not
                perfectly synchronized scanning, a relatively small vigilance-relaxation rate, and predator
                detections that follow a Poisson process based on collective vigilance. Group size is modeled from
                1 to 20 individuals per species.
              </p>
            </details>
          </FadeIn>

          {/* Limitations */}
          <FadeIn>
            <div className="mb-24 mt-12">
              <p className="eyebrow mb-3 text-muted dark:text-white/40">Limitations &amp; Future Work</p>
              <p className="body-copy mb-3 text-sm leading-relaxed dark:text-white/60">
                The original framework assumes a uniform detection rate across species, doesn&apos;t explicitly
                represent spatial organization or communication networks, and assumes a constant group size.
              </p>
              <p className="body-copy text-sm leading-relaxed dark:text-white/60">
                Potential improvements include species-specific detection rates, predator movement and dynamics,
                spatial heterogeneity, and more detailed reaction or communication delays.
              </p>
            </div>
          </FadeIn>

          {/* Reflection */}
          <FadeIn>
            <div className="mb-24">
              <p className="eyebrow mb-3 text-muted dark:text-white/40">What I Learned</p>
              <p className="font-body text-lg italic leading-relaxed text-surface/80 dark:text-white/70">
                This project showed me how mathematical modeling can translate complex behavioral systems into a
                series of manageable assumptions. The most interesting part was realizing that simply increasing
                the size of a system doesn&apos;t necessarily improve its performance — the relationships and
                dependencies between its components matter just as much. By progressively extending the model, we
                moved from an idealized probability framework toward a more realistic simulation involving
                heterogeneous individuals, spatial constraints, and information delays.
              </p>
            </div>
          </FadeIn>

          {/* Skills + links */}
          <FadeIn>
            <div className="mb-4 flex flex-wrap gap-2">
              {[...project.tools, "Parameter Analysis", "Model Design"]
                .filter((t, i, arr) => arr.indexOf(t) === i)
                .map((skill) => (
                  <span key={skill} className="rounded border border-border px-3 py-1.5 font-mono text-xs text-surface/70 dark:border-white/10 dark:text-white/50">
                    {skill}
                  </span>
                ))}
            </div>
          </FadeIn>

          {links.length > 0 && (
            <FadeIn>
              <div className="mt-6 flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-accent/30 px-5 py-2.5 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-white"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </div>

      {/* Next Project */}
      <section className="border-t border-border bg-base px-[5vw] py-16 dark:border-white/10 dark:bg-navy">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link href="/projects" className="font-mono text-sm text-muted transition-colors hover:text-accent dark:text-white/50">
            ← All Work
          </Link>
          <Link
            href={`/projects/${nextProject.slug}`}
            className="group flex items-center gap-4 transition-colors duration-200 hover:text-accent"
          >
            <span className="heading text-3xl transition-colors duration-200 group-hover:text-accent md:text-5xl">
              {nextProject.title}
            </span>
            <span className="font-mono text-2xl text-muted transition-colors duration-200 group-hover:text-accent dark:text-white/50">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
