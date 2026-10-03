/**
 * Photos for the Film page: a few up front, then the rest as a collage. Sizes are the real pixel sizes, so tall and wide
 * photos keep their shape. Captions only describe what's in the frame (the home page's captions are reused).
 * Generated from public/images and public/involvements; edit captions here.
 */
export type GalleryPhoto = { src: string; /** short label shown under the photo (falls back to the caption) */ short?: string; caption: string; alt: string; w: number; h: number; pos?: string };

export const FIRST_FRAMES: GalleryPhoto[] = [
  { src: "/images/IMG_7605.JPG", short: "NYC", caption: "NYC", alt: "My on a New York street", w: 2000, h: 1333 },
  { src: "/images/shellhacks-team.jpg", caption: "transPEAKtation at ShellHacks", alt: "The transPEAKtation team at ShellHacks holding laptops that show the project's architecture diagram and title screen", w: 1800, h: 1294, pos: "50% 55%" },
  { src: "/images/la-summer-2026.jpg", short: "LAX", caption: "LA, summer 2026", alt: "Leaning on a curb on a street lined with tall palm trees in Los Angeles, sun flaring above", w: 1717, h: 2576, pos: "50% 62%" },
  { src: "/images/atlanta-coca-cola.jpg", short: "ATL", caption: "Atlanta, Coca-Cola museum", alt: "In Atlanta at the Coca-Cola museum, posing with a bronze statue that holds out a cup in front of red Coca-Cola signs", w: 1932, h: 2576, pos: "50% 55%" },
  { src: "/images/photobooth-nyc.jpg", short: "NYC", caption: "photo booth, NYC", alt: "Black and white photo booth strip of four poses, taken in New York City", w: 1858, h: 2576, pos: "50% 30%" },
  { src: "/images/IMG_7729.JPG", short: "matcha", caption: "matcha, city sidewalk", alt: "My holding a matcha on a city sidewalk", w: 1320, h: 2000 },
];

export const COLLAGE: GalleryPhoto[] = [
  { src: "/involvements/dsi.jpg", caption: "DSI Symposium 2026", alt: "Group photo at the DSI Symposium 2026", w: 1800, h: 1200 },
  { src: "/involvements/product-space-2.jpg", caption: "Product Space", alt: "Product Space photo", w: 6000, h: 4000 },
  { src: "/involvements/product-space-3.jpg", caption: "Product Space", alt: "Product Space photo", w: 1179, h: 907 },
  { src: "/images/IMG_9501.JPG", short: "golden hour", caption: "golden hour, indoors", alt: "My in warm light", w: 1179, h: 2076 },
  { src: "/images/IMG_3794.JPG", short: "St. Augustine", caption: "Blue hour at the beach, St. Augustine", alt: "My at the beach at blue hour", w: 1333, h: 2000 },
  { src: "/involvements/product-space.jpg", caption: "Product Space", alt: "Product Space group photo", w: 1280, h: 960 },
  { src: "/involvements/dsi-10.jpg", caption: "DSI at Century Tower", alt: "DSI members in front of Century Tower", w: 2767, h: 3662 },
  { src: "/involvements/visa.jpg", caption: "VISA", alt: "VISA photo", w: 2556, h: 1179 },
  { src: "/images/IMG_4610.JPG", short: "mirror", caption: "behind the camera", alt: "My taking a photo in a mirror", w: 2000, h: 1333 },
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
  { src: "/images/friends-mirror-bedroom.jpg", caption: "Mirror selfie", alt: "Two friends in a dim bedroom mirror selfie, one in a dark graphic tee and a chain necklace, the other holding a camera up to her face", w: 1717, h: 2576 },
  { src: "/images/friends-dinner-pose.jpg", caption: "Dinner, chins up", alt: "Two friends at a restaurant booth in front of an exposed brick wall, both resting their chins on their hands", w: 2576, h: 1717 },
  { src: "/images/friends-night-selfie.jpg", caption: "Night out", alt: "A smiling selfie of two friends at night with city lights glowing behind them", w: 2576, h: 1717 },
  { src: "/images/friends-gold-mirror.jpg", caption: "Gold mirror", alt: "Two friends in black dresses taking a mirror selfie with a camera in an antique gold frame", w: 2576, h: 1717 },
  { src: "/images/friends-jersey.jpg", caption: "House party pose", alt: "Two friends posing in a hallway at a house party, one in a red Spain jersey and glasses, the other with her hand resting on his head", w: 2576, h: 1717 },
  { src: "/images/friends-chicago-bean.jpg", caption: "The Bean", alt: "Two friends posing in front of the mirrored Cloud Gate sculpture on a sunny day", w: 1717, h: 2576 },
  { src: "/images/friends-graduation.jpg", caption: "Graduation day", alt: "A big group of friends gathered around a graduate holding bouquets, in front of the Stephen C. O’Connell Center", w: 2576, h: 1717 },
  { src: "/images/friends-night-selfie-2.jpg", caption: "Night selfie", alt: "Two friends in a close selfie against a dark navy sky, one with her hand resting on her head", w: 1717, h: 2576 },
  { src: "/images/friends-sunny-day.jpg", caption: "Sunny day out", alt: "Two friends taking a sunny selfie in a crowd, with tents and trees behind them", w: 1536, h: 2048 },
  { src: "/images/friends-birthday-cake.jpg", caption: "Birthday cake", alt: "Two friends on a patterned sofa holding a small cartoon cake next to a white cake with candles", w: 2576, h: 1881 },
  { src: "/images/friends-cross-arms.jpg", caption: "Cross-arm pose", alt: "Two friends striking a matching pose with crossed arms and pointed fingers against a brown wall", w: 2576, h: 1717 },
  { src: "/images/friends-four-mirror.jpg", caption: "Four in the mirror", alt: "Four friends in a mirror selfie, one holding a camera with a red strap while the others cover their faces and pose", w: 645, h: 975 },
  { src: "/images/friends-red-gowns.jpg", caption: "Red caps and gowns", alt: "A large group of graduates in red caps and gowns, some wearing gold medals, standing on a wooden staircase", w: 2048, h: 1365 },
  { src: "/images/friends-dressed-up.jpg", caption: "Dressed up", alt: "Five friends in formal dresses posing close together in a dim hall, with a piano on the right", w: 2576, h: 1932 },
  { src: "/images/friends-cute-mirror.jpg", caption: "You look cute", alt: "Two friends in a wavy lit mirror with “you look cute” written above, one holding a pink camera and covering her mouth", w: 2576, h: 1932 },
  { src: "/images/friends-jenga.jpg", caption: "Jenga at the café", alt: "Three friends sitting at a table behind a tall Jenga tower and two drinks, in a warmly lit room with posters on the wall", w: 2576, h: 1743 },
  { src: "/images/friends-jerseys.jpg", caption: "Jersey trio", alt: "Three friends in soccer jerseys with their arms crossed, posing in a small hallway", w: 2576, h: 1932 },
  { src: "/images/places-met-nyc.jpg", short: "NYC", caption: "The Met, NYC", alt: "A woman in a satin dress standing in a long museum gallery with a coffered arched ceiling and sculptures along the walls", w: 1717, h: 2576 },
  { src: "/images/places-la-bookstore.jpg", short: "LAX", caption: "Bookstore in LA", alt: "A woman in a light blue top holding an open book between tall wooden shelves in a dimly lit bookstore", w: 1717, h: 2576 },
  { src: "/images/places-nyc-film.jpg", short: "NYC", caption: "NYC, on film", alt: "A woman making a peace sign on a tree-lined New York street in dappled sunlight, shot on film", w: 2576, h: 1708 },
  { src: "/images/places-san-diego-crystal-pier.jpg", short: "SD", caption: "San Diego, Crystal Pier", alt: "The Crystal Pier archway with palm trees against a blue sky", w: 1653, h: 2576 },
  { src: "/images/everyday-wish.jpg", short: "wish", caption: "Making a wish", alt: "A woman with her eyes closed and hands pressed together over a dessert with a lit candle, in front of an exposed brick wall", w: 1717, h: 2576 },
  { src: "/images/everyday-matcha.jpg", short: "matcha", caption: "Iced matcha at the restaurant", alt: "A woman holding an iced green drink in both hands at a wooden table in a busy, warmly lit restaurant", w: 2576, h: 1717 },
  { src: "/images/everyday-rooftop-dinner.jpg", short: "dinner", caption: "Rooftop dinner with a view", alt: "A woman resting her head on her hand at a rooftop table with patio heaters, plates of food and a city view behind her", w: 1717, h: 2576 },
  { src: "/images/everyday-navy-gown.jpg", short: "dressed up", caption: "In a navy satin gown on the steps", alt: "A woman in a navy satin gown twirling her hair beside a railing on brick steps, with trees and a brick building behind her", w: 1717, h: 2576 },
  { src: "/images/everyday-night-out.jpg", short: "night out", caption: "A wave across the table", alt: "A woman waving, slightly blurred, at a booth in a dimly lit bar with string lights and a lit bar behind her", w: 2576, h: 1717 },
];

/** The Film page sorts every photo into a "roll". Each roll is drawn as a film canister (colour + ISO) that unrolls its strip. */
export type Roll = { id: string; title: string; blurb: string; speed: string; color: string; srcs: string[] };
export const ROLLS: Roll[] = [
  { id: "places", title: "places", speed: "100", color: "#F4D35E", blurb: "New York, LA, Atlanta and the beach.",
    srcs: ["/images/IMG_7605.JPG", "/images/photobooth-nyc.jpg", "/images/la-summer-2026.jpg", "/images/atlanta-coca-cola.jpg", "/images/IMG_3794.JPG", "/images/places-met-nyc.jpg", "/images/places-la-bookstore.jpg", "/images/places-nyc-film.jpg", "/images/places-san-diego-crystal-pier.jpg"] },
  { id: "everyday", title: "everyday", speed: "200", color: "#8DBCE0", blurb: "Matcha, dinners, mirrors and golden hour.",
    srcs: ["/images/IMG_7729.JPG", "/images/IMG_4610.JPG", "/images/IMG_9501.JPG", "/images/everyday-wish.jpg", "/images/everyday-matcha.jpg", "/images/everyday-rooftop-dinner.jpg", "/images/everyday-navy-gown.jpg", "/images/everyday-night-out.jpg"] },
  { id: "orgs", title: "student orgs", speed: "400", color: "#E8DDC7", blurb: "DSI, VISA, SASE and Product Space: events, mentors, fundraising and the people.",
    srcs: ["/involvements/dsi.jpg", "/involvements/dsi-2.jpg", "/involvements/dsi-3.jpg", "/involvements/dsi-4.jpg", "/involvements/dsi-6.jpg", "/involvements/dsi-8.jpg", "/involvements/dsi-9.jpg", "/involvements/dsi-10.jpg", "/involvements/visa.jpg", "/involvements/visa-2.jpg", "/involvements/visa-3.jpg", "/involvements/visa-5.jpg", "/involvements/sase-mentor.jpg", "/involvements/sase-fundraising.jpg", "/involvements/product-space.jpg", "/involvements/product-space-2.jpg", "/involvements/product-space-3.jpg"] },
  { id: "hackathons", title: "hackathons", speed: "800", color: "#FBE7A1", blurb: "ShellHacks and the Best Finance Project win.",
    srcs: ["/images/shellhacks-team.jpg", "/involvements/dsi-5.jpg", "/involvements/dsi-7.jpg"] },
  { id: "friends", title: "friends", speed: "1600", color: "#F6C9C2", blurb: "The people I get to do life with.",
    srcs: ["/images/friends-mirror-bedroom.jpg", "/images/friends-dinner-pose.jpg", "/images/friends-night-selfie.jpg", "/images/friends-gold-mirror.jpg", "/images/friends-jersey.jpg", "/images/friends-chicago-bean.jpg", "/images/friends-graduation.jpg", "/images/friends-night-selfie-2.jpg", "/images/friends-sunny-day.jpg", "/images/friends-birthday-cake.jpg", "/images/friends-cross-arms.jpg", "/images/friends-four-mirror.jpg", "/images/friends-red-gowns.jpg", "/images/friends-dressed-up.jpg", "/images/friends-cute-mirror.jpg", "/images/friends-jenga.jpg", "/images/friends-jerseys.jpg", "/images/sase-mentor-mentee.jpg"] },
];

export const ALL_PHOTOS: GalleryPhoto[] = [...FIRST_FRAMES, ...COLLAGE];
export const photosOf = (r: Roll): GalleryPhoto[] => r.srcs.map((src) => ALL_PHOTOS.find((p) => p.src === src)).filter((p): p is GalleryPhoto => !!p);
