import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export const AuroraText = memo(
  ({
    children,
    className,
    colors = ['#FF0080', '#7928CA', '#0070F3', '#38bdf8'],
    speed = 1,
  }: AuroraTextProps) => {
    const animationDuration = `${10 / speed}s`;

    const gradientStyle = {
      backgroundImage: `linear-gradient(90deg, ${colors.join(', ')}, ${colors[0]})`,
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: `aurora-flow ${animationDuration} ease-in-out infinite`,
    } as React.CSSProperties;

    return (
      <span className={cn('relative inline-block', className)}>
        <span className="sr-only">{children}</span>
        <span className="relative" style={gradientStyle} aria-hidden="true">
          {children}
        </span>
      </span>
    );
  }
);

AuroraText.displayName = 'AuroraText';
