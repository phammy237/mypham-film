"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeProvider";

/* A strip of film across the top: sprocket holes along both edges, each page is a numbered frame, and the frame
   you're on is lit in butter. The strip is always film-black, so it reads the same over the hero, the maps and
   the cream pages. */
const navLinks = [
  ["About", "/#about"],
  ["Biography", "/biography/journey"],
  ["Work", "/projects"],
  ["Film", "/film"],
  ["Involvements", "/involvements"],
  ["CV", "/cv"],
] as [string, string][];

const frameNo = (i: number) => `${String(i + 1).padStart(2, "0")}A`;

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y < lastY || y < 50);
      setLastY(y);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || (href !== "/" && href !== "/#about" && pathname.startsWith(href));

  return (
    <>
      <motion.header
        className="film-nav fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[var(--film)] text-[#FAF7EF]"
        animate={{ y: visible ? 0 : -80 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        // its own view-transition layer, so page-to-page zooms move the content while the navbar holds still
        style={{ viewTransitionName: "site-nav" }}
      >
        <div className="mx-auto flex h-[60px] max-w-[1680px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#FAF7EF]/80 transition-colors hover:text-[#F4D35E] lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
            <Link
              href="/"
              className="hidden h-9 w-9 shrink-0 text-[#FAF7EF] transition-colors hover:text-[#F4D35E] lg:block"
              aria-label="My Pham home (replays my signature)"
              data-cursor-label="replay signature ✎"
              data-cursor-photo
              onClick={(e) => {
                try { sessionStorage.setItem("replay-intro", "1"); } catch { /* storage can be blocked */ }
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  window.dispatchEvent(new Event("replay-intro"));
                }
              }}
            >
              <span
                className="block h-full w-full bg-current"
                style={{
                  WebkitMaskImage: "url(/logo.png)",
                  maskImage: "url(/logo.png)",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </Link>
            <Link href="/" className="f-mono text-[13px] font-medium tracking-[0.14em] text-[#FAF7EF] transition-colors hover:text-[#F4D35E]">
              MY PHAM
            </Link>
          </div>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {navLinks.map(([label, href], i) => {
              const active = isActive(href);
              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-baseline gap-1.5 rounded-[3px] px-2.5 py-1.5 transition-colors duration-200 ${
                    active ? "bg-[#F4D35E] text-[#20201E]" : "text-[#FAF7EF]/85 hover:bg-white/10 hover:text-[#FAF7EF]"
                  }`}
                >
                  <span className={`f-mono hidden !text-[9.5px] xl:inline ${active ? "text-[#20201E]/70" : "text-[#F4D35E]"}`}>{frameNo(i)}</span>
                  <span className="f-mono !text-[12px] tracking-[0.12em]">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Night mode"
              title={theme === "dark" ? "Switch to day" : "Switch to night"}
              onClick={toggle}
              className="relative h-7 w-14 shrink-0 rounded-full border border-white/35 text-[#FAF7EF]/70 transition-colors duration-300"
            >
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-between px-2 text-[11px] leading-none">
                <span>☀</span><span>☾</span>
              </span>
              <span aria-hidden="true" className="absolute top-[3px] h-5 w-5 rounded-full bg-[#F4D35E] shadow ring-1 ring-black/20 transition-[left] duration-500 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ left: theme === "dark" ? "calc(100% - 1.4rem)" : "3px" }} />
            </button>
            <Link
              href="/connect"
              aria-current={pathname.startsWith("/connect") ? "page" : undefined}
              className={`f-mono !text-[12px] rounded-full border px-3.5 py-1.5 tracking-[0.1em] transition-colors duration-200 max-[399px]:hidden ${
                pathname.startsWith("/connect") ? "border-transparent bg-[#F4D35E] text-[#20201E]" : "border-[#F4D35E] text-[#F4D35E] hover:bg-[#F4D35E] hover:text-[#20201E]"
              }`}
            >
              CONNECT
            </Link>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="film-nav-panel fixed left-0 right-0 top-[60px] z-40 border-b border-white/10 bg-[var(--film)] text-[#FAF7EF] shadow-xl lg:hidden"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <nav aria-label="Main" className="flex flex-col px-[5vw] py-3">
                {navLinks.map(([label, href], i) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-baseline gap-3 border-b border-white/10 px-1 py-3 transition-colors last:border-b-0 ${active ? "text-[#F4D35E]" : "text-[#FAF7EF]/90 hover:text-[#F4D35E]"}`}
                    >
                      <span className="f-mono !text-[11px] text-[#F4D35E]">{frameNo(i)}</span>
                      <span className="f-serif text-[30px] leading-none">{label}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/connect"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 flex items-center justify-between rounded-full bg-[#F4D35E] px-5 py-3 text-[#20201E]"
                >
                  <span className="f-mono !text-[12px] tracking-[0.12em] !text-[#20201E]">CONNECT</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
