"use client";
import { useEffect, useState } from "react";

type Playing = { configured: boolean; isPlaying?: boolean; title?: string; artist?: string; url?: string };

/** a tiny "now playing" line; stays hidden until the Spotify keys are added (see .env.example) */
export function NowPlaying({ className = "" }: { className?: string }) {
  const [t, setT] = useState<Playing | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/now-playing").then((r) => r.json()).then((j: Playing) => { if (alive) setT(j); }).catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (!t?.configured || !t.title) return null;
  const line = (
    <>
      <span aria-hidden="true" className={t.isPlaying ? "inline-block animate-pulse text-[#F4D35E]" : "text-[var(--muted)]"}>♪</span>{" "}
      {t.isPlaying ? "now playing" : "last played"}: {t.title}{t.artist ? ` · ${t.artist}` : ""}
    </>
  );
  return t.url
    ? <a href={t.url} target="_blank" rel="noopener noreferrer" className={`f-mono block hover:text-[var(--blue)] ${className}`}>{line}</a>
    : <p className={`f-mono ${className}`}>{line}</p>;
}
