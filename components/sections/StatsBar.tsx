"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useOnScreen } from "@/lib/hooks/useOnScreen";
import { education } from "@/data/cv";
import { allWork } from "@/data/projects";

const GPA = parseFloat(education[0].gpa.split(" / ")[0]);
// counted from the same list the Work page shows, so it never goes stale as projects are added
const PROJECT_COUNT = allWork.filter((p) => p.category !== "Hackathon").length;

const stats = [
  { value: 3,    suffix: "",  label: "Internships" },
  { value: PROJECT_COUNT, suffix: "", label: "Projects" },
  { value: 6,    suffix: "+", label: "Awards" },
  { value: 350,  suffix: "+", label: "Members Led" },
  { value: GPA,  suffix: "",  label: "GPA", decimal: true },
];

function Counter({ value, suffix, decimal }: { value: number; suffix: string; decimal?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useOnScreen(ref as React.RefObject<Element>);
  const reducedMotion = useReducedMotion();
  // Reduced-motion users get the real value immediately with no animation.
  // Everyone else starts at 0 and counts up once the stat scrolls into view.
  const [count, setCount] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (!inView || reducedMotion) return;
    const steps = 50;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setCount(step < steps ? value * eased : value);
      if (step >= steps) clearInterval(timer);
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [inView, reducedMotion, value]);

  return (
    <span ref={ref}>
      {decimal ? count.toFixed(2) : Math.floor(count)}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="bg-sand dark:bg-navy px-[5vw] pt-40 pb-14">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <p className="heading" style={{ fontSize: "clamp(32px, 4vw, 52px)" }}>
                <Counter value={s.value} suffix={s.suffix} decimal={s.decimal} />
              </p>
              <p className="font-mono text-[10px] text-muted dark:text-white/30 tracking-[0.2em] uppercase">
                {s.label}
              </p>
              <div className="w-6 h-px bg-accent/40 mt-1" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
