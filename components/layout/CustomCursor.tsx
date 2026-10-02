"use client";
import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef<number>();

  useEffect(() => {
    // Only on fine pointer devices (mouse/trackpad)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };

    const updateHover = (target: EventTarget | null) => {
      const next = target instanceof Element && !!target.closest("a, button, [data-cursor-hover]");
      hoveredRef.current = next;
      setHovered(next);
    };
    const onOver = (e: MouseEvent) => updateHover(e.target);
    const onOut = (e: MouseEvent) => updateHover(e.relatedTarget);

    const animate = () => {
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      // Ring lags behind with lerp
      ring.current.x += (pos.current.x - ring.current.x) * 0.28;
      ring.current.y += (pos.current.y - ring.current.y) * 0.28;
      if (ringRef.current) {
        const size = hoveredRef.current ? 44 : 28;
        ringRef.current.style.transform = `translate(${ring.current.x - size / 2}px, ${ring.current.y - size / 2}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    raf.current = requestAnimationFrame(animate);

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none w-2 h-2 rounded-full bg-accent"
        style={{ opacity: visible ? (hovered ? 0 : 1) : 0, willChange: "transform" }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 z-[9998] pointer-events-none rounded-full border-2 border-accent transition-[width,height] duration-150 ${hovered ? "w-11 h-11 opacity-70" : "w-7 h-7 opacity-40"}`}
        style={{ opacity: visible ? (hovered ? 0.7 : 0.4) : 0, willChange: "transform" }}
      />
    </>
  );
}
