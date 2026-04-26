'use client';

import { cn } from '@/src/lib/utils';
import { Shuffle } from 'lucide-react';

import { contestPrimaryButtonClassName } from '../contest-theme';

type ShuffleButtonProps = {
  onClick?: () => void;
};

export function ShuffleButton({ onClick }: ShuffleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Shuffle"
      className={cn(contestPrimaryButtonClassName, 'grid h-10 w-10 cursor-pointer place-items-center')}
    >
      <Shuffle className="h-4 w-4" strokeWidth={2.25} />
    </button>
  );
}
