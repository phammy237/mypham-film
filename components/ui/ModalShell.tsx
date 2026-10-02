"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function ModalShell({
  onClose,
  maxWidth = "max-w-3xl",
  panelClassName = "bg-navy border border-white/10",
  closeButtonClassName = "bg-black/50 text-white/70 hover:text-white hover:bg-black/70",
  labelledBy,
  children,
}: {
  onClose: () => void;
  maxWidth?: string;
  panelClassName?: string;
  closeButtonClassName?: string;
  /** id of the element (usually the title) that labels this dialog for assistive tech */
  labelledBy?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl outline-none ${panelClassName}`}
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
      >
        <button onClick={onClose} aria-label="Close" className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-20 ${closeButtonClassName}`}>✕</button>
        {children}
      </motion.div>
    </motion.div>
  );
}
