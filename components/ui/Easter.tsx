"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* Hidden delights: click the star after "My Pham" for a burst of film frames; type "matcha" anywhere for a sticker. */
type Piece = { id: number; x: number; y: number; dx: number; dy: number; rot: number; color: string; w: number; h: number };
const COLORS = ["#F4D35E", "#8DBCE0", "#FBE7A1", "#FAF7EF", "#416788"];
let uid = 0;

const typing = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
};

export function Easter() {
  const reduce = useReducedMotion();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [sticker, setSticker] = useState(false);
  const buffer = useRef("");
  const stickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onConfetti = (e: Event) => {
      if (reduce) return;
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail ?? { x: innerWidth / 2, y: innerHeight / 3 };
      const burst: Piece[] = Array.from({ length: 30 }, () => {
        const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 320;
        return { id: ++uid, x, y, dx: Math.cos(a) * v, dy: Math.sin(a) * v - 140, rot: (Math.random() - 0.5) * 720, color: COLORS[Math.floor(Math.random() * COLORS.length)], w: 10 + Math.random() * 10, h: 7 + Math.random() * 6 };
      });
      setPieces((p) => [...p, ...burst]);
      setTimeout(() => setPieces((p) => p.filter((q) => !burst.includes(q))), 2000);
    };
    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-6);
      if (buffer.current === "matcha") {
        buffer.current = "";
        setSticker(true);
        if (stickerTimer.current) clearTimeout(stickerTimer.current);
        stickerTimer.current = setTimeout(() => setSticker(false), 4200);
      }
    };
    window.addEventListener("film-confetti", onConfetti);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("film-confetti", onConfetti);
      window.removeEventListener("keydown", onKey);
      if (stickerTimer.current) clearTimeout(stickerTimer.current);
    };
  }, [reduce]);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9980] overflow-hidden">
        {pieces.map((p) => (
          <motion.span key={p.id} className="absolute block rounded-[2px] border border-[#20201E]/30"
            style={{ left: p.x, top: p.y, width: p.w, height: p.h, background: p.color }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: p.dx, y: p.dy + 520, rotate: p.rot, opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.2, 0.7, 0.3, 1] }} />
        ))}
      </div>
      <AnimatePresence>
        {sticker && (
          <motion.div role="status" aria-label="matcha sticker" className="fixed bottom-24 left-6 z-[9970] flex items-center gap-3 rounded-sm bg-[#FBE7A1] px-4 py-3 text-[#20201E] shadow-xl"
            initial={{ opacity: 0, y: 30, rotate: -12, scale: 0.7 }} animate={{ opacity: 1, y: 0, rotate: -4, scale: 1 }} exit={{ opacity: 0, y: 20, rotate: 6 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}>
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M8 18h28v8a14 14 0 0 1-14 14h0A14 14 0 0 1 8 26v-8Z" fill="#8DBA6A" stroke="#20201E" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M36 21h3a5 5 0 0 1 0 10h-4" stroke="#20201E" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M16 10c-2 2 2 3 0 6M24 8c-2 2 2 3 0 6M32 10c-2 2 2 3 0 6" stroke="#20201E" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="f-hand text-2xl leading-none">matcha &gt; coffee ♡</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
