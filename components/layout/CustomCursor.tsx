"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/* Camera-viewfinder cursor: four butter corner brackets + a centre cross. Brackets tighten over links
   ("focus"), a label appears over photos, and a click fires a shutter flash. Text fields get the native I-beam. */
type Mode = "idle" | "focus" | "photo" | "text";

const PHOTO_SELECTOR = "[data-cursor-photo], [data-cursor-label]";
const FOCUS_SELECTOR = "a, button, summary, [role='button'], [role='tab'], [data-cursor-hover]";
const TEXT_SELECTOR = "input, textarea, select, [contenteditable='true']";

function modeFor(target: EventTarget | null): { mode: Mode; label: string } {
  if (!(target instanceof Element)) return { mode: "idle", label: "" };
  if (target.closest(TEXT_SELECTOR)) return { mode: "text", label: "" };
  const photo = target.closest<HTMLElement>(PHOTO_SELECTOR);
  if (photo) return { mode: "photo", label: photo.dataset.cursorLabel ?? "view ↗" };
  if (target.closest(FOCUS_SELECTOR)) return { mode: "focus", label: "" };
  return { mode: "idle", label: "" };
}

export function CustomCursor() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<{ mode: Mode; label: string }>({ mode: "idle", label: "" });
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setFine(true);
    document.documentElement.classList.add("film-cursor");

    const onMove = (e: MouseEvent) => {
      if (rootRef.current) rootRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      setVisible(true);
    };
    const onOver = (e: MouseEvent) => setState(modeFor(e.target));
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget) setVisible(false); };
    const onDown = () => setFlash((n) => n + 1);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.documentElement.classList.remove("film-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  if (!fine) return null;
  const { mode, label } = state;
  const half = mode === "focus" ? 11 : mode === "photo" ? 20 : 16;
  const hidden = !visible || mode === "text";

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[9999]" style={{ willChange: "transform" }}>
      <div className="film-cursor-box" data-mode={mode} data-still={reduce ? "" : undefined}
        style={{ ["--half" as string]: `${half}px`, opacity: hidden ? 0 : 1 }}>
        <i /><i /><i /><i />
        <b />
        {mode === "photo" && <span className="film-cursor-label">{label}</span>}
        {flash > 0 && !reduce && <em key={flash} className="film-cursor-flash" />}
      </div>
    </div>
  );
}
