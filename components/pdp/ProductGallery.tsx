'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/**
 * 4:5 primary image with thumbnail strip on desktop; horizontal snap-scroll on mobile.
 * No zoom/lightbox — deferred.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="lg:flex lg:gap-5">
      {/* Desktop thumbs */}
      <ol className="hidden lg:flex lg:w-20 lg:flex-col lg:gap-3">
        {images.map((src, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                'relative block aspect-[4/5] w-full overflow-hidden bg-bg-muted transition-opacity duration-fast ease-standard',
                i === active
                  ? 'opacity-100 ring-1 ring-text-primary'
                  : 'opacity-70 hover:opacity-100',
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ol>

      {/* Main: desktop */}
      <div className="relative hidden lg:block lg:flex-1">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-muted">
          <Image
            src={images[active]}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* Mobile: snap scroll */}
      <div
        className="relative -mx-5 flex snap-x snap-mandatory overflow-x-auto md:-mx-8 lg:hidden"
        aria-label={`${alt} gallery`}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="relative aspect-[4/5] w-full flex-shrink-0 snap-center bg-bg-muted"
          >
            <Image
              src={src}
              alt={i === 0 ? alt : ''}
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
