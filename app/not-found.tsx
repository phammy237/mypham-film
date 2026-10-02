import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-[5vw] text-center text-[var(--ink)]">
      <p className="f-hand mb-2 text-3xl text-[var(--blue)]" style={{ transform: "rotate(-3deg)" }}>this frame didn&apos;t make the roll</p>
      <div className="f-pola relative rotate-[2deg]">
        <div className="grid aspect-[4/3] w-[min(78vw,360px)] place-items-center bg-[var(--film)] text-[#FAF7EF]">
          <span className="f-serif text-[clamp(88px,22vw,150px)] leading-none">404</span>
        </div>
        <span className="f-fno" style={{ right: 16, bottom: 26 }}>MY 404A</span>
        <p className="f-hand mt-2 text-xl text-[#20201E]">page not found</p>
      </div>
      <p className="f-type mt-8 max-w-sm text-base text-[var(--muted)]">Nothing was shot here. Let&apos;s get you back to the good frames.</p>
      <Link href="/" className="f-btn f-btn-butter mt-6">go home →</Link>
    </div>
  );
}
