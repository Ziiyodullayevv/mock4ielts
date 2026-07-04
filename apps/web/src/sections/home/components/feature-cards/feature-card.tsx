import type { ListeningReadingCardItem } from '../../types';

import Link from 'next/link';
import Image from 'next/image';

type FeatureCardProps = {
  item: ListeningReadingCardItem;
};

export function FeatureCard({ item }: FeatureCardProps) {
  const title = `${item.title} ${item.highlight}`;

  return (
    <div className="detail-card relative flex min-h-[296px] w-full flex-col justify-between overflow-hidden rounded-[20px] border border-stone-200 bg-white px-6 pb-8 pt-6 shadow-[0_22px_50px_rgba(15,23,42,0.08)] sm:min-h-[312px] sm:px-10 sm:pb-10 md:h-[331px] md:w-[587px] dark:border-white/8 dark:bg-white/12 dark:shadow-none">
      <div className="z-10 flex max-w-[14rem] flex-col items-start text-stone-950 sm:max-w-72 dark:text-white">
        {item.icon}

        <h3 className="mt-4 text-[18px] font-semibold text-stone-950 sm:text-[18px] dark:text-white">{title}</h3>
        <p className="my-3 text-[14px] leading-7 text-stone-600 dark:text-white/65">{item.description}</p>
      </div>

      {item.href ? (
        <Link
          href={item.href}
          className="z-10 flex w-fit items-center gap-2 rounded-full border-2 border-stone-900 px-6 py-3 text-[14px] text-stone-950 transition hover:bg-stone-950 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
        >
          {item.cta}
          <ArrowIcon />
        </Link>
      ) : (
        <button
          type="button"
          className="z-10 flex w-fit items-center gap-2 rounded-full border-2 border-stone-900 px-6 py-3 text-[14px] text-stone-950 transition hover:bg-stone-950 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
        >
          {item.cta}
          <ArrowIcon />
        </button>
      )}

      <Image
        src={item.imageSrc}
        alt={item.imageAlt}
        fill
        className="absolute right-0 bottom-0 h-full w-full object-cover object-bottom"
        sizes="(min-width: 768px) 587px, 100vw"
        unoptimized
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.92)_42%,rgba(255,255,255,0.36)_72%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(90deg,rgba(34,31,31,0.96)_0%,rgba(34,31,31,0.92)_42%,rgba(34,31,31,0.32)_72%,rgba(34,31,31,0)_100%)]" />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="rotate-90"
    >
      <path
        d="M12 5V19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M6 11L12 5L18 11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
