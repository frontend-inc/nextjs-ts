import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  inView?: boolean;
}

export function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  inView = false,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!inView);

  useEffect(() => {
    if (!inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [inView]);

  return (
    <div
      ref={ref}
      className={cn(
        isVisible ? 'opacity-100 blur-none' : 'opacity-0 blur-sm',
        className
      )}
      style={{
        animation: isVisible
          ? `blur-fade ${duration}s ease-out ${delay}s forwards`
          : 'none',
      }}
    >
      {children}
    </div>
  );
}
