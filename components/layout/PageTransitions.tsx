"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Zoom transitions between pages — the journey's zoom-out, as the site's signature motion. Wraps internal
 * link clicks in the browser's View Transitions API: the old page eases out with a slight zoom, the new
 * one settles in (styles in globals.css). Browsers without the API, and visitors who prefer reduced
 * motion, get Next's normal instant navigation — nothing here is required for the site to work.
 */
type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => Promise<void>) => unknown };

export function PageTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  // resolves the in-flight transition's "update" promise once the new route has actually rendered
  const finishRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    finishRef.current?.();
    finishRef.current = null;
  }, [pathname]);

  useEffect(() => {
    const doc = document as ViewTransitionDoc;
    if (!doc.startViewTransition) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      // same page (incl. #anchors): let the browser/Next handle it without a page transition
      if (url.pathname === location.pathname) return;

      e.preventDefault(); // Next's <Link> sees this and skips its own navigation
      doc.startViewTransition!(
        () =>
          new Promise<void>((resolve) => {
            finishRef.current = resolve;
            router.push(url.pathname + url.search + url.hash);
            // never hold the old page frozen if the route is slow to resolve
            setTimeout(resolve, 1200);
          })
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
