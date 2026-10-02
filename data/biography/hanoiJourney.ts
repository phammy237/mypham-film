export type GeoPoint = { lat: number; lon: number };

export type HanoiJourneySubsection = {
  title: string;
  description: string;
};

export type HanoiJourneyPin = {
  id: string;
  /** short label used on the map itself */
  number: number;
  /** short map label, e.g. "Home" */
  title: string;
  /** short map subtitle, e.g. "Where curiosity began" */
  subtitle: string;
  /** age range during this chapter, e.g. "6–8" */
  ageRange: string;
  coordinates: GeoPoint;
  /** optional — omit until a real photo of this specific place exists; never a generic stand-in */
  image?: string;
  preview: {
    /** full official name, shown in the preview card */
    title: string;
    description: string;
  };
  /** full backstory paragraphs, for the future expanded photo-story panel */
  backstory: string[];
  /** grouped sub-stories, currently only used by the last chapter */
  subsections?: HanoiJourneySubsection[];
  /** photo shot list for when real photos are ready to drop in */
  photoIdeas: string[];
  /** real photos, shown as a gallery in the expanded story modal once available */
  gallery?: string[];
  /** shown in the preview card's image slot and the modal's media area whenever neither `image`
   *  nor `gallery` has a real photo yet — a designed placeholder, never a borrowed/wrong photo or a
   *  broken-image icon. Omit once real media exists; JourneyMediaPlaceholder is never shown
   *  alongside real media, only in its place. */
  mediaPlaceholder?: { eyebrow: string; description: string };
};

export const hanoiCheckpointCopy = {
  eyebrow: "01 / Hanoi — Complete",
  heading: "Roots.",
  paragraph: "This city gave me the curiosity to imagine a life beyond it.",
  continueCta: "Continue",
  stayCta: "Stay and explore Hanoi",
  skipCta: "Skip directly to the United States",
};

export const notYetInterludeCopy = {
  heading: "For Years, the Answer Was “Not Yet.”",
  paragraph:
    "I began applying to boarding schools in ninth grade and received scholarship offers each year. My parents believed in me, but they were afraid I was too young to live across the world alone.",
  resolution: "Eventually, “not yet” became “now.”",
  cta: "Cross the ocean",
};

export const hanoiJourneyCopy = {
  eyebrow: "Chapter 01 · Roots",
  heading: "Hanoi Journey",
  instruction: "Select a numbered pin to open a chapter.",
};

export const hanoiJourneyPins: HanoiJourneyPin[] = [
  {
    id: "home-early-childhood",
    number: 1,
    title: "Home",
    subtitle: "Where curiosity began",
    ageRange: "0–6",
    // Deliberately approximate (neighborhood-level, ~1km, rounded to 2 decimal places) — the
    // previous 4-decimal value had street-level precision, precise enough to identify a specific
    // residence. Rounded in place, not re-geocoded, so it stays truthfully in the same part of
    // Hanoi without pinpointing a home address. Do not increase this coordinate's precision.
    coordinates: { lat: 21.01, lon: 105.82 },
    image: "/biography/home/home-1.jpg",
    preview: {
      title: "Home & Early Childhood",
      description: "Before school, learning began at home through mathematics, music, art, and the freedom to explore.",
    },
    backstory: [
      "My earliest memories of learning are closely tied to my mother. She had competed in mathematics at the national level, and numbers became part of our daily routine long before I understood that they were supposed to be difficult.",
      "On the way to and from school, we counted prime numbers and played number games together. By the time I was around five, she was already teaching me how to solve simple equations using x and y.",
      "My parents also encouraged me to try almost everything. I took lessons in piano, violin, ballet, golf, tennis, and art, often moving between activities before I was old enough to fully understand why I had been enrolled in them.",
      "This was also where the story of my name began. I was originally named Như Anh, but at a piano competition when I was five, I looked up to a girl named Hà My and decided to name myself after her. I apparently accepted the new name immediately and refused to respond when anyone called me Như Anh.",
      "Even as a child, I seemed determined to decide who I was.",
    ],
    photoIdeas: [
      "Childhood photo with your mother",
      "Piano competition or piano lesson",
      "Early math notebook",
      "Family photo",
      "Art or ballet photo",
      "A handwritten “Hà My”",
    ],
    gallery: [
      "/biography/home/home-1.jpg",
      "/biography/home/home-2.jpg",
      "/biography/home/home-3.jpg",
      "/biography/home/home-4.jpg",
      "/biography/home/home-5.jpg",
      "/biography/home/home-6.mp4",
      "/biography/home/home-7.mp4",
    ],
  },
  {
    id: "nam-thanh-cong",
    number: 2,
    title: "Nam Thành Công",
    subtitle: "My first classroom",
    ageRange: "6–8",
    coordinates: { lat: 21.0168, lon: 105.8112 },
    image: "/biography/nam-thanh-cong/nam-thanh-cong-1.png",
    preview: {
      title: "Nam Thành Công Primary School",
      description: "The first formal chapter of a school journey that would eventually take me far beyond Hanoi.",
    },
    backstory: [
      "I spent the first two years of primary school at Nam Thành Công.",
      "It was the beginning of my formal education, but at that age, school was still mostly a world of routines, uniforms, classmates, and small discoveries. I was learning how to become a student while still carrying all the curiosity and activities my parents had introduced at home.",
      "When I was seven, I was selected to act in a small part in a movie that was broadcasted on national television, a strange and exciting detour from the routine of classrooms and uniforms.",
      "Although this chapter was relatively short, it became the starting point of a much longer journey. After two years, I transferred to Ngôi Sao Hà Nội, where school became more competitive and my academic world began expanding.",
    ],
    photoIdeas: ["School entrance", "Uniform photo", "Class picture", "Early handwriting or schoolwork", "Childhood friends"],
    gallery: [
      "/biography/nam-thanh-cong/nam-thanh-cong-1.png",
      "/biography/nam-thanh-cong/nam-thanh-cong-movie.mp4",
    ],
  },
  {
    id: "ngoi-sao-ha-noi",
    number: 3,
    title: "Ngôi Sao Hà Nội",
    subtitle: "Learning to reach higher",
    ageRange: "8–10",
    coordinates: { lat: 21.0098, lon: 105.8003 },
    // No real photo of Ngôi Sao Hà Nội exists yet — /IMG_4610.JPG was a wrong/demo stock photo
    // (not an actual photo of this school) and has been removed rather than left in place. Shows
    // the designed JourneyMediaPlaceholder until a real photo replaces this comment + adds `image`/
    // `gallery` back.
    mediaPlaceholder: { eyebrow: "Photo Coming Soon", description: "A memory for this chapter will be added here." },
    preview: {
      title: "Ngôi Sao Hà Nội Primary School",
      description: "Three years of scholarships, selective classes, and my first academic experiences outside Vietnam.",
    },
    backstory: [
      "After transferring to Ngôi Sao Hà Nội, I entered a more demanding academic environment.",
      "I received scholarships during all three years I attended and was consistently placed in A0, the school’s selective mathematics and English class. Those years strengthened the part of me that loved challenge, competition, and the satisfaction of understanding something difficult.",
      "I also traveled to Singapore and Malaysia for mathematics competitions. These were some of my first experiences seeing education take me beyond my own city and country.",
      "At the same time, I attended an American elementary program in Vietnam and began learning English more seriously. Language gradually became another form of access—not only to school material, but to a larger world I had not yet entered.",
    ],
    photoIdeas: [
      "Scholarship certificates",
      "A0 class photo",
      "Math competition photos",
      "Singapore and Malaysia",
      "Medals or awards",
      "American school or English-learning photos",
    ],
    gallery: [
      "/biography/ngoi-sao-ha-noi/ngoi-sao-ha-noi-1.jpg",
      "/biography/ngoi-sao-ha-noi/ngoi-sao-ha-noi-2.jpg",
    ],
  },
  {
    id: "cau-giay-secondary",
    number: 4,
    title: "Cầu Giấy",
    subtitle: "A bigger canvas",
    ageRange: "10–14",
    coordinates: { lat: 21.03, lon: 105.798 },
    // No real photo of Cầu Giấy exists yet — deliberately omitted rather than reusing the generic
    // stock photo (/IMG_7605.JPG) other pages use as decoration. Shows the designed
    // JourneyMediaPlaceholder in the meantime. To add real photos later: drop files in
    // public/biography/cau-giay/ (matching the flat convention every other Hanoi pin already uses —
    // home/, nam-thanh-cong/, ngoi-sao-ha-noi/, nguyen-hue/), set `image`/`gallery` here, and remove
    // `mediaPlaceholder` — no component changes needed either way.
    mediaPlaceholder: { eyebrow: "Memories In Progress", description: "Art, music, languages, and a bigger canvas." },
    preview: {
      title: "Cầu Giấy Secondary School",
      description: "Where art, music, languages, friendship, and learning began blending together.",
    },
    backstory: [
      "At Cầu Giấy Secondary School, my interests became much more creative.",
      "I had always enjoyed drawing, but I began experimenting with a wider range of materials and techniques. Pencil and crayons turned into watercolor, acrylic, oil painting, pointillism, fashion design, and large A0 works.",
      "Each new medium gave me another way to express an idea. Art became less of an extracurricular activity and more of a language of its own.",
      "I also developed a stronger interest in learning new languages and joined the school band as a vocalist. Singing gave me another kind of confidence, while the friendships I formed made this stage of school feel less centered on achievement and more connected to people.",
      "Cầu Giấy was where I began understanding that being analytical and being creative were never opposites. I did not have to fit into only one category.",
    ],
    photoIdeas: [
      "Pencil and crayon pieces",
      "Watercolor",
      "Oil and acrylic work",
      "Pointillism",
      "A0 artwork",
      "Fashion sketches",
      "Band performance",
      "Friend photos",
    ],
  },
  {
    id: "nguyen-hue-gifted",
    number: 5,
    title: "Nguyễn Huệ",
    subtitle: "Beyond the classroom",
    ageRange: "14–17",
    coordinates: { lat: 20.9637, lon: 105.7658 },
    image: "/biography/nguyen-hue/nguyen-hue-3.jpg",
    preview: {
      title: "Nguyễn Huệ School for the Gifted",
      description: "Where school expanded into projects, leadership, service, entrepreneurship, and friendships across Hanoi.",
    },
    backstory: [
      "At Nguyễn Huệ School for the Gifted, my world expanded far beyond the classroom.",
      "I entered a more academically demanding environment, but much of my growth came from the projects and communities I joined throughout Hanoi. I became involved in student organizations, humanitarian initiatives, fundraising events, concerts, entrepreneurship, marketing, and large-scale school programs.",
      "Through C-Shirt, I explored sustainability and entrepreneurship by researching how coffee waste could be transformed into fabric, collaborating with designers and manufacturers, creating a brand, recruiting volunteers, and planning marketing and costs.",
      "Through projects such as Ngăn Bàn, H.E.A.R.T., Trash Again, Đồng Chí, CHẠM22, and High School Help Kit, I learned how to train teams, work with sponsors, organize events, raise funds, and support communities beyond my own school.",
      "I also interned in marketing, worked as an English tutor, served as a student ambassador, and met people from schools throughout the city.",
      "This was the chapter where I stopped simply participating in opportunities and began helping create them.",
      "It was also during these years that I kept applying to boarding schools abroad. I had received scholarship offers since ninth grade, but my parents were not yet ready to send me away. They worried that I was too young to take care of myself.",
      "For several years, the answer was not yet.",
      "Eventually, it became yes.",
    ],
    subsections: [
      { title: "Building", description: "C-Shirt, Bosch, marketing, entrepreneurship" },
      { title: "Leading", description: "Ngăn Bàn, Inspiration Day, large teams and events" },
      { title: "Serving", description: "H.E.A.R.T., Trash Again, Đồng Chí, CHẠM22, tutoring" },
      { title: "Connecting", description: "Friends, students across Hanoi, citywide projects and events" },
    ],
    photoIdeas: [
      "Nguyễn Huệ campus",
      "C-Shirt work",
      "Project teams",
      "Basketball tournament",
      "Volunteer activities",
      "Concerts",
      "Bosch",
      "Friend groups",
      "Boarding-school application or acceptance material",
    ],
    gallery: [
      "/biography/nguyen-hue/nguyen-hue-1.jpg",
      "/biography/nguyen-hue/nguyen-hue-2.jpg",
      "/biography/nguyen-hue/nguyen-hue-3.jpg",
      "/biography/nguyen-hue/nguyen-hue-4.jpg",
      "/biography/nguyen-hue/nguyen-hue-5.jpg",
      "/biography/nguyen-hue/nguyen-hue-6.jpg",
      "/biography/nguyen-hue/nguyen-hue-7.jpg",
      "/biography/nguyen-hue/nguyen-hue-8.jpg",
      "/biography/nguyen-hue/nguyen-hue-9.jpg",
      "/biography/nguyen-hue/nguyen-hue-10.jpg",
      "/biography/nguyen-hue/nguyen-hue-11.jpg",
      "/biography/nguyen-hue/nguyen-hue-12.jpg",
      "/biography/nguyen-hue/nguyen-hue-13.jpg",
      "/biography/nguyen-hue/nguyen-hue-14.jpg",
      "/biography/nguyen-hue/nguyen-hue-15.jpg",
      "/biography/nguyen-hue/nguyen-hue-16.jpg",
      "/biography/nguyen-hue/nguyen-hue-17.jpg",
      "/biography/nguyen-hue/nguyen-hue-18.jpg",
      "/biography/nguyen-hue/nguyen-hue-19.jpg",
      "/biography/nguyen-hue/nguyen-hue-20.jpg",
    ],
  },
];
