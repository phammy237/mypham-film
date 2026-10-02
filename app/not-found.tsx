import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-[5vw] text-center">
      <p className="eyebrow text-muted mb-4">
        Page not found
      </p>
      <h1 className="font-display text-8xl text-surface mb-4">404</h1>
      <p className="body-copy text-lg mb-8">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="font-mono text-sm px-5 py-2.5 bg-accent text-white hover:bg-accent/90 transition-colors"
      >
        Go home →
      </Link>
    </div>
  );
}
