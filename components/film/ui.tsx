import Image from "next/image";
import type { ReactNode } from "react";
import type { Project } from "@/data/projects";

export const frameNo = (n: number) => `MY ${String(n).padStart(3, "0")}A`;

/** a photo with film grain and an optional frame number */
export function FilmPhoto({ src, alt, n, sizes, className = "", priority = false, style, pos }: {
  src: string; alt: string; n?: number; sizes: string; className?: string; priority?: boolean; style?: React.CSSProperties; pos?: string;
}) {
  return (
    <span className={`f-photo ${className}`} style={style}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={pos ? { objectPosition: pos } : undefined} />
      {n !== undefined && <span className="f-fno">{frameNo(n)}</span>}
    </span>
  );
}

/* projects without a screenshot get a flat film-palette block with the title set in serif */
const BLOCKS = [
  { bg: "#F4D35E", fg: "#20201E" },
  { bg: "#8DBCE0", fg: "#20201E" },
  { bg: "#E8DDC7", fg: "#20201E" },
  { bg: "#FBE7A1", fg: "#20201E" },
  { bg: "#416788", fg: "#FAF7EF" },
];
const hash = (s: string) => s.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** a flat film-palette title card, for anything without a photo */
export function BlockArt({ seed, label, n, className = '', sub }: { seed: string; label: string; n?: number; className?: string; sub?: string }) {
  const b = BLOCKS[hash(seed) % BLOCKS.length];
  return (
    <span className={`f-photo ${className}`} style={{ background: b.bg, color: b.fg }}>
      <span className="absolute inset-0 grid place-content-center gap-1 p-4 text-center">
        <span className="f-serif text-[clamp(22px,3vw,34px)] leading-[1.05]">{label}</span>
        {sub && <span className="f-mono opacity-70">{sub}</span>}
      </span>
      {n !== undefined && <span className="f-fno" style={{ color: b.fg === '#FAF7EF' ? '#F4D35E' : '#20201E', textShadow: 'none' }}>{frameNo(n)}</span>}
    </span>
  );
}

/** a project's cover: its screenshot when there is one, a title card otherwise */
export function ProjectArt({ project, n, sizes, className = '', priority }: {
  project: Project; n?: number; sizes: string; className?: string; priority?: boolean;
}) {
  if (project.image) {
    return (
      <span className={`f-photo ${className}`}>
        <Image src={project.image} alt={project.title} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover', objectPosition: 'top' }} />
        {n !== undefined && <span className="f-fno">{frameNo(n)}</span>}
      </span>
    );
  }
  return <BlockArt seed={project.slug} label={project.title} n={n} className={className} />;
}

/** page title block: handwritten kicker, serif title with marker underline, typewriter intro */
export function PageHead({ kicker, title, children, note }: { kicker?: string; title: string; children?: ReactNode; note?: ReactNode }) {
  return (
    <header className="f-wrap relative pb-6 pt-4 md:pt-8">
      {kicker && <p className="f-hand text-2xl text-[var(--blue)] md:text-3xl" style={{ transform: "rotate(-2deg)", transformOrigin: "left" }}>{kicker}</p>}
      <h1 className="f-h1 mt-1"><span className="f-mark">{title}</span></h1>
      {children && <p className="f-type mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">{children}</p>}
      {note && <div className="f-hand absolute right-5 top-6 hidden max-w-[200px] text-2xl md:block" style={{ transform: "rotate(5deg)" }}>{note}</div>}
    </header>
  );
}
