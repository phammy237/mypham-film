import type { JourneyChapterConfig, JourneyChapterId } from "@/lib/biography/journeyTypes";

type JourneyProgressRailProps = {
  chapters: JourneyChapterConfig[];
  activeChapterId: JourneyChapterId;
  activeChapterIndex: number;
  onNavigate: (chapterId: JourneyChapterId) => void;
};

/**
 * Four-chapter rail reading straight off the centralized `journeyChapters` config — desktop gets
 * a vertical rail pinned to the right edge, mobile gets a bottom bar that stays out of the way of
 * the sticky stage's own content. Fully theme-aware (site's light/dark tokens), matching the map
 * and story panels rather than assuming the page is always dark.
 */
export function JourneyProgressRail({ chapters, activeChapterId, activeChapterIndex, onNavigate }: JourneyProgressRailProps) {
  return (
    <>
      <nav
        aria-label="Journey chapters"
        className="journey-desktop-rail fixed z-40 hidden md:flex"
      >
        {/* faint vertical connector spanning all four stops — sits behind the dots, not a card */}
        <div
          className="journey-rail-line"
          aria-hidden="true"
        />
        {chapters.map((chapter) => {
          const isActive = chapter.id === activeChapterId;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onNavigate(chapter.id)}
              aria-current={isActive ? "step" : undefined}
              // Active/inactive are told apart by color (dark ink + filled accent dot vs. muted gray
              // + hollow dot), not by opacity — "do not make inactive states almost invisible."
              className="journey-rail-stop group relative flex flex-col-reverse items-center gap-3 transition-colors"
            >
              <span
                className={`font-mono text-[10px] uppercase leading-none tracking-[0.18em] transition-colors ${
                  isActive
                    ? "text-journey-ink dark:text-[rgba(244,241,248,0.92)]"
                    : "text-[rgba(79,87,120,0.42)] group-hover:text-[rgba(79,87,120,0.65)] dark:text-[rgba(205,200,224,0.40)] dark:group-hover:text-[rgba(205,200,224,0.65)]"
                }`}
              >
                {chapter.label}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  isActive
                    ? "bg-journey-violet shadow-[0_0_8px_rgba(124,106,242,0.28)] dark:bg-[#A58AFF] dark:shadow-[0_0_8px_rgba(165,138,255,0.45)]"
                    : "border border-[rgba(90,95,130,0.24)] bg-transparent group-hover:border-journey-violet dark:border-[rgba(180,172,215,0.28)] dark:group-hover:border-[#A58AFF]"
                }`}
              />
            </button>
          );
        })}
      </nav>

      <nav
        aria-label="Journey chapters"
        className="fixed inset-x-0 bottom-20 z-40 flex justify-center md:hidden"
      >
        <div className="flex items-center gap-1 rounded-full border border-[rgba(38,49,91,0.12)] bg-[#FBFAFD]/90 px-2 py-2 backdrop-blur-sm dark:border-white/15 dark:bg-navy-deep/85">
          {chapters.map((chapter, i) => {
            const isActive = chapter.id === activeChapterId;
            const isCompleted = i < activeChapterIndex;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onNavigate(chapter.id)}
                aria-current={isActive ? "step" : undefined}
                className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                  isActive
                    ? "bg-journey-violet text-white dark:bg-accent-lavender dark:text-navy"
                    : isCompleted
                      ? "text-journey-violet dark:text-accent-lavender/80"
                      : "text-journey-muted dark:text-white/40"
                }`}
              >
                {chapter.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
