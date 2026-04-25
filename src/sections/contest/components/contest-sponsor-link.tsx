import { HeartHandshake } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { contestButtonClassName } from './contest-theme';

export function ContestSponsorLink() {
  return (
    <button
      type="button"
      className={cn(
        contestButtonClassName,
        'mx-auto mt-6 gap-2 px-4 py-2 text-sm text-stone-500 dark:text-stone-300'
      )}
    >
      <HeartHandshake className="size-4" strokeWidth={2} aria-hidden />
      <span>Sponsor a Contest</span>
    </button>
  );
}
