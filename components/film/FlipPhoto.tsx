"use client";
import { useState } from "react";
import { FilmPhoto, frameNo } from "@/components/film/ui";

/** a photo that flips over like the back of a Polaroid, with a handwritten note on the back */
export function FlipPhoto({ src, alt, n, sizes, note, aspect = "4 / 5", className = "", pos }: {
  src: string; alt: string; n?: number; sizes: string; note: string; aspect?: string; className?: string; pos?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((f) => !f);
  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={flipped ? `${alt}: showing the note, press to flip back` : `${alt}: press to flip it over`}
      data-flipped={flipped}
      data-cursor-photo
      data-cursor-label={flipped ? "flip back ↺" : "flip over ↻"}
      className={`f-flip ${className}`}
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); toggle(); } }}
    >
      <span className="f-flip-inner" style={{ aspectRatio: aspect }}>
        <span className="f-flip-face">
          <FilmPhoto src={src} alt={alt} n={n} sizes={sizes} pos={pos} style={{ position: "absolute", inset: 0 }} />
        </span>
        <span className="f-flip-face f-flip-back">
          <span className="f-hand">{note}</span>
          <span className="f-mono">{n !== undefined ? `${frameNo(n)} · ` : ""}flip back ↺</span>
        </span>
      </span>
    </span>
  );
}
