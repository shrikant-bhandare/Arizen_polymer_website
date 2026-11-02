import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../lib/site';

/**
 * The poster is a normal high-priority image (it is the largest paint), and the
 * loop fades in over it once it can play. No video at all for reduced motion or
 * Data Saver; a lighter 720p file on small screens; paused while off-screen.
 */
export function HeroVideo() {
  const reduce = useReducedMotion();
  const small = useMediaQuery('(max-width: 767px)');
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const saveData = typeof navigator !== 'undefined' && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const useVideo = !reduce && !saveData;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [useVideo, small]);

  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      {/* Same srcset as the server's <link rel="preload">, so the browser reuses that download. */}
      <picture>
        <source type="image/webp" srcSet="/media/hero/hero-poster-960.webp 960w, /media/hero/hero-poster.webp 1920w" sizes="100vw" />
        <img src="/media/hero/hero-poster.jpg" alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
      </picture>
      {useVideo && (
        <video
          key={small ? 'sm' : 'lg'}
          ref={ref}
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1.6s] ${playing ? 'opacity-100' : 'opacity-0'}`}
        >
          {small ? (
            <source src="/media/hero/hero-720.mp4" type="video/mp4" />
          ) : (
            <>
              <source src="/media/hero/hero-1080.webm" type="video/webm" />
              <source src="/media/hero/hero-1080.mp4" type="video/mp4" />
            </>
          )}
        </video>
      )}
    </div>
  );
}
