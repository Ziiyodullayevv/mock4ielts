import type { ReactNode } from 'react';

type AuthProviderButtonProps = {
  children: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'subtle';
};

export function AuthProviderButton({
  children,
  icon,
  onClick,
  variant = 'solid',
}: AuthProviderButtonProps) {
  const className =
    variant === 'subtle'
      ? 'border border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.1]'
      : 'border-none bg-white text-black';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
