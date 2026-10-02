"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-[5vw] text-center text-[var(--ink)]">
      <p className="f-hand mb-2 text-3xl text-[var(--blue)]" style={{ transform: "rotate(-3deg)" }}>the film jammed</p>
      <h1 className="f-h1"><span className="f-mark">something went wrong</span></h1>
      <p className="f-type mt-6 max-w-sm text-base text-[var(--muted)]">That one&apos;s on me. Try again, or head back to the start of the roll.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="f-btn f-btn-butter">try again</button>
        <Link href="/" className="f-btn">go home</Link>
      </div>
    </div>
  );
}
