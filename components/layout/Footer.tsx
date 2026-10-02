import Link from "next/link";
import { SITE_EMAIL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-navy border-t border-border dark:border-white/10 px-[5vw] py-16">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-mono text-sm text-muted dark:text-white/40 mb-1">
            UF Data Science · Class of 2028
          </p>
          <p className="font-body text-2xl text-surface dark:text-white">
            Open to opportunities →
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="font-mono text-sm text-muted dark:text-white/60 hover:text-accent transition-colors duration-200"
          >
            {SITE_EMAIL}
          </a>
          <a
            href="https://linkedin.com/in/mypham237"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-muted dark:text-white/60 hover:text-accent transition-colors duration-200"
          >
            LinkedIn ↗
          </a>
          <a
            href="tel:3527454868"
            className="font-mono text-sm text-muted dark:text-white/60 hover:text-accent transition-colors duration-200"
          >
            352-745-4868
          </a>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-border dark:border-white/5 flex flex-wrap gap-6">
        {[
          ["Projects", "/projects"],
          ["Involvements", "/involvements"],
          ["CV", "/cv"],
        ].map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="font-mono text-xs text-muted/50 dark:text-white/30 hover:text-muted dark:hover:text-white/60 transition-colors duration-200"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="max-w-[1200px] mx-auto mt-6">
        <p className="font-mono text-xs text-muted/40 dark:text-white/20">
          © 2026 My Pham · Built with Next.js &amp; Framer Motion
        </p>
      </div>
    </footer>
  );
}
