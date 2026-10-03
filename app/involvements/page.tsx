"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { YouAreHere, NextStop } from "@/components/layout/Wayfinding";
import { ModalShell } from "@/components/ui/ModalShell";
import { BlockArt, FilmPhoto, PageHead, frameNo } from "@/components/film/ui";

type InvType = "Leadership" | "Professional" | "Mentorship";

type InvRole = { title: string; period: string };
type InvLink = { label: string; url: string };

type Involvement = {
  role: string;
  org: string;
  period: string;
  type: InvType;
  description: string;
  bullets: string[];
  awards: string[];
  image?: string;  // drop in public/involvements/<slug>.jpg
  gallery?: string[];  // additional photos, shown as a slideshow in the Media tab
  roleHistory?: InvRole[];  // prior roles held at this org, oldest first
  links?: InvLink[];  // website, socials, etc.
};

const involvements: Involvement[] = [
  {
    role: "Events & Operations Director",
    org: "Society of Software Developers",
    period: "Apr 2025 — Present",
    type: "Leadership",
    description: "Running events and operations for UF’s software development community.",
    bullets: [
      "Manage a $20K+ annual budget for technical workshops, career events, and student programming, overseeing funding allocation and event logistics.",
      "Lead end-to-end event operations, coordinating timelines, vendors, venues, and cross-functional teams to deliver programming for UF’s software development community.",
    ],
    awards: [],
  },
  {
    role: "External Vice President",
    org: "UF Data Science & Informatics Club",
    period: "May 2025 — Present",
    type: "Leadership",
    description: "Led the largest data science organization at UF — 350+ members, 8+ winning hackathon teams.",
    image: "/involvements/dsi.jpg",
    gallery: [
      "/involvements/dsi-2.jpg",
      "/involvements/dsi-3.jpg",
      "/involvements/dsi-4.jpg",
      "/involvements/dsi-5.jpg",
      "/involvements/dsi-6.jpg",
      "/involvements/dsi-7.jpg",
      "/involvements/dsi-8.jpg",
      "/involvements/dsi-9.jpg",
      "/involvements/dsi-10.jpg",
    ],
    roleHistory: [
      { title: "Event Coordinator", period: "Aug 2024 — May 2025" },
      { title: "External Vice President", period: "May 2025 — Present" },
    ],
    links: [
      { label: "Website", url: "https://www.ufdsi.com/" },
      { label: "Instagram", url: "https://www.instagram.com/uf_dsi/" },
    ],
    bullets: [
      "Drove outreach with AIIRI, Google, Microsoft, Deloitte, and startups; negotiated funding and launched student projects.",
      "Hosted 5+ research and industry tours, connecting 350+ members with labs, startups, and industry professionals, leading to 8+ winning hackathon teams.",
      "Directed marketing and outreach growing internal engagement by 300% and boosting student–employer engagement by 600%.",
      "Earned Student Org of the Year and Career Influencer Award.",
      "Initiated partnership with UF Career Connections Center to host career-readiness workshops.",
    ],
    awards: ["Student Org of the Year", "Career Influencer Award"],
  },
  {
    role: "Operations Committee Head",
    org: "WingHacks",
    period: "Apr 2025 — Present",
    type: "Leadership",
    description: "Leading operations planning for WingHacks 2027 — the systems, logistics, and coordination behind a large-scale hackathon.",
    bullets: [
      "Own planning across venue logistics, resource allocation, catering, procurement, setup, storage, transportation, signage, participant flow, and event-day operations.",
      "Coordinate closely with sponsorship, design, outreach, and other committees to translate each team's needs into operational requirements, timelines, budgets, and execution plans.",
      "Build purchasing schedules and resource plans around what can be purchased, rented, borrowed, stored, or reused, while accounting for vendor lead times and budget constraints.",
      "Develop committee delegation structures, setup and cleanup plans, contingency procedures, and event-day operating workflows so responsibilities are clear before the hackathon begins.",
    ],
    awards: [],
  },
  {
    role: "Vice President",
    org: "AI Security & Risk Association",
    period: "2025 — Present",
    type: "Leadership",
    description: "Leading AI security and risk discussions at UF.",
    bullets: [
      "Leading organization focused on AI safety, security, and ethical risk management.",
      "Organizing events and workshops on responsible AI development.",
    ],
    awards: [],
  },
  {
    role: "Fellow",
    org: "Product Space",
    period: "2026 — Present",
    type: "Professional",
    description: "Selected fellow working on real product strategy challenges for live clients.",
    image: "/involvements/product-space.jpg",
    gallery: [
      "/involvements/product-space-2.jpg",
      "/involvements/product-space-3.jpg",
    ],
    bullets: [
      "Working as a product strategy fellow on live client projects (Lattéra, Gator Creek LLC).",
      "Designing MVP pilot measurement systems and go-to-market strategies.",
    ],
    awards: [],
  },
  {
    role: "Treasurer",
    org: "Vietnamese International Student Association",
    period: "May 2025 — Present",
    type: "Leadership",
    description: "Managing finances and cultural programming for VISA.",
    image: "/involvements/visa.jpg",
    gallery: [
      "/involvements/visa-2.jpg",
      "/involvements/visa-3.jpg",
      "/involvements/visa-5.jpg",
      "/involvements/visa-6.jpg",
    ],
    roleHistory: [
      { title: "Social Chair", period: "Aug 2024 — May 2025" },
      { title: "Treasurer", period: "May 2025 — Present" },
    ],
    bullets: [
      "Manage $10,000+ annual budget and secure $5,000+ in sponsorships.",
      "Lead planning and execution of large-scale Tết Festivals (300+ attendees).",
      "Oversee logistics and resource allocation for cross-functional initiatives.",
    ],
    awards: [],
  },
  {
    role: "Mentor",
    org: "Society of Asian Scientists and Engineers (SASE)",
    period: "2025 — Present",
    type: "Mentorship",
    description: "Mentoring underclassmen in career and academic development.",
    image: "/involvements/sase-mentor.jpg",
    bullets: [
      "Providing career guidance and mentorship to underclassmen.",
      "Supporting students with internship applications, interview prep, and networking.",
    ],
    awards: [],
  },
  {
    role: "Mentor",
    org: "GatorAI",
    period: "2025 — Present",
    type: "Mentorship",
    description: "Mentoring students in AI/ML skill-building at UF.",
    bullets: [
      "Providing mentorship on AI/ML concepts and projects.",
      "Supporting students building technical and career readiness in AI.",
    ],
    awards: [],
  },
  {
    role: "Member",
    org: "Gator Student Consulting Organization",
    period: "2025 — Present",
    type: "Professional",
    description: "Consulting on real business problems for local organizations.",
    bullets: [
      "Engaging in consulting case work and professional development.",
      "Working with local businesses and nonprofits on strategic challenges.",
    ],
    awards: [],
  },
  {
    role: "Fundraising Committee Intern",
    org: "Society of Asian Scientists and Engineers (SASE)",
    period: "2025",
    type: "Professional",
    description: "Supporting fundraising efforts and sponsor outreach.",
    image: "/involvements/sase-fundraising.jpg",
    bullets: [
      "Assisted with fundraising strategy and sponsor outreach.",
      "Contributed to event planning and execution.",
    ],
    awards: [],
  },
];

const CATEGORIES: InvType[] = ["Leadership", "Professional", "Mentorship"];

/* entries with a photo lead each row (and the featured hero) — stable sort keeps relative order within each group */
const orderedInvolvements = [...involvements].sort((a, b) => Number(!!b.image) - Number(!!a.image));

const featured = orderedInvolvements.slice(0, 5);

/* every involvement gets a frame number in roll order */
const frameOf = (inv: Involvement) => orderedInvolvements.indexOf(inv) + 1;
const keyOf = (inv: Involvement) => `${inv.role}-${inv.org}`;

function InvArt({ inv, sizes, className = "" }: { inv: Involvement; sizes: string; className?: string }) {
  const n = frameOf(inv);
  return inv.image
    ? <FilmPhoto src={inv.image} alt={`${inv.org}`} n={n} sizes={sizes} className={className} />
    : <BlockArt seed={inv.org} label={inv.org.replace(/ \(.*\)/, "")} sub={inv.role} n={n} className={className} />;
}

/* ─── Media slideshow ───────────────────────────────── */
function MediaSlideshow({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const multi = images.length > 1;
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-[var(--film)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={images[idx]} src={images[idx]} alt="" className="h-full w-full object-cover" />
        {multi && (
          <>
            <button type="button" aria-label="Previous photo" onClick={prev} className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#FAF7EF]/90 text-[#20201E] transition-colors hover:bg-[#F4D35E]">‹</button>
            <button type="button" aria-label="Next photo" onClick={next} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#FAF7EF]/90 text-[#20201E] transition-colors hover:bg-[#F4D35E]">›</button>
            <span className="f-fno">{frameNo(idx + 1)}</span>
          </>
        )}
      </div>
      {multi && (
        <div className="flex justify-center gap-1.5">
          {images.map((src, i) => (
            <button key={src} type="button" aria-label={`Go to photo ${i + 1}`} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-[var(--butter)] ring-1 ring-[var(--ink)]/30" : "w-1.5 bg-[var(--ink)]/25 hover:bg-[var(--ink)]/45"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Modal ─────────────────────────────────────────── */
function InvModal({ inv, onClose }: { inv: Involvement; onClose: () => void }) {
  const hasRoles = !!inv.roleHistory && inv.roleHistory.length > 0;
  const hasMedia = !!inv.gallery && inv.gallery.length > 0;
  const tabs = ["overview", ...(hasRoles ? ["roles"] : []), ...(hasMedia ? ["media"] : [])] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("overview");

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl" labelledBy="inv-modal-title">
      <InvArt inv={inv} sizes="672px" className="aspect-[16/8]" />
      <div className="px-6 pb-2 pt-5">
        <p className="f-mono text-[var(--muted)]">{inv.type} · {inv.period}</p>
        <h2 id="inv-modal-title" className="f-h2 mt-1">{inv.role}</h2>
        <p className="f-type mt-1 text-[15px] text-[var(--muted)]">{inv.org}</p>
      </div>

      {tabs.length > 1 && (
        <div role="tablist" className="mt-3 flex gap-1 border-b border-[var(--line)] px-5">
          {tabs.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`f-type relative px-3 py-3 text-[15px] transition-colors ${tab === t ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>
              {t}
              {tab === t && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-[var(--butter)]" />}
            </button>
          ))}
        </div>
      )}

      {tab === "overview" && (
        <div className="space-y-5 p-6">
          <p className="f-serif text-xl leading-snug">{inv.description}</p>
          <ul className="space-y-3">
            {inv.bullets.map((b, i) => (
              <li key={i} className="grid grid-cols-[34px_1fr] items-start gap-2">
                <span className="f-mono mt-1 text-[var(--blue)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[15px] leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
          {inv.awards.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
              {inv.awards.map((a) => <span key={a} className="f-chip border-transparent bg-[var(--butter)] text-[#20201E]">🏆 {a}</span>)}
            </div>
          )}
          {inv.links && inv.links.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
              {inv.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="f-btn text-[13px]">{l.label} ↗</a>)}
            </div>
          )}
        </div>
      )}

      {tab === "roles" && hasRoles && (
        <div className="p-6">
          {inv.roleHistory!.map((r) => (
            <div key={r.title} className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3 last:border-b-0">
              <span className="f-type font-bold">{r.title}</span>
              <span className="f-mono whitespace-nowrap text-[var(--muted)]">{r.period}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "media" && hasMedia && <div className="p-6"><MediaSlideshow images={inv.gallery!} /></div>}
    </ModalShell>
  );
}

/* ─── Card ──────────────────────────────────────────── */
function InvCard({ inv, onSelect }: { inv: Involvement; onSelect: (inv: Involvement) => void }) {
  return (
    <article className="f-card f-hover-lift flex min-w-0 flex-col p-3">
      <button type="button" data-cursor-photo data-cursor-label="view frame ↗" onClick={() => onSelect(inv)} className="f-hoverable relative block w-full text-left" aria-label={`Open ${inv.role}, ${inv.org}`}>
        <InvArt inv={inv} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px" className="aspect-[16/10] rounded-lg" />
        <span className="f-view">view frame ↗</span>
      </button>
      <p className="f-mono mt-3 text-[var(--muted)]">{inv.period}</p>
      <h3 className="f-type mt-1 text-xl font-bold leading-tight">{inv.role}</h3>
      <p className="mt-0.5 text-[14px] text-[var(--muted)]">{inv.org}</p>
      <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-snug">{inv.description}</p>
      {inv.awards.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{inv.awards.map((a) => <span key={a} className="f-chip border-transparent bg-[var(--butter)] text-[#20201E]">🏆 {a}</span>)}</div>}
    </article>
  );
}

/* ─── "On the roll": the featured five on a film strip ─ */
function OnTheRoll({ onSelect }: { onSelect: (inv: Involvement) => void }) {
  return (
    <section aria-label="Featured involvements" className="overflow-hidden py-6">
      <div className="f-wrap mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="f-h2">on the roll →</h2>
        <span className="f-mono text-[var(--muted)]">good people, good problems &lt;3</span>
      </div>
      <div className="f-tilt" style={{ padding: "26px 0" }}>
        <div className="f-strip" tabIndex={0} role="region" aria-label="Featured involvements: scroll sideways">
          <div className="f-rail">
            {featured.map((inv, i) => (
              <button key={keyOf(inv)} type="button" data-cursor-photo data-cursor-label="view frame ↗" onClick={() => onSelect(inv)} className="f-hoverable relative w-[300px] shrink-0 text-left text-[#FAF7EF] md:w-[340px]" style={{ scrollSnapAlign: "start" }}>
                <InvArt inv={inv} sizes="340px" className="aspect-[3/2] rounded-[3px]" />
                <span className="f-view">view frame ↗</span>
                <span className="f-edge"><span>{String(i + 1).padStart(2, "0")}A ▸</span><span>{inv.role}</span></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────── */
export default function InvolvementsPage() {
  const [selected, setSelected] = useState<Involvement | null>(null);
  const [cat, setCat] = useState<"All" | InvType>("All");
  const shown = CATEGORIES.filter((c) => cat === "All" || c === cat);

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />

      <div className="pt-20">
        <div className="f-wrap pb-2"><YouAreHere page="Involvements" /></div>
        <PageHead kicker="sometimes I build communities" title="involvements" note={<>{involvements.length} roles,<br />lots of people :)</>}>
          The teams and communities I lead, mentor in, and learn from.
        </PageHead>
        <OnTheRoll onSelect={setSelected} />
      </div>

      <section className="f-band mt-10 pb-14 pt-10">
        <div className="f-wrap">
          <h2 className="f-h2">everyone, everything →</h2>
          <div className="mt-4 flex flex-wrap gap-1" role="group" aria-label="Filter by type">
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className="f-tab">{c.toLowerCase()}</button>
            ))}
          </div>

          {shown.map((c) => {
            const items = orderedInvolvements.filter((inv) => inv.type === c);
            if (!items.length) return null;
            return (
              <motion.div key={c} className="mt-10" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
                <p className="f-hand mb-4 text-3xl">{c.toLowerCase()}</p>
                <div className="grid grid-cols-1 gap-4 text-[var(--ink)] sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((inv) => <InvCard key={keyOf(inv)} inv={inv} onSelect={setSelected} />)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {selected && <InvModal inv={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <NextStop from="Involvements" />
      <Footer />
    </main>
  );
}
