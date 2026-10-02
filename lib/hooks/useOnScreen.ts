import { useEffect, useState, RefObject } from "react";

export function useOnScreen(ref: RefObject<Element>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}
