import type { ListeningReadingCardItem } from '../../types';

import Link from 'next/link';
import Image from 'next/image';

type FeatureCardProps = {
  item: ListeningReadingCardItem;
};

export function FeatureCard({ item }: FeatureCardProps) {
  const title = `${item.title} ${item.highlight}`;

  return (
    <div className="detail-card relative flex h-[331px] min-h-[312px] w-[587px] flex-col justify-between overflow-hidden rounded-[20px] bg-white/12 px-10 pt-6 pb-10">
      <div className="z-10 flex max-w-72 flex-col items-start">
        {item.icon}

        <h3 className="mt-4 text-[18px] font-semibold text-white">{title}</h3>
        <p className="my-3 text-[14px] text-white/65">{item.description}</p>
      </div>

      {item.href ? (
        <Link
          href={item.href}
          className="z-10 flex w-fit items-center gap-2 rounded-full border-2 border-white px-6 py-3 text-[14px] text-white transition hover:bg-white hover:text-black"
        >
          {item.cta}
          <ArrowIcon />
        </Link>
      ) : (
        <button
          type="button"
          className="z-10 flex w-fit items-center gap-2 rounded-full border-2 border-white px-6 py-3 text-[14px] text-white transition hover:bg-white hover:text-black"
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
        sizes="587px"
        unoptimized
      />
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
