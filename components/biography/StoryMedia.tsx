"use client";
import { ImagePlaceholder } from "@/components/biography/ImagePlaceholder";

export const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

/** Max real images ever rendered directly in a gallery-style grid — enough for a rich moment
 *  without turning into a runaway grid; anything past this is summarized with a "+N" tag. */
const GALLERY_DISPLAY_CAP = 6;

function MediaItem({
  src,
  alt,
  className,
  loadMedia,
  overlayLabel,
}: {
  src: string;
  alt: string;
  className: string;
  loadMedia: boolean;
  /** e.g. "+12" — shown as a dark scrim over the last visible tile when more images exist than fit */
  overlayLabel?: string;
}) {
  if (!loadMedia) {
    return <div className={`rounded-[13px] bg-accent-light/40 dark:bg-white/[0.03] ${className}`} />;
  }
  return (
    <div className={`relative overflow-hidden rounded-[13px] bg-accent-light dark:bg-white/5 ${className}`}>
      {isVideo(src) ? (
        <video src={src} className="h-full w-full object-cover" muted loop playsInline />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      )}
      {overlayLabel && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 font-mono text-sm text-white">
          {overlayLabel}
        </div>
      )}
    </div>
  );
}

export type StoryMediaVariant = "hero-two-row" | "gallery" | "candid-pair";

export type StoryMediaProps = {
  /** real image/video paths only — resolving "which photos exist" is the caller's job (usually
   *  straight from journey data), this component never invents or falls back to stock imagery */
  images: string[];
  /** per-image captions, aligned by index; also doubles as meaningful alt text when present */
  captions?: string[];
  /** meaningful fallback alt text (e.g. the location/section name) when no per-image caption exists */
  alt: string;
  /** pacing/emphasis hint for 3+ images — ignored for 0/1/2, which always render the same way */
  variant?: StoryMediaVariant;
  /** perf gate: only the active location (± 1) actually loads real media; others show neutral
   *  swatches in the same shape so layout never shifts once media does load */
  loadMedia?: boolean;
};

/**
 * Reusable story media system shared by every location's story panel (Hanoi and U.S. alike) —
 * gracefully handles 0, 1, 2, or 3+ images/videos instead of assuming a fixed slot count per
 * layout. Zero images renders one deliberate "no photos yet" placeholder (never a stock fallback);
 * anything real renders in a shape proportional to how much there actually is.
 */
export function StoryMedia({ images, captions, alt, variant = "gallery", loadMedia = true }: StoryMediaProps) {
  const altFor = (i: number) => captions?.[i] || alt;

  if (images.length === 0) {
    return <ImagePlaceholder className="aspect-[16/9] w-full" caption="No photos yet" />;
  }

  if (images.length === 1) {
    return <MediaItem src={images[0]} alt={altFor(0)} loadMedia={loadMedia} className="aspect-[16/10] w-full" />;
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-[10px]">
        {images.map((src, i) => (
          <MediaItem key={src} src={src} alt={altFor(i)} loadMedia={loadMedia} className="aspect-[4/5] w-full" />
        ))}
      </div>
    );
  }

  if (variant === "hero-two-row") {
    const [hero, ...rest] = images;
    const shown = rest.slice(0, 3);
    return (
      <div className="space-y-[10px]">
        <MediaItem src={hero} alt={altFor(0)} loadMedia={loadMedia} className="aspect-[16/9] w-full" />
        <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3">
          {shown.map((src, i) => (
            <MediaItem key={src} src={src} alt={altFor(i + 1)} loadMedia={loadMedia} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "candid-pair") {
    const [hero, ...rest] = images;
    const shown = rest.slice(0, 2);
    return (
      <div className="space-y-[10px]">
        <MediaItem src={hero} alt={altFor(0)} loadMedia={loadMedia} className="aspect-[16/9] w-full" />
        <div className="grid grid-cols-2 gap-[10px] sm:w-2/3">
          {shown.map((src, i) => (
            <MediaItem key={src} src={src} alt={altFor(i + 1)} loadMedia={loadMedia} className="aspect-[4/3] w-full" />
          ))}
        </div>
      </div>
    );
  }

  // "gallery": an even grid of however many exist, capped with a "+N" tag rather than growing forever
  const shown = images.slice(0, GALLERY_DISPLAY_CAP);
  const overflow = images.length - shown.length;
  return (
    <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3">
      {shown.map((src, i) => (
        <MediaItem
          key={src}
          src={src}
          alt={altFor(i)}
          loadMedia={loadMedia}
          className="aspect-square w-full"
          overlayLabel={overflow > 0 && i === shown.length - 1 ? `+${overflow}` : undefined}
        />
      ))}
    </div>
  );
}
