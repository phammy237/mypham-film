"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ background: "#F7F3FA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", color: "#18233F" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong</h2>
        <button
          onClick={reset}
          style={{ padding: "0.5rem 1.5rem", background: "#5B3A8E", color: "white", border: "none", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
