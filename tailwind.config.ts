import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-instrument)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        roboto: ["var(--font-roboto)", "sans-serif"],
        editorial: ["var(--font-instrument)", "serif"],
        hand: ["var(--font-caveat)", "cursive"],
        type: ["var(--font-courier)", "monospace"],
      },
      colors: {
        // Deep violet — main brand color: intense, creative, ambitious
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-light": "#E8DDC7",
        // Muted gold — warm, elegant, quietly confident (secondary accent)
        "accent-gold": "#C99A1B",
        // Dusty mauve — romantic and emotionally expressive
        "accent-mauve": "#D98E73",
        // Smoky lavender — dreamy and artistic without being childish
        "accent-lavender": "#8DBCE0",
        // Pearl white — soft, polished, clean
        base: "#FAF7EF",
        card: "#FFFDF8",
        // Pearl white — light-mode page background from the hero down through the homepage
        sand: "#FAF7EF",
        // Midnight navy — intelligent, private, slightly intimidating
        surface: "#20201E",
        navy: "#20201E",
        // Raised surface in dark mode — cards, panels, modals floating above the navy base
        "navy-mid": "#2A2A27",
        // Deepest dark-mode moment (immersive/interlude sections) — deliberately dark but never pure black
        "navy-deep": "#171715",
        border: "#E3DAC6",
        muted: "#6E6A60",
        // Film home — cream canvas, film-blue structure, butter personality, sky + beige accents
        "film-cream": "#FAF7EF",
        "film-beige": "#E8DDC7",
        "film-butter": "#F4D35E",
        "film-sky": "#8DBCE0",
        "film-blue": "#416788",
        "film-black": "#20201E",
        // Biography journey — named so the journey's panels share the film palette
        "journey-violet": "#416788",
        "journey-ink": "#20201E",
        "journey-paper": "#F4EFE3",
        "journey-muted": "#6E6A60",
        "journey-muted-dark": "#ABA597",
        "journey-body": "#20201E",
        "journey-lilac": "#8DBCE0",
        "journey-lilac-soft": "#8DBCE0",
        "journey-glow": "#F4D35E",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
export default config;
