'use client';

import type { ExternalToast } from 'sonner';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { X, Check, CircleAlert } from 'lucide-react';
import { Toaster as Sonner, toast as sonnerToast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;
type ToastKind = 'error' | 'success';

function ContestToastCard({
  kind,
  message,
  onClose,
}: {
  kind: ToastKind;
  message: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="group relative w-[calc(100vw-2rem)] max-w-82 pl-1.5 pt-1.5">
      <button
        type="button"
        onClick={onClose}
        className={[
          'absolute left-0 top-0 z-20 rounded-full p-px',
          'bg-linear-to-tl from-[#d8dce2] via-[#f6f7f9] to-[#d8dce2]',
          'shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)]',
          'dark:from-white/14 dark:via-[#151515]/78 dark:to-white/14 dark:shadow-none',
          'opacity-0 transition-opacity pointer-events-none',
          'group-hover:opacity-100 group-hover:pointer-events-auto',
          'group-focus-within:opacity-100 group-focus-within:pointer-events-auto',
        ].join(' ')}
        aria-label="Close notification"
      >
        <span className="grid size-5 place-items-center rounded-full bg-white text-[#0f172a] dark:bg-[#141414] dark:text-white/85">
          <X className="size-3" aria-hidden />
        </span>
      </button>

      <div
        className={[
          'overflow-hidden backdrop-blur-3xl rounded-[22px] bg-linear-to-tl from-[#d8dce2] via-[#f6f7f9] to-[#d8dce2] p-px',
          'shadow-[0_8px_18px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04),0_25px_55px_rgba(0,0,0,0.25)]',
          'dark:from-white/14 dark:via-[#151515]/78 dark:to-white/14 dark:shadow-[0_25px_55px_rgba(0,0,0,0.5)]',
        ].join(' ')}
      >
        <div
          className={[
            'relative flex min-h-15 items-center gap-4 rounded-[22px] px-4 py-3 text-[#0f172a]',
            'bg-[linear-gradient(145deg,rgba(255,255,255,0.98)_0%,rgba(247,248,250,0.98)_100%)]',
            'dark:bg-[linear-gradient(145deg,rgba(24,24,24,0.98)_0%,rgba(20,20,20,0.98)_100%)] dark:text-white',
          ].join(' ')}
        >
          <div
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-white dark:bg-white dark:text-[#141414]"
            aria-hidden
          >
            {kind === 'success' ? (
              <Check className="size-3" strokeWidth={3} />
            ) : (
              <CircleAlert className="size-3" strokeWidth={2.4} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-[-0.02em] text-[#0f172a] dark:text-white">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function showContestToast(kind: ToastKind, message: React.ReactNode, data?: ExternalToast) {
  return sonnerToast.custom(
    (id) => (
      <ContestToastCard kind={kind} message={message} onClose={() => sonnerToast.dismiss(id)} />
    ),
    {
      ...data,
      closeButton: false,
      className: '!w-auto !border-0 !bg-transparent !p-0 !shadow-none !overflow-visible',
      style: {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
      },
      unstyled: true,
    }
  );
}

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      position="top-right"
      toastOptions={{
        className: '!w-auto !border-0 !bg-transparent !p-0 !shadow-none !overflow-visible',
        style: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
        },
        unstyled: true,
      }}
      {...props}
    />
  );
}

export const toast = Object.assign(sonnerToast, {
  error: (message: React.ReactNode, data?: ExternalToast) =>
    showContestToast('error', message, data),
  success: (message: React.ReactNode, data?: ExternalToast) =>
    showContestToast('success', message, data),
});
