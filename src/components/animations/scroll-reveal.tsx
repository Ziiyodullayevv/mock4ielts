'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof typeof motion;
};

const HIDDEN = {
  opacity: 0,
  y: 24,
  filter: 'blur(8px)',
};

const VISIBLE = {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
};

export function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
  return (
    <motion.div
      initial={HIDDEN}
      whileInView={VISIBLE}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
