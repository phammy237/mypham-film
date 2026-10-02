"use client";
import { useState, useEffect, useCallback } from "react";

export function useRotatingIndex(length: number, intervalMs: number) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(() => setIdx((i) => (i + 1) % length), [length]);
  const retreat = useCallback(() => setIdx((i) => (i - 1 + length) % length), [length]);

  useEffect(() => {
    if (paused || length <= 1) return;
    const t = setInterval(advance, intervalMs);
    return () => clearInterval(t);
  }, [paused, advance, intervalMs, length]);

  return { idx, setIdx, paused, setPaused, advance, retreat };
}
