export type GeoPoint = { lat: number; lon: number };

export type StorySection = {
  image: string;
  caption: string;
  text: string;
};

export type StoryPin = {
  id: string;
  number: number;
  /** fallback position on the chapter map, percentage 0-100 (used when no real geo data is available) */
  x: number;
  y: number;
  /** real-world coordinate; when present, ChapterMap projects this instead of x/y */
  geo?: GeoPoint;
  title: string;
  blurb: string;
  thumbnail: string;
  story: {
    chapterLabel: string;
    sections: StorySection[];
  };
};

export type PhotoMarker = {
  id: string;
  x: number;
  y: number;
  image: string;
  label: string;
};

export type Chapter = {
  id: string;
  /** topojson numeric country id, used to highlight on the globe */
  countryId: string;
  regionLabel: string;
  globeTarget: GeoPoint;
  eyebrow: string;
  title: string;
  /** short one-line subheading under the title */
  tagline?: string;
  intro: string;
  /** short transitional line between the intro paragraph and the CTAs */
  transitionLine?: string;
  exploreCta: string;
  /** secondary, low-emphasis action to skip past this chapter's detail */
  skipCta?: string;
  /** small instruction line under the CTAs */
  instruction?: string;
  mapLabel: string;
  mapEyebrow: string;
  /** static GeoJSON asset (e.g. a real river line) rendered behind the pins, projected with the same geo transform as pin coordinates */
  mapBackdropData?: string;
  pins: StoryPin[];
  photoMarkers?: PhotoMarker[];
  checkpoint: {
    heading: string;
    subheading: string;
    continueLabel: string;
    stayLabel: string;
  };
};

const placeholderImages = [
  "/images/headshot.jpg",
  "/images/IMG_3794.JPG",
  "/images/IMG_4610.JPG",
  "/images/IMG_7605.JPG",
  "/images/IMG_7729.JPG",
  "/images/IMG_9501.JPG",
];

function placeholderPin(number: number, x: number, y: number, chapterLabel: string, geo?: GeoPoint): StoryPin {
  return {
    id: `${chapterLabel.toLowerCase()}-pin-${number}`,
    number,
    x,
    y,
    geo,
    title: "Placeholder Title",
    blurb: "One-line preview of this chapter goes here.",
    thumbnail: placeholderImages[number % placeholderImages.length],
    story: {
      chapterLabel,
      sections: Array.from({ length: 4 }).map((_, i) => ({
        image: placeholderImages[(number + i) % placeholderImages.length],
        caption: "Section Title Here",
        text: "This is a short paragraph of placeholder text. It will be replaced with real content later. This section can include images, stories, and moments from this chapter.",
      })),
    },
  };
}

export const chapters: Chapter[] = [
  {
    id: "vietnam",
    countryId: "704",
    regionLabel: "Vietnam",
    globeTarget: { lat: 21.0285, lon: 105.8542 },
    eyebrow: "Chapter 01 · Roots",
    title: "Hanoi",
    tagline: "The city where my relationship with learning, creativity, and ambition first began.",
    intro: "I was born and raised in Hanoi, where much of my childhood was shaped by school commutes, number games with my mother, art classes, music, close friendships, and the constant encouragement to try something new.",
    transitionLine: "Follow the journey through five places that shaped me.",
    exploreCta: "Start with Pin 01",
    skipCta: "Skip to the next chapter",
    instruction: "Click the numbered pins to explore.",
    mapLabel: "Hanoi",
    mapEyebrow: "Hanoi Map",
    mapBackdropData: "/data/hanoi-river.json",
    pins: [
      placeholderPin(1, 18, 62, "Hanoi", { lat: 21.0285, lon: 105.8542 }), // Hoan Kiem Lake
      placeholderPin(2, 44, 46, "Hanoi", { lat: 21.0355, lon: 105.8495 }), // Old Quarter
      placeholderPin(3, 70, 28, "Hanoi", { lat: 21.048, lon: 105.839 }),   // West Lake
      placeholderPin(4, 30, 22, "Hanoi", { lat: 21.0413, lon: 105.858 }),  // Long Bien Bridge
      placeholderPin(5, 58, 74, "Hanoi", { lat: 21.027, lon: 105.8355 }),  // Temple of Literature
    ],
    checkpoint: {
      heading: "You're at the end of this chapter.",
      subheading: "What would you like to do next?",
      continueLabel: "Continue to the United States",
      stayLabel: "Keep exploring Hanoi",
    },
  },
  {
    id: "united-states",
    countryId: "840",
    regionLabel: "United States",
    globeTarget: { lat: 39.5, lon: -98.35 },
    eyebrow: "Chapter 02 · Becoming",
    title: "[United States heading placeholder]",
    tagline: "[One-line placeholder intro.]",
    intro: "[One-line placeholder intro.]",
    transitionLine: "Follow the main route or select a location.",
    exploreCta: "Start the chapter",
    skipCta: "Explore freely",
    instruction: "Follow the main route or select a location.",
    mapLabel: "United States",
    mapEyebrow: "United States Map",
    pins: [
      placeholderPin(1, 22, 60, "United States"),
      placeholderPin(2, 68, 42, "United States"),
    ],
    photoMarkers: [
      { id: "us-marker-1", x: 40, y: 30, image: placeholderImages[2], label: "Placeholder moment" },
      { id: "us-marker-2", x: 82, y: 66, image: placeholderImages[4], label: "Placeholder moment" },
    ],
    checkpoint: {
      heading: "You're at the end of this chapter.",
      subheading: "What would you like to do next?",
      continueLabel: "Return to the globe",
      stayLabel: "Keep exploring the U.S.",
    },
  },
];

export const heroCopy = {
  eyebrow: "A Life in Places",
  heading: "A Life\nin Places",
  subheading: "The places that raised me, challenged me, and shaped who I am becoming.",
  cta: "Begin in Vietnam",
  dragHint: "Drag to explore",
};

export const finalGlobeCopy = {
  heading: "Still Becoming",
  paragraph: "I began in Hanoi, but no single place can explain who I am now. Each one introduced me to another version of myself. Home is every place that changed me — and every person who made those places matter.",
  ctas: [
    { label: "Explore the globe again", style: "solid" as const, action: "restart" as const },
    { label: "See my work", style: "outline" as const, href: "/projects" },
    { label: "Connect with me", style: "outline" as const, href: "/connect" },
  ],
};

export const routeArc = {
  from: chapters[0].globeTarget,
  to: chapters[1].globeTarget,
};
