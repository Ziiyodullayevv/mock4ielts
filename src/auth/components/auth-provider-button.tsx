import type { ReactNode } from 'react';

type AuthProviderButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  icon: ReactNode;
  loading?: boolean;
  onClick?: () => void;
  variant?: 'solid' | 'subtle';
};

export function AuthProviderButton({
  children,
  disabled = false,
  icon,
  loading = false,
  onClick,
  variant = 'solid',
}: AuthProviderButtonProps) {
  const className =
    variant === 'subtle'
      ? 'border border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.1]'
      : 'border-none bg-white text-black';
  const spinnerClassName =
    variant === 'subtle'
      ? 'border-white/30 border-t-white'
      : 'border-black/20 border-t-black';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className={`size-4 animate-spin rounded-full border-2 ${spinnerClassName}`}
            aria-hidden="true"
          />
          Please wait...
        </span>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
