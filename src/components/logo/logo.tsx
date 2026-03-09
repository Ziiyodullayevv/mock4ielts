import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/src/lib/utils';

const LOGO_BY_VARIANT = {
  dark: '/logo/logo_dark.png',
  light: '/logo/logo_white.png',
  red: '/logo/logo_red.png',
} as const;

export type LogoVariant = keyof typeof LOGO_BY_VARIANT;

type LogoProps = {
  className?: string;
  href?: string;
  size?: number;
  variant?: LogoVariant;
};

export function Logo({ className, href = '/', size = 30, variant = 'light' }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Go to home page"
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Image
        src={LOGO_BY_VARIANT[variant]}
        alt={`Logo ${variant}`}
        width={size}
        height={size}
        className="h-auto w-auto object-contain"
      />
    </Link>
  );
}
