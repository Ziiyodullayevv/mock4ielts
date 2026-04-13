'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { memo, useMemo, type ReactNode, type ElementType, type CSSProperties } from 'react';

export interface ShimmerProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

const ShimmerComponent = ({
  children,
  as: Component = 'span',
  className,
  duration = 2,
  spread = 2,
}: ShimmerProps) => {
  const MotionComponent = motion(Component);

  const textLength = typeof children === 'string' ? children.length : 10;

  const dynamicSpread = useMemo(() => textLength * spread, [textLength, spread]);

  return (
    // eslint-disable-next-line react-hooks/static-components
    <MotionComponent
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      className={cn('inline-block bg-clip-text text-transparent bg-[length:250%_100%]', className)}
      style={
        {
          '--spread': `${dynamicSpread}px`,
          backgroundImage: `
            linear-gradient(
              90deg,
              transparent calc(50% - var(--spread)),
              currentColor,
              transparent calc(50% + var(--spread))
            )
          `,
        } as CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
};

export const Shimmer = memo(ShimmerComponent);
