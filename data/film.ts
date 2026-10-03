/**
 * Content for the film home page — My's real photos and the order they appear in. Captions only
 * describe what's in the frame. Projects are referenced by slug from data/projects.ts.
 */

/** `pos` keeps faces in frame when a photo is cropped; `portrait` marks tall photos so viewers show them upright */
export type FilmPhoto = { src: string; caption: string; alt: string; pos?: string; portrait?: boolean };

export const PHOTOS = {
  nyc: { src: "/images/IMG_7605.JPG", caption: "NYC", alt: "My on a New York street" },
  beach: { src: "/images/IMG_3794.JPG", caption: "blue hour at the beach", alt: "My at the beach at blue hour" },
  matcha: { src: "/images/IMG_7729.JPG", caption: "matcha, city sidewalk", alt: "My holding a matcha on a city sidewalk" },
  mirror: { src: "/images/IMG_4610.JPG", caption: "behind the camera", alt: "My taking a photo in a mirror" },
  glow: { src: "/images/IMG_9501.JPG", caption: "golden hour, indoors", alt: "My in warm light" },
  win: { src: "/involvements/dsi-5.jpg", caption: "Best Finance Project · CartCoach", alt: "The CartCoach team holding the Best Finance Project sign" },
  dsi: { src: "/involvements/dsi.jpg", caption: "DSI Symposium 2026", alt: "Group photo at the DSI Symposium 2026" },
  dsiTower: { src: "/involvements/dsi-10.jpg", caption: "DSI at Century Tower", alt: "DSI members in front of Century Tower" },
  tet: { src: "/involvements/visa-3.jpg", caption: "Tết with VISA", alt: "Friends celebrating Tết with VISA" },
  visa: { src: "/involvements/visa-2.jpg", caption: "VISA night", alt: "VISA event night" },
  ps: { src: "/involvements/product-space.jpg", caption: "Product Space", alt: "Product Space group photo" },
  sase: { src: "/involvements/sase-mentor.jpg", caption: "SASE", alt: "SASE friends at night" },
  shellhacks: { src: "/images/shellhacks-team.jpg", caption: "ShellHacks, transPEAKtation team", alt: "Four teammates at ShellHacks holding laptops that show the transPEAKtation architecture diagram and title screen", pos: "50% 55%" },
  booth: { src: "/images/photobooth.jpg", caption: "photo booth", alt: "Black and white photo booth strip of four poses", pos: "50% 30%", portrait: true },
  kitchen: { src: "/images/friends-night-in.jpg", caption: "friends, night in", alt: "Four friends posing in a kitchen, one standing behind making a heart with her hands", pos: "50% 40%" },
  palms: { src: "/images/palms-sunflare.jpg", caption: "palm trees and sun flare", alt: "Leaning on a curb on a street lined with tall palm trees, sun flaring above", pos: "50% 62%", portrait: true },
  coke: { src: "/images/coca-cola-museum.jpg", caption: "cheers at the Coca-Cola museum", alt: "Posing with a bronze statue that holds out a cup, in front of red Coca-Cola signs", pos: "50% 55%", portrait: true },
} satisfies Record<string, FilmPhoto>;

export type PhotoKey = keyof typeof PHOTOS;

/** a frame is a photo or a project — the strip and grid mix both on purpose */
export type FrameRef = { photo: PhotoKey } | { project: string };
export type GridFilter = "projects" | "leadership" | "travel" | "friends" | "random";

/** "lately, on film" — life and work, interleaved */
export const LATELY: FrameRef[] = [
  { photo: "nyc" }, { photo: "matcha" }, { project: "transpeaktation" }, { photo: "shellhacks" }, { photo: "mirror" }, { photo: "win" }, { photo: "palms" }, { photo: "beach" },
  { project: "kite" }, { photo: "tet" }, { photo: "booth" }, { photo: "dsi" }, { project: "cartcoach" }, { photo: "glow" }, { photo: "kitchen" }, { photo: "ps" },
  { photo: "coke" }, { project: "wnba-simulator" }, { photo: "sase" },
];

/** "more on film" — the filterable grid */
export const MORE: (FrameRef & { filter: GridFilter; tall?: boolean })[] = [
  { photo: "nyc", filter: "travel", tall: true }, { photo: "beach", filter: "travel" }, { photo: "dsi", filter: "leadership" },
  { project: "transpeaktation", filter: "projects" }, { photo: "tet", filter: "friends", tall: true }, { photo: "matcha", filter: "random" },
  { photo: "win", filter: "projects" }, { photo: "sase", filter: "friends" }, { project: "kite", filter: "projects" },
  { photo: "ps", filter: "leadership", tall: true }, { photo: "mirror", filter: "random" }, { photo: "dsiTower", filter: "leadership" },
  { photo: "visa", filter: "friends" }, { project: "campus-compass", filter: "projects" }, { photo: "glow", filter: "random" },
  { project: "wnba-simulator", filter: "projects" },
  { photo: "shellhacks", filter: "projects" }, { photo: "booth", filter: "random", tall: true }, { photo: "kitchen", filter: "friends" },
  { photo: "palms", filter: "travel", tall: true }, { photo: "coke", filter: "travel" },
];

export const FEATURED = ["transpeaktation", "cartcoach", "kite"];

/** the rotating "currently:" note */
export const CURRENTLY = [
  "probably building something I don't need",
  "somewhere between Figma and FastAPI",
  "drinking matcha",
  "applying to PM internships",
];
