'use client';

import * as React from 'react';
import { toast, Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      closeButton
      richColors
      expand
      toastOptions={{
        classNames: {
          closeButton:
            '!border-white/10 !bg-white/[0.06] !text-white/70 hover:!bg-white/[0.1] hover:!text-white',
          description: '!text-white/72',
          toast:
            '!rounded-2xl !border !border-white/10 !bg-[#101011] !text-white !shadow-[0_18px_48px_rgba(0,0,0,0.4)]',
          title: '!text-sm !font-semibold !text-white',
        },
      }}
      {...props}
    />
  );
}

export { toast };
