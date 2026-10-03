"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const GO: Record<string, [string, string]> = {
  h: ["/", "Home"],
  w: ["/projects", "Work"],
  f: ["/film", "Film"],
  i: ["/involvements", "Involvements"],
  b: ["/biography/journey", "Biography"],
  v: ["/cv", "CV"],
  c: ["/connect", "Connect"],
};

const typing = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
};

/** keyboard shortcuts: g then a letter to go somewhere, / for the chat, ? for this cheat sheet */
export function Shortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const armed = useRef(false);

  useEffect(() => {
    const disarm = () => { armed.current = false; setPending(false); if (timer.current) clearTimeout(timer.current); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); disarm(); return; }
      if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (armed.current) {
        const dest = GO[e.key.toLowerCase()];
        disarm();
        if (dest) { e.preventDefault(); router.push(dest[0]); setOpen(false); }
        return;
      }
      if (e.key === "g") { armed.current = true; setPending(true); timer.current = setTimeout(disarm, 1300); return; }
      if (e.key === "/") { e.preventDefault(); window.dispatchEvent(new Event("open-chat")); return; }
      if (e.key === "?") { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); if (timer.current) clearTimeout(timer.current); };
  }, [router]);

  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);

  return (
    <>
      <AnimatePresence>
        {pending && (
          <motion.div aria-live="polite" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="f-mono fixed bottom-6 left-1/2 z-[9960] -translate-x-1/2 rounded-full bg-[#20201E] px-4 py-2 text-[#FAF7EF] shadow-lg">
            g ▸ <span className="text-[#F4D35E]">h</span>ome · <span className="text-[#F4D35E]">w</span>ork · <span className="text-[#F4D35E]">f</span>ilm · <span className="text-[#F4D35E]">i</span>nvolvements · <span className="text-[#F4D35E]">b</span>iography · c<span className="text-[#F4D35E]">v</span> · <span className="text-[#F4D35E]">c</span>onnect
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[9990] bg-[#20201E]/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"
              className="f-card fixed left-1/2 top-1/2 z-[9991] w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 p-6 text-[var(--ink)]"
              initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-start justify-between gap-4">
                <h2 className="f-h2">shortcuts</h2>
                <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] hover:bg-[var(--butter)] hover:text-[#20201E]">✕</button>
              </div>
              <dl className="f-type mt-5 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5 text-[15px]">
                {Object.entries(GO).map(([k, [, label]]) => (
                  <div key={k} className="contents">
                    <dt><kbd className="f-chip !text-[11px]">g</kbd> <kbd className="f-chip !text-[11px]">{k}</kbd></dt>
                    <dd className="text-[var(--muted)]">go to {label}</dd>
                  </div>
                ))}
                <dt><kbd className="f-chip !text-[11px]">/</kbd></dt><dd className="text-[var(--muted)]">open the chat</dd>
                <dt><kbd className="f-chip !text-[11px]">← →</kbd></dt><dd className="text-[var(--muted)]">step through frames and chapters</dd>
                <dt><kbd className="f-chip !text-[11px]">?</kbd></dt><dd className="text-[var(--muted)]">this cheat sheet</dd>
                <dt><kbd className="f-chip !text-[11px]">esc</kbd></dt><dd className="text-[var(--muted)]">close anything</dd>
              </dl>
              <p className="f-hand mt-5 text-xl">psst… try typing a certain green drink.</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
