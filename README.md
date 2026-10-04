# My Pham — Film Portfolio

The film-roll redesign of mypham.space: a cream-paper homepage with a draggable "lately, on film" strip,
featured projects, and a filterable photo grid.

This started as the `film-home` branch of [Personal-Website](https://github.com/phammy237/Personal-Website),
which keeps the original UI. The two projects are now independent.

- Film homepage: `components/film/` · content (photos, captions, strip order, "currently" lines): `data/film.ts`
- Run locally: `npm install`, then `npm run dev`

---

## Original README

Personal portfolio and interactive biography built to showcase my work across product, software, data, research, and community leadership.

Live at **[mypham.space](https://mypham.space)**.

## About

This site is more than a traditional portfolio. It combines project case studies, professional experience, campus involvement, and an interactive geographic biography into one personal experience.

The site follows my journey from **Hanoi, Vietnam**, to studying in the United States, while highlighting the projects and communities that have shaped my work.

## Features

### Interactive Biography

A scroll-driven geographic journey built around an interactive globe and map.

* Animated transition from a global view into Hanoi
* Location-based story chapters from Vietnam and the United States
* Interactive map pins with previews, photos, and full stories
* Route animations and camera transitions
* NASA Blue Marble and VIIRS Earth-at-Night imagery
* Light and dark map themes
* Reduced-motion support
* Responsive layouts across desktop and mobile

### Work & Projects

A visual showcase of projects across software engineering, product, data science, and AI, including:

* **Career OS** — job discovery, application management, resume tailoring, and safe browser autofill
* **SmartPrep AI** — intelligent grocery, pantry, recipe, and meal-planning mobile app
* **Kite** — healthcare workflow platform for nurses
* **CartCoach** — browser extension designed to reduce impulse spending
* **BiasLens** — interactive ML fairness analysis dashboard
* Additional research, hackathon, and engineering projects

### Experience & Involvement

Sections covering:

* Professional experience
* Research
* Product management
* Student organizations
* Hackathons
* Leadership and community involvement

The interface uses a media-library-inspired browsing experience while maintaining the site's purple visual identity.

## Design

The site uses a custom purple palette:

```text
#10002B
#240046
#3C096C
#5A189A
#7B2CBF
#9D4EDD
#C77DFF
#E0AAFF
```

The design system focuses on:

* Strong typography and visual hierarchy
* Dark and light modes
* Consistent spacing and component sizing
* Motion used for storytelling rather than decoration
* Purple gradients, soft glow effects, and layered depth
* Accessible interactive states

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Maps & Visualization

* MapLibre GL JS
* OpenFreeMap / OpenMapTiles
* NASA Blue Marble imagery
* VIIRS Earth-at-Night imagery
* Custom geographic animation and camera utilities

### Development

* Git / GitHub
* Vercel
* ESLint
* TypeScript
* Responsive and reduced-motion testing

## Project Structure

```text
.
├── app/                     # Next.js routes and pages (incl. globals.css)
├── components/
│   ├── biography/
│   │   └── journey/         # Interactive journey experience
│   ├── layout/               # Navbar, Footer, theme provider
│   └── ui/                   # Shared UI primitives
├── data/
│   └── biography/            # Hanoi/U.S. journey + biography content
├── lib/
│   ├── biography/            # Journey themes and map/camera utilities
│   └── three/                # Three.js-dependent geometry helpers
├── public/
│   ├── biography/             # Journey + globe imagery (Hanoi, U.S., Earth)
│   ├── projects/               # Project screenshots
│   ├── involvements/           # Involvement photos
│   └── images/                 # General site photos
└── scripts/                    # Validation and development utilities
```

## Interactive Journey Architecture

The biography experience uses one persistent geographic environment rather than switching between disconnected map implementations.

Journey state controls:

* camera position
* zoom and pitch
* active location
* map labels
* route visibility
* pin state
* raster imagery crossfades
* story previews and modals
* chapter transitions

This allows the map itself to act as part of the narrative instead of simply serving as a background.

## Local Development

Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Scripts

Common commands:

```bash
npm run dev
npm run build
npm run lint
```

Additional project-specific validation scripts are available under `scripts/`.

## Deployment

The site is deployed through **Vercel** and automatically updated from the production branch.

Production:

**[mypham.space](https://mypham.space)**

## Author

**My Pham**

Data Science student at the University of Florida working across product, software engineering, data, AI, and human-centered technology.

* Portfolio: [mypham.space](https://mypham.space)
* GitHub: [github.com/phammy237](https://github.com/phammy237)
