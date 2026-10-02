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
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-[5vw] text-center">
      <p className="eyebrow text-muted mb-4">
        Something went wrong
      </p>
      <h1 className="font-display text-5xl text-surface mb-6">Error</h1>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="font-mono text-sm px-5 py-2.5 bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="font-mono text-sm px-5 py-2.5 border border-border text-muted hover:text-surface transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
