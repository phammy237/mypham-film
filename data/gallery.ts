/**
 * Photos for the Film page: a few up front, then the rest as a collage. Sizes are the real pixel sizes, so tall and wide
 * photos keep their shape. Captions only describe what's in the frame (the home page's captions are reused).
 * Generated from public/images and public/involvements; edit captions here.
 */
export type GalleryPhoto = { src: string; caption: string; alt: string; w: number; h: number; pos?: string };

export const FIRST_FRAMES: GalleryPhoto[] = [
  { src: "/images/IMG_7605.JPG", caption: "NYC", alt: "My on a New York street", w: 2000, h: 1333 },
  { src: "/images/shellhacks-team.jpg", caption: "transPEAKtation at ShellHacks", alt: "The transPEAKtation team at ShellHacks holding laptops that show the project's architecture diagram and title screen", w: 1800, h: 1294, pos: "50% 55%" },
  { src: "/images/la-summer-2026.jpg", caption: "LA, summer 2026", alt: "Leaning on a curb on a street lined with tall palm trees in Los Angeles, sun flaring above", w: 1717, h: 2576, pos: "50% 62%" },
  { src: "/images/atlanta-coca-cola.jpg", caption: "Atlanta, Coca-Cola museum", alt: "In Atlanta at the Coca-Cola museum, posing with a bronze statue that holds out a cup in front of red Coca-Cola signs", w: 1932, h: 2576, pos: "50% 55%" },
  { src: "/images/photobooth-nyc.jpg", caption: "photo booth, NYC", alt: "Black and white photo booth strip of four poses, taken in New York City", w: 1858, h: 2576, pos: "50% 30%" },
  { src: "/images/IMG_7729.JPG", caption: "matcha, city sidewalk", alt: "My holding a matcha on a city sidewalk", w: 1320, h: 2000 },
];

export const COLLAGE: GalleryPhoto[] = [
  { src: "/involvements/dsi.jpg", caption: "DSI Symposium 2026", alt: "Group photo at the DSI Symposium 2026", w: 1800, h: 1200 },
  { src: "/involvements/product-space-2.jpg", caption: "Product Space", alt: "Product Space photo", w: 6000, h: 4000 },
  { src: "/involvements/product-space-3.jpg", caption: "Product Space", alt: "Product Space photo", w: 1179, h: 907 },
  { src: "/images/IMG_9501.JPG", caption: "golden hour, indoors", alt: "My in warm light", w: 1179, h: 2076 },
  { src: "/images/IMG_3794.JPG", caption: "blue hour at the beach", alt: "My at the beach at blue hour", w: 1333, h: 2000 },
  { src: "/involvements/product-space.jpg", caption: "Product Space", alt: "Product Space group photo", w: 1280, h: 960 },
  { src: "/involvements/dsi-10.jpg", caption: "DSI at Century Tower", alt: "DSI members in front of Century Tower", w: 2767, h: 3662 },
  { src: "/involvements/visa.jpg", caption: "VISA", alt: "VISA photo", w: 2556, h: 1179 },
  { src: "/images/IMG_4610.JPG", caption: "behind the camera", alt: "My taking a photo in a mirror", w: 2000, h: 1333 },
  { src: "/involvements/visa-2.jpg", caption: "VISA night", alt: "VISA event night", w: 1179, h: 767 },
  { src: "/involvements/visa-3.jpg", caption: "Tết with VISA", alt: "Friends celebrating Tết with VISA", w: 4000, h: 3000 },
  { src: "/involvements/visa-5.jpg", caption: "VISA", alt: "VISA photo", w: 1179, h: 774 },
  { src: "/images/sase-mentor-mentee.jpg", caption: "SASE mentor and mentee", alt: "A SASE mentor and mentees posing together in a kitchen, one standing behind making a heart with her hands", w: 2576, h: 1757, pos: "50% 40%" },
  { src: "/involvements/sase-mentor.jpg", caption: "SASE", alt: "SASE friends at night", w: 1179, h: 1559 },
  { src: "/involvements/sase-fundraising.jpg", caption: "SASE fundraising", alt: "SASE fundraising photo", w: 3968, h: 2232 },
  { src: "/involvements/dsi-2.jpg", caption: "DSI", alt: "DSI photo", w: 1800, h: 1350 },
  { src: "/involvements/dsi-3.jpg", caption: "DSI", alt: "DSI photo", w: 1800, h: 1355 },
  { src: "/involvements/dsi-4.jpg", caption: "DSI", alt: "DSI photo", w: 1800, h: 1350 },
  { src: "/involvements/dsi-5.jpg", caption: "Best Finance Project · CartCoach", alt: "The CartCoach team holding the Best Finance Project sign", w: 6000, h: 4000 },
  { src: "/involvements/dsi-6.jpg", caption: "DSI", alt: "DSI photo", w: 4532, h: 2587 },
  { src: "/involvements/dsi-7.jpg", caption: "DSI", alt: "DSI photo", w: 786, h: 1024 },
  { src: "/involvements/dsi-8.jpg", caption: "DSI", alt: "DSI photo", w: 1206, h: 904 },
  { src: "/involvements/dsi-9.jpg", caption: "DSI", alt: "DSI photo", w: 4284, h: 5712 },
];

/** The Film page sorts every photo into a "roll". Each roll is drawn as a film canister (colour + ISO) that unrolls its strip. */
export type Roll = { id: string; title: string; blurb: string; speed: string; color: string; srcs: string[] };
export const ROLLS: Roll[] = [
  { id: "places", title: "places", speed: "100", color: "#F4D35E", blurb: "New York, LA, Atlanta and the beach.",
    srcs: ["/images/IMG_7605.JPG", "/images/photobooth-nyc.jpg", "/images/la-summer-2026.jpg", "/images/atlanta-coca-cola.jpg", "/images/IMG_3794.JPG"] },
  { id: "everyday", title: "everyday", speed: "200", color: "#8DBCE0", blurb: "Matcha, mirrors and golden hour.",
    srcs: ["/images/IMG_7729.JPG", "/images/IMG_4610.JPG", "/images/IMG_9501.JPG"] },
  { id: "hackathons", title: "hackathons", speed: "800", color: "#FBE7A1", blurb: "ShellHacks and the Best Finance Project win.",
    srcs: ["/images/shellhacks-team.jpg", "/involvements/dsi-5.jpg"] },
  { id: "orgs", title: "student orgs", speed: "400", color: "#E8DDC7", blurb: "DSI, VISA, SASE and Product Space: events, mentors, fundraising and the people.",
    srcs: ["/involvements/dsi.jpg", "/involvements/dsi-2.jpg", "/involvements/dsi-3.jpg", "/involvements/dsi-4.jpg", "/involvements/dsi-6.jpg", "/involvements/dsi-7.jpg", "/involvements/dsi-8.jpg", "/involvements/dsi-9.jpg", "/involvements/dsi-10.jpg",
      "/involvements/visa.jpg", "/involvements/visa-2.jpg", "/involvements/visa-3.jpg", "/involvements/visa-5.jpg",
      "/involvements/sase-mentor.jpg", "/involvements/sase-fundraising.jpg", "/images/sase-mentor-mentee.jpg", "/involvements/product-space.jpg", "/involvements/product-space-2.jpg", "/involvements/product-space-3.jpg"] },
];

export const ALL_PHOTOS: GalleryPhoto[] = [...FIRST_FRAMES, ...COLLAGE];
export const photosOf = (r: Roll): GalleryPhoto[] => r.srcs.map((src) => ALL_PHOTOS.find((p) => p.src === src)).filter((p): p is GalleryPhoto => !!p);
