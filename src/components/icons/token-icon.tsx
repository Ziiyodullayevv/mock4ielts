import type { SVGProps } from 'react';

import { useId } from 'react';
import { cn } from '@/src/lib/utils';

type TokenIconProps = SVGProps<SVGSVGElement>;

export function TokenIcon({ className, ...props }: TokenIconProps) {
  const gradientId = useId();

  return (
    <svg
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-sm', className)}
      {...props}
    >
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM14.8571 9.14286C12.8929 7.17857 12 3.42857 12 3.42857C12 3.42857 11.1071 7.17857 9.14286 9.14286C7.17857 11.1071 3.42857 12 3.42857 12C3.42857 12 7.29018 13.0045 9.14286 14.8571C10.9955 16.7098 12 20.5714 12 20.5714C12 20.5714 12.7366 16.9777 14.8571 14.8571C16.9777 12.7366 20.5714 12 20.5714 12C20.5714 12 16.8214 11.1071 14.8571 9.14286Z"
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
      />
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="1.4777e-07"
          x2="13.4167"
          y1="4.66667"
          y2="12.8333"
        >
          <stop offset="0.0001" stopColor="#33DDE5" />
          <stop offset="1" stopColor="#0F9CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
