import { experience, leadership, awards, education, skills, spokenLanguages, caseCompetitions, earlyCareerPrograms, highSchoolEducation, hobbies } from "@/data/cv";
import { allWork } from "@/data/projects";
import { hanoiJourneyPins } from "@/data/biography/hanoiJourney";
import { usJourneyPins } from "@/data/biography/usJourney";
import { SITE_EMAIL } from "@/lib/site";
import { PROFILE } from "./profile";
import { getMyosKnowledge } from "./myos";

/**
 * Everything the portfolio chatbot is allowed to know, assembled from the same data files the pages render
 * (so the chat can never drift from the site). Deliberately excludes anything private: no phone number, no
 * street addresses, no coordinates. Built once per server instance.
 */
type Job = { role: string; company: string; period: string; description?: string; bullets?: string[] };

function jobs(title: string, list: readonly Job[]): string {
  return `## ${title}\n` + list.map((j) => `- ${j.role}, ${j.company} (${j.period}). ${j.description ?? ""} ${(j.bullets ?? []).join(" ")}`.replace(/\s+/g, " ").trim()).join("\n");
}

let cached: string | null = null;

/** static site knowledge plus, when configured, live public data from myOS */
export async function getKnowledge(): Promise<string> {
  const myos = await getMyosKnowledge();
  return myos ? `${getBaseKnowledge()}

## Live from myOS (My's Career OS; public, approved items only; newer than the lists above if they differ)
${myos}` : getBaseKnowledge();
}

function getBaseKnowledge(): string {
  if (cached) return cached;

  const edu = education.map((e) => `- ${e.degree}, ${e.school} (${e.location}), ${e.period}. GPA ${e.gpa}. ${e.details.join(" ")}`).join("\n");
  const hs = highSchoolEducation
    .map((e) => `- ${e.school} (${e.location}), ${e.period}. GPA ${e.gpa}. ${e.details.join(" ")}`)
    .join("\n");

  const work = allWork
    .map((p) => {
      const links = [p.github && `GitHub: ${p.github}`, p.liveUrl && `Live: ${p.liveUrl}`, p.devpost && `Devpost: ${p.devpost}`].filter(Boolean).join(" · ");
      return `- ${p.title} (${p.month.includes(p.year) ? p.month : `${p.month} ${p.year}`}, ${p.category}${p.award ? `, award: ${p.award}` : ""}${p.competition ? `, competition: ${p.competition}` : ""}). ${p.logline} ${p.description} Tools: ${p.tools.join(", ")}.${links ? ` ${links}.` : ""} Page: /projects/${p.slug}`.replace(/\s+/g, " ").trim();
    })
    .join("\n");

  const hanoi = hanoiJourneyPins
    .map((p) => `- ${p.number}. ${p.preview.title} (ages ${p.ageRange}): ${p.preview.description} ${p.backstory.slice(0, 2).join(" ")}`.replace(/\s+/g, " ").trim())
    .join("\n");
  const us = usJourneyPins
    .map((p) => `- ${p.number}. ${p.preview.title} (${p.yearRange}): ${p.preview.description} ${p.storySections.slice(0, 1).flatMap((s) => s.body.slice(0, 2)).join(" ")}`.replace(/\s+/g, " ").trim())
    .join("\n");

  cached = [
    "# About",
    `My Pham is a Data Science student at the University of Florida (expected May 2028), originally from Hanoi, Vietnam, now in Gainesville, Florida. Interested in product management, strategy consulting and data/analytics roles. Open to opportunities. Contact: ${SITE_EMAIL}, LinkedIn linkedin.com/in/mypham237. Site pages: /projects (all work), /cv (resume), /involvements (leadership and student orgs), /biography/journey (life story map from Hanoi to the U.S.), /film (photo gallery), /connect (contact form).`,
    "## Education",
    edu,
    "## High school",
    hs,
    jobs("Experience", experience as readonly Job[]),
    jobs("Leadership and involvement", leadership as readonly Job[]),
    "## Awards",
    awards.map((a) => `- ${a.title}, ${a.event}`).join("\n"),
    "## Case competitions and hackathons entered",
    caseCompetitions.map((c) => `- ${c}`).join("\n"),
    "## Early-career programs",
    earlyCareerPrograms.map((c) => `- ${c}`).join("\n"),
    "## Skills",
    Object.entries(skills).map(([group, list]) => `- ${group}: ${(list as string[]).join(", ")}`).join("\n"),
    `## Languages spoken\n${spokenLanguages.join(", ")}`,
    `## Hobbies\n${hobbies.join(", ")}`,
    "## Projects and competition work",
    work,
    PROFILE.trim(),
    "## Life story - Hanoi chapter (from the biography page)",
    hanoi,
    "## Life story - United States chapter (from the biography page)",
    us,
  ].join("\n\n");
  return cached;
}
