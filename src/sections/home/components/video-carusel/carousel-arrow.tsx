import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselArrowProps = {
  direction: 'next' | 'prev';
  onClick: () => void;
};

export function CarouselArrow({ direction, onClick }: CarouselArrowProps) {
  const isPrevious = direction === 'prev';

  return (
    <button
      type="button"
      aria-label={isPrevious ? 'Previous slide' : 'Next slide'}
      onClick={onClick}
      className={`pointer-events-auto absolute top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-stone-950 shadow-none transition-opacity hover:opacity-70 sm:flex dark:text-white ${isPrevious ? '-left-3 md:-left-6 lg:-left-14' : '-right-3 md:-right-6 lg:-right-14'}`}
    >
      {isPrevious ? <ChevronLeft className="size-12" /> : <ChevronRight className="size-12" />}
    </button>
  );
}
