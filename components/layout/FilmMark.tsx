/* The site mark: a 35mm film canister (ISO 400) with a tongue of film coming out of it. Butter body, ink caps, cream film;
   the film's sprocket holes take the navbar's colour so they read as cut-outs. */
export function FilmMark({ className = "", body = "#F4D35E", speed = "400" }: { className?: string; body?: string; speed?: string }) {
  return (
    <svg viewBox="4 5 42 40" className={className} fill="none" aria-hidden="true">
      <path d="M17 31c-1.5 7 3 11 11 10" stroke="#E8DDC7" strokeWidth="6.4" strokeLinecap="round" />
      <path d="M17 31c-1.5 7 3 11 11 10" stroke="var(--film, #0F0F0E)" strokeWidth="2.2" strokeDasharray="1.5 2.6" strokeDashoffset="1" />
      <g transform="rotate(-24 24 24)">
        <rect x="12" y="14" width="27" height="19" rx="3.2" fill={body} stroke="#20201E" strokeWidth="1.6" />
        <rect x="7.5" y="12.2" width="7" height="22.6" rx="2.6" fill="#20201E" />
        <rect x="39" y="18" width="4.2" height="11" rx="1.6" fill="#20201E" />
        <text x="26.8" y="27.2" textAnchor="middle" fontFamily="Courier New, monospace" fontWeight="700" fontSize={speed.length > 3 ? 7.4 : 9.5} fill="#20201E">{speed}</text>
        <path d="M14.6 16.4h22" stroke="#fff" strokeOpacity=".5" strokeWidth="1.1" strokeLinecap="round" />
      </g>
    </svg>
  );
}
