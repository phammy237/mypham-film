"use client";

/* Renders outside the app layout, so it can't use the shared classes: film palette inline. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ background: "#FAF7EF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, fontFamily: "'Courier New', monospace", color: "#20201E", textAlign: "center", padding: "0 5vw" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "2.5rem", margin: "0 0 1rem" }}>Something went wrong</h2>
        <p style={{ margin: "0 0 1.5rem", color: "#6E6A60" }}>The film jammed. Give it another go.</p>
        <button
          onClick={reset}
          style={{ padding: "0.6rem 1.4rem", background: "#F4D35E", color: "#20201E", border: "none", borderRadius: 999, cursor: "pointer", fontSize: "0.95rem" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
