"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const ORBITAL_RADII = [220, 160, 110, 68];

export function ReadyToDepart() {
  return (
    <section className="relative overflow-hidden px-[5vw] py-28 bg-sand dark:bg-navy">
      {/* Ambient orb */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, #5B3A8E18 0%, transparent 70%)",
          right: "-5%",
          top: "50%",
          transform: "translateY(-50%)",
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center relative">

        {/* Left: text */}
        <div>
          <motion.p
            className="font-mono text-[10px] text-muted dark:text-white/25 tracking-[0.25em] uppercase mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            FLT No. MY-2028
          </motion.p>

          <motion.h2
            className="heading mb-6 leading-tight"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Ready for<br />departure?
          </motion.h2>

          <motion.p
            className="body-copy dark:text-white/45 leading-relaxed max-w-sm mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Whether you want to collaborate, talk product strategy, grab coffee,
            or just say hi — I&apos;m always open to connecting.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/connect"
              className="font-mono text-xs px-6 py-3 bg-accent text-white hover:bg-accent/85 transition-colors duration-200 rounded-full tracking-wider"
            >
              Let&apos;s Connect →
            </Link>
            <Link
              href="/projects"
              className="font-mono text-xs px-6 py-3 border border-border dark:border-white/20 text-muted dark:text-white/55 hover:text-surface dark:hover:text-white hover:border-surface/40 dark:hover:border-white/40 transition-colors duration-200 rounded-full tracking-wider"
            >
              View My Work
            </Link>
            <Link
              href="/cv"
              className="font-mono text-xs px-6 py-3 border border-border dark:border-white/10 text-muted/60 dark:text-white/35 hover:text-muted dark:hover:text-white/60 hover:border-border dark:hover:border-white/25 transition-colors duration-200 rounded-full tracking-wider"
            >
              Download CV
            </Link>
          </motion.div>
        </div>

        {/* Right: orbital decoration */}
        <div className="relative h-72 hidden lg:flex items-center justify-center">
          {ORBITAL_RADII.map((r, i) => (
            <motion.div
              key={r}
              className="absolute rounded-full border border-accent/20 dark:border-accent/10"
              style={{ width: r * 2, height: r * 2 }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{
                duration: 18 + i * 6,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {i < 3 && (
                <div
                  className="absolute w-1.5 h-1.5 rounded-full bg-accent/50"
                  style={{ top: 0, left: "50%", transform: "translate(-50%, -50%)" }}
                />
              )}
            </motion.div>
          ))}

          {/* Center */}
          <div className="relative z-10 w-14 h-14 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center">
            <span className="text-accent text-lg">✈</span>
          </div>

          {/* Labels */}
          <motion.div
            className="absolute font-mono text-[9px] text-muted/40 dark:text-white/20 tracking-widest"
            style={{ top: "12%", right: "8%" }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            HAN
          </motion.div>
          <motion.div
            className="absolute font-mono text-[9px] text-accent/60 dark:text-accent/40 tracking-widest"
            style={{ bottom: "12%", left: "10%" }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          >
            GNV
          </motion.div>
        </div>
      </div>
    </section>
  );
}
