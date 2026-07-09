'use client'
import React, { useEffect, useRef, useState } from 'react';
import { CarouselProps } from '@/interface';

export function Carousel({ children }: CarouselProps) {
  const containerRef = useRef<HTMLUListElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isClickScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const childrenArray = React.Children.toArray(children);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const updateIndex = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (isClickScrolling.current) return;

        const scrollLeft = el.scrollLeft;
        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;

        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          if (currentIndex !== 3) {
            setCurrentIndex(3);
          }
          return;
        }

        if (scrollLeft <= 5) {
          if (currentIndex !== 0) {
            setCurrentIndex(0);
          }
          return;
        }

        const viewportCenter = scrollLeft + clientWidth / 2;

        let closestIndex = 0;
        let minDistance = Infinity;

        Array.from(el.children).forEach((child, idx) => {
          if (idx > 3) return;
          const childEl = child as HTMLElement;
          const childCenter = childEl.offsetLeft + childEl.offsetWidth / 2;
          const distance = Math.abs(viewportCenter - childCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        });

        if (currentIndex !== closestIndex) {
          setCurrentIndex(closestIndex);
        }
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      updateIndex();
    });

    resizeObserver.observe(el);
    Array.from(el.children).forEach(child => {
      resizeObserver.observe(child);
    });

    el.addEventListener('scroll', updateIndex, { passive: true });

    setTimeout(updateIndex, 100);

    return () => {
      el.removeEventListener('scroll', updateIndex);
      resizeObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [childrenArray.length, currentIndex]);

  const scrollToIndex = (index: number) => {
    const el = containerRef.current;
    if (!el) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const limitedIndex = Math.min(index, 3);

    const targetChild = el.children[limitedIndex] as HTMLElement;
    if (!targetChild) return;

    isClickScrolling.current = true;

    setCurrentIndex(limitedIndex);

    if (limitedIndex === 3) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else if (limitedIndex === 0) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const targetLeft = targetChild.offsetLeft;
      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  };

  const scrollByItems = (count: number) => {
    isClickScrolling.current = false;
    const newIndex = Math.max(0, Math.min(3, currentIndex + count));
    scrollToIndex(newIndex);
  };

  return (
    <section className="w-full relative">
      <ul ref={containerRef} className="mt-[40px] flex flex-col md:flex-row gap-[16px] md:overflow-x-auto overflow-visible md:pb-[120px] pb-6 md:snap-x md:snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {children}
      </ul>

      <nav className="hidden md:flex absolute left-6 bottom-6 z-20 items-center gap-3" aria-label="Carousel pagination">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentIndex ? 'true' : 'false'}
            className={i === currentIndex ? 'w-[40px] h-[8px] bg-purple-600 rounded-full transition-all' : 'w-[8px] h-[8px] bg-gray-300 rounded-full transition-all'}
          />
        ))}
      </nav>

      <nav className="hidden md:flex absolute right-6 bottom-4 z-20 items-center gap-3" aria-label="Carousel navigation">
        <>
          {(() => {
            const disabled = currentIndex <= 0;
            return (
              <button
                aria-label="Previous"
                aria-disabled={disabled}
                disabled={disabled}
                onClick={() => { if (!disabled) scrollByItems(-1) }}
                className={`w-[56px] h-[56px] ${disabled ? 'bg-gray-50 text-gray-300 pointer-events-none' : 'bg-white/90 hover:bg-white text-gray-700'} rounded-[12px] shadow-md flex items-center justify-center transition`}
              >
                <span className="text-2xl" aria-hidden="true">←</span>
              </button>
            );
          })()}

          {(() => {
            const disabled = currentIndex >= 3;
            return (
              <button
                aria-label="Next"
                aria-disabled={disabled}
                disabled={disabled}
                onClick={() => { if (!disabled) scrollByItems(1) }}
                className={`w-[56px] h-[56px] ${disabled ? 'bg-gray-50 text-gray-300 pointer-events-none' : 'bg-gray-200 hover:bg-gray-50 text-gray-900'} rounded-[12px] shadow-md flex items-center justify-center transition`}
              >
                <span className="text-2xl" aria-hidden="true">→</span>
              </button>
            );
          })()}
        </>
      </nav>
    </section>
  );
}
