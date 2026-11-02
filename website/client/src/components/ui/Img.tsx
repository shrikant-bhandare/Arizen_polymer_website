import type { ImgHTMLAttributes } from 'react';

/** Uploaded images and bundled product renders ship with these widths in WebP and AVIF. */
const RESPONSIVE = /^\/(uploads|media\/products)\/.+\.webp$/;
const WIDTHS = [480, 960, 1600];

interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  /** Above-the-fold images load eagerly with high priority; everything else is lazy. */
  priority?: boolean;
}

export function Img({ src, alt, sizes = '100vw', priority = false, className, ...rest }: ImgProps) {
  if (!src) return null;
  const loading = priority ? ('eager' as const) : ('lazy' as const);
  const common = { alt, loading, decoding: 'async' as const, fetchPriority: priority ? ('high' as const) : undefined, className, ...rest };

  if (RESPONSIVE.test(src)) {
    const base = src.slice(0, -'.webp'.length);
    const set = (format: string) => WIDTHS.map((w) => `${base}-${w}.${format} ${w}w`).join(', ');
    return (
      <picture className="contents">
        <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
        <img src={src} {...common} />
      </picture>
    );
  }
  return <img src={src} {...common} />;
}
