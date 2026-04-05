import type { ReactNode } from 'react';

import { LoaderCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { profilePageBackgroundClassName } from '@/src/sections/profile/constants/profile-form';

type ProfileStateProps = {
  actionLabel?: string;
  description?: ReactNode;
  label: string;
  onAction?: () => void;
};

export function ProfileState({
  actionLabel,
  description,
  label,
  onAction,
}: ProfileStateProps) {
  return (
    <main
      className={`flex items-center justify-center px-4 ${profilePageBackgroundClassName}`}
    >
      <div className="flex max-w-xl flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center">
        <LoaderCircle className="size-8 animate-spin text-[#ff9f2f]" />
        <p className="text-lg font-semibold text-white">{label}</p>
        {description ? <p className="text-sm leading-7 text-white/68">{description}</p> : null}
        {actionLabel ? (
          <Button type="button" variant="orange" className="rounded-full" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </main>
  );
}
