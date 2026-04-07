import type { MouseEventHandler } from 'react';

import Link from 'next/link';
import { cn } from '@/src/lib/utils';

const LOGO_CLASS_BY_VARIANT = {
  dark: 'text-black',
  light: 'text-white',
  red: 'text-[#d92d20]',
} as const;

const LOGO_VIEWBOX_WIDTH = 142;
const LOGO_VIEWBOX_HEIGHT = 130;

export type LogoVariant = keyof typeof LOGO_CLASS_BY_VARIANT;

type LogoProps = {
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  size?: number;
  variant?: LogoVariant;
};

export function Logo({
  className,
  href = '/',
  onClick,
  size = 30,
  variant = 'light',
}: LogoProps) {
  const width = Math.round((size * LOGO_VIEWBOX_WIDTH) / LOGO_VIEWBOX_HEIGHT);

  return (
    <Link
      href={href}
      aria-label="Go to home page"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center',
        LOGO_CLASS_BY_VARIANT[variant],
        className
      )}
    >
      <svg
        width={width}
        height={size}
        viewBox="0 0 142 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-auto shrink-0"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 64.988V129.976L32 97.988C49.6 80.394 64 65.544 64 64.988C64 64.432 49.6 49.582 32 31.988L0 0V64.988ZM89.086 53.217L36.988 105.946L48.728 117.717C55.186 124.191 60.926 129.504 61.484 129.523C62.043 129.542 80.387 111.437 102.25 89.288L142 49.019V24.753C142 11.407 141.817 0.487999 141.592 0.487999C141.368 0.487999 117.741 24.216 89.086 53.217ZM124.496 78.492L107.515 95.495L124.757 112.738L142 129.981V95.734C142 76.899 141.883 61.488 141.739 61.488C141.595 61.488 133.836 69.14 124.496 78.492Z"
          fill="currentColor"
        />
      </svg>
    </Link>
  );
}
