export type GeoPoint = { lat: number; lon: number };

/** One editorial "moment" inside a location's expanded story — not a map pin. */
export type StorySection = {
  id: string;
  heading: string;
  /** full story paragraphs, same shape as hanoiJourney's backstory */
  body: string[];
  /** image paths; leave empty until real photos are dropped in, components render a placeholder block instead */
  images: string[];
  captions?: string[];
  /** controls which editorial layout StorySection uses when rendered */
  layoutVariant: "hero-two-row" | "gallery" | "candid-pair";
};

export type USJourneyPin = {
  id: string;
  /** number shown on the map pin */
  number: number;
  /** short map label */
  title: string;
  /** short map subtitle */
  subtitle: string;
  /** loose placeholder era label — not a precise date range yet */
  yearRange: string;
  coordinates: GeoPoint;
  /** optional — omit until a real photo exists; UI falls back to a placeholder block */
  image?: string;
  preview: {
    title: string;
    description: string;
  };
  /** the location's expanded photo story, built from placeholder sections for now (Phase 2 renders these) */
  storySections: StorySection[];
  gallery?: string[];
};

export const usJourneyCopy = {
  eyebrow: "Chapter 02",
  heading: "United States",
  instruction: "Follow the main route or select a location.",
  body: "Two schools on opposite ends of the country, and the slow work of turning unfamiliar places into home.",
  ctaLabel: "Explore chapter",
  secondaryCtaLabel: "Explore freely",
};

export const usCheckpointCopy = {
  eyebrow: "02 / U.S. — Complete",
  heading: "Another home.",
  paragraph: "Rivermont taught me how to begin again. Gainesville became the place where I kept becoming.",
  continueCta: "Continue",
  stayCta: "Explore the U.S. chapter again",
};

export const usMemoriesCopy = {
  eyebrow: "US Chapter · More to come",
  heading: "There's more to this chapter.",
  body: "Beyond Rivermont and Gainesville, there are more places and people worth marking on this map — I'm adding them next.",
};

export const usJourneyPins: USJourneyPin[] = [
  {
    id: "rivermont",
    number: 1,
    title: "Rivermont Collegiate",
    subtitle: "A new home",
    yearRange: "2023–2024",
    // 1821 Sunset Dr, Bettendorf, IA 52722 — the historic Joseph W. Bettendorf House, now Rivermont Collegiate.
    coordinates: { lat: 41.5293, lon: -90.5081 },
    preview: {
      title: "Rivermont Collegiate",
      description:
        "My first home in the United States, where a small boarding school in Iowa became the place I learned how to start over, build community, and find a sense of belonging far from home.",
    },
    // To add real photos later: drop files in public/biography/rivermont/ and list them in the
    // relevant section's `images` array (plus `captions` if you want specific alt text) — no
    // component changes needed, StoryMedia already renders whatever each array contains.
    // Suggested media ordering once photos exist (also sets `gallery` on this pin, which is what
    // the story modal's carousel/thumbnail-grid actually reads): 1) arrival/campus, 2) friends,
    // 3) Asian Culture Club, 4) dorm/prefect life, 5) school/community memories.
    storySections: [
      {
        id: "new-beginning",
        heading: "A New Beginning",
        body: [
          "Rivermont was the first place I called home in the United States. I arrived in Iowa thousands of miles away from Hanoi, surrounded by people, routines, and a culture that were completely new to me. Everything felt unfamiliar at first, from speaking English all day to living away from my family.",
          "But being at a small school changed that experience. I knew my classmates and teachers closely, and the diversity of the student body meant that being from somewhere else did not automatically make me feel out of place. Slowly, a place that had once felt completely foreign started to feel familiar.",
        ],
        images: [],
        layoutVariant: "hero-two-row",
      },
      {
        id: "building-a-home",
        heading: "Building a Home Away From Home",
        body: [
          "Living on campus taught me that community does not happen automatically. Someone has to create it.",
          "As a dorm prefect, I tried to help make the dorm feel less like a place students simply slept in and more like a home away from home. That meant checking in on people, helping solve everyday problems, organizing activities, communicating concerns, and sometimes simply being the person someone could talk to.",
          "It was one of my earliest lessons in leadership. I began to understand that leadership was often less about being in charge and more about paying attention to what people needed.",
        ],
        images: [],
        layoutVariant: "candid-pair",
      },
      {
        id: "creating-community",
        heading: "Creating the Community I Wanted to See",
        body: [
          "That same idea carried into the Asian Culture Club. I wanted students to have a space where Asian cultures could be shared in a way that felt welcoming, interactive, and genuinely fun.",
          "Through cultural workshops, games, Lunar New Year activities, fundraising, and school events, I learned how much work sits behind experiences that seem effortless from the outside. More importantly, I saw how something small could create conversations between people who might otherwise never have had them.",
          "Rivermont was where I first learned how to build community instead of simply searching for one.",
        ],
        images: [],
        layoutVariant: "gallery",
      },
    ],
  },
  {
    id: "gainesville",
    number: 2,
    title: "Gainesville",
    subtitle: "University of Florida",
    yearRange: "2024–Present",
    coordinates: { lat: 29.6516, lon: -82.3248 },
    preview: {
      title: "Gainesville / University of Florida",
      description:
        "A much bigger campus, a much wider world, and the chapter where I began turning curiosity into projects, research, leadership, and a clearer idea of the person I want to become.",
    },
    // Same convention as Rivermont above — drop real photos in public/biography/gainesville/ and
    // list them per section; no component changes needed.
    // Suggested media ordering once photos exist: 1) UF/campus, 2) projects, 3) research,
    // 4) DSI/VISA/student orgs, 5) friends/everyday life, 6) professional experiences.
    storySections: [
      {
        id: "starting-over-again",
        heading: "Starting Over, Again",
        body: [
          "Moving to Gainesville meant starting over for the second time.",
          "Rivermont had been small and intimate. The University of Florida was the opposite. Suddenly there were tens of thousands of students, hundreds of organizations, countless paths I could take, and no obvious answer for where I belonged.",
          "This time, though, being new did not scare me in quite the same way. I had already learned that unfamiliar places eventually become familiar when you are willing to explore them.",
          "So I started saying yes.",
        ],
        images: [],
        layoutVariant: "hero-two-row",
      },
      {
        id: "finding-my-direction",
        heading: "Finding My Direction",
        body: [
          "I came to UF to study Data Science, but college quickly became much more than choosing a major.",
          "Research introduced me to questions around sustainability, education, artificial intelligence, and how data can shape real decisions. Classes gave me technical foundations, but projects were where everything started to make sense. I liked taking problems that felt messy and turning them into models, products, workflows, or systems people could actually use.",
          "Over time, I realized that what interested me most was not one specific technology. It was the space between people, data, products, and decisions.",
        ],
        images: [],
        layoutVariant: "gallery",
      },
      {
        id: "creating-opportunities",
        heading: "Creating Opportunities for Other People",
        body: [
          "Some of the most important parts of Gainesville happened outside the classroom.",
          "Through Data Science & Informatics, the Vietnamese International Student Association, hackathons, research labs, and other campus communities, I became increasingly involved in building the kinds of opportunities I had once been searching for myself.",
          "I worked on partnerships, events, budgets, sponsorships, research visits, cultural programming, and projects that brought students together with people and opportunities outside the university.",
          "The scale was different from Rivermont, but the motivation was surprisingly similar. I still cared most about creating environments where people felt connected, supported, and excited to participate.",
        ],
        images: [],
        layoutVariant: "candid-pair",
      },
      {
        id: "still-in-progress",
        heading: "Still in Progress",
        body: [
          "Gainesville is the first chapter of this story that is still being written.",
          "Since arriving here, I have moved between research, product work, consulting, data science, student organizations, hackathons, side projects, and more ideas than I could realistically finish. Some became things I am proud of. Others taught me what I did not want to build, study, or pursue.",
          "I am still figuring out what comes next, and I think that is the point.",
          "Hanoi taught me where I came from. Rivermont taught me how to adapt and create community. Gainesville has given me the space to experiment with who I might become.",
          "For now, the destination stays open.",
        ],
        images: [],
        layoutVariant: "hero-two-row",
      },
    ],
  },
];

/**
 * Secondary, non-numbered travel markers — populated later, none hardcoded yet. Lighter than a
 * full USJourneyPin on purpose: a photo, a short caption, and an optional year/date label — never
 * promoted into a numbered geographic chapter of their own.
 *
 * To add real memories later: drop photos in public/biography/memories/ and add entries here —
 * no component changes needed, JourneyUsMemoriesPanel already renders whatever this array contains.
 */
export type MemoryMarker = {
  id: string;
  coordinates: GeoPoint;
  image?: string;
  title: string;
  caption: string;
  /** optional short label, e.g. "2024" or "Spring 2025" — omit if not meaningful for a given memory */
  year?: string;
};

export const usMemoryMarkers: MemoryMarker[] = [];
